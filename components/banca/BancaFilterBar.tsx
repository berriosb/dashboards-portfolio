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
  ChevronDown,
} from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';

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
  onProductoChange: (producto: string | null) => void;
  onSegmentoChange: (segmento: string | null) => void;
  onRegionChange: (region: string | null) => void;
  onTramoMoraChange: (tramo: string | null) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onResetFilters: () => void;
}

const DATE_PRESETS = [
  { label: 'Todo el ejercicio (12m)', start: '2024-01-01', end: '2027-12-31' },
  { label: 'Otorgados 2026', start: '2026-01-01', end: '2026-09-30' },
  { label: 'Otorgados 2025', start: '2025-01-01', end: '2025-12-31' },
  { label: 'Otorgados 2024', start: '2024-01-01', end: '2024-12-31' },
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
  onProductoChange,
  onSegmentoChange,
  onRegionChange,
  onTramoMoraChange,
  onDateRangeChange,
  onResetFilters,
}: BancaFilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const hasActiveFilters =
    selectedProducto !== null ||
    selectedSegmento !== null ||
    selectedRegion !== null ||
    selectedTramoMora !== null ||
    selectedDateRange.start !== '2024-01-01' ||
    selectedDateRange.end !== '2027-12-31';

  return (
    <div className="bg-card/90 dark:bg-card/60 rounded-xl border border-border/70 p-3 sm:p-3.5 shadow-xs space-y-3">
      {/* Controles Desktop */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango Temporal */}
          <div className="relative inline-flex items-center">
            <select
              value={`${selectedDateRange.start}|${selectedDateRange.end}`}
              onChange={(e) => {
                const [start, end] = e.target.value.split('|');
                onDateRangeChange({ start, end });
              }}
              aria-label="Filtrar por período"
              className="text-xs h-8.5 pl-8 pr-7 rounded-lg border border-border/80 bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs hover:border-foreground/30 transition-colors"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.label} value={`${p.start}|${p.end}`}>
                  {p.label}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 pointer-events-none" />
          </div>

          {/* Selector de Producto */}
          <div className="hidden sm:inline-flex items-center relative">
            <select
              value={selectedProducto || ''}
              onChange={(e) => onProductoChange(e.target.value || null)}
              aria-label="Filtrar por producto"
              className="text-xs h-8.5 pl-8 pr-7 rounded-lg border border-border/80 bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs hover:border-foreground/30 transition-colors"
            >
              <option value="">Todos los productos</option>
              {productos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 pointer-events-none" />
          </div>

          {/* Selector de Segmento */}
          <div className="hidden md:inline-flex items-center relative">
            <select
              value={selectedSegmento || ''}
              onChange={(e) => onSegmentoChange(e.target.value || null)}
              aria-label="Filtrar por segmento"
              className="text-xs h-8.5 pl-8 pr-7 rounded-lg border border-border/80 bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs hover:border-foreground/30 transition-colors"
            >
              <option value="">Todos los segmentos</option>
              {segmentos.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 pointer-events-none" />
          </div>

          {/* Selector de Región */}
          <div className="hidden lg:inline-flex items-center relative">
            <select
              value={selectedRegion || ''}
              onChange={(e) => onRegionChange(e.target.value || null)}
              aria-label="Filtrar por región"
              className="text-xs h-8.5 pl-8 pr-7 rounded-lg border border-border/80 bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs hover:border-foreground/30 transition-colors"
            >
              <option value="">Todas las regiones</option>
              {regiones.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 pointer-events-none" />
          </div>

          {/* Botón Móvil */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs h-8.5 px-3 rounded-lg border border-border/80 bg-background text-foreground font-medium hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-600 ml-0.5" />}
          </button>
        </div>

        {/* Lado derecho: Contador y Reset */}
        <div className="flex items-center gap-2.5 ml-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span className="font-semibold text-foreground">{formatNumber(filteredCount)}</span>
            <span className="text-muted-foreground/80">/ {formatNumber(totalCount)}</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 py-1 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Activos:</span>

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
