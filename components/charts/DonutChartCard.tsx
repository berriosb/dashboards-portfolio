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
  const totalVentas = data.reduce((acc, curr) => acc + curr.ventas, 0);

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
      <div className="h-[280px] w-full min-w-0 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ChannelData;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2.5 shadow-lg text-xs text-popover-foreground">
                      <p className="font-semibold text-foreground uppercase tracking-wide">{d.canal}</p>
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
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
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
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centro del Donut: Total Consolidado */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Total Canal
          </span>
          <span className="text-base sm:text-lg font-black text-foreground tabular-nums tracking-tight">
            {formatCLP(totalVentas, { compact: true })}
          </span>
        </div>
      </div>

      {/* Leyenda = control de cross-filter, no texto decorativo. Antes era un
          `<div onClick>`: sin `role`, sin tab stop y sin handler de teclado, así
          que el filtro por canal sólo se podía activar con ratón (WCAG 2.1.1).
          Ahora cada opción es un `<button>` con `aria-pressed`, que además le
          da Enter/Espacio gratis. `focus-visible:outline-none` +
          `focus-visible:ring-ring` conservan el anillo propio sin duplicar el
          global de globals.css. */}
      <div
        role="group"
        aria-label="Filtrar el panel por canal"
        className="flex items-center justify-center gap-4 text-xs pt-1 border-t border-border/50"
      >
        {data.map((d, idx) => (
          <button
            key={d.canal}
            type="button"
            onClick={() => onSelectChannel?.(selectedChannel === d.canal ? null : d.canal)}
            aria-pressed={selectedChannel === d.canal}
            /* `min-h-11`: con `py-0.5` el botón quedaba en 20px de alto, muy por debajo
               del área táctil mínima de 44px. Medido en móvil real: cuatro
               botones de leyenda a 20px y sin la mitigación de `.tap-target`,
               que es la clase que sí salva a los tooltips de glosario. */
            className={`flex items-center gap-1.5 cursor-pointer px-2 py-1.5 min-h-11 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              selectedChannel === d.canal
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              aria-hidden="true"
            />
            <span className="capitalize">{d.canal}:</span>
            <span className="font-bold tabular-nums text-foreground">{formatPercent(d.porcentaje)}</span>
          </button>
        ))}
      </div>
    </ChartFrame>
  );
}
