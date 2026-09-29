'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ChartFrame } from './ChartFrame';
import { DataTable } from './DataTable';
import { formatCLP, formatPercent } from '@/lib/format';

interface ChannelData {
  canal: string;
  ventas: number;
  pedidos: number;
  porcentaje: number;
}

interface DonutChartCardProps {
  data: ChannelData[];
  selectedChannel?: string | null;
  onSelectChannel?: (canal: string | null) => void;
}

const COLORS = ['#2563eb', '#60a5fa', '#93c5fd'];

export function DonutChartCard({
  data,
  selectedChannel,
  onSelectChannel,
}: DonutChartCardProps) {
  const tableColumns = [
    { key: 'canal', header: 'Canal', render: (r: ChannelData) => r.canal.toUpperCase() },
    { key: 'ventas', header: 'Ventas Netas', render: (r: ChannelData) => formatCLP(r.ventas), align: 'right' as const },
    { key: 'porcentaje', header: 'Participación', render: (r: ChannelData) => formatPercent(r.porcentaje), align: 'right' as const },
  ];

  return (
    <ChartFrame
      title="Distribución por Canal"
      description="Participación de ventas Online vs Tienda física"
      ariaLabel="Gráfico de donut de participación de ventas por canal"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Desglose por canal" />}
    >
      <div className="h-[280px] w-full min-w-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ChannelData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground">
                      <p className="font-semibold text-foreground uppercase">{d.canal}</p>
                      <p className="text-muted-foreground mt-0.5">
                        Ventas: <strong className="text-blue-600 dark:text-blue-400 tabular-nums">{formatCLP(d.ventas)}</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Cuota: <strong className="text-foreground tabular-nums">{formatPercent(d.porcentaje)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              dataKey="ventas"
              nameKey="canal"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              onClick={(entry: unknown) => {
                const item = entry as { canal?: string };
                if (item?.canal) {
                  onSelectChannel?.(selectedChannel === item.canal ? null : item.canal);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                const isSelected = selectedChannel === entry.canal;
                const isFilteredOut = selectedChannel && !isSelected;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={isFilteredOut ? 0.35 : 1}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs pt-1">
        {data.map((d, idx) => (
          <div
            key={d.canal}
            onClick={() => onSelectChannel?.(selectedChannel === d.canal ? null : d.canal)}
            className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded transition-all ${
              selectedChannel === d.canal ? 'bg-muted font-bold' : 'hover:opacity-80'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="capitalize">{d.canal}:</span>
            <span className="font-semibold tabular-nums">{formatPercent(d.porcentaje)}</span>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
