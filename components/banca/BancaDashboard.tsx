'use client';

import React, { useMemo, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import {
  BancaDataset,
  filterAndAggregateBanca,
  BancaFilterState,
} from '@/lib/banca-data-engine';
import { InsightBanner } from '@/components/insights/InsightBanner';
import { BancaFilterBar } from './BancaFilterBar';
import { KpiCard } from '@/components/charts/KpiCard';
import { AgingChartCard } from './AgingChartCard';
import { ProductsBarCard } from './ProductsBarCard';
import { CmfMoraLineCard } from './CmfMoraLineCard';
import { BancaSegmentsDonutCard } from './BancaSegmentsDonutCard';
import { BancaDrilldownDrawer } from './BancaDrilldownDrawer';
import { RepoLinkBadge } from '@/components/ui/RepoLinkBadge';
import { Landmark, FileSpreadsheet } from 'lucide-react';

interface BancaDashboardProps {
  dataset: BancaDataset;
}

export function BancaDashboard({ dataset }: BancaDashboardProps) {
  const [query, setQuery] = useQueryStates({
    fechaInicio: parseAsString.withDefault('2024-01-01'),
    fechaFin: parseAsString.withDefault('2027-12-31'),
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

  const handleResetFilters = () => {
    setQuery({
      fechaInicio: '2024-01-01',
      fechaFin: '2027-12-31',
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

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsDrilldownOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Explorar Deudores y Créditos
          </button>
          <RepoLinkBadge repoName="banca-chile-datos" />
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
        onProductoChange={(producto) => setQuery({ producto })}
        onSegmentoChange={(segmento) => setQuery({ segmento })}
        onRegionChange={(region) => setQuery({ region })}
        onTramoMoraChange={(tramoMora) => setQuery({ tramoMora })}
        onDateRangeChange={({ start, end }) =>
          setQuery({ fechaInicio: start, fechaFin: end })
        }
        onResetFilters={handleResetFilters}
      />

      {/* Grilla de KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        <KpiCard
          label="Cartera Total"
          value={aggregated.kpis.carteraTotal}
          previousValue={Math.round(aggregated.kpis.carteraTotal * 0.94)}
          unit="CLP"
          metricKey="carteraTotal"
          benchmark={1500000000}
          benchmarkSource="Meta CMF"
          highlightVariant="banca"
        />
        <KpiCard
          label="Cartera Vigente"
          value={aggregated.kpis.carteraVigente}
          previousValue={Math.round(aggregated.kpis.carteraVigente * 0.95)}
          unit="CLP"
          metricKey="carteraVigente"
          benchmark={1400000000}
          benchmarkSource="Calidad activos"
          highlightVariant="banca"
        />
        <KpiCard
          label="Mora 30+ CMF"
          value={aggregated.kpis.moraCarteraPct}
          previousValue={2.1}
          unit="%"
          metricKey="moraCarteraPct"
          benchmark={2.5}
          benchmarkSource="Umbral alerta CMF"
          highlightVariant="banca"
        />
        <KpiCard
          label="Mora 90+ CMF"
          value={aggregated.kpis.moraVencida90Pct}
          previousValue={0.95}
          unit="%"
          metricKey="moraVencida90Pct"
          benchmark={1.0}
          benchmarkSource="Gatillo provisión"
          highlightVariant="banca"
        />
        <KpiCard
          label="Captación Neta"
          value={aggregated.kpis.captacionNeta}
          unit="CLP"
          metricKey="captacionNeta"
          benchmark={250000000}
          benchmarkSource="Meta liquidez"
          highlightVariant="banca"
        />
        <KpiCard
          label="Cobertura Provisión"
          value={aggregated.kpis.coberturaProvisiones}
          previousValue={142}
          unit="%"
          metricKey="coberturaProvisiones"
          benchmark={130}
          benchmarkSource="Estándar IFRS 9"
          highlightVariant="banca"
        />
        <div className="col-span-2 sm:col-span-1">
          <KpiCard
            label="ROE Anualizado"
            value={aggregated.kpis.roe}
            previousValue={14.8}
            unit="%"
            metricKey="roe"
            benchmark={14.5}
            benchmarkSource="Promedio banca CL"
            highlightVariant="banca"
          />
        </div>
      </div>

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
