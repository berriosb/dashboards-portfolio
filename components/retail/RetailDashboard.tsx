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
import { KpiCard } from '@/components/charts/KpiCard';
import { LineChartCard } from '@/components/charts/LineChartCard';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { FunnelChartCard } from '@/components/charts/FunnelChartCard';
import { RfmHeatmap } from '@/components/charts/RfmHeatmap';
import { DrilldownDrawer } from './DrilldownDrawer';
import { RepoLinkBadge } from '@/components/ui/RepoLinkBadge';
import { ShareViewButton } from '@/components/ui/ShareViewButton';
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
    fechaInicio: parseAsString.withDefault('2025-10-01'),
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

  // Handlers para interactividad
  const handleResetFilters = () => {
    setQuery({
      fechaInicio: '2025-10-01',
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
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => openDrilldown('skus')}
            className="inline-flex items-center gap-1.5 text-xs font-medium h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Explorar SKUs
          </button>
          <button
            type="button"
            onClick={() => openDrilldown('customers')}
            className="inline-flex items-center gap-1.5 text-xs font-medium h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Explorar Clientes
          </button>
          <ShareViewButton />
          <RepoLinkBadge repoName="retail-bi-chile" />
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
        onCategoryChange={(categoria) => setQuery({ categoria })}
        onChannelChange={(canal) => setQuery({ canal })}
        onRegionChange={(region) => setQuery({ region })}
        onDateRangeChange={({ start, end }) =>
          setQuery({ fechaInicio: start, fechaFin: end })
        }
        onRfmSegmentChange={(segmentoRfm) => setQuery({ segmentoRfm })}
        onResetFilters={handleResetFilters}
      />

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        <KpiCard
          label="Ventas Netas"
          value={aggregated.kpis.ventasNetas}
          previousValue={Math.round(aggregated.kpis.ventasNetas * 0.92)}
          unit="CLP"
          metricKey="ventasNetas"
          benchmark={300000000}
          benchmarkSource="Meta anual CCS"
        />
        <KpiCard
          label="Ticket Promedio"
          value={aggregated.kpis.ticketPromedio}
          previousValue={42000}
          unit="CLP"
          metricKey="ticketPromedio"
          benchmark={42000}
          benchmarkSource="Retail Chile (CCS)"
        />
        <KpiCard
          label="Margen Bruto"
          value={aggregated.kpis.margenBrutoPct}
          previousValue={38.5}
          unit="%"
          metricKey="margenBrutoPct"
          benchmark={40.0}
          benchmarkSource="Rango obj. 35%-45%"
        />
        <KpiCard
          label="Pedidos Totales"
          value={aggregated.kpis.pedidosTotales}
          previousValue={Math.round(aggregated.kpis.pedidosTotales * 0.96)}
          unit="num"
          metricKey="pedidosTotales"
        />
        <KpiCard
          label="Tasa Conversión"
          value={aggregated.kpis.tasaConversion}
          previousValue={2.9}
          unit="%"
          metricKey="tasaConversion"
          benchmark={3.0}
          benchmarkSource="Mediana online CCS"
        />
        <KpiCard
          label="Clientes Recurrentes"
          value={aggregated.kpis.clientesRecurrentes}
          unit="num"
          metricKey="clientesRecurrentes"
        />
        <div className="col-span-2 sm:col-span-1">
          <KpiCard
            label="NPS Satisfacción"
            value={aggregated.kpis.nps}
            previousValue={45}
            unit="pts"
            metricKey="nps"
            benchmark={50}
            benchmarkSource="Líder retail LatAm"
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
              <LineChartCard data={aggregated.tendenciaMensual} />
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
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline self-start sm:self-auto"
              >
                Ver tabla de clientes →
              </button>
            </div>

            <RfmHeatmap
              matrix={aggregated.rfmMatrix}
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
