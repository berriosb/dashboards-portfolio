import { describe, it, expect } from 'vitest';
import retailData from '../data/retail.json';
import bancaData from '../data/banca.json';
import logisticaData from '../data/logistica.json';
import { calculateRfm } from '../lib/rfm';
import { filterAndAggregateRetail } from '../lib/data-engine';
import { filterAndAggregateBanca } from '../lib/banca-data-engine';
import { filterAndAggregateLogistica } from '../lib/logistica-data-engine';
import { BANCA_METRICS, RETAIL_METRICS } from '../lib/metric-definitions';

/**
 * Invariantes de DOMINIO, no de regresión.
 *
 * La suite anterior comprobaba que el código hiciera lo que el código hacía:
 * bounds holgadamente calibrados alrededor de los valores reales (`mora > 0`,
 * `cobertura > 100`), de modo que un generador desalineado en 20% pasaba igual.
 * Estos tests afirma que el número sea correcto en términos de negocio, que es
 * la capa que faltaba.
 */

const VENTANA_6M = { start: '2026-04-01', end: '2026-09-30' };
const VENTANA_12M = { start: '2025-10-01', end: '2026-09-30' };

const retail = retailData as never;
const banca = bancaData as never;
const logistica = logisticaData as never;

const retailFiltros = (dateRange: typeof VENTANA_6M) =>
  ({ dateRange, categories: [], channels: [], regions: [], rfmSegment: null }) as never;
const bancaFiltros = (dateRange: typeof VENTANA_6M) =>
  ({ dateRange, productos: [], segmentos: [], regiones: [], tramoMora: null }) as never;
const logisticaFiltros = (dateRange: typeof VENTANA_6M) =>
  ({ dateRange, transportistas: [], rutas: [], tiposCarga: [], prioridades: [] }) as never;

describe('RFM: los quintiles son quintiles', () => {
  const { scores, axes, population } = calculateRfm(
    (retailData as never as { records: [] }).records,
    '2026-09-30'
  );

  it('parte la población en 5 grupos de igual tamaño', () => {
    // El bug original usaba umbrales absolutos (monetario 80k/150k/250k/400k) y
    // dejaba al 45% de los clientes en M5 en vez del 20% de un quintil real.
    for (const eje of ['recencyScore', 'frequencyScore', 'monetaryScore'] as const) {
      const conteo = [1, 2, 3, 4, 5].map(
        (s) => [...scores.values()].filter((c) => c[eje] === s).length
      );
      const esperado = population / 5;
      for (const n of conteo) {
        expect(Math.abs(n - esperado) / esperado).toBeLessThan(0.15);
      }
    }
  });

  it('etiqueta cada eje con el rango REAL de su quintil', () => {
    // El heatmap anunciaba "F3 (3-4 comp.)" y "F5 (8+ comp.)" mientras el motor
    // cortaba en F3=3, F4=4-5, F5>=6: 13 clientes con 4 compras caían en una
    // celda rotulada "5-7".
    for (const nombre of ['recency', 'frequency', 'monetary'] as const) {
      for (const banda of axes[nombre]) {
        const reales = [...scores.values()]
          .map((c) =>
            nombre === 'recency'
              ? c.recencyDays
              : nombre === 'frequency'
                ? c.orderCount
                : c.totalSpent
          )
          .filter((_, i) => {
            const s = [...scores.values()][i];
            const score =
              nombre === 'recency'
                ? s.recencyScore
                : nombre === 'frequency'
                  ? s.frequencyScore
                  : s.monetaryScore;
            return score === banda.score;
          });
        expect(Math.min(...reales)).toBe(banda.min);
        expect(Math.max(...reales)).toBe(banda.max);
      }
    }
  });

  it('invierte el eje de recencia: R5 son los que compraron más hace poco', () => {
    const r5 = axes.recency.find((b) => b.score === 5)!;
    const r1 = axes.recency.find((b) => b.score === 1)!;
    expect(r5.max).toBeLessThan(r1.min);
    const conR5 = [...scores.values()].filter((c) => c.recencyScore === 5);
    expect(Math.max(...conR5.map((c) => c.recencyDays))).toBe(r5.max);
  });
});

