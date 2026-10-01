import { describe, it, expect } from 'vitest';
import retailRaw from '../data/retail.json';
import bancaRaw from '../data/banca.json';
import logisticaRaw from '../data/logistica.json';
import { filterAndAggregateRetail, RetailDataset } from '../lib/data-engine';
import { filterAndAggregateBanca, BancaDataset } from '../lib/banca-data-engine';
import { filterAndAggregateLogistica, LogisticaDataset } from '../lib/logistica-data-engine';
import { windowFraction, previousWindow, describeWindow, daysInWindow } from '../lib/comparison';
import { resolveBenchmark, ALL_METRICS, RETAIL_METRICS, BANCA_METRICS, LOGISTICA_METRICS } from '../lib/metric-definitions';

const retail = retailRaw as unknown as RetailDataset;
const banca = bancaRaw as unknown as BancaDataset;
const logistica = logisticaRaw as unknown as LogisticaDataset;

const PERIODO = { periodoInicio: '2025-10-01', periodoFin: '2026-09-30' };

/**
 * Estas pruebas son guardas de regresión. Cada una cubre un bug que estuvo
 * vivo en el repo: filtros que no filtraban, deltas fijados por fórmula y
 * benchmarks duplicados en tres lugares.
 */
describe('Ventanas de comparación', () => {
  it('windowFraction mide la porción visible del dataset', () => {
    expect(windowFraction({ start: '2025-10-01', end: '2026-09-30' }, PERIODO)).toBe(1);
    const seisMeses = windowFraction({ start: '2026-04-01', end: '2026-09-30' }, PERIODO);
    expect(seisMeses).toBeGreaterThan(0.49);
    expect(seisMeses).toBeLessThan(0.51);
  });

  it('previousWindow devuelve la ventana inmediatamente anterior, del mismo largo', () => {
    const prev = previousWindow({ start: '2026-04-01', end: '2026-09-30' }, PERIODO);
    expect(prev).not.toBeNull();
    expect(daysInWindow(prev!)).toBe(daysInWindow({ start: '2026-04-01', end: '2026-09-30' }));
    expect(prev!.end < '2026-04-01').toBe(true);
  });

  it('previousWindow devuelve null si el comparativo cae fuera del dataset', () => {
    // La ventana completa de 12m no tiene período anterior: los datos arrancan
    // en 2025-10. Acá el motor debe omitir el delta, no mostrar 0,0%.
    expect(previousWindow({ start: '2025-10-01', end: '2026-09-30' }, PERIODO)).toBeNull();
  });

  it('describeWindow expone días, fracción y comparativo', () => {
    const w = describeWindow({ start: '2026-09-01', end: '2026-09-30' }, PERIODO);
    expect(w.days).toBe(30);
    expect(w.fraction).toBeGreaterThan(0);
    expect(w.fraction).toBeLessThan(1);
    expect(w.previous).not.toBeNull();
  });
});

