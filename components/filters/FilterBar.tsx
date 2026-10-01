'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  ShoppingBag,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  X,
  Users,
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/format';
import { MobileFilterSheet, DATE_PRESETS, DEFAULT_DATE_RANGE } from './MobileFilterSheet';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import type { RetailTransaction } from '@/lib/data-engine';

interface FilterBarProps {
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
  filteredRecords?: readonly RetailTransaction[];
  onCategoryChange: (category: string | null) => void;
  onChannelChange: (channel: string | null) => void;
  onRegionChange: (region: string | null) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onRfmSegmentChange: (rfm: string | null) => void;
  onResetFilters: () => void;
}

export function FilterBar({
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
  filteredRecords = [] as RetailTransaction[],
  onCategoryChange,
  onChannelChange,
  onRegionChange,
  onDateRangeChange,
  onRfmSegmentChange,
  onResetFilters,
}: FilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const isDefaultDateRange =
    selectedDateRange.start === DEFAULT_DATE_RANGE.start &&
    selectedDateRange.end === DEFAULT_DATE_RANGE.end;

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedChannel !== null ||
    selectedRegion !== null ||
    selectedRfmSegment !== null ||
    !isDefaultDateRange;

  const currentPreset = DATE_PRESETS.find(
    (p) => p.start === selectedDateRange.start && p.end === selectedDateRange.end
  );

  /**
   * Etiqueta del rango activo. `currentPreset` cubre el caso normal; el
   * `formatDate` cubre una ventana deep-linkeada que no calza con ningún preset,
   * para que el trigger nunca quede con el span de valor vacío.
   */
  const dateRangeLabel =
    currentPreset?.label ??
    `${formatDate(selectedDateRange.start)} – ${formatDate(selectedDateRange.end)}`;

  return (
    <div className="bg-card/90 dark:bg-card/60 rounded-xl border border-border/70 p-3 sm:p-3.5 shadow-xs space-y-3">
      {/* Barra superior de controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Lado izquierdo: Controles principales desktop */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango Temporal con Radix UI */}
          <FilterSelect
            value={currentPreset ? `${currentPreset.start}|${currentPreset.end}` : null}
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
            placeholder="Período temporal"
            fallbackLabel={dateRangeLabel}
            ariaLabel="Seleccionar rango temporal"
            accentColor="blue"
          />

          {/* Selector de Categoría (Desktop) con Radix UI */}
          <div className="hidden sm:inline-flex">
            <FilterSelect
              value={selectedCategory}
              onChange={onCategoryChange}
              options={categories.map((c) => ({ label: c, value: c }))}
              allLabel="Todas las categorías"
              icon={Layers}
              placeholder="Categoría..."
              ariaLabel="Filtrar por categoría"
              accentColor="blue"
            />
          </div>

          {/* Selector de Canal (Segmented Control) */}
          <div className="hidden md:inline-flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => onChannelChange(null)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedChannel === null
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos
            </button>
            {channels.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onChannelChange(selectedChannel === ch ? null : ch)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                  selectedChannel === ch
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Selector de Región (Desktop) con Radix UI */}
          <div className="hidden lg:inline-flex">
            <FilterSelect
              value={selectedRegion}
              onChange={onRegionChange}
              options={regions.map((r) => ({ label: r, value: r }))}
              allLabel="Todas las regiones"
              icon={MapPin}
              placeholder="Región..."
              ariaLabel="Filtrar por región"
              accentColor="blue"
            />
          </div>

          {/* Botón para móviles (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs min-h-11 px-3 rounded-lg border border-border/80 bg-background text-foreground font-medium hover:bg-muted transition-colors"
            aria-label="Abrir panel de filtros avanzados"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5" />
            )}
          </button>
        </div>

        {/* Lado derecho: Contador de Transacciones, Exportación CSV y Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span className="font-semibold text-foreground">{formatNumber(filteredCount)}</span>
            <span className="text-muted-foreground">/ {formatNumber(totalCount)}</span>
          </div>

          {/* Exportación analítica en cliente (0ms) */}
          <ExportCsvButton
            data={filteredRecords || []}
            filename="retail-transacciones-filtradas"
            label="CSV"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium tap-target text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 min-h-11 px-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="sr-only sm:not-sr-only">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/50 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Activos:</span>

          {!isDefaultDateRange && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
              <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="tabular-nums">Período: <strong>{dateRangeLabel}</strong></span>
              <button
                type="button"
                onClick={() => onDateRangeChange({ ...DEFAULT_DATE_RANGE })}
                className="hover:text-blue-950 dark:hover:text-white ml-0.5"
                aria-label="Restablecer el período de análisis"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
              <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Categoría: <strong>{selectedCategory}</strong></span>
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className="hover:text-blue-950 dark:hover:text-white ml-0.5"
                aria-label={`Eliminar filtro de categoría ${selectedCategory}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedChannel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs capitalize font-medium">
              <ShoppingBag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Canal: <strong>{selectedChannel}</strong></span>
              <button
                type="button"
                onClick={() => onChannelChange(null)}
                className="hover:text-blue-950 dark:hover:text-white ml-0.5"
                aria-label={`Eliminar filtro de canal ${selectedChannel}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRegion && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
              <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Región: <strong>{selectedRegion}</strong></span>
              <button
                type="button"
                onClick={() => onRegionChange(null)}
                className="hover:text-blue-950 dark:hover:text-white ml-0.5"
                aria-label={`Eliminar filtro de región ${selectedRegion}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedRfmSegment && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium">
              <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>RFM: <strong>{selectedRfmSegment}</strong></span>
              <button
                type="button"
                onClick={() => onRfmSegmentChange(null)}
                className="hover:text-blue-950 dark:hover:text-white ml-0.5"
                aria-label={`Eliminar filtro de segmento RFM ${selectedRfmSegment}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Drawer Móvil */}
      <MobileFilterSheet
        isOpen={isMobileSheetOpen}
        onOpenChange={setIsMobileSheetOpen}
        categories={categories}
        channels={channels}
        regions={regions}
        selectedCategory={selectedCategory}
        selectedChannel={selectedChannel}
        selectedRegion={selectedRegion}
        selectedDateRange={selectedDateRange}
        selectedRfmSegment={selectedRfmSegment}
        filteredCount={filteredCount}
        totalCount={totalCount}
        onCategoryChange={onCategoryChange}
        onChannelChange={onChannelChange}
        onRegionChange={onRegionChange}
        onDateRangeChange={onDateRangeChange}
        onRfmSegmentChange={onRfmSegmentChange}
        onResetFilters={onResetFilters}
      />
    </div>
  );
}
