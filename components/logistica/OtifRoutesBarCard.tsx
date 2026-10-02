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
            margin={{ top: 5, right: 46, left: 10, bottom: 5 }}
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
            {/* Tick en dos líneas: nombre de la ruta arriba, su OTIF% debajo.

                El color por sí solo NO puede ser el portador del estado
                (WCAG 1.4.1 y AGENTS §3 `pair-status-with-labels`): con barras
                rosadas/ámbar/verdes sin cifra al lado, "cumple" y "no cumple"
                sólo se distinguen para quien distingue esos tres tonos. Con el
                valor escrito, el estado se lee con o sin percepción del color.

                Se dibuja con un `tick` custom en vez de `<LabelList>` o el prop
                `label` del `Bar` porque en Recharts 3.10 ninguna de esas dos
                APIs produjo capa de etiquetas en el DOM —se verificó: 0 nodos
                `.recharts-label` además del "Meta 95%" de la ReferenceLine— y
                el chart quedaba exactamente igual que antes del fix. Un tick
                custom sí se renderiza siempre. */}
            <YAxis
              type="category"
              dataKey="ruta"
              tickLine={false}
              axisLine={false}
              width={128}
              interval={0}
              tick={({ x, y, payload }) => {
                const item = data.find((d) => d.ruta === payload.value);
                const otif = item?.otifPct ?? 0;
                const critico = otif < 90;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      textAnchor="end"
                      dy={-1}
                      fontSize={9.5}
                      fill="hsl(var(--foreground))"
                    >
                      {payload.value}
                    </text>
                    <text
                      textAnchor="end"
                      dy={11}
                      fontSize={10.5}
                      fontWeight={700}
                      className="tabular-nums"
                      /* `style` y no el atributo `fill`: una custom property NO
                         resuelve dentro de un atributo de presentación SVG —
                         se verificó que `fill="hsl(var(--status-critical))"`
                         computaba a rgb(0,0,0), o sea texto negro invisible en
                         dark. En `style` el var() sí se resuelve. */
                      style={{
                        fill:
                          critico
                            ? 'hsl(var(--status-critical))'
                            : otif >= 95
                              ? 'hsl(var(--status-good))'
                              : 'hsl(var(--status-warn))',
                      }}
                    >
                      {formatPercent(otif)}
                    </text>
                  </g>
                );
              }}
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
