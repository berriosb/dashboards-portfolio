'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Users,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/format';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import type { CreditoRecord } from '@/lib/banca-data-engine';

interface BancaFilterBarProps {
  productos: string[];
  segmentos: string[];
  regiones: string[];
  tramosMora: string[];
  selectedProducto: string | null;
  selectedSegmento: string | null;
  selectedRegion: string | null;
  selectedTramoMora: string | null;
  selectedDateRange: { start: string; end: string };
  filteredCount: number;
  totalCount: number;
  filteredRecords?: readonly CreditoRecord[];
  onProductoChange: (producto: string | null) => void;
  onSegmentoChange: (segmento: string | null) => void;
  onRegionChange: (region: string | null) => void;
  onTramoMoraChange: (tramo: string | null) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onResetFilters: () => void;
}

/**
 * Ventana por defecto del dashboard de Banca.
 *
 * Debe coincidir con los `withDefault` de `nuqs` en `BancaDashboard.tsx`; si se
 * desincroniza, la barra "Activos:" aparece vacía en la primera visita.
 */
const DEFAULT_DATE_RANGE = { start: '2026-04-01', end: '2026-09-30' } as const;

/**
 * Presets alineados con la cobertura real del historial (2025-10 → 2026-09).
 *
 * La cartera es un STOCK: el motor resuelve el snapshot desde
 * `historialCartera` usando el mes de `dateRange.end` (`mesReferencia`). Por eso
 * los presets terminan en meses DISTINTOS: antes las cuatro ventanas cerraban en
 * 2026-09 y devolvían exactamente el mismo `mesReferencia`, la misma
 * `carteraTotal` y la misma mora, así que cambiar de período animaba el badge de
 * delta sin mover ningún valor.
 *
 * Cada ventana cubre un trimestre calendario real y, salvo el más antiguo, tiene
 * un período anterior comparable dentro del dataset para el cálculo del delta.
 */
const DATE_PRESETS = [
  { label: 'Últimos 6 meses (abr-sep 26)', start: '2026-04-01', end: '2026-09-30' },
  { label: 'Trimestre Q2 26 (abr-jun)', start: '2026-04-01', end: '2026-06-30' },
  { label: 'Trimestre Q1 26 (ene-mar)', start: '2026-01-01', end: '2026-03-31' },
  { label: 'Trimestre Q4 25 (oct-dic)', start: '2025-10-01', end: '2025-12-31' },
  { label: 'Todo el período (12m)', start: '2025-10-01', end: '2026-09-30' },
];

