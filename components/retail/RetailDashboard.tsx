'use client';

import React, { useMemo, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import {
  RetailDataset,
  filterAndAggregateRetail,
  FilterState,
} from '@/lib/data-engine';
import { InsightBanner } from '@/components/insights/InsightBanner';
import { FilterBar } from '@/components/filters/FilterBar';
import { resolveBenchmark, RETAIL_METRICS } from '@/lib/metric-definitions';
import { formatCLP } from '@/lib/format';
import { KpiCard } from '@/components/charts/KpiCard';
import { LineChartCard } from '@/components/charts/LineChartCard';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { FunnelChartCard } from '@/components/charts/FunnelChartCard';
import { RfmHeatmap } from '@/components/charts/RfmHeatmap';
import { DrilldownDrawer } from './DrilldownDrawer';
import { ShareViewButton } from '@/components/ui/ShareViewButton';
import { RepoLinkBadge } from '@/components/ui/RepoLinkBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Building2,
  Package,
  Users,
  Grid,
} from 'lucide-react';

interface RetailDashboardProps {
  dataset: RetailDataset;
}

export function RetailDashboard({ dataset }: RetailDashboardProps) {
  // 1. Estado en URL con nuqs para deep linking y compartibilidad
  const [query, setQuery] = useQueryStates({
    fechaInicio: parseAsString.withDefault('2026-04-01'),
    fechaFin: parseAsString.withDefault('2026-09-30'),
    categoria: parseAsString,
    canal: parseAsString,
    region: parseAsString,
    segmentoRfm: parseAsString,
  });

  // Estado del modal de Drilldown lateral
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [drilldownType, setDrilldownType] = useState<'skus' | 'customers'>('skus');

  // 2. Construcción de filtros tipados
  const filterState: FilterState = useMemo(() => ({
    dateRange: {
      start: query.fechaInicio,
      end: query.fechaFin,
    },
    categories: query.categoria ? [query.categoria] : [],
    channels: query.canal ? [query.canal] : [],
    regions: query.region ? [query.region] : [],
    rfmSegment: query.segmentoRfm || null,
  }), [query]);

  // 3. Ejecución del motor analítico en memoria (< 1ms)
  const aggregated = useMemo(() => {
    return filterAndAggregateRetail(dataset, filterState);
  }, [dataset, filterState]);

  // Benchmarks desde la fuente canónica (lib/metric-definitions.ts), ya
  // prorateados a la ventana visible. Nada de metas escritas a mano en el JSX:
  // era la razón de que el dashboard, el glosario y el generador mostraran
  // números distintos para el mismo indicador.
  const meta = (key: string) => resolveBenchmark(key, aggregated.window.fraction, RETAIL_METRICS);

  // Meta mensual de ventas para la LÍNEA DE META del gráfico de tendencia.
  //
  // `resolveBenchmark` devuelve el benchmark `flow` prorateado por DÍAS, es decir
  // el total de la ventana. La serie de `tendenciaMensual` es mensual, así que
  // hay que dividir por la cantidad de meses realmente presentes: sin esto la
  // referencia era el total de la ventana (p. ej. $46,1M) contra puntos mensuales
  // de ~$10M y la curva quedaba aplastada en el 20% inferior del área.
  const mesesEnSerie = Math.max(1, aggregated.tendenciaMensual.length);
  const metaVentasMensual =
    (meta('ventasNetas')?.value ?? 0) / mesesEnSerie;

  // Handlers para interactividad
  const handleResetFilters = () => {
    setQuery({
      fechaInicio: '2026-04-01',
      fechaFin: '2026-09-30',
      categoria: null,
      canal: null,
      region: null,
      segmentoRfm: null,
    });
  };

  const openDrilldown = (type: 'skus' | 'customers') => {
    setDrilldownType(type);
    setIsDrilldownOpen(true);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
              <Building2 className="w-3.5 h-3.5" />
              {dataset.meta.empresa}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Período: {dataset.meta.periodoInicio} al {dataset.meta.periodoFin}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Retail Omnicanal & Fidelización
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Monitoreo en tiempo real de facturación, márgenes, embudo digital y segmentación RFM.
          </p>
        </div>

        {/* Acciones de senior / Recruiter Hooks */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:justify-end">
          <RepoLinkBadge repoName="retail-bi-chile" />
          <button
            type="button"
            onClick={() => openDrilldown('skus')}
            className="inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Explorar SKUs
          </button>
          <button
            type="button"
            onClick={() => openDrilldown('customers')}
            className="inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Explorar Clientes
          </button>
          <ShareViewButton />
        </div>
      </div>

      {/* Hallazgo Analítico Superior (Conversion Hook para Reclutadores) */}
      <InsightBanner
        titulo={dataset.meta.businessInsight.titulo}
        descripcion={dataset.meta.businessInsight.descripcion}
        accionRecomendada={dataset.meta.businessInsight.accionRecomendada}
        variant="retail"
      />

      {/* Barra de Filtros con Cross-Filtering y Drawer Móvil */}
      <FilterBar
        categories={dataset.lookups.categorias}
        channels={dataset.lookups.canales}
        regions={dataset.lookups.regiones}
        selectedCategory={query.categoria}
        selectedChannel={query.canal}
        selectedRegion={query.region}
        selectedDateRange={{
          start: query.fechaInicio,
          end: query.fechaFin,
        }}
        selectedRfmSegment={query.segmentoRfm}
        filteredCount={aggregated.filteredCount}
        totalCount={aggregated.totalCount}
        filteredRecords={aggregated.filteredRecords}
        onCategoryChange={(categoria) => setQuery({ categoria })}
        onChannelChange={(canal) => setQuery({ canal })}
        onRegionChange={(region) => setQuery({ region })}
        onDateRangeChange={({ start, end }) =>
          setQuery({ fechaInicio: start, fechaFin: end })
        }
        onRfmSegmentChange={(segmentoRfm) => setQuery({ segmentoRfm })}
        onResetFilters={handleResetFilters}
      />

      {/* KPIs Ejecutivos con Arquitectura de 2 Niveles */}
      <div className="space-y-3.5">
        {/* Tier 1: North Star Metrics (3 Hero Cards con Sparklines y Progreso de Meta) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <KpiCard
            isHero
            label="Ventas Netas"
            value={aggregated.kpis.ventasNetas}
            previousValue={aggregated.previousKpis?.ventasNetas ?? null}
            unit="CLP"
            metricKey="ventasNetas"
            benchmark={meta('ventasNetas')?.value ?? null}
            benchmarkSource={meta('ventasNetas')?.source}
            benchmarkLabel={meta('ventasNetas')?.label}
            benchmarkProrated={meta('ventasNetas')?.prorated}
            sparklineData={aggregated.tendenciaMensual.map((m) => m.ventas)}
            highlightVariant="retail"
          />
          <KpiCard
            isHero
            label="Margen Bruto"
            value={aggregated.kpis.margenBrutoPct}
            previousValue={aggregated.previousKpis?.margenBrutoPct ?? null}
            unit="%"
            metricKey="margenBrutoPct"
            benchmark={meta('margenBrutoPct')?.value ?? null}
            benchmarkSource={meta('margenBrutoPct')?.source}
            sparklineData={aggregated.tendenciaMensual.map((m) => m.margenPct)}
            highlightVariant="retail"
          />
          <KpiCard
            isHero
            label="Ticket Promedio"
            value={aggregated.kpis.ticketPromedio}
            previousValue={aggregated.previousKpis?.ticketPromedio ?? null}
            unit="CLP"
            metricKey="ticketPromedio"
            benchmark={meta('ticketPromedio')?.value ?? null}
            benchmarkSource={meta('ticketPromedio')?.source}
            sparklineData={aggregated.tendenciaMensual.map((m) =>
              Math.round(m.ventas / Math.max(1, m.pedidos))
            )}
            highlightVariant="retail"
          />
        </div>

        {/* Tier 2: Operational Health Strip (4 Métricas Secundarias en Grid Balanceado) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-3.5">
          <KpiCard
            label="Pedidos Totales"
            value={aggregated.kpis.pedidosTotales}
            previousValue={aggregated.previousKpis?.pedidosTotales ?? null}
            unit="num"
            metricKey="pedidosTotales"
            highlightVariant="retail"
          />
          <KpiCard
            label="Tasa Conversión"
            value={aggregated.kpis.tasaConversion}
            previousValue={aggregated.previousKpis?.tasaConversion ?? null}
            unit="%"
            metricKey="tasaConversion"
            benchmark={meta('tasaConversion')?.value ?? null}
            benchmarkSource={meta('tasaConversion')?.source}
            highlightVariant="retail"
          />
          <KpiCard
            label="Clientes Recurrentes"
            value={aggregated.kpis.clientesRecurrentes}
            unit="num"
            metricKey="clientesRecurrentes"
            highlightVariant="retail"
          />
          <KpiCard
            label="NPS Satisfacción"
            value={aggregated.kpis.nps}
            previousValue={aggregated.previousKpis?.nps ?? null}
            unit="pts"
            metricKey="nps"
            benchmark={meta('nps')?.value ?? null}
            benchmarkSource={meta('nps')?.source}
            highlightVariant="retail"
          />
        </div>
      </div>

      {/* Grillas de Visualizaciones o Estado Vacío */}
      {aggregated.filteredCount === 0 ? (
        <EmptyState
          title="Sin transacciones para estos filtros"
          description="No se registraron ventas en el período simulado para la combinación de categoría, canal y región seleccionada."
          onResetFilters={handleResetFilters}
          variant="retail"
        />
      ) : (
        <>
          {/* Fila 1 de Gráficos: Tendencia Temporal + Cuota por Canal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 min-w-0">
              <LineChartCard
                data={aggregated.tendenciaMensual}
                metaMensual={metaVentasMensual > 0 ? metaVentasMensual : null}
                metaLabel={`Meta mensual ${formatCLP(metaVentasMensual, { compact: true })}`}
                periodoLabel={`${aggregated.window.days} días visibles`}
              />
            </div>
            <div className="lg:col-span-4 min-w-0">
              <DonutChartCard
                data={aggregated.ventasPorCanal}
                selectedChannel={query.canal}
                onSelectChannel={(canal) => setQuery({ canal })}
              />
            </div>
          </div>

          {/* Fila 2 de Gráficos: Desglose por Categoría + Embudo de Conversión */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 min-w-0">
              <BarChartCard
                data={aggregated.ventasPorCategoria}
                selectedCategory={query.categoria}
                onSelectCategory={(categoria) => setQuery({ categoria })}
              />
            </div>
            <div className="lg:col-span-6 min-w-0">
              <FunnelChartCard data={dataset.precomputed.funnel} />
            </div>
          </div>

          {/* Fila 3: Matriz RFM 5x5 Nativa (CSS Grid + Radix Tooltips) */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                  <Grid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Matriz RFM 5x5: Recencia vs Frecuencia de Compra
                </h2>
                <p className="text-xs text-muted-foreground">
                  Segmentación algorítmica de clientes con scores normalizados de 1 a 5. Haz clic en cualquier celda o botón de segmento para filtrar el panel completo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openDrilldown('customers')}
                className="tap-target text-xs text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline self-start sm:self-auto"
              >
                Ver tabla de clientes →
              </button>
            </div>

            <RfmHeatmap
              matrix={aggregated.rfmMatrix}
              axes={aggregated.rfmAxes}
              selectedSegment={query.segmentoRfm}
              onSelectSegment={(segmentoRfm) => setQuery({ segmentoRfm })}
            />
          </div>
        </>
      )}

      {/* Drawer Lateral de Drilldown (SKUs o Clientes) */}
      <DrilldownDrawer
        isOpen={isDrilldownOpen}
        onOpenChange={setIsDrilldownOpen}
        type={drilldownType}
        dataset={dataset}
        filteredRecords={aggregated.filteredRecords}
        selectedCategory={query.categoria}
        selectedRfmSegment={query.segmentoRfm}
      />
    </div>
  );
}
