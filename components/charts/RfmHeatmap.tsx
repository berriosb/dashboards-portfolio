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

  // Paleta de intensidad basada en densidad de clientes
  const getCellColor = (count: number, isSelected: boolean) => {
    if (count === 0) return 'bg-muted/40 text-muted-foreground/50 border-dashed';
    const ratio = count / maxCount;

    if (isSelected) {
      return 'bg-blue-600 text-white font-bold ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900';
    }

    if (ratio > 0.75) return 'bg-blue-600 text-white font-semibold hover:bg-blue-700';
    if (ratio > 0.5) return 'bg-blue-500 text-white font-semibold hover:bg-blue-600';
    if (ratio > 0.25) return 'bg-blue-200 text-blue-900 font-medium hover:bg-blue-300 dark:bg-blue-900/60 dark:text-blue-100';
    return 'bg-blue-50 text-blue-800 font-normal hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-200';
  };

  const getSegmentBadgeColor = (segment: string) => {
    switch (segment) {
      case 'Champions':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200';
      case 'Loyal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'Potential':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200';
      case 'At Risk':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Selector rápido de segmentos con badges */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-muted-foreground font-medium mr-1 text-[11px]">Segmentos:</span>
        {['Champions', 'Loyal', 'Potential', 'At Risk', 'Hibernating'].map((seg) => {
          const isActive = selectedSegment === seg;
          return (
            <button
              key={seg}
              type="button"
              onClick={() => onSelectSegment?.(isActive ? null : seg)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${getSegmentBadgeColor(
                seg
              )} ${isActive ? 'ring-2 ring-foreground/40 font-bold scale-105' : 'opacity-85 hover:opacity-100'}`}
            >
              {seg}
            </button>
          );
        })}
        {selectedSegment && (
          <button
            type="button"
            onClick={() => onSelectSegment?.(null)}
            className="text-[11px] text-muted-foreground hover:text-foreground underline ml-1"
          >
            Ver todos
          </button>
        )}
      </div>

      <TooltipPrimitive.Provider delayDuration={150}>
        <div className="relative pt-2">
          {/* Eje Y: Recencia */}
          <div className="flex">
            <div className="w-12 shrink-0 flex flex-col justify-around text-right pr-2 text-[10px] font-semibold text-muted-foreground">
              <span title="Última compra hace ≤ 30 días">R5 (30d)</span>
              <span title="Última compra hace 31-60 días">R4 (60d)</span>
              <span title="Última compra hace 61-120 días">R3 (120d)</span>
              <span title="Última compra hace 121-240 días">R2 (240d)</span>
              <span title="Última compra hace > 240 días">R1 (+240d)</span>
            </div>

            {/* Matriz 5x5 */}
            <div className="grid grid-cols-5 gap-1.5 flex-1 min-w-0">
              {matrix.map((cell, idx) => {
                const isSelected = selectedSegment === cell.segment;
                const isFilteredOut = selectedSegment && !isSelected;

                return (
                  <TooltipPrimitive.Root key={idx}>
                    <TooltipPrimitive.Trigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelectSegment?.(isSelected ? null : cell.segment)}
                        className={`h-11 md:h-12 w-full rounded-md border border-border/70 flex flex-col items-center justify-center p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${getCellColor(
                          cell.customerCount,
                          isSelected
                        )} ${isFilteredOut ? 'opacity-35 grayscale-50' : 'opacity-100'}`}
                        aria-label={`R${cell.recency} F${cell.frequency}: ${cell.customerCount} clientes en ${cell.segment}`}
                      >
                        <span className="text-xs md:text-sm tabular-nums leading-none">
                          {formatNumber(cell.customerCount)}
                        </span>
                        <span className="text-[9px] uppercase tracking-tighter truncate max-w-full opacity-80 mt-0.5">
                          {cell.segment.substring(0, 4)}
                        </span>
                      </button>
                    </TooltipPrimitive.Trigger>
                    <TooltipPrimitive.Portal>
                      <TooltipPrimitive.Content
                        side="top"
                        align="center"
                        className="z-50 rounded-lg border bg-popover p-2.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0"
                        sideOffset={4}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2 border-b border-border pb-1">
                            <span className="font-semibold text-foreground">{cell.segment}</span>
                            <span className="text-[10px] text-muted-foreground">
                              R: {cell.recency}/5 · F: {cell.frequency}/5
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 text-muted-foreground pt-0.5">
                            <span>Clientes:</span>
                            <strong className="text-foreground text-right tabular-nums">
                              {formatNumber(cell.customerCount)}
                            </strong>
                            <span>Ticket Promedio:</span>
                            <strong className="text-foreground text-right tabular-nums">
                              {cell.customerCount > 0 ? formatCLP(cell.avgTicket) : '-'}
                            </strong>
                          </div>
                          <p className="text-[10px] text-muted-foreground italic pt-1">
                            {isSelected ? 'Haz clic para deseleccionar' : 'Haz clic para filtrar el dashboard'}
                          </p>
                        </div>
                        <TooltipPrimitive.Arrow className="fill-border" />
                      </TooltipPrimitive.Content>
                    </TooltipPrimitive.Portal>
                  </TooltipPrimitive.Root>
                );
              })}
            </div>
          </div>

          {/* Eje X: Frecuencia */}
          <div className="flex pl-12 pt-1.5 text-[10px] font-semibold text-muted-foreground">
            <div className="grid grid-cols-5 flex-1 text-center">
              <span>F1 (1)</span>
              <span>F2 (2)</span>
              <span>F3 (3)</span>
              <span>F4 (4-5)</span>
              <span>F5 (6+)</span>
            </div>
          </div>
          <div className="text-center text-[10px] text-muted-foreground font-medium pt-0.5">
            Frecuencia de pedidos →
          </div>
        </div>
      </TooltipPrimitive.Provider>
    </div>
  );
}
