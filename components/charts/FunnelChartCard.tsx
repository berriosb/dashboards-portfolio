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
      <div className="h-[280px] w-full min-w-0 flex flex-col justify-between py-2">
        {data.map((step, idx) => {
          const pctOfTotal = (step.value / maxValue) * 100;
          const prevValue = idx > 0 ? data[idx - 1].value : null;
          const stepConversion = prevValue ? ((step.value / prevValue) * 100).toFixed(1) : null;

          return (
            <div key={step.step} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 inline-flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-foreground tracking-tight">
                    {step.step}
                  </span>
                  {stepConversion && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-[10.5px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium">
                      <ArrowDown className="w-2.5 h-2.5" />
                      {stepConversion}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 tabular-nums">
                  <span className="font-extrabold text-foreground">{formatNumber(step.value)}</span>
                  <span className="text-muted-foreground w-12 text-right font-medium">
                    {formatPercent(pctOfTotal)}
                  </span>
                </div>
              </div>

              {/* Barra con gradiente sutil y pista de fondo */}
              <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden p-0.5 border border-border/40">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${Math.max(pctOfTotal, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}
