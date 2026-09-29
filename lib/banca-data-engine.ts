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
    colocaciones: number;
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
}

export function filterAndAggregateBanca(
  dataset: BancaDataset,
  filters: BancaFilterState
): BancaAggregatedResult {
  const { dateRange, productos, segmentos, regiones, tramoMora } = filters;

  // 1. Filtrar registros de colocaciones
  const filteredRecords = dataset.records.filter((r) => {
    if (r.fechaOtorgamiento < dateRange.start || r.fechaOtorgamiento > dateRange.end) {
      // Si la fecha de otorgamiento está fuera, verificamos si está vigente en el período
      if (r.fechaVencimiento < dateRange.start) return false;
    }
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

  // 3. Captación Neta desde recordsMovimientos
  let totalDepositos = 0;
  let totalRetiros = 0;
  for (const mv of dataset.recordsMovimientos) {
    if (segmentos.length > 0 && !segmentos.includes(mv.segmento)) continue;
    if (mv.tipo === 'deposito') totalDepositos += mv.monto;
    else totalRetiros += mv.monto;
  }
  const captacionNeta = totalDepositos - totalRetiros;

  // Porcentajes globales
  const moraCarteraPct = carteraTotal > 0 ? parseFloat(((saldoMora30 / carteraTotal) * 100).toFixed(1)) : 0;
  const moraVencida90Pct = carteraTotal > 0 ? parseFloat(((saldoMora90 / carteraTotal) * 100).toFixed(1)) : 0;
  const coberturaProvisiones = saldoMora90 > 0 ? parseFloat(((totalProvisiones / saldoMora90) * 100).toFixed(1)) : 100;

  // ROE desde precomputed
  const ultimosResultados = dataset.precomputed.resultadoMensual;
  const roePromedio = ultimosResultados.length > 0
    ? parseFloat((ultimosResultados.reduce((acc, r) => acc + r.roe, 0) / ultimosResultados.length).toFixed(1))
    : 15.0;

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

  // Tendencia de mora mensual sintetizada para Recharts
  const meses = [
    '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09',
  ];

  const tendenciaMoraMensual = meses.map((mes, idx) => {
    // Dinámica de curva realista con subida en Q3
    const baseMora30 = moraCarteraPct;
    const factorQ = idx >= 6 ? (idx - 6) * 0.15 : 0;
    const m30 = parseFloat(Math.max(1.5, baseMora30 + factorQ + ((idx % 3) - 1) * 0.1).toFixed(2));
    const m90 = parseFloat(Math.max(0.6, moraVencida90Pct + factorQ * 0.4 + ((idx % 2) - 0.5) * 0.05).toFixed(2));
    return {
      mes,
      mora30Pct: m30,
      mora90Pct: m90,
      colocaciones: Math.round(carteraTotal / 12 * (0.95 + idx * 0.01)),
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
  };
}
