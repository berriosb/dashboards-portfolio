import { describeWindow, type CompareMode, type WindowMeta } from './comparison';

export interface DespachoRecord {
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

export interface LogisticaDataset {
  meta: {
    empresa: string;
    periodoInicio: string;
    periodoFin: string;
    moneda: string;
    seed: number;
    businessInsight: {
      titulo: string;
      descripcion: string;
      accionRecomendada: string;
    };
  };
  initialKpis: Array<{
    key: string;
    label: string;
    value: number;
    previousValue: number;
    unit: string;
    metricType: string;
    benchmark: number;
    benchmarkSource: string;
  }>;
  lookups: {
    rutas: string[];
    transportistas: string[];
    tiposCarga: string[];
    prioridades: string[];
    causasIncidencia: string[];
  };
  records: DespachoRecord[];
}

export interface LogisticaFilterState {
  dateRange: { start: string; end: string };
  rutas: string[];
  transportistas: string[];
  tiposCarga: string[];
  prioridades: string[];
  soloIncidencias?: boolean;
}

export interface LogisticaAggregatedResult {
  kpis: {
    otifPct: number;
    otifParcialPct: number;
    leadTimeP50: number;
    leadTimeP90: number;
    hhiProveedores: number;
    fillRatePct: number;
    costoPromedio: number;
    totalDespachos: number;
  };
  otifPorRuta: Array<{
    ruta: string;
    otifPct: number;
    despachos: number;
    costoPromedio: number;
  }>;
  distribucionLeadTime: Array<{
    rangoHoras: string;
    despachos: number;
    porcentaje: number;
  }>;
  concentracionTransportistas: Array<{
    transportista: string;
    cuotaPct: number;
    despachos: number;
    otifPct: number;
  }>;
  causasIncidencias: Array<{
    causa: string;
    cantidad: number;
    porcentaje: number;
  }>;
  tendenciaMensualOtif: Array<{
    mes: string;
    otifPct: number;
    fillRatePct: number;
    despachos: number;
  }>;
  filteredCount: number;
  totalCount: number;
  filteredRecords: DespachoRecord[];
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function aggregateLogistica(
  dataset: LogisticaDataset,
  filters: LogisticaFilterState
): LogisticaAggregatedResult {
  const { dateRange, rutas, transportistas, tiposCarga, prioridades, soloIncidencias } = filters;

  // 1. Filtrar registros de despachos
  const filteredRecords = dataset.records.filter((r) => {
    if (r.fechaDespacho < dateRange.start || r.fechaDespacho > dateRange.end) return false;
    if (rutas.length > 0 && !rutas.includes(r.ruta)) return false;
    if (transportistas.length > 0 && !transportistas.includes(r.transportista)) return false;
    if (tiposCarga.length > 0 && !tiposCarga.includes(r.tipoCarga)) return false;
    if (prioridades.length > 0 && !prioridades.includes(r.prioridad)) return false;
    if (soloIncidencias && r.otif) return false;
    return true;
  });

  const totalDespachos = filteredRecords.length;

  // 2. Cálculos de KPIs
  let otifCount = 0;
  let parcialCount = 0;
  let totalOrdenado = 0;
  let totalEntregado = 0;
  let totalCosto = 0;
  const leadTimes: number[] = [];

  // Mapas de desglose
  const rutaMap = new Map<string, { total: number; otif: number; costo: number }>();
  dataset.lookups.rutas.forEach((rt) => rutaMap.set(rt, { total: 0, otif: 0, costo: 0 }));

  const transMap = new Map<string, { total: number; otif: number }>();
  dataset.lookups.transportistas.forEach((tr) => transMap.set(tr, { total: 0, otif: 0 }));

  const causaMap = new Map<string, number>();
  dataset.lookups.causasIncidencia.forEach((c) => causaMap.set(c, 0));

  const monthMap = new Map<string, { total: number; otif: number; ordenado: number; entregado: number }>();

  for (const d of filteredRecords) {
    if (d.otif) otifCount++;
    if (d.cumpleTiempo && !d.cumpleCompleto) parcialCount++;

    totalOrdenado += d.unidadesOrdenadas;
    totalEntregado += d.unidadesEntregadas;
    totalCosto += d.costo;
    leadTimes.push(d.horasLeadTime);

    // Ruta
    const rData = rutaMap.get(d.ruta);
    if (rData) {
      rData.total++;
      if (d.otif) rData.otif++;
      rData.costo += d.costo;
    }

    // Transportista
    const tData = transMap.get(d.transportista);
    if (tData) {
      tData.total++;
      if (d.otif) tData.otif++;
    }

    // Incidencias
    if (d.incidencia) {
      const cur = causaMap.get(d.incidencia) || 0;
      causaMap.set(d.incidencia, cur + 1);
    }

    // Mensual
    const mes = d.fechaDespacho.substring(0, 7);
    let mData = monthMap.get(mes);
    if (!mData) {
      mData = { total: 0, otif: 0, ordenado: 0, entregado: 0 };
      monthMap.set(mes, mData);
    }
    mData.total++;
    if (d.otif) mData.otif++;
    mData.ordenado += d.unidadesOrdenadas;
    mData.entregado += d.unidadesEntregadas;
  }

  const otifPct = totalDespachos > 0 ? parseFloat(((otifCount / totalDespachos) * 100).toFixed(1)) : 0;
  const otifParcialPct = totalDespachos > 0 ? parseFloat(((parcialCount / totalDespachos) * 100).toFixed(1)) : 0;
  const fillRatePct = totalOrdenado > 0 ? parseFloat(((totalEntregado / totalOrdenado) * 100).toFixed(1)) : 0;
  const costoPromedio = totalDespachos > 0 ? Math.round(totalCosto / totalDespachos) : 0;

  const leadTimeP50 = calculatePercentile(leadTimes, 50);
  const leadTimeP90 = calculatePercentile(leadTimes, 90);

  // Concentración HHI de Transportistas
  let sumSquaredShares = 0;
  const concentracionTransportistas = Array.from(transMap.entries())
    .map(([transportista, data]) => {
      const cuotaPct = totalDespachos > 0 ? parseFloat(((data.total / totalDespachos) * 100).toFixed(1)) : 0;
      sumSquaredShares += Math.pow(cuotaPct, 2);
      return {
        transportista,
        cuotaPct,
        despachos: data.total,
        otifPct: data.total > 0 ? parseFloat(((data.otif / data.total) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => b.despachos - a.despachos);

  const hhiProveedores = Math.round(sumSquaredShares);

  // Desglose por Ruta
  const otifPorRuta = Array.from(rutaMap.entries())
    .map(([ruta, data]) => ({
      ruta,
      otifPct: data.total > 0 ? parseFloat(((data.otif / data.total) * 100).toFixed(1)) : 0,
      despachos: data.total,
      costoPromedio: data.total > 0 ? Math.round(data.costo / data.total) : 0,
    }))
    .sort((a, b) => a.otifPct - b.otifPct);

  // Histograma de distribución de lead time
  const leadRanges = [
    { label: '< 12h (Mismo día)', min: 0, max: 12 },
    { label: '12 - 24h (Next Day)', min: 12, max: 24 },
    { label: '24 - 36h (Interurbano)', min: 24, max: 36 },
    { label: '36 - 48h (Troncal)', min: 36, max: 48 },
    { label: '> 48h (Fuera de SLA)', min: 48, max: 9999 },
  ];

  const distribucionLeadTime = leadRanges.map((rng) => {
    const count = leadTimes.filter((lt) => lt >= rng.min && lt < rng.max).length;
    return {
      rangoHoras: rng.label,
      despachos: count,
      porcentaje: totalDespachos > 0 ? parseFloat(((count / totalDespachos) * 100).toFixed(1)) : 0,
    };
  });

  // Pareto de Causas de Incidencia
  const totalIncidencias = Array.from(causaMap.values()).reduce((s, v) => s + v, 0);
  const causasIncidencias = Array.from(causaMap.entries())
    .map(([causa, cantidad]) => ({
      causa,
      cantidad,
      porcentaje: totalIncidencias > 0 ? parseFloat(((cantidad / totalIncidencias) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Serie mensual cronológica
  const tendenciaMensualOtif = Array.from(monthMap.entries())
    .map(([mes, data]) => ({
      mes,
      otifPct: data.total > 0 ? parseFloat(((data.otif / data.total) * 100).toFixed(1)) : 0,
      fillRatePct: data.ordenado > 0 ? parseFloat(((data.entregado / data.ordenado) * 100).toFixed(1)) : 0,
      despachos: data.total,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  return {
    kpis: {
      otifPct,
      otifParcialPct,
      leadTimeP50,
      leadTimeP90,
      hhiProveedores,
      fillRatePct,
      costoPromedio,
      totalDespachos,
    },
    otifPorRuta,
    distribucionLeadTime,
    concentracionTransportistas,
    causasIncidencias,
    tendenciaMensualOtif,
    filteredCount: totalDespachos,
    totalCount: dataset.records.length,
    filteredRecords,
  };
}

/**
 * Ventana activa + ventana de comparación.
 *
 * `previousKpis` es `null` cuando no existe un período comparable dentro de la
 * cobertura del dataset. En ese caso los KPIs se muestran SIN delta: es
 * preferible no mostrar nada antes que inventar un 0,0% que se lee como
 * "no se movió".
 */
export interface LogisticaAggregatedResultWithWindow extends LogisticaAggregatedResult {
  window: WindowMeta;
  previousKpis: LogisticaAggregatedResult['kpis'] | null;
}

export function filterAndAggregateLogistica(
  dataset: LogisticaDataset,
  filters: LogisticaFilterState,
  opts: { compareMode?: CompareMode } = {}
): LogisticaAggregatedResultWithWindow {
  const current = aggregateLogistica(dataset, filters);
  const window = describeWindow(filters.dateRange, dataset.meta, opts.compareMode);

  let previousKpis: LogisticaAggregatedResult['kpis'] | null = null;
  if (window.previous) {
    // Se re-agregan los MISMOS filtros con la ventana anterior desplazada:
    // el delta siempre es apples-to-apples, incluso con filtros por categoría.
    previousKpis = aggregateLogistica(dataset, { ...filters, dateRange: window.previous }).kpis;
  }

  return { ...current, window, previousKpis };
}
