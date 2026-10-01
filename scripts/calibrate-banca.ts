/**
 * Calibración del generador de Banca.
 *
 * Ejecuta el generador en memoria para un barrido de la escala de mora y
 * reporta, para cada valor, los tres KPIs contra las bandas reales de la CMF.
 * Sirve para DOS cosas:
 *
 *   1. Encontrar el dial correcto sin adivinar (barrer en vez de iterar a ciegas).
 *   2. Verificar en CI que el generador no se desalineó si alguien toca la matriz.
 *
 *   pnpm data:calibrate          → tabla de resultados
 *   pnpm data:calibrate -- --ok  → falla (exit 1) si el dial vigente está fuera de banda
 *
 * Bandas de referencia (sistema bancario chileno, reports CMF):
 *   mora 30+   : 2.0 – 4.0%   (alerta temprana interna; la CMF no publica un umbral 30+)
 *   mora 90+   : 1.5 – 2.9%   (indicador oficial "morosidad de 90 días o más")
 *   cobertura  : 150 – 260%   (índice de cobertura = stock provisiones / mora 90+)
 */
import { generateBanca, ESCALA_MORA_VIGENTE, CREDITOS_BASE } from './generate-data';

type Hist = Record<string, Array<{ mes: string; saldo: number; diasMora: number; provision: number }>>;

interface Band {
  min: number;
  max: number;
}

const BANDAS = {
  mora30: { min: 2.0, max: 4.0 } as Band,
  mora90: { min: 1.5, max: 2.9 } as Band,
  cobertura: { min: 150, max: 260 } as Band,
  // Amplitud del cambio mensual. Un salto mayor es ruido, no un negocio.
  deltaMensualMax: 0.35,
};

function medir(hist: Hist) {
  const ids = Object.keys(hist);
  const meses = [...new Set(ids.flatMap((id) => hist[id].map((p) => p.mes)))].sort();

  const serie = meses.map((mes) => {
    let saldo = 0;
    let mora30 = 0;
    let mora90 = 0;
    let provision = 0;
    for (const id of ids) {
      const p = hist[id].find((x) => x.mes === mes);
      if (!p) continue;
      saldo += p.saldo;
      provision += p.provision;
      if (p.diasMora >= 30) mora30 += p.saldo;
      if (p.diasMora >= 90) mora90 += p.saldo;
    }
    return {
      mes,
      saldo,
      mora30: saldo > 0 ? (mora30 / saldo) * 100 : 0,
      mora90: saldo > 0 ? (mora90 / saldo) * 100 : 0,
      cobertura: mora90 > 0 ? (provision / mora90) * 100 : 0,
    };
  });

  const enBanda = (v: number, b: Band) => v >= b.min && v <= b.max;
  const promedios = (k: keyof (typeof serie)[number]) => {
    const vs = serie.map((s) => s[k] as number);
    return vs.reduce((a, b) => a + b, 0) / vs.length;
  };
  const deltaMax = (k: keyof (typeof serie)[number]) => {
    let mx = 0;
    for (let i = 1; i < serie.length; i++) {
      mx = Math.max(mx, Math.abs((serie[i][k] as number) - (serie[i - 1][k] as number)));
    }
    return mx;
  };

  const m30 = promedios('mora30');
  const m90 = promedios('mora90');
  const cob = promedios('cobertura');
  const d30 = deltaMax('mora30');
  const d90 = deltaMax('mora90');

  const fallas: string[] = [];
  if (!enBanda(m30, BANDAS.mora30)) fallas.push(`mora30 ${m30.toFixed(2)}% fuera de ${BANDAS.mora30.min}-${BANDAS.mora30.max}`);
  if (!enBanda(m90, BANDAS.mora90)) fallas.push(`mora90 ${m90.toFixed(2)}% fuera de ${BANDAS.mora90.min}-${BANDAS.mora90.max}`);
  if (!enBanda(cob, BANDAS.cobertura)) fallas.push(`cobertura ${cob.toFixed(0)}% fuera de ${BANDAS.cobertura.min}-${BANDAS.cobertura.max}`);
  if (d30 > BANDAS.deltaMensualMax) fallas.push(`delta 30+ ${d30.toFixed(2)}pp > ${BANDAS.deltaMensualMax}pp (ruido)`);
  if (d90 > BANDAS.deltaMensualMax) fallas.push(`delta 90+ ${d90.toFixed(2)}pp > ${BANDAS.deltaMensualMax}pp (ruido)`);

  return { serie, m30, m90, cob, d30, d90, fallas, ok: fallas.length === 0 };
}

const escales = [...new Set([1, 1.5, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.5, 4, ESCALA_MORA_VIGENTE])].sort((a, b) => a - b);

console.log('Barrido de MORA_ESCALA_GLOBAL (probabilidad de entrada a mora x este factor)\n');
console.log('escala   mora30%   mora90%   cobertura%   Δ30+pp   Δ90+pp   estado');
console.log('-'.repeat(72));

const resultados = escales.map((escala) => {
  const data = generateBanca({ escalaMora: escala, creditosBase: CREDITOS_BASE, escribir: false });
  const r = medir(data.historialCartera as Hist);
  console.log(
    String(escala).padStart(6),
    r.m30.toFixed(2).padStart(9),
    r.m90.toFixed(2).padStart(9),
    r.cob.toFixed(0).padStart(12),
    r.d30.toFixed(2).padStart(8),
    r.d90.toFixed(2).padStart(8),
    '  ' + (r.ok ? '✓ en banda' : '✗ ' + r.fallas[0]),
  );
  return { escala, ...r };
});

// El dial vigente es el que usa el generador por defecto.
const VIGENTE = ESCALA_MORA_VIGENTE;
const actual = resultados.find((r) => r.escala === VIGENTE);

console.log('\nDetalle del dial vigente (escala = ' + VIGENTE + '):');
if (actual) {
  console.log('mes        cartera(B)   mora30%   mora90%   cobertura%');
  for (const s of actual.serie) {
    console.log(
      s.mes,
      (s.saldo / 1e9).toFixed(2).padStart(12),
      s.mora30.toFixed(2).padStart(9),
      s.mora90.toFixed(2).padStart(9),
      s.cobertura.toFixed(0).padStart(12),
    );
  }
}

if (process.argv.includes('--ok')) {
  if (actual && !actual.ok) {
    console.error('\n✗ El dial vigente NO cumple las bandas CMF:');
    for (const f of actual.fallas) console.error('   - ' + f);
    console.error('\n  Valores que sí cumplen (usar uno en MORA_ESCALA_GLOBAL):');
    for (const r of resultados.filter((x) => x.ok)) console.error('   · ' + r.escala);
    process.exit(1);
  }
  console.log('\n✓ dial vigente dentro de las bandas CMF');
}
