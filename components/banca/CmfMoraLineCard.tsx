'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { DataTable } from '@/components/charts/DataTable';
import { formatPercent } from '@/lib/format';

interface MonthlyMoraData {
  mes: string;
  mora30Pct: number;
  mora90Pct: number;
  colocaciones: number;
}

interface CmfMoraLineCardProps {
  data: MonthlyMoraData[];
}

export function CmfMoraLineCard({ data }: CmfMoraLineCardProps) {
  const formatMonth = (mes: string) => {
    const parts = mes.split('-');
    if (parts.length < 2) return mes;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(parts[1], 10) - 1]} ${parts[0].slice(2)}`;
  };

  const tableColumns = [
    { key: 'mes', header: 'Mes', render: (r: MonthlyMoraData) => formatMonth(r.mes) },
    {
      key: 'mora30Pct',
      header: 'Mora 30+ CMF (%)',
      render: (r: MonthlyMoraData) => formatPercent(r.mora30Pct),
      align: 'right' as const,
    },
    {
      key: 'mora90Pct',
      header: 'Mora 90+ CMF (%)',
      render: (r: MonthlyMoraData) => formatPercent(r.mora90Pct),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Evolución Morosidad CMF (30+ vs 90+ Días)"
      description="Comparativa de mora temprana de originación vs mora vencida de provisiones"
      ariaLabel="Gráfico de líneas comparativo de morosidad CMF 30+ y 90+ días"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Mora histórica CMF" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis
              dataKey="mes"
              tickFormatter={formatMonth}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={45}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as MonthlyMoraData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1.5">
                      <p className="font-semibold text-foreground">{formatMonth(d.mes)}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                            Mora 30+ CMF:
                          </span>
                          <strong className="text-amber-700 dark:text-amber-400 tabular-nums">
                            {formatPercent(d.mora30Pct)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                            Mora 90+ CMF:
                          </span>
                          <strong className="text-rose-700 dark:text-rose-400 tabular-nums">
                            {formatPercent(d.mora90Pct)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            {/* Límite regulatorio 2.5% para mora 30+ */}
            <ReferenceLine y={2.5} stroke="#d97706" strokeDasharray="3 3" opacity={0.6} />
            {/* Límite regulatorio 1.0% para mora 90+ */}
            <ReferenceLine y={1.0} stroke="#e11d48" strokeDasharray="3 3" opacity={0.6} />

            <Line
              type="monotone"
              name="Mora 30+ (Alerta CMF)"
              dataKey="mora30Pct"
              stroke="#d97706"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#d97706' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              name="Mora 90+ (Provisión CMF)"
              dataKey="mora90Pct"
              stroke="#e11d48"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#e11d48' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