describe('Benchmarks: fuente única y prorateo', () => {
  it('proratea benchmarks de tipo flow a la ventana visible', () => {
    const full = resolveBenchmark('ventasNetas', 1, RETAIL_METRICS)!;
    const half = resolveBenchmark('ventasNetas', 0.5, RETAIL_METRICS)!;
    expect(full.prorated).toBe(false);
    expect(half.prorated).toBe(true);
    expect(half.value).toBeCloseTo(full.value * 0.5, 5);
  });

  it('NO proratea benchmarks de tipo level ni ratio', () => {
    // Prorratear un ratio o un promedio es un error: el margen 40% no se
    // convierte en "meta 20%" cuando el filtro es la mitad del período.
    for (const key of ['margenBrutoPct', 'ticketPromedio', 'nps']) {
      const full = resolveBenchmark(key, 1, RETAIL_METRICS)!;
      const part = resolveBenchmark(key, 0.25, RETAIL_METRICS)!;
      expect(part.value).toBe(full.value);
      expect(part.prorated).toBe(false);
    }
  });

  it('no inventa benchmarks para métricas inexistentes', () => {
    expect(resolveBenchmark('noExiste', 1, ALL_METRICS)).toBeNull();
  });

  it('el coverage de Banca declara la banda real y no inventa una fuente oficial', () => {
    // IFRS 9 prescribe cómo medir pérdidas esperadas, no un ratio de cobertura.
    // Y la banda 150-260% NO está publicada por la CMF: es una banda de
    // referencia del proyecto, calibrada en scripts/calibrate-banca.ts. Este
    // test antes exigía que la fuente dijera "CMF", que es justamente el claim
    // inventado que se retractó: el repo no cita documento ni año para esa banda.
    const cob = BANCA_METRICS.coberturaProvisiones;
    expect(cob.benchmarkSource).not.toMatch(/IFRS/i);
    expect(cob.benchmarkSource).toMatch(/banda de referencia/i);
    // El benchmark tiene que ser el PISO de la banda, no un punto medio
    // inventado: con 180 el valor real (168,7%) disparaba alarma de
    // sub-provisionamiento mientras el validador lo daba por correcto.
    expect(cob.benchmark).toBe(150);
    expect(cob.benchmarkSource).toMatch(/260/);
  });

  it('la glosa logística y la tarjeta usan la misma clave de costo', () => {
    // Existían dos claves para el mismo indicador con metas 10x distintas.
    expect(LOGISTICA_METRICS.costoPromedio).toBeDefined();
    expect(LOGISTICA_METRICS.costoPorDespacho).toBeUndefined();
  });
});

describe('Retail: el filtro de fecha filtra de verdad', () => {
  const base = { categories: [], channels: [], regions: [], rfmSegment: null };
  const run = (start: string, end: string) =>
    filterAndAggregateRetail(retail, { ...base, dateRange: { start, end } });

  it('ventanas distintas producen conteos distintos', () => {
    const tres = run('2026-09-01', '2026-09-30');
    const seis = run('2026-04-01', '2026-09-30');
    const doce = run('2025-10-01', '2026-09-30');
    expect(tres.filteredCount).toBeLessThan(seis.filteredCount);
    expect(seis.filteredCount).toBeLessThan(doce.filteredCount);
  });

  it('expone un período anterior real y con delta no nulo', () => {
    const r = run('2026-04-01', '2026-09-30');
    expect(r.previousKpis).not.toBeNull();
    // Si el comparativo fuera idéntico al actual, el delta sería 0,0% inventado.
    expect(r.previousKpis!.ventasNetas).not.toBe(r.kpis.ventasNetas);
  });

  it('omite el delta en vez de mostrar 0,0% cuando no hay comparativo', () => {
    const r = run('2025-10-01', '2026-09-30');
    expect(r.previousKpis).toBeNull();
  });

  it('anula el delta de las KPIs que el dataset entrega ya agregadas', () => {
    // tasaConversion y nps salen de `precomputed`, una constante del período
    // completo. Compararlas contra sí mismas daba 0,0% siempre, que en
    // pantalla se lee como "no se movió" en vez de "no hay desagregación".
    const r = run('2026-04-01', '2026-09-30');
    expect(r.previousKpis!.tasaConversion).toBeNull();
    expect(r.previousKpis!.nps).toBeNull();
    // El resto sí debe traer comparativo real.
    expect(r.previousKpis!.ventasNetas).not.toBeNull();
    expect(r.previousKpis!.margenBrutoPct).not.toBeNull();
  });
});

describe('Logística: el filtro de fecha filtra de verdad', () => {
  const base = { rutas: [], transportistas: [], tiposCarga: [], prioridades: [], soloIncidencias: false };
  const run = (start: string, end: string) =>
    filterAndAggregateLogistica(logistica, { ...base, dateRange: { start, end } });

  it('el delta de OTIF cambia con la ventana activa', () => {
    const seis = run('2026-04-01', '2026-09-30');
    const noventa = run('2026-07-01', '2026-09-30');
    const d6 = ((seis.kpis.otifPct - seis.previousKpis!.otifPct) / seis.previousKpis!.otifPct) * 100;
    const d90 = ((noventa.kpis.otifPct - noventa.previousKpis!.otifPct) / noventa.previousKpis!.otifPct) * 100;
    expect(d6).not.toBeCloseTo(d90, 6);
  });
});

