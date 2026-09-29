'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { formatCLP, formatNumber } from '@/lib/format';

export interface RfmCellData {
  recency: number;
  frequency: number;
  segment: string;
  customerCount: number;
  avgTicket: number;
}

interface RfmHeatmapProps {
  matrix: RfmCellData[];
  selectedSegment?: string | null;
  onSelectSegment?: (segment: string | null) => void;
}

export function RfmHeatmap({
  matrix,
  selectedSegment,
  onSelectSegment,
}: RfmHeatmapProps) {
  // Encontrar el valor máximo de clientes para normalizar la escala de color
  const maxCount = Math.max(...matrix.map((c) => c.customerCount), 1);

  // Paleta de intensidad basada en densidad de clientes (monocromática azul según AGENTS.md)
  const getCellColor = (count: number, isSelected: boolean) => {
    if (count === 0) return 'bg-muted/15 text-muted-foreground/30 border-dashed border-border/40';
    const ratio = count / maxCount;

    if (isSelected) {
      return 'bg-blue-600 text-white font-black ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-md scale-102';
    }

    if (ratio > 0.75) return 'bg-blue-600 text-white font-black hover:bg-blue-700 border-blue-700 shadow-xs';
    if (ratio > 0.5) return 'bg-blue-500 text-white font-bold hover:bg-blue-600 border-blue-600';
    if (ratio > 0.25) return 'bg-blue-100 text-blue-950 font-semibold hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-100 border-blue-200/60 dark:border-blue-800/40';
    return 'bg-blue-50/70 text-blue-900 font-medium hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-200 border-blue-100 dark:border-blue-900/30';
  };

  return (
    <div className="w-full flex flex-col space-y-3.5">
      {/* Selector de segmentos unificado con paleta azul coherente */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-muted-foreground font-medium mr-1 text-[11px]">Segmentos:</span>
        {['Champions', 'Loyal', 'Potential', 'At Risk', 'Hibernating'].map((seg) => {
          const isActive = selectedSegment === seg;
          return (
            <button
              key={seg}
              type="button"
              onClick={() => onSelectSegment?.(isActive ? null : seg)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted font-medium'
              }`}
            >
              {seg}
            </button>
          );
        })}
        {selectedSegment && (
          <button
            type="button"
            onClick={() => onSelectSegment?.(null)}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
          >
            Ver todos
          </button>
        )}
      </div>

      <TooltipPrimitive.Provider delayDuration={150}>
        <div className="relative pt-1">
          {/* Eje Y: Recencia */}
          <div className="flex">
            <div className="w-12 shrink-0 flex flex-col justify-around text-right pr-2.5 text-[10px] font-semibold text-muted-foreground">
              <span title="Última compra hace ≤ 30 días">R5 (30d)</span>
              <span title="Última compra hace 31-60 días">R4 (60d)</span>
              <span title="Última compra hace 61-120 días">R3 (120d)</span>
              <span title="Última compra hace 121-240 días">R2 (240d)</span>
              <span title="Última compra hace > 240 días">R1 (+240d)</span>
            </div>

            {/* Matriz 5x5 */}
            <div className="grid grid-cols-5 gap-2 flex-1 min-w-0">
              {matrix.map((cell, idx) => {
                const isSelected = selectedSegment === cell.segment;
                const isFilteredOut = selectedSegment && !isSelected;

                return (
                  <TooltipPrimitive.Root key={idx}>
                    <TooltipPrimitive.Trigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelectSegment?.(isSelected ? null : cell.segment)}
                        className={`h-12 md:h-13 w-full rounded-lg border flex flex-col items-center justify-center p-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${getCellColor(
                          cell.customerCount,
                          isSelected
                        )} ${isFilteredOut ? 'opacity-25 grayscale' : 'opacity-100'}`}
                        aria-label={`R${cell.recency} F${cell.frequency}: ${cell.customerCount} clientes en ${cell.segment}`}
                      >
                        <span className="text-sm font-black tabular-nums leading-none">
                          {formatNumber(cell.customerCount)}
                        </span>
                        <span className="text-[9px] uppercase tracking-tight truncate max-w-full opacity-80 mt-1 font-semibold">
                          {cell.segment}
                        </span>
                      </button>
                    </TooltipPrimitive.Trigger>
                    <TooltipPrimitive.Portal>
                      <TooltipPrimitive.Content
                        side="top"
                        align="center"
                        className="z-50 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 text-xs text-popover-foreground shadow-lg animate-in fade-in-0"
                        sideOffset={6}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5">
                            <span className="font-bold text-foreground">{cell.segment}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              R: {cell.recency}/5 · F: {cell.frequency}/5
                            </span>
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Clientes:</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                {formatNumber(cell.customerCount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">Ticket Promedio:</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {formatCLP(cell.avgTicket)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipPrimitive.Content>
                    </TooltipPrimitive.Portal>
                  </TooltipPrimitive.Root>
                );
              })}
            </div>
          </div>

          {/* Eje X: Frecuencia de Compra */}
          <div className="flex pt-2">
            <div className="w-12 shrink-0" />
            <div className="grid grid-cols-5 gap-2 flex-1 text-center text-[10px] font-semibold text-muted-foreground">
              <span>F1 (1 comp.)</span>
              <span>F2 (2 comp.)</span>
              <span>F3 (3-4 comp.)</span>
              <span>F4 (5-7 comp.)</span>
              <span>F5 (8+ comp.)</span>
            </div>
          </div>
        </div>
      </TooltipPrimitive.Provider>
    </div>
  );
}
