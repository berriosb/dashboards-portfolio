export interface MetricDefinition {
  key: string;
  label: string;
  unit: 'CLP' | '%' | 'pts' | 'dias' | 'num';
  metricType: 'derived' | 'precomputed';
  formula: string;
  source: string;
  benchmark: number;
  benchmarkSource: string;
  interpretation: {
    high: string;
    low: string;
  };
}

export const RETAIL_METRICS: Record<string, MetricDefinition> = {
  ticketPromedio: {
    key: 'ticketPromedio',
    label: 'Ticket Promedio',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(amount WHERE !isReturn) / count(DISTINCT orderId WHERE !isReturn)',
    source: 'Transacciones omnicanal de retail',
    benchmark: 42000,
    benchmarkSource: 'Ticket promedio sector retail chileno (Cámara de Comercio de Santiago)',
    interpretation: {
      high: 'Mayor gasto por compra; efectividad en cross-selling y venta de categorías de alto valor.',
      low: 'Ticket deprimido; compras atomizadas o alta concentración en categorías de bajo margen.',
    },
  },
  margenBrutoPct: {
    key: 'margenBrutoPct',
    label: 'Margen Bruto',
    unit: '%',
    metricType: 'derived',
    formula: 'sum(amount - cost WHERE !isReturn) / sum(amount WHERE !isReturn) * 100',
    source: 'Registros transaccionales de venta y costo de producto',
    benchmark: 40.0,
    benchmarkSource: 'Rango objetivo de la industria retail chilena (35% - 45%)',
    interpretation: {
      high: 'Mix saludable de productos con alta rentabilidad y bajo nivel de promociones descontroladas.',
      low: 'Alerta de rentabilidad; alta presión por descuentos o aumentos en costos de importación/distribución.',
    },
  },
  tasaConversion: {
    key: 'tasaConversion',
    label: 'Tasa de Conversión',
    unit: '%',
    metricType: 'precomputed',
    formula: 'compradores / visitantes_totales * 100',
    source: 'Funnel omnicanal e-commerce y tiendas físicas',
    benchmark: 3.0,
    benchmarkSource: 'Mediana e-commerce en retail chileno',
    interpretation: {
      high: 'Excelente efectividad en embudo de compra y experiencia sin fricción de checkout.',
      low: 'Abandono prematuro de visitas o carritos; fricción en medios de pago o costos de despacho altos.',
    },
  },
  nps: {
    key: 'nps',
    label: 'NPS Transaccional',
    unit: 'pts',
    metricType: 'precomputed',
    formula: '% Promotores - % Detractores',
    source: 'Encuestas post-compra transaccionales',
    benchmark: 50,
    benchmarkSource: 'Estándar benchmark retail omnicanal en Chile',
    interpretation: {
      high: 'Alta fidelidad de clientes y recomendación orgánica del servicio.',
      low: 'Insatisfacción en tiempos de entrega, stock quebrado o mala atención post-venta.',
    },
  },
};
