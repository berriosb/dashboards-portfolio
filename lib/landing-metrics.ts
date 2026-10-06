/**
 * Métricas de la landing, derivadas de los MISMOS motores que alimentan los
 * dashboards.
 *
 * Antes estas cifras vivían como strings literales en `app/page.tsx`, escritas a
 * mano. El síntoma no era solo que se desactualizaran al regenerar el dataset:
 * la landing afirmaba "HHI 1.820 pts · Concentración moderada" mientras el
 * dashboard de Logística calculaba "1463 pts · Diversificado". Dos páginas del
 * mismo producto, el mismo indicador y conclusiones OPUESTAS, en un portafolio
 * cuya tesis es "los datos son verificables".
 *
 * Al calcularse aquí, con `filterAndAggregate*` sobre el período completo, la
 * landing no puede volver a contradecir a los dashboards: si el motor cambia,
 * cambian las dos a la vez.
 */

import retailDataRaw from '@/data/retail.json';
import bancaDataRaw from '@/data/banca.json';
import logisticaDataRaw from '@/data/logistica.json';

import {
  filterAndAggregateRetail,
  type RetailDataset,
  type FilterState,
} from './data-engine';
import {
  filterAndAggregateBanca,
  type BancaDataset,
  type BancaFilterState,
} from './banca-data-engine';
import {
  filterAndAggregateLogistica,
  type LogisticaDataset,
  type LogisticaFilterState,
} from './logistica-data-engine';

import { formatCLP, formatPercent, formatNumber, formatDecimal } from './format';

/** Bandas de calibración del proyecto (scripts/calibrate-banca.ts). */
const BANDA_MORA_90 = { min: 1.5, max: 2.9 };
const BANDA_PROVISIONES = { min: 150, max: 260 };

/** Umbrales de concentración del HHI, los mismos que usa el dashboard. */
const UMBRAL_HHI = { medio: 1500, alto: 2500 };
import { RETAIL_METRICS, LOGISTICA_METRICS } from './metric-definitions';

export interface LandingMetric {
  label: string;
  value: string;
  note: string;
}

/**
 * Ventana por defecto de los dashboards: `2026-04-01` a `2026-09-30`.
 *
 * NO es el período completo del dataset a propósito. Las tres tarjetas deben
 * mostrar lo mismo que se ve al abrir cada dashboard; con el período completo
 * la landing anunciaba $78,4M de ventas mientras el panel mostraba $37,7M, que
 * es exactamente el tipo de contradicción que este módulo existe para evitar.
 * La constante es la misma que los tres `handleResetFilters`.
 */
const VENTANA_POR_DEFECTO = { start: '2026-04-01', end: '2026-09-30' };

function retailMetrics(): LandingMetric[] {
  const dataset = retailDataRaw as unknown as RetailDataset;
  const filters: FilterState = {
    dateRange: VENTANA_POR_DEFECTO,
    categories: [],
    channels: [],
    regions: [],
    rfmSegment: null,
  };
  const { kpis } = filterAndAggregateRetail(dataset, filters);

  return [
    {
      label: 'Ventas Netas',
      value: formatCLP(kpis.ventasNetas, { compact: true }),
      note: `Margen bruto ${formatPercent(kpis.margenBrutoPct)}`,
    },
    {
      label: 'Margen Bruto',
      value: formatPercent(kpis.margenBrutoPct),
      note: `Meta: ${formatPercent(RETAIL_METRICS['margenBrutoPct']?.benchmark ?? 0, 0)}`,
    },
    {
      label: 'Ticket Promedio',
      value: formatCLP(kpis.ticketPromedio),
      note: `Meta: ${formatCLP(RETAIL_METRICS['ticketPromedio']?.benchmark ?? 0)}`,
    },
  ];
}

function bancaMetrics(): LandingMetric[] {
  const dataset = bancaDataRaw as unknown as BancaDataset;
  const filters: BancaFilterState = {
    dateRange: VENTANA_POR_DEFECTO,
    productos: [],
    segmentos: [],
    regiones: [],
    tramoMora: null,
  };
  const { kpis } = filterAndAggregateBanca(dataset, filters);

  return [
    {
      label: 'Cartera Vigente',
      value: formatCLP(kpis.carteraVigente, { compact: true }),
      note: 'Consumo y PyME',
    },
    {
      label: 'Mora CMF 90+',
      value: formatPercent(kpis.moraVencida90Pct),
      /* La banda 1,5% - 2,9% es calibración INTERNA del proyecto, no un
         umbral de la CMF. Se declara así para no atribuirle a la regulador
         un límite que no existe. */
      note: `Banda de referencia interna: ${formatPercent(BANDA_MORA_90.min)} - ${formatPercent(BANDA_MORA_90.max)}`,
    },
    {
      label: 'Cobertura Provisiones',
      value: formatPercent(kpis.coberturaProvisiones),
      note: `Banda de referencia: ${formatPercent(BANDA_PROVISIONES.min, 0)} - ${formatPercent(BANDA_PROVISIONES.max, 0)}`,
    },
  ];
}

function logisticaMetrics(): LandingMetric[] {
  const dataset = logisticaDataRaw as unknown as LogisticaDataset;
  const filters: LogisticaFilterState = {
    dateRange: VENTANA_POR_DEFECTO,
    rutas: [],
    transportistas: [],
    tiposCarga: [],
    prioridades: [],
    soloIncidencias: false,
  };
  const { kpis } = filterAndAggregateLogistica(dataset, filters);

  /* HHI: se toma del propio motor, que ya lo calcula con su fórmula y sus
     umbrales. La landing declaraba "1.820 pts · Concentración moderada" mientras
     el dashboard decía "1463 pts · Diversificado"; al leer ambos del mismo
     lugar, el desacuerdo deja de ser representable. */
  const hhi = kpis.hhiProveedores;
  const nivelHhi = hhi >= UMBRAL_HHI.alto ? 'Concentrado' : hhi >= UMBRAL_HHI.medio ? 'Moderado' : 'Diversificado';

  return [
    {
      label: 'Cumplimiento OTIF',
      value: formatPercent(kpis.otifPct),
      note: `Meta EDI: ${formatPercent(LOGISTICA_METRICS['otifPct']?.benchmark ?? 0, 0)}`,
    },
    {
      label: 'Lead Time P90',
      value: `${formatDecimal(kpis.leadTimeP90, 1)} hrs`,
      note: 'Límite superior SLA',
    },
    {
      label: 'HHI Proveedores',
      value: `${formatNumber(hhi)} pts`,
      note: nivelHhi,
    },
  ];
}

let cache: { retail: LandingMetric[]; banca: LandingMetric[]; logistica: LandingMetric[] } | null = null;

/**
 * Métricas de las tres tarjetas. Se calculan una vez por render del servidor:
 * son puras sobre datos estáticos, así que no hay estado que mantener.
 */
export function landingMetrics() {
  if (!cache) {
    cache = { retail: retailMetrics(), banca: bancaMetrics(), logistica: logisticaMetrics() };
  }
  return cache;
}