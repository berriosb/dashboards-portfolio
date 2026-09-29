import fs from 'fs';
import path from 'path';

const filePath = path.resolve(__dirname, '../data/retail.json');

if (!fs.existsSync(filePath)) {
  console.error(`✗ Error: El archivo ${filePath} no existe. Ejecuta pnpm data:generate primero.`);
  process.exit(1);
}

const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

const errors: string[] = [];

// Invariante 1: Metadatos completos
if (!data.meta?.periodoInicio || !data.meta?.periodoFin) {
  errors.push('Faltan periodos en meta.');
}

// Invariante 2: Registros no vacíos
if (!Array.isArray(data.records) || data.records.length === 0) {
  errors.push('El array records está vacío o no es un arreglo.');
}

// Invariante 3: Integridad de cada registro
let totalVentas = 0;
let totalCostos = 0;
const pInicio = data.meta.periodoInicio;
const pFin = data.meta.periodoFin;

for (let i = 0; i < data.records.length; i++) {
  const r = data.records[i];
  if (!r.id || !r.orderId || !r.customerId || !r.skuId) {
    errors.push(`Registro #${i} (${r.id}) carece de IDs de entidad obligatorios.`);
    break;
  }
  if (r.date < pInicio || r.date > pFin) {
    errors.push(`Registro ${r.id} tiene fecha ${r.date} fuera de rango [${pInicio}, ${pFin}].`);
    break;
  }
  if (r.amount <= 0 || r.cost <= 0) {
    errors.push(`Registro ${r.id} tiene montos inválidos (amount: ${r.amount}, cost: ${r.cost}).`);
    break;
  }
  if (r.cost > r.amount) {
    errors.push(`Registro ${r.id} tiene costo superior a la venta.`);
    break;
  }
  if (!data.lookups.categorias.includes(r.categoria)) {
    errors.push(`Registro ${r.id} tiene categoría desconocida: ${r.categoria}`);
    break;
  }
  if (!r.isReturn) {
    totalVentas += r.amount;
    totalCostos += r.cost;
  }
}

// Invariante 4: Margen global coherente
const margenGlobal = ((totalVentas - totalCostos) / totalVentas) * 100;
if (margenGlobal < 30 || margenGlobal > 60) {
  errors.push(`Margen bruto global (${margenGlobal.toFixed(1)}%) fuera del rango de retail (30% - 60%).`);
}

// Invariante 5: Funnel decreciente monótono
const funnel = data.precomputed.funnel;
for (let i = 1; i < funnel.length; i++) {
  if (funnel[i].value > funnel[i - 1].value) {
    errors.push(`Funnel inconsistente: etapa ${funnel[i].step} (${funnel[i].value}) es mayor que la anterior (${funnel[i - 1].value}).`);
  }
}

// Invariante 6: NPS coherente
const nps = data.precomputed.nps;
const npsCalculado = Math.round(((nps.promotores - nps.detractores) / nps.encuestas) * 100);
const npsKpi = data.initialKpis.find((k: any) => k.key === 'nps')?.value;
if (npsCalculado !== npsKpi) {
  errors.push(`NPS en KPI (${npsKpi}) no coincide con cálculo de encuestas (${npsCalculado}).`);
}

if (errors.length > 0) {
  console.error('✗ Invariantes violadas:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`✓ Validación de invariantes exitosa:`);
  console.log(`  - ${data.records.length} transacciones verificadas.`);
  console.log(`  - Ventas netas totales: $${new Intl.NumberFormat('es-CL').format(totalVentas)} CLP.`);
  console.log(`  - Margen bruto global: ${margenGlobal.toFixed(1)}%.`);
  console.log(`  - Funnel y NPS validados matemáticamente.`);
}
