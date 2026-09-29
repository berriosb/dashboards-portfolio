'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartFrame } from './ChartFrame';
import { DataTable } from './DataTable';
import { formatCLP, formatPercent } from '@/lib/format';

interface MonthlyData {
  mes: string;
  ventas: number;
  pedidos: number;
  margenPct: number;
}

interface LineChartCardProps {
  data: MonthlyData[];
}

export function LineChartCard({ data }: LineChartCardProps) {
  const formatMonth = (mes: string) => {
    const parts = mes.split('-');
    if (parts.length < 2) return mes;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(parts[1], 10) - 1]} ${parts[0].slice(2)}`;
  };

  const tableColumns = [
    { key: 'mes', header: 'Mes', render: (r: MonthlyData) => formatMonth(r.mes) },
    { key: 'ventas', header: 'Ventas Netas', render: (r: MonthlyData) => formatCLP(r.ventas), align: 'right' as const },
    { key: 'pedidos', header: 'Pedidos', align: 'right' as const },
    { key: 'margenPct', header: 'Margen Bruto', render: (r: MonthlyData) => formatPercent(r.margenPct), align: 'right' as const },
  ];

  return (
    <ChartFrame
      title="Tendencia Mensual de Ventas"
      description="Evolución de facturación neta en CLP últimos 12 meses"
      ariaLabel="Gráfico de área de evolución mensual de ventas netas"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Ventas mensuales detalladas" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="retailSalesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis
              dataKey="mes"
              tickFormatter={formatMonth}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickFormatter={(v) => formatCLP(v, { compact: true })}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={55}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as MonthlyData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground">
                      <p className="font-semibold text-foreground mb-1">{formatMonth(d.mes)}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Ventas:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                            {formatCLP(d.ventas)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Margen:</span>
                          <span className="font-medium tabular-nums">{formatPercent(d.margenPct)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Pedidos:</span>
                          <span className="font-medium tabular-nums">{d.pedidos}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="ventas"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#retailSalesGrad)"
              activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
