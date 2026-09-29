import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(__dirname, '../data');

function checkFile(filename: string) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`✗ Error: El archivo ${filePath} no existe. Ejecuta pnpm data:generate primero.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

let hasErrors = false;

// ==========================================
// 1. CHEQUEO RETAIL
// ==========================================
console.log('--- Validando retail.json ---');
const retail = checkFile('retail.json');
const retailErrors: string[] = [];

let totalVentas = 0;
let totalCostos = 0;
for (const r of retail.records) {
  if (!r.isReturn) {
    totalVentas += r.amount;
    totalCostos += r.cost;
  }
}
const margenRetail = ((totalVentas - totalCostos) / totalVentas) * 100;
if (margenRetail < 30 || margenRetail > 60) {
  retailErrors.push(`Margen retail (${margenRetail.toFixed(1)}%) fuera de rango 30-60%.`);
}

const funnel = retail.precomputed.funnel;
for (let i = 1; i < funnel.length; i++) {
  if (funnel[i].value > funnel[i - 1].value) {
    retailErrors.push(`Funnel inconsistente: ${funnel[i].step} > ${funnel[i - 1].step}`);
  }
}

if (retailErrors.length > 0) {
  hasErrors = true;
  console.error('✗ Errores en retail.json:', retailErrors);
} else {
  console.log(`✓ retail.json validado: ${retail.records.length} transacciones, margen ${margenRetail.toFixed(1)}%.`);
}

// ==========================================
// 2. CHEQUEO BANCA
// ==========================================
console.log('--- Validando banca.json ---');
const banca = checkFile('banca.json');
const bancaErrors: string[] = [];

if (!Array.isArray(banca.records) || banca.records.length < 1000) {
  bancaErrors.push(`Registros de colocaciones insuficientes: ${banca.records?.length}`);
}

let saldoTotal = 0;
let saldoMora30 = 0;
let saldoMora90 = 0;
let provisionTotal = 0;

for (const cr of banca.records) {
  if (cr.saldo <= 0) bancaErrors.push(`Crédito ${cr.id} tiene saldo <= 0`);
  if (cr.saldo > cr.montoOriginal) bancaErrors.push(`Crédito ${cr.id} tiene saldo > montoOriginal`);
  saldoTotal += cr.saldo;
  if (cr.diasMora >= 30) saldoMora30 += cr.saldo;
  if (cr.diasMora >= 90) saldoMora90 += cr.saldo;
  provisionTotal += cr.provision;
}

if (saldoMora90 > saldoMora30) {
  bancaErrors.push(`Invariante CMF violada: saldo mora 90+ (${saldoMora90}) no puede superar mora 30+ (${saldoMora30}).`);
}

const mora30Pct = (saldoMora30 / saldoTotal) * 100;
const mora90Pct = (saldoMora90 / saldoTotal) * 100;

if (mora90Pct > mora30Pct) {
  bancaErrors.push(`Porcentaje mora 90+ (${mora90Pct.toFixed(1)}%) supera mora 30+ (${mora30Pct.toFixed(1)}%).`);
}

if (bancaErrors.length > 0) {
  hasErrors = true;
  console.error('✗ Errores en banca.json:', bancaErrors);
} else {
  console.log(`✓ banca.json validado: ${banca.records.length} colocaciones, Mora 30+ CMF ${mora30Pct.toFixed(1)}%, Mora 90+ ${mora90Pct.toFixed(1)}%.`);
}

// ==========================================
// 3. CHEQUEO LOGÍSTICA
// ==========================================
console.log('--- Validando logistica.json ---');
const logistica = checkFile('logistica.json');
const logErrors: string[] = [];

if (!Array.isArray(logistica.records) || logistica.records.length < 1000) {
  logErrors.push(`Registros de despachos insuficientes: ${logistica.records?.length}`);
}

let otifCount = 0;
for (const d of logistica.records) {
  if (d.unidadesEntregadas > d.unidadesOrdenadas) {
    logErrors.push(`Despacho ${d.id} tiene entregadas > ordenadas.`);
  }
  if (d.horasLeadTime <= 0) {
    logErrors.push(`Despacho ${d.id} tiene lead time <= 0.`);
  }
  const calcOtif = d.cumpleTiempo && d.cumpleCompleto;
  if (d.otif !== calcOtif) {
    logErrors.push(`Despacho ${d.id} tiene OTIF inconsistente: flag ${d.otif} vs cálculo ${calcOtif}`);
  }
  if (d.otif) otifCount++;
}

const otifPct = (otifCount / logistica.records.length) * 100;
if (otifPct < 80 || otifPct > 99) {
  logErrors.push(`OTIF global (${otifPct.toFixed(1)}%) fuera del rango operativo realista (80% - 99%).`);
}

if (logErrors.length > 0) {
  hasErrors = true;
  console.error('✗ Errores en logistica.json:', logErrors);
} else {
  console.log(`✓ logistica.json validado: ${logistica.records.length} despachos, OTIF ${otifPct.toFixed(1)}%.`);
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('\n✓ Todos los datasets verificados con 0 errores de invariantes.');
}
