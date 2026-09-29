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
import { formatNumber } from '@/lib/format';
import { MobileFilterSheet, DATE_PRESETS } from './MobileFilterSheet';

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
  onCategoryChange,
  onChannelChange,
  onRegionChange,
  onDateRangeChange,
  onRfmSegmentChange,
  onResetFilters,
}: FilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedChannel !== null ||
    selectedRegion !== null ||
    selectedRfmSegment !== null ||
    selectedDateRange.start !== '2025-10-01' ||
    selectedDateRange.end !== '2026-09-30';

  // Encontrar el preset actual si coincide exactamente
  const currentPreset = DATE_PRESETS.find(
    (p) => p.start === selectedDateRange.start && p.end === selectedDateRange.end
  );

  return (
    <div className="bg-card rounded-xl border border-border p-3.5 md:p-4 shadow-xs space-y-3">
      {/* Barra superior de controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Lado izquierdo: Controles principales desktop */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango Temporal */}
          <div className="relative inline-flex items-center">
            <span className="text-muted-foreground mr-1.5 hidden lg:inline-flex items-center gap-1 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Período:
            </span>
            <select
              value={currentPreset ? `${currentPreset.start}|${currentPreset.end}` : 'custom'}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== 'custom') {
                  const [start, end] = val.split('|');
                  onDateRangeChange({ start, end });
                }
              }}
              aria-label="Seleccionar rango temporal"
              className="text-xs h-9 px-2.5 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.label} value={`${p.start}|${p.end}`}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Categoría (Desktop) */}
          <div className="hidden sm:inline-flex items-center">
            <span className="text-muted-foreground mr-1.5 hidden xl:inline-flex items-center gap-1 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Categoría:
            </span>
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value || null)}
              aria-label="Filtrar por categoría"
              className="text-xs h-9 px-2.5 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Canal (Pills rápidos) */}
          <div className="hidden md:inline-flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => onChannelChange(null)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedChannel === null
                  ? 'bg-background text-foreground shadow-xs'
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

          {/* Selector de Región (Desktop) */}
          <div className="hidden lg:inline-flex items-center">
            <span className="text-muted-foreground mr-1.5 hidden xl:inline-flex items-center gap-1 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Región:
            </span>
            <select
              value={selectedRegion || ''}
              onChange={(e) => onRegionChange(e.target.value || null)}
              aria-label="Filtrar por región"
              className="text-xs h-9 px-2.5 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              <option value="">Todas las regiones</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Botón para pantallas móviles (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 text-xs h-9 px-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
            aria-label="Abrir panel de filtros avanzados"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5" />
            )}
          </button>
        </div>

        {/* Lado derecho: Contador y Reset */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-xs text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{formatNumber(filteredCount)}</span> de{' '}
            <span>{formatNumber(totalCount)}</span> transacciones
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-1 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtros activos (Cross-filtering badges) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Activos:</span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs">
              <Layers className="w-3 h-3" />
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs capitalize">
              <ShoppingBag className="w-3 h-3" />
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs">
              <MapPin className="w-3 h-3" />
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs">
              <Users className="w-3 h-3" />
              <span>Segmento RFM: <strong>{selectedRfmSegment}</strong></span>
              <button
                type="button"
                onClick={() => onRfmSegmentChange(null)}
                className="hover:text-blue-950 dark:hover:text-white ml-0.5"
                aria-label={`Eliminar filtro RFM ${selectedRfmSegment}`}
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
