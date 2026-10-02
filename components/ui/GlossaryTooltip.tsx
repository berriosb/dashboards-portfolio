'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import { ALL_METRICS } from '@/lib/metric-definitions';
import { formatCLP, formatNumber } from '@/lib/format';

interface GlossaryTooltipProps {
  metricKey: string;
  /**
   * Meta ya prorateada a la ventana visible.
   *
   * Si no se pasa, el glosario muestra la meta de referencia sin proratear, que
   * puede no coincidir con la de la tarjeta cuando el filtro es corto. Por eso
   * las tarjetas le pasan el mismo valor resuelto que muestran ellas.
   */
  benchmark?: number;
  benchmarkSource?: string;
  benchmarkLabel?: string;
}

export function GlossaryTooltip({
  metricKey,
  benchmark,
  benchmarkSource,
  benchmarkLabel,
}: GlossaryTooltipProps) {
  const metric = ALL_METRICS[metricKey];
  if (!metric) return null;
  const shownBenchmark = benchmark ?? metric.benchmark;
  const shownSource = benchmarkSource ?? metric.benchmarkSource;

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            className="tap-target inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={`Información sobre ${metric.label}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align="center"
            className="z-50 max-w-xs rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
            sideOffset={4}
          >
            <p className="font-semibold text-foreground mb-1">{metric.label}</p>
            <p className="text-muted-foreground mb-2 leading-relaxed">{metric.formula}</p>
            <div className="border-t border-border pt-2 space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{benchmarkLabel ?? 'Benchmark'}: </span>
                {/* `formatCLP`/`formatNumber` en vez de `toLocaleString` a mano:
                    el separador de miles y el prefijo quedan en un solo lugar.
                    `tabular-nums` porque el benchmark cambia al cambiar el
                    filtro y no debe desplazar el texto que lo rodea. */}
                <span className="tabular-nums font-medium text-foreground">
                  {metric.unit === 'CLP'
                    ? formatCLP(shownBenchmark)
                    : formatNumber(shownBenchmark)}
                  {metric.unit === 'CLP' ? '' : metric.unit}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground italic">{shownSource}</p>
            </div>
            <TooltipPrimitive.Arrow className="fill-border" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
