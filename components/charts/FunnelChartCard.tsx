'use client';

import React from 'react';
import { ChartFrame } from './ChartFrame';
import { DataTable } from './DataTable';
import { formatNumber, formatPercent } from '@/lib/format';

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
      description="Tasa de paso entre etapas de compra omnicanal"
      ariaLabel="Diagrama de embudo de conversión"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Métricas del funnel de conversión" />}
    >
      <div className="h-[280px] w-full min-w-0 flex flex-col justify-around py-2">
        {data.map((step, idx) => {
          const pctOfTotal = (step.value / maxValue) * 100;
          const prevValue = idx > 0 ? data[idx - 1].value : null;
          const dropoffPct = prevValue ? ((step.value / prevValue) * 100).toFixed(1) : null;

          return (
            <div key={step.step} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 inline-flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {step.step}
                </span>

                <div className="flex items-center gap-3 tabular-nums">
                  {dropoffPct && (
                    <span className="text-[11px] text-muted-foreground" title="Conversión de paso anterior">
                      ({dropoffPct}% del paso anterior)
                    </span>
                  )}
                  <span className="font-bold text-foreground">{formatNumber(step.value)}</span>
                  <span className="text-muted-foreground w-12 text-right">
                    {formatPercent(pctOfTotal)}
                  </span>
                </div>
              </div>

              {/* Barra de progreso visual */}
              <div className="h-3 w-full bg-muted/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-out"
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
