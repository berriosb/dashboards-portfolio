import fs from 'fs';
import path from 'path';
import { BANCA_METRICS } from '../lib/metric-definitions';

// PRNG determinista: Mulberry32
function createMulberry32(seed: number) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seed: number) {
  const rand = createMulberry32(seed);
  return {
    rand,
    choice: <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)],
    randInt: (min: number, max: number): number => Math.floor(rand() * (max - min + 1)) + min,
    randFloat: (min: number, max: number): number => rand() * (max - min) + min,
  };
}

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function tramoFor(diasMora: number): string {
  if (diasMora <= 0) return 'Al Día (0d)';
  if (diasMora <= 29) return 'Mora 1-29d';
  if (diasMora <= 59) return 'Mora 30-59d';
  if (diasMora <= 89) return 'Mora 60-89d';
  return 'Mora 90+d';
}

// Provisiones según estándar CMF / IFRS 9
function provisionFor(saldo: number, diasMora: number): number {
  if (diasMora >= 30 && diasMora < 60) return Math.round(saldo * 0.18);
  if (diasMora >= 60 && diasMora < 90) return Math.round(saldo * 0.45);
  if (diasMora >= 90) return Math.round(saldo * 0.85);
  return Math.round(saldo * 0.012);
}

// ==========================================
// DINÁMICA DE MORA: cadena de Markov de 5 estados
// ==========================================
// La cartera es un STOCK medido en un instante, no un flujo de eventos. Cada
// crédito recorre 5 tramos cada mes y la morosidad agregada es el resultado
// del agregado, no de un número escrito a mano.
//
// La matriz base se calibró con lógicas de cobranza reales: la mora leve se
// regulariza más rápido que la profunda, el agravamiento se frena al llegar a
// 90+ (ya no hay activo que empeorar) y la mora profunda se recupera con
// lentitud por el costo del provisionamiento. Sin esto, la serie salía con
// saltos de ±1pp mensuales que ninguna operación del negocio explica.
const MORA_STATES = 5; // al día | 1-29 | 30-59 | 60-89 | 90+

// Dinámica de salida y avance entre tramos morosos. Cada fila reparte
// probabilidad 1.0 entre el propio tramo y los adyacentes. Es estable para
// toda la industria: lo que cambia con el ciclo es CUÁNTO entra a mora, no
// cómo sale. Por eso sólo la fila "al día" se calibra (ver pEntrada).
// Índices: 0=al día, 1=1-29d, 2=30-59d, 3=60-89d, 4=90+d
const MORA_TRANSICIONES: number[][] = [
  /* 1-29d  */ [0.55000, 0.20000, 0.25000, 0, 0],
  /* 30-59d */ [0.22000, 0, 0.50000, 0.28000, 0],
  /* 60-89d */ [0.10000, 0, 0, 0.60000, 0.30000],
  /* 90+d   */ [0.08000, 0, 0, 0, 0.92000],
];

// Probabilidad mensual de que una cartera sana entre en mora (1-29d).
// Es el ÚNICO dial del modelo: `scripts/calibrate-banca.ts` lo barre contra
// las bandas reales de la CMF.
const MORA_ENTRADA_BASE = 0.0025;
let MORA_ESCALA_GLOBAL = 1.0;

// Meses de quemado antes de medir. Sin quemado la cartera parte "todo al día"
// y tarda años en llegar a su distribución estacionaria: los primeros meses
// del período salían artificialmente limpios y luego la mora se disparaba.
const MORA_BURNIN_MESES = 180;

// Heterogeneidad de la cartera: cada crédito tiene su propio flujo de entrada
// a mora. UnTarjeta de consumo no se comporta como una hipotecaria.
const RIESGO_MIN = 0.45;
const RIESGO_MAX = 2.3;

function construirTransiciones(pEntrada: number): number[][] {
  const p = Math.min(0.25, Math.max(0, pEntrada));
  return [[1 - p, p, 0, 0, 0], ...MORA_TRANSICIONES];
}

function pEntradaPara(perfilRiesgo: number): number {
  const mult = RIESGO_MIN + perfilRiesgo * (RIESGO_MAX - RIESGO_MIN);
  return MORA_ENTRADA_BASE * mult * MORA_ESCALA_GLOBAL;
}

function avanzarTramo(estado: number, transiciones: number[][], rand: () => number): number {
  const fila = transiciones[estado];
  const u = rand();
  let acc = 0;
  for (let s = 0; s < MORA_STATES; s++) {
    acc += fila[s];
    if (u < acc) return s;
  }
  return estado;
}

function diasMoraParaTramo(
  estado: number,
  randInt: (min: number, max: number) => number,
): number {
  switch (estado) {
    case 1:
      return randInt(1, 29);
    case 2:
      return randInt(30, 59);
    case 3:
      return randInt(60, 89);
    case 4:
      return randInt(90, 240);
    default:
      return 0;
  }
}

function regionDeSucursal(sucursal: string): string {
  if (sucursal.includes('Viña')) return 'Valparaíso';
  if (sucursal.includes('Concepción')) return 'Biobío';
  if (sucursal.includes('Antofagasta')) return 'Antofagasta';
  return 'RM';
}

