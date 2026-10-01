'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Route,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  X,
  AlertTriangle,
  Package,
  Clock,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/format';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import type { DespachoRecord } from '@/lib/logistica-data-engine';

interface LogisticaFilterBarProps {
  rutas: string[];
  transportistas: string[];
  tiposCarga: string[];
  prioridades: string[];
  selectedRuta: string | null;
  selectedTransportista: string | null;
  selectedTipoCarga: string | null;
  selectedPrioridad: string | null;
  soloIncidencias: boolean;
  selectedDateRange: { start: string; end: string };
  filteredCount: number;
  totalCount: number;
  filteredRecords?: readonly DespachoRecord[];
  onRutaChange: (ruta: string | null) => void;
  onTransportistaChange: (transportista: string | null) => void;
  onTipoCargaChange: (tipo: string | null) => void;
  onPrioridadChange: (prioridad: string | null) => void;
  onSoloIncidenciasChange: (val: boolean) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onResetFilters: () => void;
}

/**
 * Ventana por defecto del dashboard de Logística.
 *
 * Debe coincidir con los `withDefault` de `nuqs` en `LogisticaDashboard.tsx`; si
 * se desincroniza, la barra "Activos:" aparece vacía en la primera visita.
 */
const DEFAULT_DATE_RANGE = { start: '2026-04-01', end: '2026-09-30' } as const;

const DATE_PRESETS = [
  { label: 'Últimos 6 meses (abr-sep 26)', start: '2026-04-01', end: '2026-09-30' },
  { label: 'Todo el año (12m)', start: '2025-10-01', end: '2026-09-30' },
  { label: 'Últimos 90 días', start: '2026-07-01', end: '2026-09-30' },
  { label: 'Últimos 30 días', start: '2026-09-01', end: '2026-09-30' },
  { label: 'Q1 (Oct-Dic 25)', start: '2025-10-01', end: '2025-12-31' },
];

