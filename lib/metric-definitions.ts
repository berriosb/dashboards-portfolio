/**
 * Fuente única de definición y benchmark de métricas.
 *
 * Antes este dato vivía en tres lugares (este archivo, el `initialKpis` del
 * generador y el JSX de cada dashboard) y se desincronizó: el dashboard
 * mostraba "Estándar IFRS 9" con 130% de cobertura para un indicador que la
 * CMF publica entre 150% y 260%, y el glosario y la tarjeta mostraba metas
 * distintas para el mismo KPI. Aquí vive una sola vez.
 *
 * `kind` decide cómo se compara contra la ventana activa:
 *   flow  → acumulado en el período. La meta se prorratea por ventana.
 *   level → valor puntual o promedio estable. La meta NO se prorratea.
 *   ratio → porcentaje o índice invariante a la longitud de la ventana.
 *           La meta NO se prorratea.
 *
 * Prorratear un ratio o un promedio es un error: si el filtro es de 30 días,
 * "margen 40%" no pasa a ser "meta 3,3%".
 */
export type BenchmarkKind = 'flow' | 'level' | 'ratio';

export interface MetricDefinition {
  key: string;
  label: string;
  unit: 'CLP' | '%' | 'pts' | 'dias' | 'num' | 'hrs';
  metricType: 'derived' | 'precomputed';
  formula: string;
  source: string;
  benchmark: number;
  benchmarkKind: BenchmarkKind;
  benchmarkSource: string;
  interpretation: {
    high: string;
    low: string;
  };
}

/**
 * Meta ajustada a la ventana visible.
 *
 * Para benchmarks `flow` divide por la fracción visible del dataset. Para
 * `level` y `ratio` devuelve el valor intacto, porque no tienen sentido
 * acumulados en el tiempo.
 */
export interface ResolvedBenchmark {
  value: number;
  /** true si el valor mostrado fue prorateado a la ventana visible. */
  prorated: boolean;
  kind: BenchmarkKind;
  source: string;
  label: string;
}

export function resolveBenchmark(
  key: string,
  windowFraction: number,
  allMetrics: Record<string, MetricDefinition>
): ResolvedBenchmark | null {
  const metric = allMetrics[key];
  if (!metric) return null;

  const prorate = metric.benchmarkKind === 'flow';
  const fraction = prorate ? Math.max(0, Math.min(1, windowFraction)) : 1;
  const prorated = prorate && fraction < 1;

  return {
    value: metric.benchmark * fraction,
    prorated,
    kind: metric.benchmarkKind,
    source: metric.benchmarkSource,
    label: prorated
      ? `Meta del período visible (prorrateada)`
      : metric.benchmarkKind === 'flow'
        ? `Meta del período completo`
        : `Meta de referencia`,
  };
}