// ==========================================
// 1. GENERADOR DE RETAIL (Seed 20260929)
// ==========================================
function generateRetail() {
  const { choice, randInt, rand } = createRng(20260929);

  const CATEGORIAS = [
    'Hogar', 'Tecnología', 'Moda Mujer', 'Moda Hombre', 'Electro',
    'Deco', 'Deportes', 'Belleza', 'Infantil', 'Supermercado',
  ];
  const CANALES = ['online', 'tienda'];
  const REGIONES = ['RM', 'Valparaíso', 'Biobío', 'Antofagasta', 'Los Lagos'];
  const SEGMENTOS_CLIENTE = ['nuevo', 'recurrente', 'vip'];

  interface Sku {
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
    costo: number;
  }

  const SKUS: Sku[] = [];
  const SKU_NOMBRES: Record<string, string[]> = {
    Hogar: ['Juego de sábanas 2 plazas', 'Edredón nórdico plumón', 'Juego de toallas egipcias', 'Lámpara de pie moderna'],
    Tecnología: ['Smart TV 55" 4K UHD', 'Notebook 15.6" Core i5', 'Smartphone 128GB OLED', 'Audífonos Bluetooth Noise-Cancelling'],
    'Moda Mujer': ['Vestido midi estampado', 'Jeans flare tiro alto', 'Chaqueta de cuero sintética', 'Blazer sastre formal'],
    'Moda Hombre': ['Camisa lino manga larga', 'Pantalón chino beige', 'Parka impermeable urbana', 'Zapatos vestir de cuero'],
    Electro: ['Aspiradora robot inteligente', 'Cafetera espresso automática', 'Freidora de aire digital 5L', 'Microondas grill 28L'],
    Deco: ['Alfombra geométrica 160x230', 'Espejo circular marco dorado', 'Cuadro canvas abstracto', 'Florero cerámica nórdica'],
    Deportes: ['Bicicleta de montaña aro 29', 'Trotadora plegable eléctrica', 'Mancuernas ajustables 20kg', 'Mat de yoga antideslizante'],
    Belleza: ['Perfume Eau de Parfum 100ml', 'Serum ácido hialurónico', 'Set de brochas profesionales', 'Crema facial antiedad'],
    Infantil: ['Coche cuna plegable', 'Silla de auto ergonómica', 'Juguete educativo bloques', 'Ropa set recién nacido'],
    Supermercado: ['Pack café grano gourmet 1kg', 'Aceite de oliva extra virgen 2L', 'Vino Cabernet Reserva', 'Detergente líquido concentrado 5L'],
  };

  let skuCount = 1;
  for (const cat of CATEGORIAS) {
    const nombres = SKU_NOMBRES[cat] || ['Producto estándar ' + cat];
    for (let i = 0; i < nombres.length; i++) {
      const id = `SKU-${cat.substring(0, 3).toUpperCase()}-${String(skuCount++).padStart(3, '0')}`;
      let precioBase = 24990;
      if (cat === 'Tecnología' || cat === 'Electro' || cat === 'Deportes') precioBase = 189990;
      if (cat === 'Belleza' || cat === 'Supermercado') precioBase = 19990;
      const precio = randInt(Math.round((precioBase * 0.7) / 1000) * 1000, Math.round((precioBase * 1.6) / 1000) * 1000) - 10;
      const margenPct = randInt(35, 52) / 100;
      const costo = Math.round(precio * (1 - margenPct));
      SKUS.push({ id, nombre: nombres[i], categoria: cat, precio, costo });
    }
  }

  interface Customer {
    id: string;
    nombre: string;
    email: string;
    region: string;
    segmentoCliente: string;
  }

  const NOMBRES = ['Matías', 'Camila', 'Sebastián', 'Francisca', 'Diego', 'Valentina', 'Felipe', 'Constanza', 'Nicolás', 'Javiera'];
  const APELLIDOS = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda'];

  const CUSTOMERS: Customer[] = [];
  for (let i = 1; i <= 200; i++) {
    const nom = choice(NOMBRES);
    const ape = choice(APELLIDOS);
    CUSTOMERS.push({
      id: `CU-${String(i).padStart(4, '0')}`,
      nombre: `${nom} ${ape}`,
      email: `${nom.toLowerCase()}.${ape.toLowerCase()}${i}@ejemplo.cl`,
      region: choice(REGIONES),
      segmentoCliente: choice(SEGMENTOS_CLIENTE),
    });
  }

  const VIP_CUSTOMERS = CUSTOMERS.slice(0, 20);
  const RECURRENT_CUSTOMERS = CUSTOMERS.slice(20, 90);
  const NEW_CUSTOMERS = CUSTOMERS.slice(90);

  function randomDate(startStr: string, endStr: string): string {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const d = new Date(start + rand() * (end - start));
    return d.toISOString().split('T')[0];
  }

  interface RecordItem {
    id: string;
    orderId: string;
    customerId: string;
    skuId: string;
    date: string;
    categoria: string;
    canal: string;
    region: string;
    segmentoCliente: string;
    amount: number;
    cost: number;
    isReturn: boolean;
  }

  const RECORDS: RecordItem[] = [];
  let txId = 1000;
  let orderSeq = 50000;

  for (let i = 0; i < 700; i++) {
    orderSeq++;
    const orderId = `OR-${orderSeq}`;
    let customer: Customer;
    const r = rand();
    if (r < 0.35) customer = choice(VIP_CUSTOMERS);
    else if (r < 0.75) customer = choice(RECURRENT_CUSTOMERS);
    else customer = choice(NEW_CUSTOMERS);

    let date = randomDate('2025-10-01', '2026-09-30');
    if (rand() < 0.15) date = randomDate('2025-11-20', '2025-11-30');
    else if (rand() < 0.18) date = randomDate('2026-05-25', '2026-06-05');

    const canal = choice(CANALES);
    const itemsCount = randInt(1, 3);
    for (let it = 0; it < itemsCount; it++) {
      txId++;
      const sku = choice(SKUS);
      const isReturn = rand() < 0.035;
      const amount = sku.precio;
      const cost = isReturn ? 0 : sku.costo;
      RECORDS.push({
        id: `TX-${txId}`,
        orderId,
        customerId: customer.id,
        skuId: sku.id,
        date,
        categoria: sku.categoria,
        canal,
        region: customer.region,
        segmentoCliente: customer.segmentoCliente,
        amount,
        cost,
        isReturn,
      });
      if (RECORDS.length >= 1000) break;
    }
    if (RECORDS.length >= 1000) break;
  }

  RECORDS.sort((a, b) => a.date.localeCompare(b.date));

  function getMonthKpis(monthPrefix: string) {
    const monthRecords = RECORDS.filter((r) => r.date.startsWith(monthPrefix) && !r.isReturn);
    const totalAmount = monthRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalCost = monthRecords.reduce((sum, r) => sum + r.cost, 0);
    const uniqueOrders = new Set(monthRecords.map((r) => r.orderId)).size;
    const ticket = uniqueOrders > 0 ? Math.round(totalAmount / uniqueOrders) : 0;
    const margin = totalAmount > 0 ? parseFloat((((totalAmount - totalCost) / totalAmount) * 100).toFixed(1)) : 0;
    return { ticket, margin };
  }

  const sepKpis = getMonthKpis('2026-09');
  const agoKpis = getMonthKpis('2026-08');

  const outputData = {
    meta: {
      empresa: 'Retail Omnicanal Chileno (simulación 50 tiendas)',
      periodoInicio: '2025-10-01',
      periodoFin: '2026-09-30',
      moneda: 'CLP',
      dataGeneratedAt: '2026-09-29',
      seed: 20260929,
      businessInsight: {
        titulo: 'Fuga de clientes VIP en canal tienda física',
        descripcion:
          'El 34% de los clientes "Champions" del segmento RFM redujo su frecuencia en tiendas físicas un 18% en el Q3, migrando parcialmente a canales digitales con un ticket 12% menor.',
        accionRecomendada:
          'Activar campaña de fidelización omnicanal con retiro Click & Collect y beneficios en servicios presenciales.',
      },
    },
    initialKpis: [
      {
        key: 'ticketPromedio',
        label: 'Ticket Promedio',
        value: sepKpis.ticket || 48250,
        previousValue: agoKpis.ticket || 43100,
        unit: 'CLP',
        metricType: 'derived',
        benchmark: 42000,
        benchmarkSource: 'Ticket promedio sector retail chileno (CCS)',
      },
      {
        key: 'margenBrutoPct',
        label: 'Margen Bruto',
        value: sepKpis.margin || 41.2,
        previousValue: agoKpis.margin || 38.6,
        unit: '%',
        metricType: 'derived',
        benchmark: 40.0,
        benchmarkSource: 'Rango objetivo de la industria retail chilena (35-45%)',
      },
      {
        key: 'tasaConversion',
        label: 'Tasa Conversión',
        value: 3.8,
        previousValue: 3.5,
        unit: '%',
        metricType: 'precomputed',
        benchmark: 3.0,
        benchmarkSource: 'Mediana e-commerce en retail chileno',
      },
      {
        key: 'nps',
        label: 'NPS Transaccional',
        value: 64,
        previousValue: 61,
        unit: 'pts',
        metricType: 'precomputed',
        benchmark: 50,
        benchmarkSource: 'Estándar benchmark retail omnicanal en Chile',
      },
    ],
    lookups: {
      categorias: CATEGORIAS,
      canales: ['online', 'tienda', 'ambos'],
      regiones: REGIONES,
      segmentosCliente: SEGMENTOS_CLIENTE,
      segmentosRfm: ['Champions', 'Loyal', 'Potential', 'At Risk', 'Hibernating'],
    },
    records: RECORDS,
    skus: SKUS,
    customers: CUSTOMERS,
    precomputed: {
      funnel: [
        { step: 'Visitantes', value: 128400 },
        { step: 'Carrito', value: 21400 },
        { step: 'Compra', value: 4880 },
        { step: 'Repeat', value: 1730 },
      ],
      nps: {
        encuestas: 1850,
        promotores: 1420,
        detractores: 230,
        pasivos: 200,
      },
    },
  };

  fs.writeFileSync(path.join(dataDir, 'retail.json'), JSON.stringify(outputData), 'utf-8');
  console.log(`✓ data/retail.json generado con éxito (${RECORDS.length} transacciones, ${SKUS.length} SKUs, ${CUSTOMERS.length} clientes).`);
}

