'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import { ALL_METRICS } from '@/lib/metric-definitions';

interface GlossaryTooltipProps {
  metricKey: string;
}

export function GlossaryTooltip({ metricKey }: GlossaryTooltipProps) {
  const metric = ALL_METRICS[metricKey];
  if (!metric) return null;

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                <span className="font-medium text-foreground">Benchmark: </span>
                {metric.unit === 'CLP' ? `$${metric.benchmark.toLocaleString('es-CL')}` : `${metric.benchmark}${metric.unit}`}
              </p>
              <p className="text-[11px] text-muted-foreground/80 italic">{metric.benchmarkSource}</p>
            </div>
            <TooltipPrimitive.Arrow className="fill-border" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
