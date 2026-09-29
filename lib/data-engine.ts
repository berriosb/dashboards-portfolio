import { calculateRfmScores, CustomerRfmScore } from './rfm';

export interface RetailTransaction {
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

export interface RetailDataset {
  meta: {
    empresa: string;
    periodoInicio: string;
    periodoFin: string;
    moneda: string;
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
    categorias: string[];
    canales: string[];
    regiones: string[];
    segmentosCliente: string[];
    segmentosRfm: string[];
  };
  records: RetailTransaction[];
  skus: Array<{ id: string; nombre: string; categoria: string; precio: number; costo: number }>;
  customers: Array<{ id: string; nombre: string; email: string; region: string; segmentoCliente: string }>;
  precomputed: {
    funnel: Array<{ step: string; value: number }>;
    nps: { encuestas: number; promotores: number; detractores: number; pasivos: number };
  };
}

export interface FilterState {
  dateRange: { start: string; end: string };
  categories: string[];
  channels: string[];
  regions: string[];
  rfmSegment?: string | null;
}

export interface AggregatedResult {
  kpis: {
    ventasNetas: number;
    ticketPromedio: number;
    margenBrutoPct: number;
    pedidosTotales: number;
    tasaConversion: number;
    nps: number;
    clientesRecurrentes: number;
  };
  ventasPorCategoria: Array<{
    categoria: string;
    ventas: number;
    pedidos: number;
    margenPct: number;
  }>;
  tendenciaMensual: Array<{
    mes: string;
    ventas: number;
    pedidos: number;
    margenPct: number;
  }>;
  ventasPorCanal: Array<{
    canal: string;
    ventas: number;
    pedidos: number;
    porcentaje: number;
  }>;
  rfmMatrix: Array<{
    recency: number;
    frequency: number;
    segment: string;
    customerCount: number;
    avgTicket: number;
  }>;
  filteredCount: number;
  totalCount: number;
  filteredRecords: RetailTransaction[];
}

export function filterAndAggregateRetail(
  dataset: RetailDataset,
  filters: FilterState
): AggregatedResult {
  const { dateRange, categories, channels, regions, rfmSegment } = filters;

  // 1. Calcular scores RFM globales de clientes para poder filtrar por segmento RFM
  const rfmScores = calculateRfmScores(dataset.records, dataset.meta.periodoFin);

  // 2. Filtrar transacciones
  const filteredRecords = dataset.records.filter((r) => {
    // Filtro de fecha
    if (r.date < dateRange.start || r.date > dateRange.end) return false;
    // Filtro de categoría
    if (categories.length > 0 && !categories.includes(r.categoria)) return false;
    // Filtro de canal
    if (channels.length > 0 && !channels.includes(r.canal)) return false;
    // Filtro de región
    if (regions.length > 0 && !regions.includes(r.region)) return false;
    // Filtro de segmento RFM
    if (rfmSegment) {
      const score = rfmScores.get(r.customerId);
      if (score?.segment !== rfmSegment) return false;
    }
    return true;
  });

  // 3. Cálculos de KPIs
  let totalVentas = 0;
  let totalCostos = 0;
  const uniqueOrders = new Set<string>();
  const customerOrdersMap = new Map<string, Set<string>>();

  // Agrupadores
  const catMap = new Map<string, { ventas: number; costos: number; orders: Set<string> }>();
  const monthMap = new Map<string, { ventas: number; costos: number; orders: Set<string> }>();
  const canalMap = new Map<string, { ventas: number; orders: Set<string> }>();

  for (const r of filteredRecords) {
    if (r.isReturn) continue; // Exclusión estricta según metric-definitions.ts

    totalVentas += r.amount;
    totalCostos += r.cost;
    uniqueOrders.add(r.orderId);

    // Clientes recurrentes
    let cOrders = customerOrdersMap.get(r.customerId);
    if (!cOrders) {
      cOrders = new Set();
      customerOrdersMap.set(r.customerId, cOrders);
    }
    cOrders.add(r.orderId);

    // Categoría
    let cat = catMap.get(r.categoria);
    if (!cat) {
      cat = { ventas: 0, costos: 0, orders: new Set() };
      catMap.set(r.categoria, cat);
    }
    cat.ventas += r.amount;
    cat.costos += r.cost;
    cat.orders.add(r.orderId);

    // Mes (YYYY-MM)
    const mes = r.date.substring(0, 7);
    let m = monthMap.get(mes);
    if (!m) {
      m = { ventas: 0, costos: 0, orders: new Set() };
      monthMap.set(mes, m);
    }
    m.ventas += r.amount;
    m.costos += r.cost;
    m.orders.add(r.orderId);

    // Canal
    let can = canalMap.get(r.canal);
    if (!can) {
      can = { ventas: 0, orders: new Set() };
      canalMap.set(r.canal, can);
    }
    can.ventas += r.amount;
    can.orders.add(r.orderId);
  }

  const orderCount = uniqueOrders.size;
  const ticketPromedio = orderCount > 0 ? Math.round(totalVentas / orderCount) : 0;
  const margenBrutoPct = totalVentas > 0 ? parseFloat(((totalVentas - totalCostos) / totalVentas * 100).toFixed(1)) : 0;

  let clientesRecurrentes = 0;
  for (const orders of customerOrdersMap.values()) {
    if (orders.size >= 2) clientesRecurrentes++;
  }

  // Formatear agrupaciones
  const ventasPorCategoria = Array.from(catMap.entries())
    .map(([categoria, data]) => ({
      categoria,
      ventas: data.ventas,
      pedidos: data.orders.size,
      margenPct: data.ventas > 0 ? parseFloat(((data.ventas - data.costos) / data.ventas * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.ventas - a.ventas);

  const tendenciaMensual = Array.from(monthMap.entries())
    .map(([mes, data]) => ({
      mes,
      ventas: data.ventas,
      pedidos: data.orders.size,
      margenPct: data.ventas > 0 ? parseFloat(((data.ventas - data.costos) / data.ventas * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  const ventasPorCanal = Array.from(canalMap.entries()).map(([canal, data]) => ({
    canal,
    ventas: data.ventas,
    pedidos: data.orders.size,
    porcentaje: totalVentas > 0 ? parseFloat(((data.ventas / totalVentas) * 100).toFixed(1)) : 0,
  }));

  // Matriz RFM 5x5 calculada sobre clientes del conjunto filtrado
  const filteredCustomerIds = new Set(filteredRecords.map((r) => r.customerId));
  const rfmCellMap = new Map<string, { count: number; totalSpent: number; segment: string }>();

  for (let r = 1; r <= 5; r++) {
    for (let f = 1; f <= 5; f++) {
      let seg = 'Hibernating';
      if (r >= 4 && f >= 4) seg = 'Champions';
      else if (r >= 3 && f >= 3) seg = 'Loyal';
      else if (r >= 3 && f <= 2) seg = 'Potential';
      else if (r <= 2 && f >= 3) seg = 'At Risk';
      rfmCellMap.set(`${r}-${f}`, { count: 0, totalSpent: 0, segment: seg });
    }
  }

  for (const cId of filteredCustomerIds) {
    const score = rfmScores.get(cId);
    if (!score) continue;
    const key = `${score.recencyScore}-${score.frequencyScore}`;
    const cell = rfmCellMap.get(key);
    if (cell) {
      cell.count++;
      cell.totalSpent += score.totalSpent;
    }
  }

  const rfmMatrix: AggregatedResult['rfmMatrix'] = [];
  for (let r = 5; r >= 1; r--) {
    for (let f = 1; f <= 5; f++) {
      const cell = rfmCellMap.get(`${r}-${f}`)!;
      rfmMatrix.push({
        recency: r,
        frequency: f,
        segment: cell.segment,
        customerCount: cell.count,
        avgTicket: cell.count > 0 ? Math.round(cell.totalSpent / cell.count) : 0,
      });
    }
  }

  return {
    kpis: {
      ventasNetas: totalVentas,
      ticketPromedio,
      margenBrutoPct,
      pedidosTotales: orderCount,
      tasaConversion: dataset.precomputed.funnel[2].value / dataset.precomputed.funnel[0].value * 100,
      nps: Math.round(
        ((dataset.precomputed.nps.promotores - dataset.precomputed.nps.detractores) /
          dataset.precomputed.nps.encuestas) *
          100
      ),
      clientesRecurrentes,
    },
    ventasPorCategoria,
    tendenciaMensual,
    ventasPorCanal,
    rfmMatrix,
    filteredCount: filteredRecords.length,
    totalCount: dataset.records.length,
    filteredRecords,
  };
}