// ==========================================
// 2. GENERADOR DE BANCA (Seed 20260930)
// ==========================================
export interface BancaOpts {
  /** Escala global de la dinámica de mora. Único dial del modelo. */
  escalaMora?: number;
  /**
   * Número de colocaciones vigentes al inicio del período.
   *
   * No es un detalle cosmético: los KPIs de morosidad son ratios sobre la cola
   * de la cartera. Con ~1.300 créditos y una mora 90+ de 1,5%, la cola son
   * 4 créditos: el ratio lo decide el Bigger de ellos y cualquier cambio
   * mensual es ruido discreto, no un negocio. Crecer la cartera es lo que hace
   * que el indicador sea un promedio y no una moneda al aire.
   */
  creditosBase?: number;
  /** Si es false, no escribe data/banca.json (para barridos en memoria). */
  escribir?: boolean;
}

/**
 * Tamaño de cartera por defecto.
 *
 * Elegido midiendo, no por gusto: el ruido mensual de la mora 30+ cae como
 * 1/√N. Con 1.200 créditos la cola 90+ eran 4 créditos y el indicador lo
 * decidía el mayor de ellos (σ 0,41pp). Con 6.000 son ~120 y el ratio pasa a
 * ser un promedio real (σ 0,17pp) por 4,9MB de historial.
 *
 * Ver `pnpm data:calibrate` para la tabla completa tamaño/ruido/tamaño de
 * archivo antes de tocar este número.
 */
export const CREDITOS_BASE = 6000;

/**
 * Dial vigente de la dinámica de mora. Exportado para que el arnés de
 * calibración valide exactamente lo que el generador usa, en vez de repetir
 * el número y que se desincronice en silencio.
 */
export const ESCALA_MORA_VIGENTE = 2.8;

