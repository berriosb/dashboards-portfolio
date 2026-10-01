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
  ReferenceArea,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { DataTable } from '@/components/charts/DataTable';
import { formatPercent } from '@/lib/format';

interface MonthlyMoraData {
  mes: string;
  mora30Pct: number;
  mora90Pct: number;
  saldoPromedioMensual: number;
}

/**
 * Referencias de la tarjeta, todas del PROYECTO y ninguna regulatoria.
 *
 * La CMF publica el indicador "morosidad de 90 días o más", pero no difunde un
 * umbral 30+ ni una banda de riesgo que la tarjeta pueda dibujar como si fuera
 * una norma. Antes esta card pintaba un "Límite Mora 90+ (1,0%)" y una "zona de
 * riesgo regulatorio" que no existen en ninguna fuente, y dejaban la serie real
 * (1,6% - 2,2%) entera dentro de la supuesta zona de riesgo mientras el KPI de
 * arriba decía "Bajo meta".
 *
 * Las cifras viven en un solo lugar:
 *   - banda 90+ : 1,5% - 2,9%  → banda de calibración del proyecto
 *                 (scripts/calibrate-banca.ts, "Bandas de referencia")
 *   - meta 90+  : 2,0%          → BANCA_METRICS.moraVencida90Pct.benchmark
 *   - alerta 30+: 2,5%          → BANCA_METRICS.moraCarteraPct.benchmark
 *                 ("Umbral interno de alerta temprana", no un límite CMF)
 */
const BANDA_MORA_90 = { min: 1.5, max: 2.9 };
const META_MORA_90 = 2.0;
const ALERTA_MORA_30 = 2.5;

/**
 * Único acento permitido en Banca (emerald) para la serie que es indicador
 * oficial, y un neutro slate para la segunda serie. Las referencias van en
 * `muted-foreground`: son estructura de referencia, no otro color de alerta.
 */
const COLOR_MORA_90 = '#059669';
const COLOR_MORA_30 = '#64748b';
const COLOR_REFERENCIA = 'hsl(var(--muted-foreground))';

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
      header: 'Mora 30+ (%)',
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
      title="Evolución de Morosidad (30+ vs 90+ Días)"
      description={`Mora 30+ (alerta temprana interna) contra mora 90+ (indicador oficial reportado a la CMF). La banda ${formatPercent(BANDA_MORA_90.min)} - ${formatPercent(BANDA_MORA_90.max)} y las metas son referencias de calibración del proyecto, no límites regulatorios.`}
      ariaLabel="Gráfico de líneas comparativo de morosidad 30+ y 90+ días con banda de referencia del proyecto"
      tableComponent={
        <DataTable data={data} columns={tableColumns} caption="Mora histórica 30+ y 90+ días" />
      }
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
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: COLOR_MORA_30 }}
                            />
                            Mora 30+:
                          </span>
                          <strong className="text-foreground font-semibold tabular-nums">
                            {formatPercent(d.mora30Pct)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: COLOR_MORA_90 }}
                            />
                            Mora 90+ (CMF):
                          </span>
                          <strong className="text-foreground font-semibold tabular-nums">
                            {formatPercent(d.mora90Pct)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            {/* Banda de calibración del proyecto para mora 90+ (1,5% - 2,9%).
                Neutra a propósito: el único acento de Banca es el emerald de la
                serie 90+, y esta banda no es un límite normativo. */}
            <ReferenceArea
              y1={BANDA_MORA_90.min}
              y2={BANDA_MORA_90.max}
              fill={COLOR_REFERENCIA}
              fillOpacity={0.08}
              label={{
                value: `Banda de referencia ${formatPercent(BANDA_MORA_90.min)} - ${formatPercent(BANDA_MORA_90.max)}`,
                position: 'insideTopRight',
                fill: COLOR_REFERENCIA,
                fontSize: 10,
              }}
            />

            {/* Umbral interno de alerta temprana 30+ (2,5%). La CMF no publica un
                umbral 30+, así que se nombra como lo que es: interno. */}
            <ReferenceLine
              y={ALERTA_MORA_30}
              stroke={COLOR_REFERENCIA}
              strokeDasharray="4 4"
              opacity={0.7}
              label={{
                value: `Alerta temprana interna 30+ (${formatPercent(ALERTA_MORA_30)})`,
                position: 'insideTopLeft',
                fill: COLOR_REFERENCIA,
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            {/* Meta de referencia 90+ (2,0%), la misma que muestra el KPI de
                arriba (BANCA_METRICS.moraVencida90Pct.benchmark). */}
            <ReferenceLine
              y={META_MORA_90}
              stroke={COLOR_REFERENCIA}
              strokeDasharray="4 4"
              opacity={0.7}
              label={{
                value: `Meta de referencia 90+ (${formatPercent(META_MORA_90)})`,
                position: 'insideBottomRight',
                fill: COLOR_REFERENCIA,
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            <Line
              type="monotone"
              name="Mora 30+ (alerta interna)"
              dataKey="mora30Pct"
              stroke={COLOR_MORA_30}
              strokeWidth={2.5}
              dot={{ r: 3, fill: COLOR_MORA_30 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              name="Mora 90+ (indicador CMF)"
              dataKey="mora90Pct"
              stroke={COLOR_MORA_90}
              strokeWidth={2.5}
              dot={{ r: 3, fill: COLOR_MORA_90 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
