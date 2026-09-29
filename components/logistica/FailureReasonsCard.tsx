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

interface FailureData {
  causa: string;
  cantidad: number;
  porcentaje: number;
}

interface FailureReasonsCardProps {
  data: FailureData[];
}

export function FailureReasonsCard({ data }: FailureReasonsCardProps) {
  const tableColumns = [
    { key: 'causa', header: 'Causa de Incidencia' },
    {
      key: 'cantidad',
      header: 'Casos Registrados',
      render: (r: FailureData) => formatNumber(r.cantidad),
      align: 'right' as const,
    },
    {
      key: 'porcentaje',
      header: '% del Total de Fallas',
      render: (r: FailureData) => formatPercent(r.porcentaje),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Pareto de Causas de No Cumplimiento"
      description="Factores que provocaron quiebres en entregas a tiempo o completas"
      ariaLabel="Gráfico de Pareto de causas de incidencias de despacho"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Desglose de incidencias" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="causa"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
              width={125}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as FailureData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                      <p className="font-semibold text-foreground">{d.causa}</p>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Casos:</span>
                          <strong className="text-rose-600 dark:text-rose-400 tabular-nums">
                            {formatNumber(d.cantidad)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Participación:</span>
                          <span className="tabular-nums font-medium">{formatPercent(d.porcentaje)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`fail-cell-${index}`}
                  fill={index === 0 ? '#e11d48' : '#f59e0b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
