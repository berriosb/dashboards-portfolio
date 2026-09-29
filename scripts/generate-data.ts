import fs from 'fs';
import path from 'path';

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

  fs.writeFileSync(path.join(dataDir, 'retail.json'), JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`✓ data/retail.json generado con éxito (${RECORDS.length} transacciones, ${SKUS.length} SKUs, ${CUSTOMERS.length} clientes).`);
}

// ==========================================
// 2. GENERADOR DE BANCA (Seed 20260930)
// ==========================================
function generateBanca() {
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

  const RECORDS: CreditoRecord[] = [];

  for (let i = 1; i <= 1200; i++) {
    const id = `CR-2026-${String(i).padStart(5, '0')}`;
    const clienteNum = randInt(1, 400);
    const clienteId = `CL-${String(clienteNum).padStart(5, '0')}`;
    const rutNum = randInt(8000000, 24000000);
    const rutDv = randInt(0, 9);
    const rut = `${Math.floor(rutNum / 1000000)}.${Math.floor((rutNum % 1000000) / 1000)}.${String(rutNum % 1000).padStart(3, '0')}-${rutDv}`;
    const nombre = `${choice(NOMBRES)} ${choice(APELLIDOS)}`;

    const producto = choice(PRODUCTOS);
    const segmento = choice(SEGMENTOS);
    const sucursal = choice(SUCURSALES);
    const region = sucursal.includes('Viña') ? 'Valparaíso' : sucursal.includes('Concepción') ? 'Biobío' : sucursal.includes('Antofagasta') ? 'Antofagasta' : 'RM';

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

    // Distribución realista de mora en banca chilena
    const rMora = rand();
    let diasMora = 0;
    let tramoMora = 'Al Día (0d)';

    if (rMora < 0.82) {
      diasMora = 0;
      tramoMora = 'Al Día (0d)';
    } else if (rMora < 0.92) {
      diasMora = randInt(1, 29);
      tramoMora = 'Mora 1-29d';
    } else if (rMora < 0.96) {
      diasMora = randInt(30, 59);
      tramoMora = 'Mora 30-59d';
    } else if (rMora < 0.98) {
      diasMora = randInt(60, 89);
      tramoMora = 'Mora 60-89d';
    } else {
      diasMora = randInt(90, 240);
      tramoMora = 'Mora 90+d';
    }

    // Provisiones según estándar CMF / IFRS 9
    let provision = Math.round(saldo * 0.012); // Provisión genérica base ~1.2%
    if (diasMora >= 30 && diasMora < 60) {
      provision = Math.round(saldo * 0.18);
    } else if (diasMora >= 60 && diasMora < 90) {
      provision = Math.round(saldo * 0.45);
    } else if (diasMora >= 90) {
      provision = Math.round(saldo * 0.85); // Cartera deteriorada severa
    }

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
      saldo,
      tasaInteresAnual: tasaInteres,
      diasMora,
      tramoMora,
      provision,
    });
  }

  // Movimientos de captación neta mensuales (12 meses)
  const MESES = [
    '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09',
  ];

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

  // Precomputed: Estado de Resultados y ROE mensual
  const RESULTADOS_MENSUALES = MESES.map((mes, idx) => {
    const utilidadNeta = randInt(42000000, 58000000);
    const patrimonio = 3800000000 + idx * 25000000;
    const activos = 28000000000 + idx * 120000000;
    const roe = parseFloat(((utilidadNeta * 12 / patrimonio) * 100).toFixed(1));
    const roa = parseFloat(((utilidadNeta * 12 / activos) * 100).toFixed(2));
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
    initialKpis: [
      {
        key: 'carteraTotal',
        label: 'Cartera Total Colocaciones',
        value: RECORDS.reduce((s, r) => s + r.saldo, 0),
        previousValue: Math.round(RECORDS.reduce((s, r) => s + r.saldo, 0) * 0.94),
        unit: 'CLP',
        metricType: 'derived',
        benchmark: 1500000000,
        benchmarkSource: 'Presupuesto de colocaciones CMF',
      },
      {
        key: 'moraCarteraPct',
        label: 'Mora CMF (30+ días)',
        value: 2.4,
        previousValue: 2.1,
        unit: '%',
        metricType: 'derived',
        benchmark: 2.5,
        benchmarkSource: 'Umbral prudencial CMF morosidad temprana',
      },
      {
        key: 'moraVencida90Pct',
        label: 'Mora Vencida (90+ días)',
        value: 1.1,
        previousValue: 0.95,
        unit: '%',
        metricType: 'derived',
        benchmark: 1.0,
        benchmarkSource: 'Gatillo provisión obligatoria CMF',
      },
      {
        key: 'coberturaProvisiones',
        label: 'Cobertura de Provisiones',
        value: 138.4,
        previousValue: 142.1,
        unit: '%',
        metricType: 'derived',
        benchmark: 130.0,
        benchmarkSource: 'Regulación CMF (estándar IFRS 9)',
      },
      {
        key: 'roe',
        label: 'ROE Anualizado',
        value: 15.2,
        previousValue: 14.8,
        unit: '%',
        metricType: 'precomputed',
        benchmark: 14.5,
        benchmarkSource: 'Promedio histórico banca chilena (CMF)',
      },
    ],
    lookups: {
      productos: PRODUCTOS,
      segmentos: SEGMENTOS,
      regiones: REGIONES,
      sucursales: SUCURSALES,
      tramosMora: ['Al Día (0d)', 'Mora 1-29d', 'Mora 30-59d', 'Mora 60-89d', 'Mora 90+d'],
    },
    records: RECORDS,
    recordsMovimientos: MOVIMIENTOS,
    precomputed: {
      resultadoMensual: RESULTADOS_MENSUALES,
    },
  };

  fs.writeFileSync(path.join(dataDir, 'banca.json'), JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`✓ data/banca.json generado con éxito (${RECORDS.length} colocaciones, ${MOVIMIENTOS.length} movimientos).`);
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

  fs.writeFileSync(path.join(dataDir, 'logistica.json'), JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`✓ data/logistica.json generado con éxito (${RECORDS.length} despachos, ${RUTAS.length} rutas).`);
}

// Ejecutar generadores
generateRetail();
generateBanca();
generateLogistica();
