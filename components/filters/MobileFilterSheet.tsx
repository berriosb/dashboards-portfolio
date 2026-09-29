'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { RotateCcw, Filter, Calendar, Layers, MapPin, ShoppingBag } from 'lucide-react';
import { formatNumber } from '@/lib/format';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  channels: string[];
  regions: string[];
  selectedCategory: string | null;
  selectedChannel: string | null;
  selectedRegion: string | null;
  selectedDateRange: { start: string; end: string };
  selectedRfmSegment: string | null;
  filteredCount: number;
  totalCount: number;
  onCategoryChange: (category: string | null) => void;
  onChannelChange: (channel: string | null) => void;
  onRegionChange: (region: string | null) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onRfmSegmentChange: (rfm: string | null) => void;
  onResetFilters: () => void;
}

export const DATE_PRESETS = [
  { label: 'Todo el año (12m)', start: '2025-10-01', end: '2026-09-30' },
  { label: 'Últimos 90 días', start: '2026-07-01', end: '2026-09-30' },
  { label: 'Últimos 30 días', start: '2026-09-01', end: '2026-09-30' },
  { label: 'Q1 (Oct-Dic 25)', start: '2025-10-01', end: '2025-12-31' },
  { label: 'Q2 (Ene-Mar 26)', start: '2026-01-01', end: '2026-03-31' },
  { label: 'Q3 (Abr-Jun 26)', start: '2026-04-01', end: '2026-06-30' },
  { label: 'Q4 (Jul-Sep 26)', start: '2026-07-01', end: '2026-09-30' },
];

export function MobileFilterSheet({
  isOpen,
  onOpenChange,
  categories,
  channels,
  regions,
  selectedCategory,
  selectedChannel,
  selectedRegion,
  selectedDateRange,
  selectedRfmSegment,
  filteredCount,
  totalCount,
  onCategoryChange,
  onChannelChange,
  onRegionChange,
  onDateRangeChange,
  onRfmSegmentChange,
  onResetFilters,
}: MobileFilterSheetProps) {
  const hasActiveFilters =
    selectedCategory !== null ||
    selectedChannel !== null ||
    selectedRegion !== null ||
    selectedRfmSegment !== null ||
    selectedDateRange.start !== '2025-10-01' ||
    selectedDateRange.end !== '2026-09-30';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto px-5 py-6">
        <SheetHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <Filter className="w-4 h-4" />
              </div>
              <SheetTitle>Filtros de Análisis</SheetTitle>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums font-medium">
              {formatNumber(filteredCount)} / {formatNumber(totalCount)} filas
            </span>
          </div>
          <SheetDescription className="text-xs">
            Ajusta los parámetros para recalcular instantáneamente todas las métricas en memoria.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* Período de tiempo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Período de Análisis
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {DATE_PRESETS.map((preset) => {
                const isActive =
                  selectedDateRange.start === preset.start &&
                  selectedDateRange.end === preset.end;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onDateRangeChange({ start: preset.start, end: preset.end })}
                    className={`text-xs px-2.5 py-2 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500'
                        : 'border-border bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Categoría de Producto
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedCategory === null
                    ? 'border-blue-600 bg-blue-600 text-white font-medium'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onCategoryChange(isSelected ? null : cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white font-medium'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Canal de Venta */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Canal de Venta
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChannelChange(null)}
                className={`text-xs py-2 rounded-lg border text-center transition-all ${
                  selectedChannel === null
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                Todos
              </button>
              {channels.map((ch) => {
                const isSelected = selectedChannel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => onChannelChange(isSelected ? null : ch)}
                    className={`text-xs py-2 rounded-lg border text-center capitalize transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Región */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Región Geográfica
            </label>
            <select
              value={selectedRegion || ''}
              onChange={(e) => onRegionChange(e.target.value ? e.target.value : null)}
              className="w-full text-xs h-10 px-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las regiones</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Segmento RFM si está activo */}
          {selectedRfmSegment && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-muted-foreground">Filtro RFM activo: </span>
                <strong className="text-blue-700 dark:text-blue-300 font-bold">
                  {selectedRfmSegment}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => onRfmSegmentChange(null)}
                className="text-xs text-rose-600 dark:text-rose-400 underline font-medium"
              >
                Quitar
              </button>
            </div>
          )}
        </div>

        <SheetFooter className="pt-2 border-t border-border flex flex-row gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-xs py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-xs"
          >
            Ver {formatNumber(filteredCount)} registros
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