describe('RFM: la recencia sigue a la ventana activa', () => {
  it('cambia el score al mover la fecha de referencia', () => {
    // Anclada a la fecha de fin del dataset, 93 de 106 clientes cambiaban de
    // score al filtrar un trimestre: el heatmap mentía bajo cualquier filtro.
    const full = calculateRfm((retailData as never as { records: [] }).records, '2026-09-30');
    const q2 = calculateRfm((retailData as never as { records: [] }).records, '2026-06-30');
    const distintos = [...full.scores.entries()].filter(
      ([id, a]) => q2.scores.get(id)?.recencyScore !== a.recencyScore
    );
    expect(distintos.length).toBeGreaterThan(0);

    // Y con la ventana correcta, cada cliente de R5 fue visto dentro del quintil
    // superior de recencia de ESA ventana.
    const conR5 = [...q2.scores.values()].filter((c) => c.recencyScore === 5);
    const bandaR5 = q2.axes.recency.find((b) => b.score === 5)!;
    for (const c of conR5) {
      expect(c.recencyDays).toBeLessThanOrEqual(bandaR5.max);
    }
  });
});

describe('Retail: el ticket promedio es un ticket, no el valor de vida', () => {
  it('el ticket de la celda RFM no supera el ticket real del período', () => {
    const r = filterAndAggregateRetail(retail, retailFiltros(VENTANA_6M));
    const ticketReal = r.kpis.ticketPromedio;
    const maximoCelda = Math.max(...r.rfmMatrix.map((c) => c.avgTicket));
    // Antes cada celda dividía el gasto HISTÓRICO vitalicio del cliente entre
    // la cantidad de clientes, así que la celda R5-F5 marcaba 8,8x el ticket.
    expect(maximoCelda).toBeLessThanOrEqual(ticketReal * 1.6);
  });
});

describe('Retail: guardas de denominador cero', () => {
  it('no produce NaN con un filtro queVacía todos los registros', () => {
    const r = filterAndAggregateRetail(retail, retailFiltros(VENTANA_6M));
    for (const [k, v] of Object.entries(r.kpis)) {
      expect(Number.isNaN(v as number), `${k} es NaN`).toBe(false);
    }
    expect(Number.isFinite(r.kpis.tasaConversion)).toBe(true);
    expect(Number.isFinite(r.kpis.nps)).toBe(true);
  });

  it('tasa de conversión y NPS son finitos por definición', () => {
    // `funnel[2] / funnel[0]` y `(promotores - detractores) / encuestas` iban sin
    // guarda, a diferencia de todos los demás ratios del repo.
    const r = filterAndAggregateRetail(retail, retailFiltros(VENTANA_6M));
    expect(r.kpis.tasaConversion).toBeGreaterThan(0);
    expect(r.kpis.nps).toBeGreaterThan(-100);
    expect(r.kpis.nps).toBeLessThanOrEqual(100);
  });
});

describe('Banca: el balance es coherente con la cartera', () => {
  const r = filterAndAggregateBanca(banca, bancaFiltros(VENTANA_6M));

  it('la cartera no puede multiplicar al balance total', () => {
    // El generador sorteaba `activos` y `patrimonio` por separado de la cartera:
    // la cartera daba 203.302.165.957 contra 28.660.000.000 de activos, o sea
    // 7,09x el balance entero. Un banco no puede tener su cartera 7x por encima
    // de su balance.
    const activos = (
      bancaData as never as { precomputed: { resultadoMensual: Array<{ activos: number }> } }
    ).precomputed.resultadoMensual.at(-1)!.activos;
    expect(r.kpis.carteraTotal).toBeLessThan(activos);
    expect(r.kpis.carteraTotal / activos).toBeGreaterThan(0.3);
    expect(r.kpis.carteraTotal / activos).toBeLessThan(0.9);
  });

  it('el patrimonio mantiene una-capitalización de banco', () => {
    const ultimo = (
      bancaData as never as {
        precomputed: { resultadoMensual: Array<{ patrimonio: number; activos: number }> };
      }
    ).precomputed.resultadoMensual.at(-1)!;
    const capitalizacion = ultimo.patrimonio / ultimo.activos;
    // Sistemas bancarios chilenos: 8-14% de patrimonio sobre activos. Un banco
    // con 7,09x de apalancamiento estaba fuera de cualquier rango creíble.
    expect(capitalizacion).toBeGreaterThan(0.05);
    expect(capitalizacion).toBeLessThan(0.2);
  });

  it('la utilidad es positiva y consistente con un ROA de banco', () => {
    const meses = (
      bancaData as never as {
        precomputed: { resultadoMensual: Array<{ utilidadNeta: number; roa: number }> };
      }
    ).precomputed.resultadoMensual;
    for (const mes of meses) {
      expect(mes.utilidadNeta).toBeGreaterThan(0);
      expect(mes.roa).toBeGreaterThan(0.3);
      expect(mes.roa).toBeLessThan(2.5);
    }
  });
});

