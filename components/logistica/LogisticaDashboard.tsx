'use client';

import React, { useMemo, useState } from 'react';
import { useQueryStates, parseAsString, parseAsBoolean } from 'nuqs';
import {
  LogisticaDataset,
  filterAndAggregateLogistica,
  LogisticaFilterState,
} from '@/lib/logistica-data-engine';
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
import { Truck, FileText } from 'lucide-react';

interface LogisticaDashboardProps {
  dataset: LogisticaDataset;
}

export function LogisticaDashboard({ dataset }: LogisticaDashboardProps) {
  const [query, setQuery] = useQueryStates({
    fechaInicio: parseAsString.withDefault('2025-10-01'),
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

  const handleResetFilters = () => {
    setQuery({
      fechaInicio: '2025-10-01',
      fechaFin: '2026-09-30',
      ruta: null,
      transportista: null,
      tipoCarga: null,
      prioridad: null,
      soloIncidencias: false,
    });
  };

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
              Período Operativo: {dataset.meta.periodoInicio} al {dataset.meta.periodoFin}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Logística & Cadena de Suministro
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Control de cumplimiento OTIF, tiempos de ciclo P50/P90, costos unitarios y concentración de flota.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsDrilldownOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs"
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

      {/* Grilla de KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        <KpiCard
          label="Cumplimiento OTIF"
          value={aggregated.kpis.otifPct}
          previousValue={92.4}
          unit="%"
          metricKey="otifPct"
          benchmark={95.0}
          benchmarkSource="Estándar EDI Chile"
          highlightVariant="logistica"
        />
        <KpiCard
          label="Lead Time P50"
          value={aggregated.kpis.leadTimeP50}
          previousValue={17.5}
          unit="hrs"
          metricKey="leadTimeP50"
          benchmark={18.0}
          benchmarkSource="SLA compromiso estándar"
          highlightVariant="logistica"
        />
        <KpiCard
          label="Lead Time P90"
          value={aggregated.kpis.leadTimeP90}
          previousValue={38.0}
          unit="hrs"
          metricKey="leadTimeP90"
          benchmark={36.0}
          benchmarkSource="Límite superior SLA"
          highlightVariant="logistica"
        />
        <KpiCard
          label="Fill Rate Volumen"
          value={aggregated.kpis.fillRatePct}
          previousValue={97.8}
          unit="%"
          metricKey="fillRatePct"
          benchmark={98.0}
          benchmarkSource="Exactitud de picking"
          highlightVariant="logistica"
        />
        <KpiCard
          label="Costo Promedio"
          value={aggregated.kpis.costoPromedio}
          previousValue={46500}
          unit="CLP"
          metricKey="costoPorDespacho"
          benchmark={45000}
          benchmarkSource="Presupuesto por flete"
          highlightVariant="logistica"
        />
        <KpiCard
          label="Concentración HHI"
          value={aggregated.kpis.hhiProveedores}
          unit="pts"
          metricKey="hhiProveedores"
          benchmark={1800}
          benchmarkSource="Umbral DOJ/FTC"
          highlightVariant="logistica"
        />
        <div className="col-span-2 sm:col-span-1">
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
