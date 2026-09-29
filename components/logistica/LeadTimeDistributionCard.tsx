'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { DataTable } from '@/components/charts/DataTable';
import { formatPercent, formatNumber } from '@/lib/format';

interface LeadTimeData {
  rangoHoras: string;
  despachos: number;
  porcentaje: number;
}

interface LeadTimeDistributionCardProps {
  data: LeadTimeData[];
  p50: number;
  p90: number;
}

export function LeadTimeDistributionCard({
  data,
  p50,
  p90,
}: LeadTimeDistributionCardProps) {
  const tableColumns = [
    { key: 'rangoHoras', header: 'Rango de Horas' },
    {
      key: 'despachos',
      header: 'Nº Envíos',
      render: (r: LeadTimeData) => formatNumber(r.despachos),
      align: 'right' as const,
    },
    {
      key: 'porcentaje',
      header: '% del Total',
      render: (r: LeadTimeData) => formatPercent(r.porcentaje),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Distribución de Lead Time (Tiempos de Ciclo)"
      description={`Mediana P50: ${p50} hrs · Límite Superior SLA P90: ${p90} hrs`}
      ariaLabel="Histograma de tiempos de ciclo de despachos logísticos"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Desglose de lead times" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-2 flex flex-col justify-between">
        {/* Chips de percentiles destacados */}
        <div className="flex items-center gap-2 px-1 text-xs">
          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 font-semibold tabular-nums">
            P50 (Mediana): {p50}h
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 font-semibold tabular-nums">
            P90 (Cola SLA): {p90}h
          </span>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="rangoHoras"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9.5, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickFormatter={(v) => formatNumber(v)}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as LeadTimeData;
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                        <p className="font-semibold text-foreground">{d.rangoHoras}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Despachos:</span>
                          <strong className="text-amber-700 dark:text-amber-400 tabular-nums">
                            {formatNumber(d.despachos)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Proporción:</span>
                          <span className="tabular-nums font-medium">{formatPercent(d.porcentaje)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="despachos" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => {
                  const isSlaBreach = entry.rangoHoras.includes('> 48h');
                  return (
                    <Cell
                      key={`lead-cell-${index}`}
                      fill={isSlaBreach ? '#e11d48' : '#d97706'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartFrame>
  );
}
