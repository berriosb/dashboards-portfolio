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

interface ProductData {
  producto: string;
  saldo: number;
  creditos: number;
  tasaMora30: number;
}

interface ProductsBarCardProps {
  data: ProductData[];
  selectedProduct?: string | null;
  onSelectProduct?: (producto: string | null) => void;
}

export function ProductsBarCard({
  data,
  selectedProduct,
  onSelectProduct,
}: ProductsBarCardProps) {
  const tableColumns = [
    { key: 'producto', header: 'Producto Financiero' },
    {
      key: 'saldo',
      header: 'Saldo Vigente',
      render: (r: ProductData) => formatCLP(r.saldo),
      align: 'right' as const,
    },
    {
      key: 'creditos',
      header: 'Nº Operaciones',
      render: (r: ProductData) => formatNumber(r.creditos),
      align: 'right' as const,
    },
    {
      key: 'tasaMora30',
      header: 'Mora 30+ CMF',
      render: (r: ProductData) => formatPercent(r.tasaMora30),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Colocaciones por Producto"
      description="Saldo de cartera por línea de crédito (haz clic para filtrar)"
      ariaLabel="Gráfico de barras de colocaciones por producto"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Desglose por producto financiero" />}
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
              tickFormatter={(v) => formatCLP(v, { compact: true })}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="producto"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
              width={85}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ProductData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                      <p className="font-semibold text-foreground">{d.producto}</p>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Saldo:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {formatCLP(d.saldo)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Mora 30+ CMF:</span>
                          <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                            {formatPercent(d.tasaMora30)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Operaciones:</span>
                          <span className="font-medium tabular-nums">{formatNumber(d.creditos)}</span>
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
              radius={[0, 4, 4, 0]}
              onClick={(entry: unknown) => {
                const item = entry as { producto?: string };
                if (item?.producto) {
                  onSelectProduct?.(selectedProduct === item.producto ? null : item.producto);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                const isSelected = selectedProduct === entry.producto;
                const isFilteredOut = selectedProduct && !isSelected;
                return (
                  <Cell
                    key={`prod-cell-${index}`}
                    fill={isSelected ? '#047857' : isFilteredOut ? '#a7f3d0' : '#059669'}
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
