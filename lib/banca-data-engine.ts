import { describeWindow, type CompareMode, type WindowMeta } from './comparison';

export interface CreditoRecord {
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

export interface MovimientoRecord {
  id: string;
  mes: string;
  tipo: 'deposito' | 'retiro';
  monto: number;
  segmento: string;
}

export interface BancaDataset {
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
    productos: string[];
    segmentos: string[];
    regiones: string[];
    sucursales: string[];
    tramosMora: string[];
  };
  records: CreditoRecord[];
  recordsMovimientos: MovimientoRecord[];
  /**
   * Estado mes a mes de cada crédito. La cartera es un stock: sin esta serie el
   * filtro temporal no tiene nada que medir y todos los presets devuelven la
   * misma foto.
   */
  historialCartera: Record<
    string,
    Array<{ mes: string; saldo: number; diasMora: number; provision: number }>
  >;
  precomputed: {
    resultadoMensual: Array<{
      mes: string;
      utilidadNeta: number;
      patrimonio: number;
      activos: number;
      roe: number;
      roa: number;
    }>;
  };
}

type PuntoHistorial = { mes: string; saldo: number; diasMora: number; provision: number };

function tramoDeMora(diasMora: number): string {
  if (diasMora <= 0) return 'Al Día (0d)';
  if (diasMora <= 29) return 'Mora 1-29d';
  if (diasMora <= 59) return 'Mora 30-59d';
  if (diasMora <= 89) return 'Mora 60-89d';
  return 'Mora 90+d';
}

function mesesDelHistorial(historial: BancaDataset['historialCartera']): string[] {
  const set = new Set<string>();
  for (const serie of Object.values(historial)) {
    for (const p of serie) set.add(p.mes);
  }
  return [...set].sort();
}

/**
 * Proyecta la cartera al último mes con datos dentro de la ventana activa.
 *
 * La cartera es un stock, así que el KPI de una ventana es el ESTADO al cierre
 * de esa ventana, no una suma de meses. Antes se usaba siempre el estado final
 * del crédito (`cr.saldo`), que es el mismo para cualquier rango de fechas: por
 * eso todos los presets devolvían exactamente los mismos 1.200 créditos.
 *
 * Un crédito entra en la proyección si tiene un punto de historial en ese mes,
 * o sea si existía en esa fecha. Los créditos originados durante el período
 * aparecen a partir de su mes de otorgamiento, que es el comportamiento real.
 */
function proyectarCartera(
  dataset: BancaDataset,
  dateRange: { start: string; end: string }
): { records: CreditoRecord[]; mes: string | null } {
  const historial = dataset.historialCartera;
  if (!historial) return { records: [], mes: null };

  const claveMes = dateRange.end.slice(0, 7);
  const mes = mesesDelHistorial(historial).filter((m) => m <= claveMes).pop() ?? null;
  if (!mes) return { records: [], mes: null };

  const puntoPorId = new Map<string, PuntoHistorial>();
  for (const [id, serie] of Object.entries(historial)) {
    const p = serie.find((x) => x.mes === mes);
    if (p) puntoPorId.set(id, p);
  }

  const records = dataset.records
    .filter((cr) => puntoPorId.has(cr.id))
    .map((cr) => {
      const p = puntoPorId.get(cr.id)!;
      return {
        ...cr,
        saldo: p.saldo,
        diasMora: p.diasMora,
        provision: p.provision,
        tramoMora: tramoDeMora(p.diasMora),
      };
    });

  return { records, mes };
}

export interface BancaFilterState {
  dateRange: { start: string; end: string };
  productos: string[];
  segmentos: string[];
  regiones: string[];
  tramoMora?: string | null;
}

export interface BancaAggregatedResult {
  kpis: {
    carteraTotal: number;
    carteraVigente: number;
    moraCarteraPct: number;
    moraVencida90Pct: number;
    captacionNeta: number;
    coberturaProvisiones: number;
    roe: number;
    clientesActivos: number;
  };
  agingCartera: Array<{
    tramo: string;
    saldo: number;
    creditos: number;
    porcentaje: number;
  }>;
  colocacionesPorProducto: Array<{
    producto: string;
    saldo: number;
    creditos: number;
    tasaMora30: number;
  }>;
  tendenciaMoraMensual: Array<{
    mes: string;
    mora30Pct: number;
    mora90Pct: number;
    /** Índice de cobertura mes a mes: stock de provisiones / mora 90+. */
    coberturaPct: number;
    /** Saldo de cartera promedio del mes. Antes se llamaba `colocaciones` y era
     *  `saldo / 12`: un STOCK rotulado como FLUJO. */
    saldoPromedioMensual: number;
  }>;
  distribucionSegmentos: Array<{
    segmento: string;
    saldo: number;
    creditos: number;
    porcentaje: number;
  }>;
  filteredCount: number;
  totalCount: number;
  filteredRecords: CreditoRecord[];
  /**
   * Mes de cierre used para el snapshot. La cartera es un stock: las cifras son
   * "al cierre de este mes", no un acumulado. `null` si la ventana cae fuera
   * de la cobertura del historial.
   */
  mesReferencia: string | null;
}