export function LogisticaFilterBar({
  rutas,
  transportistas,
  tiposCarga,
  prioridades,
  selectedRuta,
  selectedTransportista,
  selectedTipoCarga,
  selectedPrioridad,
  soloIncidencias,
  selectedDateRange,
  filteredCount,
  totalCount,
  filteredRecords = [] as DespachoRecord[],
  onRutaChange,
  onTransportistaChange,
  onTipoCargaChange,
  onPrioridadChange,
  onSoloIncidenciasChange,
  onDateRangeChange,
  onResetFilters,
}: LogisticaFilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const isDefaultDateRange =
    selectedDateRange.start === DEFAULT_DATE_RANGE.start &&
    selectedDateRange.end === DEFAULT_DATE_RANGE.end;

  const hasActiveFilters =
    selectedRuta !== null ||
    selectedTransportista !== null ||
    selectedTipoCarga !== null ||
    selectedPrioridad !== null ||
    soloIncidencias ||
    !isDefaultDateRange;

  const currentPreset = DATE_PRESETS.find(
    (p) => p.start === selectedDateRange.start && p.end === selectedDateRange.end
  );

  /** Etiqueta legible del período, incluso si la ventana no calza con un preset. */
  const dateRangeLabel =
    currentPreset?.label ??
    `${formatDate(selectedDateRange.start)} – ${formatDate(selectedDateRange.end)}`;

  return (
    <div className="bg-card/90 dark:bg-card/60 rounded-xl border border-border/70 p-3 sm:p-3.5 shadow-xs space-y-3">
      {/* Controles Desktop */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Controles Desktop con Radix UI */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango Temporal */}
          <FilterSelect
            value={`${selectedDateRange.start}|${selectedDateRange.end}`}
            onChange={(val) => {
              if (val) {
                const [start, end] = val.split('|');
                onDateRangeChange({ start, end });
              }
            }}
            options={DATE_PRESETS.map((p) => ({
              label: p.label,
              value: `${p.start}|${p.end}`,
            }))}
            icon={Calendar}
            placeholder="Período logístico"
            fallbackLabel={dateRangeLabel}
            ariaLabel="Filtrar por período"
            accentColor="amber"
          />

          {/* Selector de Ruta */}
          <div className="hidden sm:inline-flex">
            <FilterSelect
              value={selectedRuta}
              onChange={onRutaChange}
              options={rutas.map((r) => ({ label: r, value: r }))}
              allLabel="Todas las rutas"
              icon={Route}
              placeholder="Ruta..."
              ariaLabel="Filtrar por ruta"
              accentColor="amber"
            />
          </div>

          {/* Selector de Transportista */}
          <div className="hidden md:inline-flex">
            <FilterSelect
              value={selectedTransportista}
              onChange={onTransportistaChange}
              options={transportistas.map((t) => ({ label: t, value: t }))}
              allLabel="Todas las flotas"
              icon={Truck}
              placeholder="Transportista..."
              ariaLabel="Filtrar por transportista"
              accentColor="amber"
            />
          </div>

          {/* Selector de Tipo de Carga */}
          <div className="hidden lg:inline-flex">
            <FilterSelect
              value={selectedTipoCarga}
              onChange={onTipoCargaChange}
              options={tiposCarga.map((t) => ({ label: t, value: t }))}
              allLabel="Todos los tipos"
              icon={Package}
              placeholder="Tipo de carga..."
              ariaLabel="Filtrar por tipo de carga"
              accentColor="amber"
            />
          </div>

          {/* Selector de Prioridad de Servicio */}
          <div className="hidden xl:inline-flex">
            <FilterSelect
              value={selectedPrioridad}
              onChange={onPrioridadChange}
              options={prioridades.map((p) => ({ label: p, value: p }))}
              allLabel="Todas las prioridades"
              icon={Clock}
              placeholder="Prioridad..."
              ariaLabel="Filtrar por prioridad de servicio"
              accentColor="amber"
            />
          </div>

          {/* Botón Solo Incidencias */}
          <button
            type="button"
            onClick={() => onSoloIncidenciasChange(!soloIncidencias)}
            className={`hidden lg:inline-flex items-center gap-1.5 text-xs h-8.5 px-2.5 rounded-lg border transition-all ${
              soloIncidencias
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900 font-semibold shadow-xs'
                : 'bg-background text-muted-foreground border-border/80 hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Solo fallas</span>
          </button>

          {/* Botón Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs min-h-11 px-3 rounded-lg border border-border/80 bg-background text-foreground font-medium hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-600 ml-0.5" />}
          </button>
        </div>

        {/* Lado derecho: Contador, Exportación CSV y Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            <span className="font-semibold text-foreground">{formatNumber(filteredCount)}</span>
            <span className="text-muted-foreground">/ {formatNumber(totalCount)}</span>
          </div>

          {/* Exportación CSV instantánea */}
          <ExportCsvButton
            data={filteredRecords || []}
            filename="logistica-despachos-filtrados"
            label="CSV"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium tap-target text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 min-h-11 px-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="sr-only sm:not-sr-only">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Activos:</span>

          {!isDefaultDateRange && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              <Calendar className="w-3 h-3" />
              <span className="tabular-nums">Período: <strong>{dateRangeLabel}</strong></span>
              <button
                type="button"
                onClick={() => onDateRangeChange({ ...DEFAULT_DATE_RANGE })}
                aria-label="Restablecer el período de análisis"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRuta && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              <Route className="w-3 h-3" />
              <span>Ruta: <strong>{selectedRuta}</strong></span>
              <button type="button" onClick={() => onRutaChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTransportista && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              <Truck className="w-3 h-3" />
              <span>Flota: <strong>{selectedTransportista}</strong></span>
              <button type="button" onClick={() => onTransportistaChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTipoCarga && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              <Package className="w-3 h-3" />
              <span>Carga: <strong>{selectedTipoCarga}</strong></span>
              <button type="button" onClick={() => onTipoCargaChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedPrioridad && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
              <Clock className="w-3 h-3" />
              <span>Prioridad: <strong>{selectedPrioridad}</strong></span>
              <button type="button" onClick={() => onPrioridadChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {soloIncidencias && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Solo no cumplidos</span>
              <button type="button" onClick={() => onSoloIncidenciasChange(false)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Drawer Móvil */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto px-5 py-6">
          <SheetHeader className="pb-3 border-b border-border">
            <SheetTitle>Filtros de Logística</SheetTitle>
            <SheetDescription className="text-xs">
              Filtra despachos por ruta, transportista o nivel de servicio.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Ruta de Transporte</label>
              <select
                value={selectedRuta || ''}
                onChange={(e) => onRutaChange(e.target.value || null)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card"
              >
                <option value="">Todas las rutas</option>
                {rutas.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Empresa Transportista</label>
              <select
                value={selectedTransportista || ''}
                onChange={(e) => onTransportistaChange(e.target.value || null)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card"
              >
                <option value="">Todos los transportistas</option>
                {transportistas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Tipo de Carga</label>
              <select
                value={selectedTipoCarga || ''}
                onChange={(e) => onTipoCargaChange(e.target.value || null)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card"
              >
                <option value="">Todos los tipos de carga</option>
                {tiposCarga.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Prioridad de Servicio</label>
              <select
                value={selectedPrioridad || ''}
                onChange={(e) => onPrioridadChange(e.target.value || null)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card"
              >
                <option value="">Todas las prioridades</option>
                {prioridades.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SheetFooter className="pt-2 border-t border-border flex flex-row gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="w-full text-xs py-2.5 rounded-lg bg-amber-600 text-white font-medium"
            >
              Aplicar filtros ({formatNumber(filteredCount)} despachos)
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
