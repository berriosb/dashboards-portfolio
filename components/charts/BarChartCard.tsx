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
import { ChartFrame } from './ChartFrame';
import { DataTable } from './DataTable';
import { formatCLP, formatPercent } from '@/lib/format';

interface CategoryData {
  categoria: string;
  ventas: number;
  pedidos: number;
  margenPct: number;
}

interface BarChartCardProps {
  data: CategoryData[];
  selectedCategory?: string | null;
  onSelectCategory?: (categoria: string | null) => void;
}

export function BarChartCard({
  data,
  selectedCategory,
  onSelectCategory,
}: BarChartCardProps) {
  const tableColumns = [
    { key: 'categoria', header: 'Categoría' },
    { key: 'ventas', header: 'Ventas Netas', render: (r: CategoryData) => formatCLP(r.ventas), align: 'right' as const },
    { key: 'pedidos', header: 'Pedidos', align: 'right' as const },
    { key: 'margenPct', header: 'Margen', render: (r: CategoryData) => formatPercent(r.margenPct), align: 'right' as const },
  ];

  return (
    <ChartFrame
      title="Ventas por Categoría"
      description="Facturación neta por línea de producto (haz clic para filtrar)"
      ariaLabel="Gráfico de barras horizontales de ventas por categoría"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Ventas desglosadas por categoría" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data.slice(0, 8)}
            margin={{ top: 14, right: 20, left: 8, bottom: 6 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => formatCLP(v, { compact: true })}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="categoria"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as CategoryData;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2.5 shadow-lg text-xs text-popover-foreground">
                      <p className="font-semibold text-foreground mb-1">{d.categoria}</p>
                      <div className="space-y-0.5">
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
            <Bar
              dataKey="ventas"
              radius={[0, 6, 6, 0]}
              maxBarSize={22}
              onClick={(entry: unknown) => {
                const item = entry as { categoria?: string };
                if (item?.categoria) {
                  onSelectCategory?.(selectedCategory === item.categoria ? null : item.categoria);
                }
              }}
              className="cursor-pointer"
            >
              {data.slice(0, 8).map((entry, index) => {
                const isSelected = selectedCategory === entry.categoria;
                const isFilteredOut = selectedCategory && !isSelected;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isSelected ? '#1d4ed8' : isFilteredOut ? '#93c5fd' : '#2563eb'}
                    opacity={isFilteredOut ? 0.35 : 1}
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
