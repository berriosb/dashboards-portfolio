'use client';

import React from 'react';
import { ChartFrame } from './ChartFrame';
import { DataTable } from './DataTable';
import { formatNumber, formatPercent } from '@/lib/format';
import { ArrowDown } from 'lucide-react';

interface FunnelStep {
  step: string;
  value: number;
}

interface FunnelChartCardProps {
  data: FunnelStep[];
}

export function FunnelChartCard({ data }: FunnelChartCardProps) {
  const maxValue = data[0]?.value || 1;

  const tableColumns = [
    { key: 'step', header: 'Etapa' },
    { key: 'value', header: 'Volumen', render: (r: FunnelStep) => formatNumber(r.value), align: 'right' as const },
    {
      key: 'ratio',
      header: '% Total',
      render: (r: FunnelStep) => formatPercent((r.value / maxValue) * 100),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Embudo de Conversión"
      description="Tasa de paso y retención en etapas de compra omnicanal"
      ariaLabel="Diagrama de embudo de conversión"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Métricas del funnel de conversión" />}
    >
      <div className="h-[280px] w-full min-w-0 flex flex-col justify-between py-1">
        {data.map((step, idx) => {
          const pctOfTotal = (step.value / maxValue) * 100;
          const prevValue = idx > 0 ? data[idx - 1].value : null;
          const dropOffRate = prevValue ? (((prevValue - step.value) / prevValue) * 100).toFixed(1) : null;

          return (
            <div key={step.step} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-muted text-foreground border border-border inline-flex items-center justify-center text-[10px] font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-foreground tracking-tight">
                    {step.step}
                  </span>
                  {dropOffRate && (
                    <span
                      className="hidden sm:inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-medium border border-rose-200/50 dark:border-rose-900/40"
                      title={`Tasa de abandono respecto al paso anterior: -${dropOffRate}%`}
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                      -{dropOffRate}% fuga
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 tabular-nums">
                  <span className="font-bold text-foreground">{formatNumber(step.value)}</span>
                  <span className="text-muted-foreground w-12 text-right font-medium text-[11px]">
                    {formatPercent(pctOfTotal)}
                  </span>
                </div>
              </div>

              {/* Barra estructural sin gradientes (Anti-slop / Enterprise standard) */}
              <div className="h-3 w-full bg-muted/60 rounded-md overflow-hidden border border-border/60">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-sm transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(pctOfTotal, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}
