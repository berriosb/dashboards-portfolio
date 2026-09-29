'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { DataTable } from '@/components/charts/DataTable';
import { formatCLP, formatPercent, formatNumber } from '@/lib/format';

interface SegmentData {
  segmento: string;
  saldo: number;
  creditos: number;
  porcentaje: number;
}

interface BancaSegmentsDonutCardProps {
  data: SegmentData[];
  selectedSegment?: string | null;
  onSelectSegment?: (segmento: string | null) => void;
}

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7'];

export function BancaSegmentsDonutCard({
  data,
  selectedSegment,
  onSelectSegment,
}: BancaSegmentsDonutCardProps) {
  const tableColumns = [
    { key: 'segmento', header: 'Segmento' },
    { key: 'saldo', header: 'Saldo Colocado', render: (r: SegmentData) => formatCLP(r.saldo), align: 'right' as const },
    { key: 'porcentaje', header: 'Participación', render: (r: SegmentData) => formatPercent(r.porcentaje), align: 'right' as const },
    { key: 'creditos', header: 'Operaciones', render: (r: SegmentData) => formatNumber(r.creditos), align: 'right' as const },
  ];

  return (
    <ChartFrame
      title="Distribución por Segmento de Cliente"
      description="Participación de cartera entre Personas, PyME y Empresas"
      ariaLabel="Gráfico de donut de colocaciones por segmento"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Desglose por segmento" />}
    >
      <div className="h-[280px] w-full min-w-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as SegmentData;
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                      <p className="font-semibold text-foreground">{d.segmento}</p>
                      <p className="text-muted-foreground">
                        Saldo: <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">{formatCLP(d.saldo)}</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Cuota: <strong className="text-foreground tabular-nums">{formatPercent(d.porcentaje)}</strong>
                      </p>
                      <p className="text-muted-foreground">
                        Operaciones: <strong className="text-foreground tabular-nums">{formatNumber(d.creditos)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              dataKey="saldo"
              nameKey="segmento"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              onClick={(entry: unknown) => {
                const item = entry as { segmento?: string };
                if (item?.segmento) {
                  onSelectSegment?.(selectedSegment === item.segmento ? null : item.segmento);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => {
                const isSelected = selectedSegment === entry.segmento;
                const isFilteredOut = selectedSegment && !isSelected;
                return (
                  <Cell
                    key={`banca-seg-${index}`}
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

      <div className="flex items-center justify-center gap-3 flex-wrap text-xs pt-1">
        {data.map((d, idx) => (
          <div
            key={d.segmento}
            onClick={() => onSelectSegment?.(selectedSegment === d.segmento ? null : d.segmento)}
            className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded transition-all ${
              selectedSegment === d.segmento ? 'bg-muted font-bold' : 'hover:opacity-80'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span>{d.segmento}:</span>
            <span className="font-semibold tabular-nums">{formatPercent(d.porcentaje)}</span>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
