'use client';

import React, { useMemo, useState } from 'react';
import { useQueryStates, parseAsString, parseAsBoolean } from 'nuqs';
import {
  LogisticaDataset,
  filterAndAggregateLogistica,
  LogisticaFilterState,
} from '@/lib/logistica-data-engine';
import { resolveBenchmark, LOGISTICA_METRICS } from '@/lib/metric-definitions';
import { formatDate } from '@/lib/format';
import { InsightBanner } from '@/components/insights/InsightBanner';
import { LogisticaFilterBar } from './LogisticaFilterBar';
import { KpiCard } from '@/components/charts/KpiCard';
import { OtifRoutesBarCard } from './OtifRoutesBarCard';
import { LeadTimeDistributionCard } from './LeadTimeDistributionCard';
import { SupplierHhiCard } from './SupplierHhiCard';
import { FailureReasonsCard } from './FailureReasonsCard';
import { LogisticaDrilldownDrawer } from './LogisticaDrilldownDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShareViewButton } from '@/components/ui/ShareViewButton';
import { RepoLinkBadge } from '@/components/ui/RepoLinkBadge';
import { Truck, FileText } from 'lucide-react';

interface LogisticaDashboardProps {
  dataset: LogisticaDataset;
}

export function LogisticaDashboard({ dataset }: LogisticaDashboardProps) {
  const [query, setQuery] = useQueryStates({
    fechaInicio: parseAsString.withDefault('2026-04-01'),
    fechaFin: parseAsString.withDefault('2026-09-30'),
    ruta: parseAsString,
    transportista: parseAsString,
    tipoCarga: parseAsString,
    prioridad: parseAsString,
    soloIncidencias: parseAsBoolean.withDefault(false),
  });

  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  const filterState: LogisticaFilterState = useMemo(
    () => ({
      dateRange: {
        start: query.fechaInicio,
        end: query.fechaFin,
      },
      rutas: query.ruta ? [query.ruta] : [],
      transportistas: query.transportista ? [query.transportista] : [],
      tiposCarga: query.tipoCarga ? [query.tipoCarga] : [],
      prioridades: query.prioridad ? [query.prioridad] : [],
      soloIncidencias: query.soloIncidencias,
    }),
    [query]
  );

  const aggregated = useMemo(() => {
    return filterAndAggregateLogistica(dataset, filterState);
  }, [dataset, filterState]);

  // Benchmarks desde la fuente canónica, prorateados a la ventana visible.
  const meta = (key: string) => resolveBenchmark(key, aggregated.window.fraction, LOGISTICA_METRICS);

  const handleResetFilters = () => {
    setQuery({
      fechaInicio: '2026-04-01',
      fechaFin: '2026-09-30',
      ruta: null,
      transportista: null,
      tipoCarga: null,
      prioridad: null,
      soloIncidencias: false,
    });
  };

  /* El insight viene de `dataset.meta.businessInsight` y no se recalcula: es
     contexto del dataset completo. Con filtros activos —por ejemplo "solo
     incidencias"— el banner seguía describiendo el cumplimiento de todo el
     mes, que es justo lo contrario de lo que el usuario pidió ver. */
  const filtrosActivos = [
    query.ruta ? `ruta ${query.ruta}` : null,
    query.transportista ? `transportista ${query.transportista}` : null,
    query.tipoCarga ? `tipo de carga ${query.tipoCarga}` : null,
    query.prioridad ? `prioridad ${query.prioridad}` : null,
    query.soloIncidencias ? 'solo incidencias' : null,
  ].filter((f): f is string => Boolean(f));

  const hayFiltros = filtrosActivos.length > 0;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
              <Truck className="w-3.5 h-3.5" />
              {dataset.meta.empresa}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Período Operativo: {formatDate(dataset.meta.periodoInicio)} – {formatDate(dataset.meta.periodoFin)}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Logística & Cadena de Suministro
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Control de cumplimiento OTIF, tiempos de ciclo P50/P90, costos unitarios y concentración de flota.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:justify-end">
          <RepoLinkBadge label="Pipeline de datos" />
          <button
            type="button"
            onClick={() => setIsDrilldownOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Explorar Guías y Despachos
          </button>
          <ShareViewButton />
        </div>
      </div>

      {/* Hallazgo Analítico Superior */}
      <InsightBanner
        titulo={dataset.meta.businessInsight.titulo}
        descripcion={dataset.meta.businessInsight.descripcion}
        accionRecomendada={dataset.meta.businessInsight.accionRecomendada}
        variant="logistica"
        alcance={hayFiltros ? 'filtrado' : 'dataset'}
        filtrosActivos={filtrosActivos}
      />

      {/* Barra de Filtros con Nuqs */}
      <LogisticaFilterBar
        rutas={dataset.lookups.rutas}
        transportistas={dataset.lookups.transportistas}
        tiposCarga={dataset.lookups.tiposCarga}
        prioridades={dataset.lookups.prioridades}
        selectedRuta={query.ruta}
        selectedTransportista={query.transportista}
        selectedTipoCarga={query.tipoCarga}
        selectedPrioridad={query.prioridad}
        soloIncidencias={query.soloIncidencias}
        selectedDateRange={{
          start: query.fechaInicio,
          end: query.fechaFin,
        }}
        filteredCount={aggregated.filteredCount}
        totalCount={aggregated.totalCount}
        filteredRecords={aggregated.filteredRecords}
        onRutaChange={(ruta) => setQuery({ ruta })}
        onTransportistaChange={(transportista) => setQuery({ transportista })}
        onTipoCargaChange={(tipoCarga) => setQuery({ tipoCarga })}
        onPrioridadChange={(prioridad) => setQuery({ prioridad })}
        onSoloIncidenciasChange={(soloIncidencias) => setQuery({ soloIncidencias })}
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
            label="Cumplimiento OTIF"
            value={aggregated.kpis.otifPct}
            previousValue={aggregated.previousKpis?.otifPct ?? null}
            unit="%"
            metricKey="otifPct"
            benchmark={meta('otifPct')?.value ?? null}
            benchmarkSource={meta('otifPct')?.source}
            highlightVariant="logistica"
            sparklineData={aggregated.tendenciaMensualOtif.map((m) => m.otifPct)}
          />
          <KpiCard
            isHero
            label="Lead Time P90"
            value={aggregated.kpis.leadTimeP90}
            previousValue={aggregated.previousKpis?.leadTimeP90 ?? null}
            unit="hrs"
            metricKey="leadTimeP90"
            benchmark={meta('leadTimeP90')?.value ?? null}
            benchmarkSource={meta('leadTimeP90')?.source}
            highlightVariant="logistica"
            trendDirection="lower-is-better"
            sparklineData={aggregated.distribucionLeadTime.map((d) => d.porcentaje)}
          />
          <KpiCard
            isHero
            label="Costo Promedio Flete"
            value={aggregated.kpis.costoPromedio}
            previousValue={aggregated.previousKpis?.costoPromedio ?? null}
            unit="CLP"
            metricKey="costoPromedio"
            benchmark={meta('costoPromedio')?.value ?? null}
            benchmarkSource={meta('costoPromedio')?.source}
            highlightVariant="logistica"
            trendDirection="lower-is-better"
            sparklineData={aggregated.otifPorRuta.map((r) => r.costoPromedio)}
          />
        </div>

        {/* Tier 2: Operational Health Strip (4 Métricas Secundarias en Grid Balanceado) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-3.5">
          <KpiCard
            label="Lead Time P50"
            value={aggregated.kpis.leadTimeP50}
            previousValue={aggregated.previousKpis?.leadTimeP50 ?? null}
            unit="hrs"
            metricKey="leadTimeP50"
            benchmark={meta('leadTimeP50')?.value ?? null}
            benchmarkSource={meta('leadTimeP50')?.source}
            highlightVariant="logistica"
            trendDirection="lower-is-better"
          />
          <KpiCard
            label="Fill Rate Volumen"
            value={aggregated.kpis.fillRatePct}
            previousValue={aggregated.previousKpis?.fillRatePct ?? null}
            unit="%"
            metricKey="fillRatePct"
            benchmark={meta('fillRatePct')?.value ?? null}
            benchmarkSource={meta('fillRatePct')?.source}
            highlightVariant="logistica"
          />
          <KpiCard
            label="Concentración HHI"
            value={aggregated.kpis.hhiProveedores}
            unit="pts"
            metricKey="hhiProveedores"
            benchmark={meta('hhiProveedores')?.value ?? null}
            benchmarkSource={meta('hhiProveedores')?.source}
            highlightVariant="logistica"
          />
          <KpiCard
            label="Total Despachos"
            value={aggregated.kpis.totalDespachos}
            unit="num"
            highlightVariant="logistica"
          />
        </div>
      </div>

      {/* Grillas de Visualizaciones o Estado Vacío */}
      {aggregated.filteredCount === 0 ? (
        <EmptyState
          title="Sin despachos para estos filtros"
          description="No se encontraron guías u operaciones que coincidan con la ruta, transportista, tipo de carga o prioridad seleccionada."
          onResetFilters={handleResetFilters}
          variant="logistica"
        />
      ) : (
        <>
          {/* Fila 1 de Gráficos: OTIF por Ruta + Concentración HHI de Transportistas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 min-w-0">
              <OtifRoutesBarCard
                data={aggregated.otifPorRuta}
                selectedRuta={query.ruta}
                onSelectRuta={(ruta) => setQuery({ ruta })}
              />
            </div>
            <div className="lg:col-span-5 min-w-0">
              <SupplierHhiCard
                data={aggregated.concentracionTransportistas}
                hhiScore={aggregated.kpis.hhiProveedores}
                selectedTransportista={query.transportista}
                onSelectTransportista={(transportista) => setQuery({ transportista })}
              />
            </div>
          </div>

          {/* Fila 2 de Gráficos: Distribución Lead Time + Causas de Incidencia Pareto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 min-w-0">
              <LeadTimeDistributionCard
                data={aggregated.distribucionLeadTime}
                p50={aggregated.kpis.leadTimeP50}
                p90={aggregated.kpis.leadTimeP90}
              />
            </div>
            <div className="lg:col-span-6 min-w-0">
              <FailureReasonsCard data={aggregated.causasIncidencias} />
            </div>
          </div>
        </>
      )}

      {/* Drawer de Drilldown Lateral */}
      <LogisticaDrilldownDrawer
        isOpen={isDrilldownOpen}
        onOpenChange={setIsDrilldownOpen}
        filteredRecords={aggregated.filteredRecords}
        selectedRuta={query.ruta}
        selectedTransportista={query.transportista}
      />
    </div>
  );
}
