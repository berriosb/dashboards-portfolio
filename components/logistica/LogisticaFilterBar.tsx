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
} from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

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
  onRutaChange: (ruta: string | null) => void;
  onTransportistaChange: (transportista: string | null) => void;
  onTipoCargaChange: (tipo: string | null) => void;
  onPrioridadChange: (prioridad: string | null) => void;
  onSoloIncidenciasChange: (val: boolean) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onResetFilters: () => void;
}

const DATE_PRESETS = [
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
  onRutaChange,
  onTransportistaChange,
  onTipoCargaChange,
  onPrioridadChange,
  onSoloIncidenciasChange,
  onDateRangeChange,
  onResetFilters,
}: LogisticaFilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const hasActiveFilters =
    selectedRuta !== null ||
    selectedTransportista !== null ||
    selectedTipoCarga !== null ||
    selectedPrioridad !== null ||
    soloIncidencias ||
    selectedDateRange.start !== '2025-10-01' ||
    selectedDateRange.end !== '2026-09-30';

  return (
    <div className="bg-card rounded-xl border border-border p-3.5 md:p-4 shadow-xs space-y-3">
      {/* Controles Desktop */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango Temporal */}
          <div className="relative inline-flex items-center">
            <span className="text-muted-foreground mr-1.5 hidden lg:inline-flex items-center gap-1 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Período:
            </span>
            <select
              value={`${selectedDateRange.start}|${selectedDateRange.end}`}
              onChange={(e) => {
                const [start, end] = e.target.value.split('|');
                onDateRangeChange({ start, end });
              }}
              aria-label="Filtrar por período"
              className="text-xs h-9 px-2.5 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.label} value={`${p.start}|${p.end}`}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Ruta */}
          <div className="hidden sm:inline-flex items-center">
            <span className="text-muted-foreground mr-1.5 hidden xl:inline-flex items-center gap-1 text-xs font-medium">
              <Route className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Ruta:
            </span>
            <select
              value={selectedRuta || ''}
              onChange={(e) => onRutaChange(e.target.value || null)}
              aria-label="Filtrar por ruta"
              className="text-xs h-9 px-2.5 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="">Todas las rutas</option>
              {rutas.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Transportista */}
          <div className="hidden md:inline-flex items-center">
            <span className="text-muted-foreground mr-1.5 hidden xl:inline-flex items-center gap-1 text-xs font-medium">
              <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Flota:
            </span>
            <select
              value={selectedTransportista || ''}
              onChange={(e) => onTransportistaChange(e.target.value || null)}
              aria-label="Filtrar por transportista"
              className="text-xs h-9 px-2.5 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[150px] truncate"
            >
              <option value="">Todas las flotas</option>
              {transportistas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Solo Incidencias */}
          <button
            type="button"
            onClick={() => onSoloIncidenciasChange(!soloIncidencias)}
            className={`hidden lg:inline-flex items-center gap-1.5 text-xs h-9 px-2.5 rounded-lg border transition-all ${
              soloIncidencias
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900 font-semibold'
                : 'bg-background text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Solo fallas</span>
          </button>

          {/* Botón Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-600 ml-0.5" />}
          </button>
        </div>

        {/* Lado derecho: Contador y Reset */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-xs text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{formatNumber(filteredCount)}</span> de{' '}
            <span>{formatNumber(totalCount)}</span> despachos
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 py-1 px-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Activos:</span>

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