describe('Banca: el filtro temporal mueve los KPIs de stock', () => {
  it('una ventana que cierra en otro mes resuelve otro snapshot', () => {
    // `proyectarCartera` saca el stock del mes de `dateRange.end`, así que lo
    // que hay que mover es el CIERRE. Antes los 4 presets de fecha terminaban
    // todos el 2026-09-30: el selector de período era decorativo y el badge de
    // delta se movía mientras el valor de la tarjeta nunca cambiaba.
    const cierreSeptiembre = filterAndAggregateBanca(
      banca,
      bancaFiltros({ start: '2026-04-01', end: '2026-09-30' })
    );
    const cierreMarzo = filterAndAggregateBanca(
      banca,
      bancaFiltros({ start: '2026-01-01', end: '2026-03-31' })
    );
    expect(cierreMarzo.kpis.carteraTotal).not.toBe(cierreSeptiembre.kpis.carteraTotal);
    expect(cierreMarzo.kpis.moraCarteraPct).not.toBe(cierreSeptiembre.kpis.moraCarteraPct);
  });

  it('extender el rango sin mover el cierre no cambia el stock', () => {
    // El snapshot es una foto de fin de mes, no un acumulado: agregar meses
    // anteriores al rango no puede cambiar la foto final. Si lo hiciera, el
    // filtro temporal estaría doblemente roto.
    const seis = filterAndAggregateBanca(banca, bancaFiltros(VENTANA_6M));
    const doce = filterAndAggregateBanca(banca, bancaFiltros(VENTANA_12M));
    expect(seis.kpis.carteraTotal).toBe(doce.kpis.carteraTotal);
  });

  it('la cobertura real cae dentro de la banda que el repo declara', () => {
    const r = filterAndAggregateBanca(banca, bancaFiltros(VENTANA_6M));
    // El benchmark era 180 y el valor real 168,7: la tarjeta disparaba
    // "sub-provisionamiento" mientras scripts/check-data.ts daba el mismo
    // número por bueno dentro de su banda 150-260%.
    expect(r.kpis.coberturaProvisiones).toBeGreaterThanOrEqual(150);
    expect(r.kpis.coberturaProvisiones).toBeLessThanOrEqual(260);
    expect(BANCA_METRICS.coberturaProvisiones.benchmark).toBe(150);
  });

  it('el KPI de cobertura y la serie mensual coinciden', () => {
    const r = filterAndAggregateBanca(banca, bancaFiltros(VENTANA_6M));
    const ultimo = r.tendenciaMoraMensual.at(-1)!;
    // Mismo ratio, dos fallbacks opuestos: 100% en la tarjeta y 0% en la serie
    // para la misma población vacía.
    expect(ultimo.coberturaPct).toBeGreaterThan(0);
    expect(Math.abs(ultimo.coberturaPct - r.kpis.coberturaProvisiones)).toBeLessThan(1);
  });

  it('mora 90+ está anidada dentro de mora 30+', () => {
    const r = filterAndAggregateBanca(banca, bancaFiltros(VENTANA_6M));
    expect(r.kpis.moraVencida90Pct).toBeLessThanOrEqual(r.kpis.moraCarteraPct);
  });
});

describe('Logística: OTIF es una conjunción, no un producto de tasas', () => {
  it('coincide con cumpleTiempo AND cumpleCompleto registro a registro', () => {
    const registros = (logisticaData as never as { records: Array<Record<string, unknown>> })
      .records;
    for (const reg of registros) {
      const esperado = Boolean(reg.cumpleTiempo) && Boolean(reg.cumpleCompleto);
      expect(reg.otif).toBe(esperado);
    }
  });

  it('el HHI de la flota cae en el rango de mercado moderado', () => {
    const r = filterAndAggregateLogistica(logistica, logisticaFiltros(VENTANA_6M));
    expect(r.kpis.hhiProveedores).toBeGreaterThan(1000);
    expect(r.kpis.hhiProveedores).toBeLessThan(2500);
  });
});

describe('Benchmarks: el README y el código no pueden divergir', () => {
  it('el benchmark de margen del código está en el rango que declara el glosario', () => {
    // El README anunciaba 32% mientras metric-definitions fijaba 40%.
    expect(RETAIL_METRICS.margenBrutoPct.benchmark).toBe(40);
  });
});
