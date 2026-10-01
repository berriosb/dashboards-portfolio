'use client';

import React, { useMemo, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import {
  BancaDataset,
  filterAndAggregateBanca,
  BancaFilterState,
} from '@/lib/banca-data-engine';
import { resolveBenchmark, BANCA_METRICS } from '@/lib/metric-definitions';
import { InsightBanner } from '@/components/insights/InsightBanner';
import { BancaFilterBar } from './BancaFilterBar';
import { KpiCard } from '@/components/charts/KpiCard';
import { AgingChartCard } from './AgingChartCard';
import { ProductsBarCard } from './ProductsBarCard';
import { CmfMoraLineCard } from './CmfMoraLineCard';
import { BancaSegmentsDonutCard } from './BancaSegmentsDonutCard';
import { BancaDrilldownDrawer } from './BancaDrilldownDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShareViewButton } from '@/components/ui/ShareViewButton';
import { RepoLinkBadge } from '@/components/ui/RepoLinkBadge';
import { Landmark, FileSpreadsheet } from 'lucide-react';

interface BancaDashboardProps {
  dataset: BancaDataset;
}

export function BancaDashboard({ dataset }: BancaDashboardProps) {
  const [query, setQuery] = useQueryStates({
    fechaInicio: parseAsString.withDefault('2026-04-01'),
    fechaFin: parseAsString.withDefault('2026-09-30'),
    producto: parseAsString,
    segmento: parseAsString,
    region: parseAsString,
    tramoMora: parseAsString,
  });

  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  const filterState: BancaFilterState = useMemo(
    () => ({
      dateRange: {
        start: query.fechaInicio,
        end: query.fechaFin,
      },
      productos: query.producto ? [query.producto] : [],
      segmentos: query.segmento ? [query.segmento] : [],
      regiones: query.region ? [query.region] : [],
      tramoMora: query.tramoMora || null,
    }),
    [query]
  );

  const aggregated = useMemo(() => {
    return filterAndAggregateBanca(dataset, filterState);
  }, [dataset, filterState]);

  // Benchmarks desde la fuente canónica (lib/metric-definitions.ts), prorateados
  // a la ventana visible. La cartera es un stock: las metas de saldo y mora NO
  // se proratean, sólo las de flujo como captación neta.
  const meta = (key: string) => resolveBenchmark(key, aggregated.window.fraction, BANCA_METRICS);

  const handleResetFilters = () => {
    setQuery({
      fechaInicio: '2026-04-01',
      fechaFin: '2026-09-30',
      producto: null,
      segmento: null,
      region: null,
      tramoMora: null,
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
              <Landmark className="w-3.5 h-3.5" />
              {dataset.meta.empresa}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Período de Cartera: {dataset.meta.periodoInicio} al {dataset.meta.periodoFin}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Banca Comercial & Riesgo Crediticio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Supervisión integral de colocaciones, mora temprana vs vencida CMF, provisiones IFRS 9 y liquidez.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:justify-end">
          <RepoLinkBadge repoName="banca-chile-datos" />
          <button
            type="button"
            onClick={() => setIsDrilldownOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Explorar Deudores y Créditos
          </button>
          <ShareViewButton />
        </div>
      </div>

      {/* Hallazgo Analítico Superior (Conversion Hook) */}
      <InsightBanner
        titulo={dataset.meta.businessInsight.titulo}
        descripcion={dataset.meta.businessInsight.descripcion}
        accionRecomendada={dataset.meta.businessInsight.accionRecomendada}
        variant="banca"
      />

      {/* Barra de Filtros con Nuqs */}
      <BancaFilterBar
        productos={dataset.lookups.productos}
        segmentos={dataset.lookups.segmentos}
        regiones={dataset.lookups.regiones}
        tramosMora={dataset.lookups.tramosMora}
        selectedProducto={query.producto}
        selectedSegmento={query.segmento}
        selectedRegion={query.region}
        selectedTramoMora={query.tramoMora}
        selectedDateRange={{
          start: query.fechaInicio,
          end: query.fechaFin,
        }}
        filteredCount={aggregated.filteredCount}
        totalCount={aggregated.totalCount}
        filteredRecords={aggregated.filteredRecords}
        onProductoChange={(producto) => setQuery({ producto })}
        onSegmentoChange={(segmento) => setQuery({ segmento })}
        onRegionChange={(region) => setQuery({ region })}
        onTramoMoraChange={(tramoMora) => setQuery({ tramoMora })}
        onDateRangeChange={({ start, end }) =>
          setQuery({ fechaInicio: start, fechaFin: end })
        }
        onResetFilters={handleResetFilters}
      />

      {/* KPIs Ejecutivos con Arquitectura de 2 Niveles */}
      <div className="space-y-3.5">
        {/* Tier 1: North Star Metrics (3 Hero Cards con Sparklines y Progreso de Meta) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <KpiCard
            isHero
            label="Cartera Total"
            value={aggregated.kpis.carteraTotal}
            previousValue={aggregated.previousKpis?.carteraTotal ?? null}
            unit="CLP"
            metricKey="carteraTotal"
            benchmark={meta('carteraTotal')?.value ?? null}
            benchmarkSource={meta('carteraTotal')?.source}
            highlightVariant="banca"
            sparklineData={aggregated.tendenciaMoraMensual.map((m) => m.saldoPromedioMensual)}
          />
          <KpiCard
            isHero
            label="Mora 90+ CMF"
            value={aggregated.kpis.moraVencida90Pct}
            previousValue={aggregated.previousKpis?.moraVencida90Pct ?? null}
            unit="%"
            metricKey="moraVencida90Pct"
            benchmark={meta('moraVencida90Pct')?.value ?? null}
            benchmarkSource={meta('moraVencida90Pct')?.source}
            highlightVariant="banca"
            trendDirection="lower-is-better"
            sparklineData={aggregated.tendenciaMoraMensual.map((m) => m.mora90Pct)}
          />
          <KpiCard
            isHero
            label="Cobertura Provisión"
            value={aggregated.kpis.coberturaProvisiones}
            previousValue={aggregated.previousKpis?.coberturaProvisiones ?? null}
            unit="%"
            metricKey="coberturaProvisiones"
            benchmark={meta('coberturaProvisiones')?.value ?? null}
            benchmarkSource={meta('coberturaProvisiones')?.source}
            highlightVariant="banca"
            // Antes era un array fijo [132, 134, 136, ...] dibujado a mano.
            sparklineData={aggregated.tendenciaMoraMensual.map((m) => m.coberturaPct)}
          />
        </div>

        {/* Tier 2: Operational Health Strip (4 Métricas Secundarias en Grid Balanceado) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-3.5">
          <KpiCard
            label="Cartera Vigente"
            value={aggregated.kpis.carteraVigente}
            previousValue={aggregated.previousKpis?.carteraVigente ?? null}
            unit="CLP"
            metricKey="carteraVigente"
            benchmark={meta('carteraVigente')?.value ?? null}
            benchmarkSource={meta('carteraVigente')?.source}
            highlightVariant="banca"
          />
          <KpiCard
            label="Mora 30+ CMF"
            value={aggregated.kpis.moraCarteraPct}
            previousValue={aggregated.previousKpis?.moraCarteraPct ?? null}
            unit="%"
            metricKey="moraCarteraPct"
            benchmark={meta('moraCarteraPct')?.value ?? null}
            benchmarkSource={meta('moraCarteraPct')?.source}
            highlightVariant="banca"
            trendDirection="lower-is-better"
          />
          <KpiCard
            label="Captación Neta"
            value={aggregated.kpis.captacionNeta}
            unit="CLP"
            metricKey="captacionNeta"
            previousValue={aggregated.previousKpis?.captacionNeta ?? null}
            benchmark={meta('captacionNeta')?.value ?? null}
            benchmarkSource={meta('captacionNeta')?.source}
            benchmarkLabel={meta('captacionNeta')?.label}
            benchmarkProrated={meta('captacionNeta')?.prorated}
            highlightVariant="banca"
          />
          <KpiCard
            label="ROE Anualizado"
            value={aggregated.kpis.roe}
            previousValue={aggregated.previousKpis?.roe ?? null}
            unit="%"
            metricKey="roe"
            benchmark={meta('roe')?.value ?? null}
            benchmarkSource={meta('roe')?.source}
            highlightVariant="banca"
          />
        </div>
      </div>

      {/* Grillas de Visualizaciones o Estado Vacío */}
      {aggregated.filteredCount === 0 ? (
        <EmptyState
          title="Sin colocaciones para estos filtros"
          description="No se encontraron créditos que coincidan con la combinación de producto, segmento, región y mora seleccionada."
          onResetFilters={handleResetFilters}
          variant="banca"
        />
      ) : (
        <>
          {/* Fila 1 de Gráficos: Aging de Cartera + Distribución de Segmentos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 min-w-0">
              <AgingChartCard
                data={aggregated.agingCartera}
                selectedTramo={query.tramoMora}
                onSelectTramo={(tramoMora) => setQuery({ tramoMora })}
              />
            </div>
            <div className="lg:col-span-5 min-w-0">
              <BancaSegmentsDonutCard
                data={aggregated.distribucionSegmentos}
                selectedSegment={query.segmento}
                onSelectSegment={(segmento) => setQuery({ segmento })}
              />
            </div>
          </div>

          {/* Fila 2 de Gráficos: Colocaciones por Producto + Tendencia Mora CMF */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 min-w-0">
              <ProductsBarCard
                data={aggregated.colocacionesPorProducto}
                selectedProduct={query.producto}
                onSelectProduct={(producto) => setQuery({ producto })}
              />
            </div>
            <div className="lg:col-span-6 min-w-0">
              <CmfMoraLineCard data={aggregated.tendenciaMoraMensual} />
            </div>
          </div>
        </>
      )}

      {/* Drawer de Drilldown Lateral */}
      <BancaDrilldownDrawer
        isOpen={isDrilldownOpen}
        onOpenChange={setIsDrilldownOpen}
        filteredRecords={aggregated.filteredRecords}
        selectedProduct={query.producto}
        selectedSegment={query.segmento}
        selectedTramoMora={query.tramoMora}
      />
    </div>
  );
}