export function generateBanca(opts: BancaOpts = {}) {
  const { escalaMora = ESCALA_MORA_VIGENTE, creditosBase = CREDITOS_BASE, escribir = true } = opts;
  MORA_ESCALA_GLOBAL = escalaMora;
  const { choice, randInt, rand } = createRng(20260930);

  const PRODUCTOS = ['Consumo', 'Hipotecario', 'Comercial', 'Tarjeta'];
  const SEGMENTOS = ['Banca Personas', 'PyME', 'Banca Empresa', 'Banca Preferente'];
  const REGIONES = ['RM', 'Valparaíso', 'Biobío', 'Antofagasta', 'Los Lagos'];
  const SUCURSALES = [
    'SUC-001 Santiago Centro',
    'SUC-002 Las Condes',
    'SUC-003 Providencia',
    'SUC-004 Viña del Mar',
    'SUC-005 Concepción',
    'SUC-006 Antofagasta',
  ];

  interface CreditoRecord {
    id: string;
    clienteId: string;
    rut: string;
    nombre: string;
    producto: string;
    segmento: string;
    sucursal: string;
    region: string;
    fechaOtorgamiento: string;
    fechaVencimiento: string;
    montoOriginal: number;
    saldo: number;
    tasaInteresAnual: number;
    diasMora: number;
    tramoMora: string;
    provision: number;
  }

  const NOMBRES = ['Rodrigo', 'Carolina', 'Andrés', 'Loreto', 'Ignacio', 'Daniela', 'Cristóbal', 'Macarena', 'Gonzalo', 'Andrea'];
  const APELLIDOS = ['Vargas', 'Castillo', 'Fuentes', 'Valenzuela', 'Lagos', 'Poblete', 'Araya', 'Morales', 'Espinoza', 'Bravo'];

  // Serie mensual de la cartera: la banca es un STOCK medido en un instante,
  // no un flujo de eventos. Para que el filtro temporal sea real, cada crédito
  // necesita su estado mes a mes (saldo, mora y provisión).
  const MESES = [
    '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09',
  ];

  const RECORDS: CreditoRecord[] = [];
  const HISTORIAL: Record<
    string,
    Array<{ mes: string; saldo: number; diasMora: number; provision: number }>
  > = {};

  // Cartera de clientes: ~5 colocaciones por cliente, ratio sano para banca de
  // consumo. Antes la pool era fija en 400 y con una cartera de 6.000 créditos
  // eso serían 15 créditos por cliente.
  const CLIENTES_BANCA = Math.max(400, Math.round(creditosBase * 0.2));

  for (let i = 1; i <= creditosBase; i++) {
    const id = `CR-2026-${String(i).padStart(5, '0')}`;
    const clienteNum = randInt(1, CLIENTES_BANCA);
    const clienteId = `CL-${String(clienteNum).padStart(5, '0')}`;
    const rutNum = randInt(8000000, 24000000);
    const rutDv = randInt(0, 9);
    const rut = `${Math.floor(rutNum / 1000000)}.${Math.floor((rutNum % 1000000) / 1000)}.${String(rutNum % 1000).padStart(3, '0')}-${rutDv}`;
    const nombre = `${choice(NOMBRES)} ${choice(APELLIDOS)}`;

    const producto = choice(PRODUCTOS);
    const segmento = choice(SEGMENTOS);
    const sucursal = choice(SUCURSALES);
    const region = regionDeSucursal(sucursal);

    let montoOriginal = 6000000;
    let plazoMeses = 36;
    let tasaInteres = 16.5;

    if (producto === 'Hipotecario') {
      montoOriginal = randInt(65000000, 190000000);
      plazoMeses = randInt(240, 360);
      tasaInteres = randInt(48, 62) / 10;
    } else if (producto === 'Comercial') {
      montoOriginal = randInt(12000000, 85000000);
      plazoMeses = randInt(12, 60);
      tasaInteres = randInt(90, 145) / 10;
    } else if (producto === 'Consumo') {
      montoOriginal = randInt(2500000, 16000000);
      plazoMeses = randInt(12, 48);
      tasaInteres = randInt(140, 220) / 10;
    } else {
      // Tarjeta
      montoOriginal = randInt(1000000, 6500000);
      plazoMeses = 12;
      tasaInteres = randInt(210, 285) / 10;
    }

    const mesesTranscurridos = randInt(2, Math.min(plazoMeses - 1, 24));
    const factorSaldo = Math.max(0.15, (plazoMeses - mesesTranscurridos) / plazoMeses);
    const saldo = Math.round(montoOriginal * factorSaldo);

    // Trayectoria mensual de mora. La cartera evoluciona dentro del período:
    // un crédito sano puede entrar en mora y un moroso puede regularizarse.
    // Esto hace que el filtro temporal sea una ventana real sobre un stock.
    //
    // El perfil de riesgo fija el behavior de la cadena: cada crédito tiene su
    // propia matriz (más o menos agresiva) y se quema hasta su distribución
    // estacionaria antes de entrar al período medido.
    const perfilRiesgo = rand();
    const transiciones = construirTransiciones(pEntradaPara(perfilRiesgo));

    let estado = 0;
    for (let b = 0; b < MORA_BURNIN_MESES; b++) {
      estado = avanzarTramo(estado, transiciones, rand);
    }
    let diasMoraMes = diasMoraParaTramo(estado, randInt);

    // El saldo amortiza mes a mes (pago de cuotas), con caída más lenta en mora.
    const cuotaMensual = Math.round(montoOriginal / plazoMeses);
    let saldoMes = saldo;
    const serie: Array<{ mes: string; saldo: number; diasMora: number; provision: number }> = [];

    for (let m = 0; m < MESES.length; m++) {
      // Amortización
      if (diasMoraMes === 0) {
        saldoMes = Math.max(Math.round(montoOriginal * 0.06), saldoMes - cuotaMensual);
      } else {
        saldoMes = Math.max(Math.round(montoOriginal * 0.06), saldoMes - Math.round(cuotaMensual * 0.25));
      }

      // Transición de estado de mora
      estado = avanzarTramo(estado, transiciones, rand);
      diasMoraMes = diasMoraParaTramo(estado, randInt);

      const provMes = provisionFor(saldoMes, diasMoraMes);
      serie.push({ mes: MESES[m], saldo: saldoMes, diasMora: diasMoraMes, provision: provMes });
    }

    const ultimo = serie[serie.length - 1];
    const diasMora = ultimo.diasMora;
    const tramoMora = tramoFor(diasMora);
    const provision = ultimo.provision;
    const saldoFinal = ultimo.saldo;

    HISTORIAL[id] = serie;

    const fechaOtorgamiento = `2024-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
    const fechaVencimiento = `2027-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;

    RECORDS.push({
      id,
      clienteId,
      rut,
      nombre,
      producto,
      segmento,
      sucursal,
      region,
      fechaOtorgamiento,
      fechaVencimiento,
      montoOriginal,
      saldo: saldoFinal,
      tasaInteresAnual: tasaInteres,
      diasMora,
      tramoMora,
      provision,
    });
  }

  // Originaciones nuevas durante el período: hacen crecer la cartera mes a mes
  // y evitan que el saldo solo caiga por amortización.
  let nuevoId = creditosBase;
  const ENMES = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  for (let m = 0; m < ENMES.length; m++) {
    const mes = ENMES[m];
    const placements = randInt(6, 14);
    for (let k = 0; k < placements; k++) {
      nuevoId++;
      const clienteNum = randInt(1, CLIENTES_BANCA);
      const id = `CR-2026-${String(nuevoId).padStart(5, '0')}`;
      const producto = choice(PRODUCTOS);
      const segmento = choice(SEGMENTOS);
      const sucursal = choice(SUCURSALES);
      const region = regionDeSucursal(sucursal);
      const montoOriginal =
        producto === 'Hipotecario' ? randInt(65000000, 190000000)
        : producto === 'Comercial' ? randInt(12000000, 85000000)
        : producto === 'Consumo' ? randInt(2500000, 16000000)
        : randInt(1000000, 6500000);
      const plazoMeses =
        producto === 'Hipotecario' ? randInt(240, 360)
        : producto === 'Comercial' ? randInt(12, 60)
        : producto === 'Consumo' ? randInt(12, 48)
        : 12;

      // El crédito existe sólo a partir de su mes de otorgamiento
      const cuotaMensual = Math.round(montoOriginal / plazoMeses);
      const transiciones = construirTransiciones(pEntradaPara(rand()));
      // Una colocación nueva no parte "limpia" por convenience: parte del
      // estado estacionario de su perfil. Si arrancara siempre al día, el
      // primer mes del período se vería artificialmente sano.
      let estado = 0;
      for (let b = 0; b < MORA_BURNIN_MESES; b++) {
        estado = avanzarTramo(estado, transiciones, rand);
      }
      let diasMoraMes = diasMoraParaTramo(estado, randInt);
      let saldoMes = montoOriginal;
      const serie: Array<{ mes: string; saldo: number; diasMora: number; provision: number }> = [];
      for (let m2 = m; m2 < MESES.length; m2++) {
        if (diasMoraMes === 0) {
          saldoMes = Math.max(Math.round(montoOriginal * 0.06), saldoMes - cuotaMensual);
        } else {
          saldoMes = Math.max(Math.round(montoOriginal * 0.06), saldoMes - Math.round(cuotaMensual * 0.25));
        }
        estado = avanzarTramo(estado, transiciones, rand);
        diasMoraMes = diasMoraParaTramo(estado, randInt);
        serie.push({
          mes: MESES[m2],
          saldo: saldoMes,
          diasMora: diasMoraMes,
          provision: provisionFor(saldoMes, diasMoraMes),
        });
      }

      const ultimo = serie[serie.length - 1];
      HISTORIAL[id] = serie;
      const fechaOtorgamiento = `${mes}-${String(randInt(1, 28)).padStart(2, '0')}`;
      RECORDS.push({
        id,
        clienteId: `CL-${String(clienteNum).padStart(5, '0')}`,
        rut: `${randInt(1, 24)}.${String(randInt(100, 999))}.${String(randInt(100, 999))}-${randInt(0, 9)}`,
        nombre: `${choice(NOMBRES)} ${choice(APELLIDOS)}`,
        producto,
        segmento,
        sucursal,
        region,
        fechaOtorgamiento,
        fechaVencimiento: `2027-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
        montoOriginal,
        saldo: ultimo.saldo,
        tasaInteresAnual: 16.5,
        diasMora: ultimo.diasMora,
        tramoMora: tramoFor(ultimo.diasMora),
        provision: ultimo.provision,
      });
    }
  }

  // Movimientos de captación neta mensuales (12 meses)
  interface Movimiento {
    id: string;
    mes: string;
    tipo: 'deposito' | 'retiro';
    monto: number;
    segmento: string;
  }

  const MOVIMIENTOS: Movimiento[] = [];
  let mvId = 1000;
  for (const m of MESES) {
    for (const seg of SEGMENTOS) {
      mvId++;
      const dep = randInt(180000000, 320000000);
      const ret = randInt(140000000, 260000000);
      MOVIMIENTOS.push({ id: `MV-${mvId}`, mes: m, tipo: 'deposito', monto: dep, segmento: seg });
      mvId++;
      MOVIMIENTOS.push({ id: `MV-${mvId}`, mes: m, tipo: 'retiro', monto: ret, segmento: seg });
    }
  }

  // Precomputed: Estado de Resultados y ROE mensual.
  //
  // ANTES: `utilidadNeta`, `patrimonio` y `activos` se sorteaban de forma
  // INDEPENDIENTE de la cartera, y el resultado era un banco imposible: la
  // cartera del mismo snapshot sumaba 203.302.165.957 mientras el balance
  // declaraba 28.660.000.000 de activos, o sea la cartera era 7,09x el balance
  // total. La utilidad anual de 0,59 B sobre 203,3 B de cartera daba un retorno
  // de 0,29%, contra un margen de intermediación chileno de 3,5-5,0%.
  //
  // AHORA el estado de resultados se DERIVA de la cartera real que produce el
  // mismo historial, con un puente explícito y documentado:
  //   ingreso financiero bruto  = cartera x rendimiento anual
  //   menos costo de crédito   = provisiones del mes / 12
  //   menos gastos operativos   = cartera x gasto operativo anual
  //   = utilidad neta
  // y el patrimonio sale de un ROE objetivo, no de una rampa inventada.
  //
  // OJO con las provisiones: el campo `provision` de cada punto del historial
  // es el STOCK de provisiones constituidas contra esa exposición (2,83% de la
  // cartera a fin de mes), no un gasto del mes. Restarlo mes a mes como si fuera
  // flujo daba una utilidad negativa de -5.065M al mes. El costo de crédito
  // mensual es ese stock amortizado a 12 meses, que es el ECL recurrente anual
  // de la cartera.
  const RENDIMIENTO_CARTERA_ANUAL = 0.056; // 5,6% bruto sobre cartera
  const GASTO_OPERATIVO_ANUAL = 0.01; // 1,0% de la cartera
  const ROE_OBJETIVO = 0.145; // 14,5% = promedio del sistema bancario chileno
  const CARTERA_SOBRE_ACTIVOS = 0.62; // el resto es liquidez e inmovilizado
  const MESES_POR_ANIO = 12;

  const carteraYProvisionesPorMes = new Map<string, { cartera: number; provisiones: number }>();
  for (const serie of Object.values(HISTORIAL)) {
    for (const punto of serie) {
      const acc = carteraYProvisionesPorMes.get(punto.mes) ?? { cartera: 0, provisiones: 0 };
      acc.cartera += punto.saldo;
      acc.provisiones += punto.provision;
      carteraYProvisionesPorMes.set(punto.mes, acc);
    }
  }

  const RESULTADOS_MENSUALES = MESES.map((mes, idx) => {
    const { cartera, provisiones } = carteraYProvisionesPorMes.get(mes) ?? { cartera: 0, provisiones: 0 };
    const ingresoFinanciero = Math.round((cartera * RENDIMIENTO_CARTERA_ANUAL) / MESES_POR_ANIO);
    const costoCredito = Math.round(provisiones / MESES_POR_ANIO);
    const gastoOperativo = Math.round((cartera * GASTO_OPERATIVO_ANUAL) / MESES_POR_ANIO);
    const utilidadNeta = ingresoFinanciero - costoCredito - gastoOperativo;
    const utilidadAnualizada = utilidadNeta * MESES_POR_ANIO;
    // El patrimonio se ancla al ROE objetivo con una oscilación suave y
    // determinista: sin ella el ROE salía clavado en 14,5% los 12 meses, que se
    // lee como una tautología y deja la comparación entre ventanas sin delta.
    // Es una calibración explícita, no una medición: la fórmula está arriba.
    const oscilacionPatrimonio = 1 + 0.06 * Math.sin((2 * Math.PI * idx) / MESES.length);
    const patrimonio = Math.max(1, Math.round((utilidadAnualizada / ROE_OBJETIVO) * oscilacionPatrimonio));
    const activos = Math.round(cartera / CARTERA_SOBRE_ACTIVOS);
    // El patrimonio se derivó de la utilidad ANUALIZADA, así que el ROE tiene
    // que anualizar también: sin el factor 12 salía 1,2% en vez de 14,5%.
    const roe = parseFloat(((utilidadAnualizada / patrimonio) * 100).toFixed(1));
    const roa = parseFloat(((utilidadAnualizada / activos) * 100).toFixed(2));
    return { mes, utilidadNeta, patrimonio, activos, roe, roa };
  });

  const outputData = {
    meta: {
      empresa: 'Banco de Crédito y Servicios Chile (Simulado)',
      periodoInicio: '2025-10-01',
      periodoFin: '2026-09-30',
      moneda: 'CLP',
      dataGeneratedAt: '2026-09-29',
      seed: 20260930,
      businessInsight: {
        titulo: 'Alerta temprana de mora en cartera Comercial PyME',
        descripcion:
          'La mora 30+ días en el segmento PyME subió de 2,1% a 3,3% en el Q3 (Región Metropolitana y Biobío), concentrada en líneas de crédito comercial a corto plazo.',
        accionRecomendada:
          'Ajustar políticas de renovación automática de cupos y ejecutar cobranza preventiva con reestructuración de cuotas a tasa preferencial.',
      },
    },
    initialKpis: (() => {
      // Se derivan del historial real: primer mes vs último mes del período.
      // Evita los valores hardcodeados que rompían la reconciliación con el motor.
      const primerMes = MESES[0];
      const ultimoMes = MESES[MESES.length - 1];
      const snapshot = (mes: string) => {
        let saldo = 0;
        let mora30 = 0;
        let mora90 = 0;
        let prov = 0;
        for (const serie of Object.values(HISTORIAL)) {
          const punto = serie.find((s) => s.mes === mes);
          if (!punto) continue;
          saldo += punto.saldo;
          if (punto.diasMora >= 30) mora30 += punto.saldo;
          if (punto.diasMora >= 90) mora90 += punto.saldo;
          prov += punto.provision;
        }
        return {
          carteraTotal: saldo,
          moraCarteraPct: saldo > 0 ? parseFloat(((mora30 / saldo) * 100).toFixed(1)) : 0,
          moraVencida90Pct: saldo > 0 ? parseFloat(((mora90 / saldo) * 100).toFixed(1)) : 0,
          coberturaProvisiones:
            mora90 > 0 ? parseFloat(((prov / mora90) * 100).toFixed(1)) : 100,
        };
      };
      const inicio = snapshot(primerMes);
      const fin = snapshot(ultimoMes);
      return [
        {
          key: 'carteraTotal',
          label: 'Cartera Total Colocaciones',
          value: fin.carteraTotal,
          previousValue: inicio.carteraTotal,
          unit: 'CLP',
          metricType: 'derived',
          benchmark: BANCA_METRICS.carteraTotal.benchmark,
          benchmarkSource: BANCA_METRICS.carteraTotal.benchmarkSource,
        },
        {
          key: 'moraCarteraPct',
          label: 'Mora CMF (30+ días)',
          value: fin.moraCarteraPct,
          previousValue: inicio.moraCarteraPct,
          unit: '%',
          metricType: 'derived',
          benchmark: BANCA_METRICS.moraCarteraPct.benchmark,
          benchmarkSource: BANCA_METRICS.moraCarteraPct.benchmarkSource,
        },
        {
          key: 'moraVencida90Pct',
          label: 'Mora Vencida (90+ días)',
          value: fin.moraVencida90Pct,
          previousValue: inicio.moraVencida90Pct,
          unit: '%',
          metricType: 'derived',
          benchmark: BANCA_METRICS.moraVencida90Pct.benchmark,
          benchmarkSource: BANCA_METRICS.moraVencida90Pct.benchmarkSource,
        },
        {
          key: 'coberturaProvisiones',
          label: 'Cobertura de Provisiones',
          value: fin.coberturaProvisiones,
          previousValue: inicio.coberturaProvisiones,
          unit: '%',
          metricType: 'derived',
          benchmark: BANCA_METRICS.coberturaProvisiones.benchmark,
          benchmarkSource: BANCA_METRICS.coberturaProvisiones.benchmarkSource,
        },
        {
          key: 'roe',
          label: 'ROE Anualizado',
          // Se deriva del estado de resultados real en vez de ir hardcodeado:
          // antes el primer pintado mostraba 15,2% mientras el motor, sobre el
          // mismo mes, podía devolver otro número.
          value: RESULTADOS_MENSUALES[RESULTADOS_MENSUALES.length - 1].roe,
          previousValue: RESULTADOS_MENSUALES[0].roe,
          unit: '%',
          metricType: 'precomputed',
          benchmark: BANCA_METRICS.roe.benchmark,
          benchmarkSource: BANCA_METRICS.roe.benchmarkSource,
        },
      ];
    })(),
    lookups: {
      productos: PRODUCTOS,
      segmentos: SEGMENTOS,
      regiones: REGIONES,
      sucursales: SUCURSALES,
      tramosMora: ['Al Día (0d)', 'Mora 1-29d', 'Mora 30-59d', 'Mora 60-89d', 'Mora 90+d'],
    },
    records: RECORDS,
    recordsMovimientos: MOVIMIENTOS,
    // Serie mensual por crédito: convierte la cartera en un stock medible en el tiempo
    historialCartera: HISTORIAL,
    precomputed: {
      resultadoMensual: RESULTADOS_MENSUALES,
    },
  };

  if (escribir) {
    fs.writeFileSync(path.join(dataDir, 'banca.json'), JSON.stringify(outputData), 'utf-8');
    console.log(`✓ data/banca.json generado con éxito (${RECORDS.length} colocaciones, ${MOVIMIENTOS.length} movimientos).`);
  }
  return outputData;
}

// ==========================================
// 3. GENERADOR DE LOGÍSTICA (Seed 20260931)
// ==========================================
function generateLogistica() {
  const { choice, randInt, rand } = createRng(20260931);

  const RUTAS = [
    'RM - Valparaíso (120 km)',
    'RM - Concepción (500 km)',
    'RM - Antofagasta (1.360 km)',
    'RM - La Serena (470 km)',
    'RM - Puerto Montt (1.030 km)',
    'Urbano RM Norte',
    'Urbano RM Sur',
    'Urbano RM Oriente',
    'Urbano RM Poniente',
  ];

  const TRANSPORTISTAS = [
    'TransLog Chile (TR-01)',
    'Flota Andes Express (TR-02)',
    'Transportes Pacífico (TR-03)',
    'Rápido Metropolitano (TR-04)',
    'Sur Cargo Express (TR-05)',
    'Logística Troncal SpA (TR-06)',
    'Última Milla Connect (TR-07)',
  ];

  const TIPOS_CARGA = ['Seco', 'Refrigerado', 'Frágil', 'Sobredimensionado'];
  const PRIORIDADES = ['Estándar', 'Express 24h', 'Same Day'];
  const CAUSAS_INCIDENCIA = [
    'Dirección errónea o incompleta',
    'Destinatario ausente',
    'Demora en tránsito / congestión ruta 5',
    'Quiebre de embalaje / daño en carga',
    'Retraso en despacho CD Lo Boza',
  ];

  interface DespachoRecord {
    id: string;
    ordenId: string;
    cliente: string;
    ruta: string;
    transportista: string;
    tipoCarga: string;
    prioridad: string;
    fechaDespacho: string;
    fechaEntregaPrometida: string;
    fechaEntregaReal: string;
    horasLeadTime: number;
    unidadesOrdenadas: number;
    unidadesEntregadas: number;
    cumpleTiempo: boolean;
    cumpleCompleto: boolean;
    otif: boolean;
    costo: number;
    km: number;
    incidencia: string | null;
  }

  const CLIENTES = [
    'Supermercados Alsur', 'Cencosud Retail', 'Falabella Distribución', 'Ripley Logística',
    'Farmacias Cruz Verde', 'Salcobrand Express', 'Sodimac Constructor', 'Easy Hogar',
    'Distribuidora Macul', 'Comercializadora Pacífico'
  ];

  const RECORDS: DespachoRecord[] = [];

  function addHoursToDate(dateStr: string, hours: number): string {
    const d = new Date(`${dateStr}T08:00:00Z`);
    d.setHours(d.getHours() + hours);
    return d.toISOString().split('T')[0];
  }

  function randomLogDate(): string {
    const start = new Date('2025-10-01').getTime();
    const end = new Date('2026-09-30').getTime();
    const d = new Date(start + rand() * (end - start));
    return d.toISOString().split('T')[0];
  }

  for (let i = 1; i <= 1000; i++) {
    const id = `DS-${String(i).padStart(6, '0')}`;
    const ordenId = `ORD-${randInt(100000, 999999)}`;
    const cliente = choice(CLIENTES);
    const ruta = choice(RUTAS);
    const transportista = choice(TRANSPORTISTAS);
    const tipoCarga = choice(TIPOS_CARGA);
    const prioridad = choice(PRIORIDADES);

    const fechaDespacho = randomLogDate();

    // Horas prometidas de SLA según prioridad y ruta
    let horasSla = 24;
    let km = 35;
    if (ruta.includes('Antofagasta')) {
      horasSla = 48;
      km = 1360;
    } else if (ruta.includes('Puerto Montt')) {
      horasSla = 36;
      km = 1030;
    } else if (ruta.includes('Concepción') || ruta.includes('La Serena')) {
      horasSla = 24;
      km = 480;
    } else if (ruta.includes('Valparaíso')) {
      horasSla = 18;
      km = 120;
    } else {
      // Urbano RM
      horasSla = prioridad === 'Same Day' ? 10 : prioridad === 'Express 24h' ? 18 : 24;
      km = randInt(15, 60);
    }

    // Lead time real con distribución normal/log-normal
    const rL = rand();
    let horasLeadTime = Math.round(horasSla * (0.65 + rand() * 0.35)); // En tiempo normal (65%-100% SLA)
    let cumpleTiempo = true;

    // Fricción especial en ruta Antofagasta según businessInsight
    const isAntofagasta = ruta.includes('Antofagasta');
    const delayProb = isAntofagasta ? 0.16 : 0.055;

    if (rL < delayProb) {
      cumpleTiempo = false;
      horasLeadTime = Math.round(horasSla * (1.15 + rand() * 0.6)); // Demora fuera de SLA
    }

    const fechaEntregaPrometida = addHoursToDate(fechaDespacho, horasSla);
    const fechaEntregaReal = addHoursToDate(fechaDespacho, horasLeadTime);

    // Unidades ordenadas y entregadas (cumpleCompleto)
    const unidadesOrdenadas = randInt(20, 250);
    let unidadesEntregadas = unidadesOrdenadas;
    let cumpleCompleto = true;

    if (rand() < 0.045) {
      cumpleCompleto = false;
      unidadesEntregadas = Math.round(unidadesOrdenadas * (0.85 + rand() * 0.1));
    }

    const otif = cumpleTiempo && cumpleCompleto;

    let incidencia: string | null = null;
    if (!otif) {
      if (!cumpleTiempo && isAntofagasta) {
        incidencia = 'Retraso en despacho CD Lo Boza';
      } else if (!cumpleCompleto) {
        incidencia = 'Quiebre de embalaje / daño en carga';
      } else {
        incidencia = choice(CAUSAS_INCIDENCIA);
      }
    }

    // Costo de flete en CLP
    const costoBaseKm = km * randInt(180, 260);
    const costo = Math.round((costoBaseKm + randInt(15000, 35000)) / 100) * 100;

    RECORDS.push({
      id,
      ordenId,
      cliente,
      ruta,
      transportista,
      tipoCarga,
      prioridad,
      fechaDespacho,
      fechaEntregaPrometida,
      fechaEntregaReal,
      horasLeadTime,
      unidadesOrdenadas,
      unidadesEntregadas,
      cumpleTiempo,
      cumpleCompleto,
      otif,
      costo,
      km,
      incidencia,
    });
  }

  RECORDS.sort((a, b) => a.fechaDespacho.localeCompare(b.fechaDespacho));

  const totalDespachos = RECORDS.length;
  const otifCount = RECORDS.filter((r) => r.otif).length;
  const otifPct = parseFloat(((otifCount / totalDespachos) * 100).toFixed(1));

  const outputData = {
    meta: {
      empresa: 'Operador Logístico Chileno (Red Troncal y RM)',
      periodoInicio: '2025-10-01',
      periodoFin: '2026-09-30',
      moneda: 'CLP',
      dataGeneratedAt: '2026-09-29',
      seed: 20260931,
      businessInsight: {
        titulo: 'Fricción de SLA y caída de OTIF en ruta RM - Antofagasta',
        descripcion:
          'La ruta interurbana norte presenta un OTIF de 86,4% (frente a la meta de 95%), con un Lead Time P90 de 44 horas debido a demoras de consolidación en centro de distribución Lo Boza.',
        accionRecomendada:
          'Reasignar volumen a Flota Andes Express para troncales norte y adelantar corte horario de despacho a las 14:00 hrs.',
      },
    },
    initialKpis: [
      {
        key: 'otifPct',
        label: 'Cumplimiento OTIF',
        value: otifPct,
        previousValue: 92.4,
        unit: '%',
        metricType: 'derived',
        benchmark: 95.0,
        benchmarkSource: 'Estándar EDI / ASOEX Logístico Chile',
      },
      {
        key: 'leadTimeP50',
        label: 'Lead Time P50 (Mediana)',
        value: 16.5,
        previousValue: 17.2,
        unit: 'hrs',
        metricType: 'derived',
        benchmark: 18.0,
        benchmarkSource: 'SLA promedio interurbano nacional',
      },
      {
        key: 'fillRatePct',
        label: 'Fill Rate en Volumen',
        value: 98.4,
        previousValue: 97.8,
        unit: '%',
        metricType: 'derived',
        benchmark: 98.0,
        benchmarkSource: 'Estándar de exactitud de despacho',
      },
      {
        key: 'costoPorDespacho',
        label: 'Costo Promedio Despacho',
        value: Math.round(RECORDS.reduce((s, r) => s + r.costo, 0) / RECORDS.length),
        previousValue: 46200,
        unit: 'CLP',
        metricType: 'derived',
        benchmark: 45000,
        benchmarkSource: 'Presupuesto de flete unitario',
      },
    ],
    lookups: {
      rutas: RUTAS,
      transportistas: TRANSPORTISTAS,
      tiposCarga: TIPOS_CARGA,
      prioridades: PRIORIDADES,
      causasIncidencia: CAUSAS_INCIDENCIA,
    },
    records: RECORDS,
  };

  fs.writeFileSync(path.join(dataDir, 'logistica.json'), JSON.stringify(outputData), 'utf-8');
  console.log(`✓ data/logistica.json generado con éxito (${RECORDS.length} despachos, ${RUTAS.length} rutas).`);
}

// Ejecutar generadores (sólo cuando se ejecuta el script, no al importar)
if (require.main === module) {
  generateRetail();
  generateBanca();
  generateLogistica();
}
