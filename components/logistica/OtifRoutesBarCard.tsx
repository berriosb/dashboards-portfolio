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
  ReferenceLine,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { DataTable } from '@/components/charts/DataTable';
import { formatPercent, formatNumber, formatCLP } from '@/lib/format';

interface RouteData {
  ruta: string;
  otifPct: number;
  despachos: number;
  costoPromedio: number;
}

interface OtifRoutesBarCardProps {
  data: RouteData[];
  selectedRuta?: string | null;
  onSelectRuta?: (ruta: string | null) => void;
}

export function OtifRoutesBarCard({
  data,
  selectedRuta,
  onSelectRuta,
}: OtifRoutesBarCardProps) {
  const tableColumns = [
    { key: 'ruta', header: 'Ruta de Despacho' },
    {
      key: 'otifPct',
      header: 'Cumplimiento OTIF',
      render: (r: RouteData) => formatPercent(r.otifPct),
      align: 'right' as const,
    },
    {
      key: 'despachos',
      header: 'Nº Envíos',
      render: (r: RouteData) => formatNumber(r.despachos),
      align: 'right' as const,
    },
    {
      key: 'costoPromedio',
      header: 'Costo Promedio',
      render: (r: RouteData) => formatCLP(r.costoPromedio),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Cumplimiento OTIF por Ruta"
      description="Porcentaje de entregas a tiempo y completas (Meta: 95% EDI Chile)"
      ariaLabel="Gráfico de barras de cumplimiento OTIF por ruta de transporte"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Ranking de OTIF por ruta" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              /* Dominio derivado de los datos, no fijo en [75, 100]. Con el
                 dominio fijo cualquier ruta bajo 75% se dibujaba como barra de
                 largo cero, indistinguible de un dato faltante: la peor ruta
                 —justo la que hay que actuar — desaparecía. El piso se
                 redondea a 5 para que la escala siga siendo legible. */
              domain={[
                Math.max(0, Math.floor((Math.min(...data.map((d) => d.otifPct)) - 5) / 5) * 5),
                100,
              ]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="ruta"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
              width={120}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as RouteData;
                  const isBelowSla = d.otifPct < 90;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                      <p className="font-semibold text-foreground">{d.ruta}</p>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">OTIF Real:</span>
                          <strong
                            className={`tabular-nums ${
                              isBelowSla
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {formatPercent(d.otifPct)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Envíos:</span>
                          <span className="tabular-nums font-medium">{formatNumber(d.despachos)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Costo flete:</span>
                          <span className="tabular-nums font-medium">{formatCLP(d.costoPromedio)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta 95%', position: 'top', fill: '#10b981', fontSize: 10 }} />
            <Bar
              dataKey="otifPct"
              radius={[0, 4, 4, 0]}
              onClick={(entry: unknown) => {
                const item = entry as { ruta?: string };
                if (item?.ruta) {
                  onSelectRuta?.(selectedRuta === item.ruta ? null : item.ruta);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                const isSelected = selectedRuta === entry.ruta;
                const isFilteredOut = selectedRuta && !isSelected;
                const isCritical = entry.otifPct < 90;
                const baseColor = isCritical ? '#e11d48' : entry.otifPct >= 95 ? '#059669' : '#d97706';
                return (
                  <Cell
                    key={`ruta-cell-${index}`}
                    fill={isSelected ? '#b45309' : isFilteredOut ? '#fed7aa' : baseColor}
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