function aggregateBanca(
  dataset: BancaDataset,
  filters: BancaFilterState
): BancaAggregatedResult {
  const { dateRange, productos, segmentos, regiones, tramoMora } = filters;

  // 1. Proyectar la cartera al cierre de la ventana activa.
  //
  // El filtro anterior comparaba `fechaOtorgamiento` contra el rango y, si no
  // calzaba, dejaba pasar el crédito mientras siguiera vigente. Como todos los
  // créditos vencen en 2027, la guarda de vencimiento nunca se activaba y los
  // 6 presets devolvían la cartera completa. La ventana se resuelve ahora con
  // el historial real.
  const { records: carteraVentana, mes: mesReferencia } = proyectarCartera(dataset, dateRange);

  const filteredRecords = carteraVentana.filter((r) => {
    if (productos.length > 0 && !productos.includes(r.producto)) return false;
    if (segmentos.length > 0 && !segmentos.includes(r.segmento)) return false;
    if (regiones.length > 0 && !regiones.includes(r.region)) return false;
    if (tramoMora && r.tramoMora !== tramoMora) return false;
    return true;
  });

  // 2. Cálculos de KPIs
  let carteraTotal = 0;
  let carteraVigente = 0;
  let saldoMora30 = 0;
  let saldoMora90 = 0;
  let totalProvisiones = 0;
  const uniqueClients = new Set<string>();

  // Mapas de desglose
  const agingMap = new Map<string, { saldo: number; creditos: number }>();
  const tramosOrden = ['Al Día (0d)', 'Mora 1-29d', 'Mora 30-59d', 'Mora 60-89d', 'Mora 90+d'];
  tramosOrden.forEach((t) => agingMap.set(t, { saldo: 0, creditos: 0 }));

  const prodMap = new Map<string, { saldo: number; creditos: number; saldoMora30: number }>();
  dataset.lookups.productos.forEach((p) => prodMap.set(p, { saldo: 0, creditos: 0, saldoMora30: 0 }));

  const segMap = new Map<string, { saldo: number; creditos: number }>();
  dataset.lookups.segmentos.forEach((s) => segMap.set(s, { saldo: 0, creditos: 0 }));

  for (const cr of filteredRecords) {
    carteraTotal += cr.saldo;
    totalProvisiones += cr.provision;
    uniqueClients.add(cr.clienteId);

    if (cr.diasMora < 30) {
      carteraVigente += cr.saldo;
    }
    if (cr.diasMora >= 30) {
      saldoMora30 += cr.saldo;
    }
    if (cr.diasMora >= 90) {
      saldoMora90 += cr.saldo;
    }

    // Aging
    const ag = agingMap.get(cr.tramoMora);
    if (ag) {
      ag.saldo += cr.saldo;
      ag.creditos += 1;
    }

    // Producto
    const pr = prodMap.get(cr.producto);
    if (pr) {
      pr.saldo += cr.saldo;
      pr.creditos += 1;
      if (cr.diasMora >= 30) pr.saldoMora30 += cr.saldo;
    }

    // Segmento
    const sg = segMap.get(cr.segmento);
    if (sg) {
      sg.saldo += cr.saldo;
      sg.creditos += 1;
    }
  }

  // 3. Captación Neta desde recordsMovimientos, acotada a la ventana activa.
  //    Es un FLUJO: se suma mes a mes dentro del rango, no se proyecta.
  let totalDepositos = 0;
  let totalRetiros = 0;
  for (const mv of dataset.recordsMovimientos) {
    if (mv.mes < dateRange.start.slice(0, 7) || mv.mes > dateRange.end.slice(0, 7)) continue;
    if (segmentos.length > 0 && !segmentos.includes(mv.segmento)) continue;
    if (mv.tipo === 'deposito') totalDepositos += mv.monto;
    else totalRetiros += mv.monto;
  }
  const captacionNeta = totalDepositos - totalRetiros;

  // Porcentajes globales
  const moraCarteraPct = carteraTotal > 0 ? parseFloat(((saldoMora30 / carteraTotal) * 100).toFixed(1)) : 0;
  const moraVencida90Pct = carteraTotal > 0 ? parseFloat(((saldoMora90 / carteraTotal) * 100).toFixed(1)) : 0;
  // Sin mora 90+ el ratio no está definido. Se devuelve 0 y no 100 porque 100%
  // se lee como "cobertura perfecta" justo en el caso en que no hay nada que
  // cubrir; la serie mensual usaba 0 y la tarjeta 100 para la misma población
  // vacía, así que el mismo ratio mostraba dos números opuestos.
  const coberturaProvisiones = saldoMora90 > 0 ? parseFloat(((totalProvisiones / saldoMora90) * 100).toFixed(1)) : 0;

  // ROE: promedio de los meses QUE CAEN EN la ventana, no de los 12 meses.
  const claveIni = dateRange.start.slice(0, 7);
  const claveFin = dateRange.end.slice(0, 7);
  const resultadosVentana = dataset.precomputed.resultadoMensual.filter(
    (r) => r.mes >= claveIni && r.mes <= claveFin
  );
  const roePromedio = resultadosVentana.length > 0
    ? parseFloat((resultadosVentana.reduce((acc, r) => acc + r.roe, 0) / resultadosVentana.length).toFixed(1))
    : 0;

  // Agrupaciones ordenadas
  const agingCartera = tramosOrden.map((tramo) => {
    const data = agingMap.get(tramo) || { saldo: 0, creditos: 0 };
    return {
      tramo,
      saldo: data.saldo,
      creditos: data.creditos,
      porcentaje: carteraTotal > 0 ? parseFloat(((data.saldo / carteraTotal) * 100).toFixed(1)) : 0,
    };
  });

  const colocacionesPorProducto = Array.from(prodMap.entries())
    .map(([producto, data]) => ({
      producto,
      saldo: data.saldo,
      creditos: data.creditos,
      tasaMora30: data.saldo > 0 ? parseFloat(((data.saldoMora30 / data.saldo) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.saldo - a.saldo);

  const distribucionSegmentos = Array.from(segMap.entries())
    .map(([segmento, data]) => ({
      segmento,
      saldo: data.saldo,
      creditos: data.creditos,
      porcentaje: carteraTotal > 0 ? parseFloat(((data.saldo / carteraTotal) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.saldo - a.saldo);

  // Tendencia de mora mensual LEÍDA del historial real y acotada a la ventana.
  //
  // Antes se fabricaba con una fórmula: `baseMora30 + (idx-6)*0.15 + ((idx%3)-1)*0.1`,
  // o sea una rampa inventada en Q3 que no tenía nada que ver con la cartera.
  // Con `historialCartera` la curva se mide, no se cuenta.
  const historial = dataset.historialCartera;
  const creditosEnVentana = new Set(carteraVentana.map((r) => r.id));
  const mesesVentana = historial
    ? mesesDelHistorial(historial).filter((m) => m >= claveIni && m <= claveFin)
    : [];

  const tendenciaMoraMensual = mesesVentana.map((mes) => {
    let saldo = 0;
    let m30 = 0;
    let m90 = 0;
    let prov = 0;
    for (const [id, serie] of Object.entries(historial)) {
      if (!creditosEnVentana.has(id)) continue;
      const p = serie.find((x) => x.mes === mes);
      if (!p) continue;
      saldo += p.saldo;
      prov += p.provision;
      if (p.diasMora >= 30) m30 += p.saldo;
      if (p.diasMora >= 90) m90 += p.saldo;
    }
    return {
      mes,
      mora30Pct: saldo > 0 ? parseFloat(((m30 / saldo) * 100).toFixed(2)) : 0,
      mora90Pct: saldo > 0 ? parseFloat(((m90 / saldo) * 100).toFixed(2)) : 0,
      coberturaPct: m90 > 0 ? parseFloat(((prov / m90) * 100).toFixed(2)) : 0,
      saldoPromedioMensual: Math.round(saldo / 12),
    };
  });

  return {
    kpis: {
      carteraTotal,
      carteraVigente,
      moraCarteraPct,
      moraVencida90Pct,
      captacionNeta,
      coberturaProvisiones,
      roe: roePromedio,
      clientesActivos: uniqueClients.size,
    },
    agingCartera,
    colocacionesPorProducto,
    tendenciaMoraMensual,
    distribucionSegmentos,
    filteredCount: filteredRecords.length,
    totalCount: dataset.records.length,
    filteredRecords,
    mesReferencia,
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
export interface BancaAggregatedResultWithWindow extends BancaAggregatedResult {
  window: WindowMeta;
  previousKpis: BancaAggregatedResult['kpis'] | null;
}

export function filterAndAggregateBanca(
  dataset: BancaDataset,
  filters: BancaFilterState,
  opts: { compareMode?: CompareMode } = {}
): BancaAggregatedResultWithWindow {
  const current = aggregateBanca(dataset, filters);
  const window = describeWindow(filters.dateRange, dataset.meta, opts.compareMode);

  let previousKpis: BancaAggregatedResult['kpis'] | null = null;
  if (window.previous) {
    // Se re-agregan los MISMOS filtros con la ventana anterior desplazada:
    // el delta siempre es apples-to-apples, incluso con filtros por categoría.
    previousKpis = aggregateBanca(dataset, { ...filters, dateRange: window.previous }).kpis;
  }

  return { ...current, window, previousKpis };
}
