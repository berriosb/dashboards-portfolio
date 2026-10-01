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
let provisionMora90 = 0;
let provisionMora30 = 0;

for (const cr of banca.records) {
  if (cr.saldo <= 0) bancaErrors.push(`Crédito ${cr.id} tiene saldo <= 0`);
  if (cr.saldo > cr.montoOriginal) bancaErrors.push(`Crédito ${cr.id} tiene saldo > montoOriginal`);
  if (cr.provision < 0) bancaErrors.push(`Crédito ${cr.id} tiene provisión negativa`);
  saldoTotal += cr.saldo;
  if (cr.diasMora >= 30) saldoMora30 += cr.saldo;
  if (cr.diasMora >= 90) saldoMora90 += cr.saldo;
  provisionTotal += cr.provision;
  if (cr.diasMora >= 90) provisionMora90 += cr.provision;
  if (cr.diasMora >= 30) provisionMora30 += cr.provision;
}

// Invariante IFRS 9: la provision esperada se concentra en la cola de mora, asi
// que la mora 90+ debe tener una provision menor que la 30+ y que el total
// (Stage 3 vs. provisioned but not yet in Stage 3). Si no, la provision esta
// plana y el dashboard muestra un CMF Mora 90+ que la data no sostiene.
if (provisionMora90 >= provisionTotal) {
  bancaErrors.push(
    `IFRS 9: la provision en mora 90+ (${Math.round(provisionMora90)}) debe ser menor que la provision total (${Math.round(provisionTotal)}); una provision plana sugiere un calculo invalido.`
  );
}

// La cola 90+ es un subconjunto de la 30+: su provisión no puede superarla.
if (provisionMora90 > provisionMora30) {
  bancaErrors.push(
    `Invariante IFRS 9 violada: provisión mora 90+ (${Math.round(provisionMora90)}) supera mora 30+ (${Math.round(provisionMora30)}).`
  );
}

if (saldoMora90 > saldoMora30) {
  bancaErrors.push(`Invariante CMF violada: saldo mora 90+ (${saldoMora90}) no puede superar mora 30+ (${saldoMora30}).`);
}

const mora30Pct = (saldoMora30 / saldoTotal) * 100;
const mora90Pct = (saldoMora90 / saldoTotal) * 100;

if (mora90Pct > mora30Pct) {
  bancaErrors.push(`Porcentaje mora 90+ (${mora90Pct.toFixed(1)}%) supera mora 30+ (${mora30Pct.toFixed(1)}%).`);
}

// ==========================================
// 2b. SERIE MENSUAL DE LA CARTERA (stock medible en el tiempo)
// ==========================================
// Los ratios de morosidad sobre una foto fija no se pueden comparar mes a mes.
// El historial es lo que permite que el filtro temporal signifique algo, así
// que se validan las propiedades que lo hacen creíble: nivel en banda de la
// CMF, movimientos mensuales plausibles y cola 90+ con tamaño de muestra útil.
type PuntoSerie = { mes: string; saldo: number; diasMora: number; provision: number };
const historial: Record<string, PuntoSerie[]> = banca.historialCartera;

if (!historial || Object.keys(historial).length === 0) {
  bancaErrors.push('Falta historialCartera: sin él el filtro temporal de Banca no puede medir nada.');
} else {
  const ids = Object.keys(historial);
  const meses = [...new Set(ids.flatMap((id) => historial[id].map((p) => p.mes)))].sort();

  const serie = meses.map((mes) => {
    let saldo = 0, mora30 = 0, mora90 = 0, prov = 0, n90 = 0;
    for (const id of ids) {
      const p = historial[id].find((x) => x.mes === mes);
      if (!p) continue;
      saldo += p.saldo;
      prov += p.provision;
      if (p.diasMora >= 30) mora30 += p.saldo;
      if (p.diasMora >= 90) { mora90 += p.saldo; n90 += 1; }
    }
    return { mes, n90, m30: (mora30 / saldo) * 100, m90: (mora90 / saldo) * 100, cob: (prov / mora90) * 100 };
  });

  const promediar = (k: 'm30' | 'm90' | 'cob') => {
    const vs = serie.map((s) => s[k]);
    return vs.reduce((a, b) => a + b, 0) / vs.length;
  };
  const maxDelta = (k: 'm30' | 'm90') => {
    let mx = 0;
    for (let i = 1; i < serie.length; i++) mx = Math.max(mx, Math.abs(serie[i][k] - serie[i - 1][k]));
    return mx;
  };

  // Bandas del sistema bancario chileno (reports CMF) y un techo de ruido
  // mensual. Ver scripts/calibrate-banca.ts para el barrido completo.
  const prom30 = promediar('m30');
  const prom90 = promediar('m90');
  const promCob = promediar('cob');
  const d30 = maxDelta('m30');
  const d90 = maxDelta('m90');
  const cola90 = Math.min(...serie.map((s) => s.n90));

  if (prom30 < 2.0 || prom30 > 4.0) bancaErrors.push(`Mora 30+ promedio ${prom30.toFixed(2)}% fuera de la banda 2.0-4.0%.`);
  if (prom90 < 1.5 || prom90 > 2.9) bancaErrors.push(`Mora 90+ promedio ${prom90.toFixed(2)}% fuera de la banda CMF 1.5-2.9%.`);
  if (promCob < 150 || promCob > 260) bancaErrors.push(`Cobertura promedio ${promCob.toFixed(0)}% fuera de la banda CMF 150-260%.`);
  if (d30 > 0.35) bancaErrors.push(`Salto mensual de mora 30+ de ${d30.toFixed(2)}pp: es ruido, no una tendencia.`);
  if (d90 > 0.35) bancaErrors.push(`Salto mensual de mora 90+ de ${d90.toFixed(2)}pp: es ruido, no una tendencia.`);
  if (cola90 < 50) {
    bancaErrors.push(`Cola 90+ con ${cola90} créditos en el mes más bajo: el ratio lo decide un handful de créditos, no un promedio. Crece la cartera (CREDITOS_BASE).`);
  }

  console.log(`  · serie ${meses.length} meses | mora 30+ ${prom30.toFixed(2)}% | mora 90+ ${prom90.toFixed(2)}% | cobertura ${promCob.toFixed(0)}%`);
  console.log(`  · movimiento mensual máx: 30+ ${d30.toFixed(2)}pp, 90+ ${d90.toFixed(2)}pp | cola 90+ mínima ${cola90} créditos`);
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