export const RETAIL_METRICS: Record<string, MetricDefinition> = {
  ventasNetas: {
    key: 'ventasNetas',
    label: 'Ventas Netas',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(amount WHERE !isReturn)',
    source: 'Transacciones facturadas omnicanal',
    benchmark: 92000000,
    benchmarkKind: 'flow',
    benchmarkSource: 'Presupuesto anual de ventas aprobado por el directorio',
    interpretation: {
      high: 'Sobre meta comercial y buen ritmo de colocación de catálogo.',
      low: 'Facturación rezagada; evaluar estacionalidad o promociones.',
    },
  },
  ticketPromedio: {
    key: 'ticketPromedio',
    label: 'Ticket Promedio',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(amount WHERE !isReturn) / count(DISTINCT orderId WHERE !isReturn)',
    source: 'Transacciones omnicanal de retail',
    benchmark: 170000,
    benchmarkKind: 'level',
    benchmarkSource: 'Meta de ticket promedio (mix de categorías y pricing)',
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
    benchmarkKind: 'ratio',
    benchmarkSource: 'Rango objetivo de la industria retail chilena (35% - 45%)',
    interpretation: {
      high: 'Mix saludable de productos con alta rentabilidad y bajo nivel de promociones descontroladas.',
      low: 'Alerta de rentabilidad; alta presión por descuentos o aumentos en costos de importación/distribución.',
    },
  },
  pedidosTotales: {
    key: 'pedidosTotales',
    label: 'Pedidos Totales',
    unit: 'num',
    metricType: 'derived',
    formula: 'count(DISTINCT orderId WHERE !isReturn)',
    source: 'Órdenes despachadas y retiradas',
    benchmark: 550,
    benchmarkKind: 'flow',
    benchmarkSource: 'Meta de órdenes del período',
    interpretation: {
      high: 'Alto dinamismo comercial y volumen transaccional.',
      low: 'Baja afluencia o caída en tráfico omnicanal.',
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
    benchmarkKind: 'ratio',
    benchmarkSource: 'Mediana e-commerce en retail chileno',
    interpretation: {
      high: 'Excelente efectividad en embudo de compra y experiencia sin fricción de checkout.',
      low: 'Abandono prematuro de visitas o carritos; fricción en medios de pago o costos de despacho altos.',
    },
  },
  clientesRecurrentes: {
    key: 'clientesRecurrentes',
    label: 'Clientes Recurrentes',
    unit: 'num',
    metricType: 'derived',
    formula: 'count(DISTINCT customerId con >= 2 órdenes)',
    source: 'Base de clientes fidelizados',
    benchmark: 120,
    benchmarkKind: 'flow',
    benchmarkSource: 'Meta de recompra del período',
    interpretation: {
      high: 'Buena retención y lealtad de clientes a la marca.',
      low: 'Fuga de clientes después de la primera compra.',
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
    benchmarkKind: 'level',
    benchmarkSource: 'Benchmark de NPS del sector retail omnicanal en Chile',
    interpretation: {
      high: 'Alta fidelidad de clientes y recomendación orgánica del servicio.',
      low: 'Insatisfacción en tiempos de entrega, stock quebrado o mala atención post-venta.',
    },
  },
};

export const BANCA_METRICS: Record<string, MetricDefinition> = {
  carteraTotal: {
    key: 'carteraTotal',
    label: 'Cartera Total de Colocaciones',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(saldo)',
    source: 'Cartera de créditos vigentes y vencidos',
    benchmark: 220000000000,
    benchmarkKind: 'level',
    benchmarkSource: 'Presupuesto anual de colocaciones aprobado por el directorio',
    interpretation: {
      high: 'Crecimiento en colocaciones y expansión de participación de mercado.',
      low: 'Contracción de oferta crediticia o desintermediación financiera.',
    },
  },
  carteraVigente: {
    key: 'carteraVigente',
    label: 'Cartera Vigente (Al Día)',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(saldo WHERE diasMora < 30)',
    source: 'Créditos sin atraso significativo',
    benchmark: 210000000000,
    benchmarkKind: 'level',
    benchmarkSource: 'Meta de cartera sana sobre el presupuesto de colocaciones',
    interpretation: {
      high: 'Excelente salud crediticia y bajo riesgo de pérdidas.',
      low: 'Deterioro en originación y aumento de mora temprana.',
    },
  },
  moraCarteraPct: {
    key: 'moraCarteraPct',
    label: 'Mora Cartera (30+ Días)',
    unit: '%',
    metricType: 'derived',
    formula: 'sum(saldo WHERE diasMora >= 30) / sum(saldo) * 100',
    source: 'Indicador de alerta temprana de cobranza',
    benchmark: 2.5,
    benchmarkKind: 'ratio',
    benchmarkSource: 'Umbral interno de alerta temprana (morosidad 30+)',
    interpretation: {
      high: 'Alerta temprana de riesgo; aumento de impago en cuotas recientes.',
      low: 'Gestión de cobranza preventiva efectiva y bajo sobreendeudamiento.',
    },
  },
  moraVencida90Pct: {
    key: 'moraVencida90Pct',
    label: 'Mora Vencida CMF (90+ Días)',
    unit: '%',
    metricType: 'derived',
    formula: 'sum(saldo WHERE diasMora >= 90) / sum(saldo) * 100',
    source: 'Indicador oficial de morosidad de 90 días o más reportado a la CMF',
    benchmark: 2.0,
    benchmarkKind: 'ratio',
    benchmarkSource: 'Morosidad de 90 días o más del sistema bancario chileno (CMF)',
    interpretation: {
      high: 'Cartera en cobranza judicial / castigo inminente; impacto directo en provisiones.',
      low: 'Baja siniestralidad crediticia y reservas controladas.',
    },
  },
  captacionNeta: {
    key: 'captacionNeta',
    label: 'Captación Neta',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(depositos) - sum(retiros)',
    source: 'Movimientos mensuales de cuentas corrientes y depósitos a plazo',
    benchmark: 1500000000,
    benchmarkKind: 'flow',
    benchmarkSource: 'Meta de captación neta del período',
    interpretation: {
      high: 'Entrada neta positiva de fondos; menor costo de fondeo interbancario.',
      low: 'Fuga de depósitos hacia fondos mutuos o competidores.',
    },
  },
  coberturaProvisiones: {
    key: 'coberturaProvisiones',
    label: 'Cobertura de Provisiones',
    unit: '%',
    metricType: 'derived',
    formula: 'sum(provision) / sum(saldo WHERE diasMora >= 90) * 100',
    source: 'Stock de provisiones constituidas sobre la cartera vencida',
    benchmark: 150.0,
    benchmarkKind: 'ratio',
    benchmarkSource:
      'Banda de referencia del proyecto: piso de 150% y techo de 260% (scripts/calibrate-banca.ts)',
    interpretation: {
      high: 'Cobertura holgada dentro de la banda de referencia (150-260%).',
      low: 'Bajo el piso de 150% de la banda de referencia: sub-provisionamiento.',
    },
  },
  roe: {
    key: 'roe',
    label: 'ROE (Rentabilidad sobre Patrimonio)',
    unit: '%',
    metricType: 'precomputed',
    formula: 'utilidadNeta / patrimonioPromedio * 100',
    source: 'Estado de Resultados y Balance General',
    benchmark: 14.5,
    benchmarkKind: 'ratio',
    benchmarkSource: 'Promedio histórico banca chilena (CMF)',
    interpretation: {
      high: 'Eficiencia en generación de valor para accionistas.',
      low: 'Presión por costos operacionales o elevado gasto en provisiones.',
    },
  },
  clientesActivos: {
    key: 'clientesActivos',
    label: 'Clientes Activos con Crédito',
    unit: 'num',
    metricType: 'derived',
    formula: 'count(DISTINCT clienteId WHERE saldo > 0)',
    source: 'Padrón de deudores bancarios',
    benchmark: 1300,
    benchmarkKind: 'level',
    benchmarkSource: 'Meta de clientes activos con crédito',
    interpretation: {
      high: 'Amplitud de base de clientes y diversificación de riesgo.',
      low: 'Concentración de cartera en pocos deudores.',
    },
  },
};

export const LOGISTICA_METRICS: Record<string, MetricDefinition> = {
  otifPct: {
    key: 'otifPct',
    label: 'Cumplimiento OTIF (On-Time In-Full)',
    unit: '%',
    metricType: 'derived',
    formula: 'count(despachos aTiempo AND completos) / count(despachos) * 100',
    source: 'Trazabilidad de órdenes y guías de despacho electrónicas',
    benchmark: 95.0,
    benchmarkKind: 'ratio',
    benchmarkSource: 'Estándar internacional de excelencia logística (EDI / ASOEX)',
    interpretation: {
      high: 'Entregas perfectas; clientes reciben exactamente lo ordenado en fecha.',
      low: 'Incumplimiento de SLA contractual y riesgo de multas comerciales.',
    },
  },
  otifParcialPct: {
    key: 'otifParcialPct',
    label: 'Entregas a Tiempo pero Incompletas',
    unit: '%',
    metricType: 'derived',
    formula: 'count(despachos aTiempo AND incompletos) / count(despachos) * 100',
    source: 'Guías con quiebre parcial de bultos',
    benchmark: 3.0,
    benchmarkKind: 'ratio',
    benchmarkSource: 'Tolerancia de descalce de inventario',
    interpretation: {
      high: 'Problemas de inventario o preparación de pedidos en bodega.',
      low: 'Alta exactitud de picking y packing.',
    },
  },
  leadTimeP50: {
    key: 'leadTimeP50',
    label: 'Lead Time P50 (Mediana)',
    unit: 'hrs',
    metricType: 'derived',
    formula: 'percentil 50 de (fechaEntregaReal - fechaDespacho) en horas',
    source: 'Registros de salida de CD a entrega final',
    benchmark: 18.0,
    benchmarkKind: 'level',
    benchmarkSource: 'Compromiso estándar next-day RM e interurbano cercano',
    interpretation: {
      high: 'Operación lenta; demoras en transporte troncal.',
      low: 'Despacho ágil y optimización de rutas.',
    },
  },
  leadTimeP90: {
    key: 'leadTimeP90',
    label: 'Lead Time P90 (Límite Superior SLA)',
    unit: 'hrs',
    metricType: 'derived',
    formula: 'percentil 90 de (fechaEntregaReal - fechaDespacho) en horas',
    source: 'Cola del 10% de despachos más demorados',
    benchmark: 36.0,
    benchmarkKind: 'level',
    benchmarkSource: 'Límite contractual antes de penalizaciones SLA',
    interpretation: {
      high: 'Colas largas de demora e incidencias en rutas complejas.',
      low: 'Consistencia operativa sin retrasos extremos.',
    },
  },
  hhiProveedores: {
    key: 'hhiProveedores',
    label: 'Concentración HHI de Transportistas',
    unit: 'pts',
    metricType: 'derived',
    formula: 'sum((cuota_transportista_pct)^2)',
    source: 'Participación en volumen despachado por transportista',
    benchmark: 1800,
    benchmarkKind: 'level',
    benchmarkSource: 'Umbral antimonopolio DOJ / FTC (< 1.500 moderado, > 2.500 concentrado)',
    interpretation: {
      high: 'Alta dependencia crítica de 1 o 2 transportistas (riesgo de interrupción).',
      low: 'Flota diversificada y poder de negociación con proveedores.',
    },
  },
  fillRatePct: {
    key: 'fillRatePct',
    label: 'Fill Rate (Nivel de Servicio en Volumen)',
    unit: '%',
    metricType: 'derived',
    formula: 'sum(unidadesEntregadas) / sum(unidadesOrdenadas) * 100',
    source: 'Balance de unidades físicas transportadas',
    benchmark: 98.0,
    benchmarkKind: 'ratio',
    benchmarkSource: 'Estándar de retail y distribución chilena',
    interpretation: {
      high: 'Cero quiebres de carga en tránsito.',
      low: 'Pérdidas, mermas o despachos parciales.',
    },
  },
  // La clave es `costoPromedio` porque es la que devuelve el motor. Antes el
  // glosario la llamaba `costoPorDespacho` y mostraba una meta de $4.200
  // mientras la tarjeta mostraba $45.000 para el mismo indicador.
  costoPromedio: {
    key: 'costoPromedio',
    label: 'Costo Promedio por Despacho',
    unit: 'CLP',
    metricType: 'derived',
    formula: 'sum(costoTransporte) / count(despachos)',
    source: 'Facturación de fletes y combustible',
    benchmark: 120000,
    benchmarkKind: 'level',
    benchmarkSource: 'Presupuesto de costo de flete por despacho',
    interpretation: {
      high: 'Sobrecosto logístico por rutas ineficientes o baja consolidación.',
      low: 'Alta densidad de entrega y sinergia de carga.',
    },
  },
  totalDespachos: {
    key: 'totalDespachos',
    label: 'Despachos Totales',
    unit: 'num',
    metricType: 'derived',
    formula: 'count(despachos)',
    source: 'Guías de despacho emitidas',
    benchmark: 1050,
    benchmarkKind: 'flow',
    benchmarkSource: 'Meta de despachos del período',
    interpretation: {
      high: 'Alto volumen operativo y utilización de flota.',
      low: 'Baja utilización de capacidad o demanda estancada.',
    },
  },
};

export const ALL_METRICS: Record<string, MetricDefinition> = {
  ...RETAIL_METRICS,
  ...BANCA_METRICS,
  ...LOGISTICA_METRICS,
};
