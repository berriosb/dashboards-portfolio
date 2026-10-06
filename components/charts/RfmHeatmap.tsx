'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { formatCLP, formatNumber } from '@/lib/format';
import type { RfmAxes, RfmQuintileBand } from '@/lib/rfm';
import { rfmSegmentLabel } from '@/lib/rfm';

export interface RfmCellData {
  recency: number;
  frequency: number;
  segment: string;
  customerCount: number;
  avgTicket: number;
}

interface RfmHeatmapProps {
  matrix: RfmCellData[];
  /** Rangos reales de cada quintil, calculados por el motor sobre la ventana activa. */
  axes?: RfmAxes;
  selectedSegment?: string | null;
  onSelectSegment?: (segment: string | null) => void;
}

/**
 * Etiqueta de un quintil a partir del rango REAL observado en él.
 *
 * Antes los ejes anunciaban cortes fijos ("F3 (3-4 comp.)", "F5 (8+ comp.)") que
 * ya no correspondían a los umbrales del motor: 13 clientes con exactamente 4
 * compras caían en una celda rotulada "5-7". Ahora el rótulo se arma con el
 * mínimo y el máximo que el quintil efectivamente contiene, así que la
 * etiqueta y el corte que produjo la celda no pueden desincronizarse.
 */
function bandLabel(
  band: RfmQuintileBand | undefined,
  unit: string
): string {
  if (!band || band.count === 0) return `— ${unit}`;
  if (band.min === band.max) return `${band.min} ${unit}`;
  return `${band.min}-${band.max} ${unit}`;
}

/**
 * Rótulo de RECENCIA como rango contiguo y no como mínimo/máximo observados.
 *
 * El rango observado era fiel pero no partía el eje: con los datos actuales
 * producía R4 "47-100d" y R3 "100-125d" (el 100 en las dos) y R2 "125-207d"
 * con R1 ">211d", dejando 208-211d sin cubrir en ningún quintil. Un eje que se
 * solapa y además deja huecos invita a contar cuántos clientes caen "después de
 * 207" y salen mal.
 *
 * La forma correcta son cortes contiguos derivados del rango real: el
 * límite superior de un quintil es el mínimo del siguiente. Así el eje se lee
 * como una partición de la línea de tiempo, sin ambigüedad y sin huecos, y
 * sigue reflejando el dataset activo en vez de cortes fijos que se desincronicen.
 */
function recencyLabel(band: RfmQuintileBand | undefined, siguiente?: RfmQuintileBand): string {
  if (!band || band.count === 0) return '—';
  // R5 es el extremo superior del eje (días bajos).
  if (band.score === 5) return `≤${band.max}d`;
  // R1 es el extremo inferior: se abre hacia +∞.
  if (band.score === 1) return `>${band.min - 1}d`;
  // Quintiles intermedios: el tope lo fija el mínimo del quintil siguiente.
  const tope = siguiente?.count ? siguiente.min - 1 : band.max;
  return `${band.min}-${tope}d`;
}

