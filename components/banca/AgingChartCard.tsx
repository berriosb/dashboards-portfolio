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
import { formatCLP, formatPercent, formatNumber } from '@/lib/format';

interface AgingData {
  tramo: string;
  saldo: number;
  creditos: number;
  porcentaje: number;
}

interface AgingChartCardProps {
  data: AgingData[];
  selectedTramo?: string | null;
  onSelectTramo?: (tramo: string | null) => void;
}

const TRAMO_COLORS: Record<string, string> = {
  'Al Día (0d)': '#059669', // Cartera sana / vigente
  'Mora 1-29d': '#64748b', // Atraso técnico / administrativo leve (slate neutro)
  'Mora 30-59d': '#d97706', // Alerta temprana CMF (ámbar)
  'Mora 60-89d': '#ea580c', // Riesgo alto previo a castigo (naranja intenso)
  'Mora 90+d': '#be123c', // Cartera deteriorada / IFRS 9 (carmín crítico)
};

export function AgingChartCard({
  data,
  selectedTramo,
  onSelectTramo,
}: AgingChartCardProps) {
  const tableColumns = [
    { key: 'tramo', header: 'Tramo de Mora' },
    {
      key: 'saldo',
      header: 'Saldo Colocaciones',
      render: (r: AgingData) => formatCLP(r.saldo),
      align: 'right' as const,
    },
    {
      key: 'creditos',
      header: 'Nº Créditos',
      render: (r: AgingData) => formatNumber(r.creditos),
      align: 'right' as const,
    },
    {
      key: 'porcentaje',
      header: '% Cartera',
      render: (r: AgingData) => formatPercent(r.porcentaje),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Aging de Cartera y Morosidad"
      description="Distribución de saldo por tramos de días de atraso (haz clic para filtrar)"
      ariaLabel="Gráfico de barras de aging de colocaciones bancarias"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Aging de colocaciones" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
            <XAxis
              dataKey="tramo"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickFormatter={(v) => formatCLP(v, { compact: true })}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={65}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as AgingData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                      <p className="font-semibold text-foreground">{d.tramo}</p>
                      <div className="space-y-0.5 pt-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Saldo:</span>
                          <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {formatCLP(d.saldo)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Cuota Cartera:</span>
                          <span className="tabular-nums font-medium">{formatPercent(d.porcentaje)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Créditos:</span>
                          <span className="tabular-nums font-medium">{formatNumber(d.creditos)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="saldo"
              radius={[4, 4, 0, 0]}
              onClick={(entry: unknown) => {
                const item = entry as { tramo?: string };
                if (item?.tramo) {
                  onSelectTramo?.(selectedTramo === item.tramo ? null : item.tramo);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                const isSelected = selectedTramo === entry.tramo;
                const isFilteredOut = selectedTramo && !isSelected;
                const baseColor = TRAMO_COLORS[entry.tramo] || '#059669';
                return (
                  <Cell
                    key={`aging-cell-${index}`}
                    fill={baseColor}
                    opacity={isFilteredOut ? 0.35 : 1}
                    stroke={isSelected ? 'hsl(var(--foreground))' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