export function BancaFilterBar({
  productos,
  segmentos,
  regiones,
  tramosMora,
  selectedProducto,
  selectedSegmento,
  selectedRegion,
  selectedTramoMora,
  selectedDateRange,
  filteredCount,
  totalCount,
  filteredRecords = [] as CreditoRecord[],
  onProductoChange,
  onSegmentoChange,
  onRegionChange,
  onTramoMoraChange,
  onDateRangeChange,
  onResetFilters,
}: BancaFilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const isDefaultDateRange =
    selectedDateRange.start === DEFAULT_DATE_RANGE.start &&
    selectedDateRange.end === DEFAULT_DATE_RANGE.end;

  const hasActiveFilters =
    selectedProducto !== null ||
    selectedSegmento !== null ||
    selectedRegion !== null ||
    selectedTramoMora !== null ||
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
            placeholder="Período de cartera"
            fallbackLabel={dateRangeLabel}
            ariaLabel="Filtrar por período"
            accentColor="emerald"
          />

          {/* Selector de Producto */}
          <div className="hidden sm:inline-flex">
            <FilterSelect
              value={selectedProducto}
              onChange={onProductoChange}
              options={productos.map((p) => ({ label: p, value: p }))}
              allLabel="Todos los productos"
              icon={Layers}
              placeholder="Producto..."
              ariaLabel="Filtrar por producto"
              accentColor="emerald"
            />
          </div>

          {/* Selector de Segmento */}
          <div className="hidden md:inline-flex">
            <FilterSelect
              value={selectedSegmento}
              onChange={onSegmentoChange}
              options={segmentos.map((s) => ({ label: s, value: s }))}
              allLabel="Todos los segmentos"
              icon={Users}
              placeholder="Segmento..."
              ariaLabel="Filtrar por segmento"
              accentColor="emerald"
            />
          </div>

          {/* Selector de Región */}
          <div className="hidden lg:inline-flex">
            <FilterSelect
              value={selectedRegion}
              onChange={onRegionChange}
              options={regiones.map((r) => ({ label: r, value: r }))}
              allLabel="Todas las regiones"
              icon={MapPin}
              placeholder="Región..."
              ariaLabel="Filtrar por región"
              accentColor="emerald"
            />
          </div>

          {/* Botón Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs min-h-11 px-3 rounded-lg border border-border/80 bg-background text-foreground font-medium hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-600 ml-0.5" />}
          </button>
        </div>

        {/* Lado derecho: Contador, Exportación CSV y Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span className="font-semibold text-foreground">{formatNumber(filteredCount)}</span>
            <span className="text-muted-foreground">/ {formatNumber(totalCount)}</span>
          </div>

          {/* Exportación CSV instantánea */}
          <ExportCsvButton
            data={filteredRecords || []}
            filename="banca-cartera-filtrada"
            label="CSV"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium tap-target text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 min-h-11 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs">
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

          {selectedProducto && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs">
              <Layers className="w-3 h-3" />
              <span>Producto: <strong>{selectedProducto}</strong></span>
              <button type="button" onClick={() => onProductoChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSegmento && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs">
              <Users className="w-3 h-3" />
              <span>Segmento: <strong>{selectedSegmento}</strong></span>
              <button type="button" onClick={() => onSegmentoChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRegion && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs">
              <MapPin className="w-3 h-3" />
              <span>Región: <strong>{selectedRegion}</strong></span>
              <button type="button" onClick={() => onRegionChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTramoMora && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>Mora: <strong>{selectedTramoMora}</strong></span>
              <button type="button" onClick={() => onTramoMoraChange(null)}>
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
            <SheetTitle>Filtros de Cartera Bancaria</SheetTitle>
            <SheetDescription className="text-xs">
              Ajusta los parámetros de colocaciones y morosidad CMF.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Producto</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onProductoChange(null)}
                  className={`px-3 py-1 rounded-full border ${selectedProducto === null ? 'bg-emerald-600 text-white' : 'bg-card'}`}
                >
                  Todos
                </button>
                {productos.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onProductoChange(selectedProducto === p ? null : p)}
                    className={`px-3 py-1 rounded-full border ${selectedProducto === p ? 'bg-emerald-600 text-white' : 'bg-card'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Segmento</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onSegmentoChange(null)}
                  className={`px-3 py-1 rounded-full border ${selectedSegmento === null ? 'bg-emerald-600 text-white' : 'bg-card'}`}
                >
                  Todos
                </button>
                {segmentos.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSegmentoChange(selectedSegmento === s ? null : s)}
                    className={`px-3 py-1 rounded-full border ${selectedSegmento === s ? 'bg-emerald-600 text-white' : 'bg-card'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Tramo de Mora</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onTramoMoraChange(null)}
                  className={`px-3 py-1 rounded-full border ${selectedTramoMora === null ? 'bg-emerald-600 text-white' : 'bg-card'}`}
                >
                  Todos
                </button>
                {tramosMora.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTramoMoraChange(selectedTramoMora === t ? null : t)}
                    className={`px-3 py-1 rounded-full border ${selectedTramoMora === t ? 'bg-rose-600 text-white' : 'bg-card'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="pt-2 border-t border-border flex flex-row gap-2">
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="w-full text-xs py-2.5 rounded-lg bg-emerald-600 text-white font-medium"
            >
              Aplicar filtros ({formatNumber(filteredCount)} registros)
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