export function RfmHeatmap({
  matrix,
  axes,
  selectedSegment,
  onSelectSegment,
}: RfmHeatmapProps) {
  // Encontrar el valor máximo de clientes para normalizar la escala de color
  const maxCount = Math.max(...matrix.map((c) => c.customerCount), 1);

  // Paleta de intensidad basada en densidad de clientes (monocromática azul según AGENTS.md).
  // La rampa alterna fondo claro con texto oscuro y fondo oscuro con texto claro,
  // en vez de poner `text-white` sobre azules medios: blanco sobre blue-600 queda
  // en 3.76:1 y bajo 4.5:1. Cada par de la rampa está por encima de 4.5:1.
  const getCellColor = (count: number, isSelected: boolean) => {
    // Las celdas vacías igual necesitan leerse: antes iban en muted/15 con texto
    // al 30%, o sea 1.48:1, prácticamente invisibles.
    if (count === 0) return 'bg-muted/50 text-muted-foreground border-dashed border-border';
    const ratio = count / maxCount;

    if (isSelected) {
      return 'bg-blue-700 text-white font-black ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-md scale-102';
    }

    if (ratio > 0.75) return 'bg-blue-700 text-white font-black hover:bg-blue-800 border-blue-800 shadow-xs';
    if (ratio > 0.5) return 'bg-blue-300 text-blue-950 font-bold hover:bg-blue-400 border-blue-400 dark:bg-blue-400 dark:text-blue-950 dark:border-blue-300';
    if (ratio > 0.25) return 'bg-blue-100 text-blue-950 font-semibold hover:bg-blue-200 dark:bg-blue-200 dark:text-blue-950 border-blue-200/60 dark:border-blue-300/60';
    return 'bg-blue-50/70 text-blue-900 font-medium hover:bg-blue-100 dark:bg-blue-100/70 dark:text-blue-950 border-blue-100 dark:border-blue-200';
  };

  return (
    <div className="w-full flex flex-col space-y-3.5">
      {/* Selector de segmentos unificado con paleta azul coherente */}
      <div
        role="group"
        aria-label="Filtrar por segmento RFM"
        className="flex items-center gap-1.5 flex-wrap text-xs"
      >
        <span className="text-muted-foreground font-medium mr-1 text-[11px]">Segmentos:</span>
        {['Champions', 'Loyal', 'Potential', 'At Risk', 'Hibernating'].map((seg) => {
          const isActive = selectedSegment === seg;
          return (
            <button
              key={seg}
              type="button"
              onClick={() => onSelectSegment?.(isActive ? null : seg)}
              aria-pressed={isActive}
              className={`px-2.5 min-h-11 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted font-medium'
              }`}
            >
              {rfmSegmentLabel(seg)}
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
          {/* Eje Y: Recencia. Va de mejor (arriba) a peor (abajo); los quintiles
              llegan ordenados de score 5 a 1. */}
          <div className="flex">
            <div className="w-12 shrink-0 flex flex-col justify-around text-right pr-2.5 text-[10px] font-semibold text-muted-foreground">
              {([5, 4, 3, 2, 1] as const).map((score) => (
                <span
                  key={score}
                  title={`Quintil de recencia ${score} de 5`}
                >
                  {/* El eje baja de score 5 a 1, así que el "siguiente" que
                      cierra el rango por arriba es el quintil de score -1. */}
                  R{score} (
                  {recencyLabel(
                    axes?.recency.find((b) => b.score === score),
                    axes?.recency.find((b) => b.score === score - 1)
                  )}
                  )
                </span>
              ))}
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
                        aria-pressed={isSelected}
                        className={`h-12 md:h-13 w-full rounded-lg border flex flex-col items-center justify-center p-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${getCellColor(
                          cell.customerCount,
                          isSelected
                        )} ${isFilteredOut ? 'opacity-25 grayscale' : 'opacity-100'}`}
                        // Sin aria-label: el nombre accesible sale del contenido visible, que es
                        // lo que exige WCAG 2.5.3 (Label in Name) de forma robusta. Con
                        // aria-label el texto visible se concatena como "2POTENTIAL" y el
                        // nombre debe contener esa cadena exacta, cosa que ninguna etiqueta
                        // alterna resuelve bien. El contexto R/F va en un span sr-only, que se
                        // suma al nombre accesible sin alterar lo que se ve.
                      >
                        <span className="text-sm font-black tabular-nums leading-none">
                          {formatNumber(cell.customerCount)}
                        </span>
                        {/* Sin `opacity-80`: bajar la opacidad del 9px lo dejaba en
                            ~3.9:1 incluso sobre los azules oscuros. La jerarquía la
                            dan el tamaño y el uppercase. */}
                        <span className="text-[9px] uppercase tracking-tight truncate max-w-full mt-1 font-semibold">
                          {rfmSegmentLabel(cell.segment)}
                        </span>
                        <span className="sr-only">
                          , celda R{cell.recency} F{cell.frequency}
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
                            <span className="font-bold text-foreground">{rfmSegmentLabel(cell.segment)}</span>
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
              {([1, 2, 3, 4, 5] as const).map((score) => (
                <span key={score}>
                  F{score} ({bandLabel(axes?.frequency.find((b) => b.score === score), 'comp.')})
                </span>
              ))}
            </div>
          </div>
        </div>
      </TooltipPrimitive.Provider>
    </div>
  );
}
