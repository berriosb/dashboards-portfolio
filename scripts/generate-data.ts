import fs from 'fs';
import path from 'path';

// PRNG determinista: Mulberry32
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260929;
const rand = mulberry32(SEED);

function choice<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const CATEGORIAS = [
  'Hogar',
  'Tecnología',
  'Moda Mujer',
  'Moda Hombre',
  'Electro',
  'Deco',
  'Deportes',
  'Belleza',
  'Infantil',
  'Supermercado',
];

const CANALES = ['online', 'tienda'];
const REGIONES = ['RM', 'Valparaíso', 'Biobío', 'Antofagasta', 'Los Lagos'];
const SEGMENTOS_CLIENTE = ['nuevo', 'recurrente', 'vip'];

// Generación de SKUs
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
    
    const precio = randInt(Math.round(precioBase * 0.7 / 1000) * 1000, Math.round(precioBase * 1.6 / 1000) * 1000) - 10;
    const margenPct = randInt(35, 52) / 100;
    const costo = Math.round(precio * (1 - margenPct));
    SKUS.push({ id, nombre: nombres[i], categoria: cat, precio, costo });
  }
}

// Generación de Clientes (200 clientes)
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

// Generación de Fechas entre 2025-10-01 y 2026-09-30 (365 días)
function getRandomDate() {
  const start = new Date(2025, 9, 1).getTime();
  const end = new Date(2026, 8, 30).getTime();
  const t = start + rand() * (end - start);
  const d = new Date(t);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Generación de Transacciones (1.000 records)
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
for (let i = 1; i <= 1000; i++) {
  const customer = choice(CUSTOMERS);
  const sku = choice(SKUS);
  const qty = rand() < 0.8 ? 1 : randInt(2, 3);
  const isReturn = rand() < 0.035; // 3.5% devoluciones
  const amount = sku.precio * qty;
  const cost = sku.costo * qty;
  const canal = customer.segmentoCliente === 'vip' && rand() < 0.65 ? 'online' : choice(CANALES);

  RECORDS.push({
    id: `TX-${String(i).padStart(5, '0')}`,
    orderId: `OR-${String(randInt(10000, 99999))}`,
    customerId: customer.id,
    skuId: sku.id,
    date: getRandomDate(),
    categoria: sku.categoria,
    canal,
    region: customer.region,
    segmentoCliente: customer.segmentoCliente,
    amount,
    cost,
    isReturn,
  });
}

// Ordenar por fecha cronológicamente
RECORDS.sort((a, b) => a.date.localeCompare(b.date));

// Cálculo de KPIs iniciales para el mes de corte (Septiembre 2026 vs Agosto 2026)
function getMonthKpis(monthPrefix: string) {
  const monthRecords = RECORDS.filter(r => r.date.startsWith(monthPrefix) && !r.isReturn);
  const totalAmount = monthRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalCost = monthRecords.reduce((sum, r) => sum + r.cost, 0);
  const uniqueOrders = new Set(monthRecords.map(r => r.orderId)).size;
  const ticket = uniqueOrders > 0 ? Math.round(totalAmount / uniqueOrders) : 0;
  const margin = totalAmount > 0 ? parseFloat(((totalAmount - totalCost) / totalAmount * 100).toFixed(1)) : 0;
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
    seed: SEED,
    businessInsight: {
      titulo: 'Fuga de clientes VIP en canal tienda física',
      descripcion: 'El 34% de los clientes "Champions" del segmento RFM redujo su frecuencia en tiendas físicas un 18% en el Q3, migrando parcialmente a canales digitales con un ticket 12% menor.',
      accionRecomendada: 'Activar campaña de fidelización omnicanal con retiro Click & Collect y beneficios en servicios presenciales.',
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

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'retail.json'), JSON.stringify(outputData, null, 2), 'utf-8');
console.log(`✓ data/retail.json generado con éxito (${RECORDS.length} transacciones, ${SKUS.length} SKUs, ${CUSTOMERS.length} clientes).`);