describe('Banca: la cartera es un stock medible en el tiempo', () => {
  const base = { productos: [], segmentos: [], regiones: [], tramoMora: null };
  const run = (start: string, end: string) =>
    filterAndAggregateBanca(banca, { ...base, dateRange: { start, end } });

  it('el snapshot usa el mes de la ventana, no siempre el último mes', () => {
    // Éste era el bug de fondo: los 6 presets devolvían los mismos 1.200
    // créditos porque el motor leía siempre el estado final del crédito.
    expect(run('2026-09-01', '2026-09-30').mesReferencia).toBe('2026-09');
    expect(run('2026-04-01', '2026-09-30').mesReferencia).toBe('2026-09');
    expect(run('2026-01-01', '2026-03-31').mesReferencia).toBe('2026-03');
    expect(run('2025-10-01', '2025-12-31').mesReferencia).toBe('2025-12');
  });

  it('una ventana temprano ve menos créditos que una tardía', () => {
    const temprano = run('2025-10-01', '2025-12-31');
    const tardio = run('2026-09-01', '2026-09-30');
    expect(temprano.filteredCount).toBeLessThan(tardio.filteredCount);
  });

  it('el delta de cartera varía con la ventana de comparación', () => {
    const seis = run('2026-04-01', '2026-09-30');
    const noventa = run('2026-07-01', '2026-09-30');
    const d6 = (seis.kpis.carteraTotal - seis.previousKpis!.carteraTotal) / seis.previousKpis!.carteraTotal;
    const d90 = (noventa.kpis.carteraTotal - noventa.previousKpis!.carteraTotal) / noventa.previousKpis!.carteraTotal;
    expect(d6).not.toBeCloseTo(d90, 6);
  });

  it('la tendencia de mora se lee del historial, no de una fórmula inventada', () => {
    const r = run('2025-10-01', '2026-09-30');
    expect(r.tendenciaMoraMensual.length).toBe(12);
    // El último punto de la serie debe coincidir con el KPI de la ventana.
    const ultimo = r.tendenciaMoraMensual[r.tendenciaMoraMensual.length - 1];
    expect(ultimo.mora30Pct).toBeCloseTo(r.kpis.moraCarteraPct, 1);
    expect(ultimo.mora90Pct).toBeCloseTo(r.kpis.moraVencida90Pct, 1);
    // Y la serie tiene que variar: si fuera constante, no habría serie.
    const valores = r.tendenciaMoraMensual.map((t) => t.mora30Pct);
    expect(new Set(valores).size).toBeGreaterThan(3);
  });

  it('la cobertura mensual se calcula y no es una constante inventada', () => {
    const r = run('2025-10-01', '2026-09-30');
    const cob = r.tendenciaMoraMensual.map((t) => t.coberturaPct);
    expect(cob.every((c) => c > 0)).toBe(true);
    expect(new Set(cob).size).toBeGreaterThan(3);
  });

  it('respeta los invariantes CMF en cualquier ventana', () => {
    for (const [start, end] of [
      ['2025-10-01', '2026-09-30'],
      ['2026-01-01', '2026-03-31'],
      ['2026-09-01', '2026-09-30'],
    ] as const) {
      const r = run(start, end);
      expect(r.kpis.moraCarteraPct).toBeGreaterThanOrEqual(r.kpis.moraVencida90Pct);
      expect(r.kpis.carteraVigente).toBeLessThanOrEqual(r.kpis.carteraTotal);
      expect(r.kpis.coberturaProvisiones).toBeGreaterThan(0);
    }
  });
});
