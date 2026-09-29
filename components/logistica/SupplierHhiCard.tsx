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
import { formatPercent, formatNumber } from '@/lib/format';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface TransportistaData {
  transportista: string;
  cuotaPct: number;
  despachos: number;
  otifPct: number;
}

interface SupplierHhiCardProps {
  data: TransportistaData[];
  hhiScore: number;
  selectedTransportista?: string | null;
  onSelectTransportista?: (t: string | null) => void;
}

export function SupplierHhiCard({
  data,
  hhiScore,
  selectedTransportista,
  onSelectTransportista,
}: SupplierHhiCardProps) {
  const isHighConcentration = hhiScore > 2500;
  const isModerateConcentration = hhiScore >= 1500 && hhiScore <= 2500;

  const tableColumns = [
    { key: 'transportista', header: 'Empresa Transportista' },
    {
      key: 'cuotaPct',
      header: 'Cuota de Flota',
      render: (r: TransportistaData) => formatPercent(r.cuotaPct),
      align: 'right' as const,
    },
    {
      key: 'otifPct',
      header: 'Cumplimiento OTIF',
      render: (r: TransportistaData) => formatPercent(r.otifPct),
      align: 'right' as const,
    },
    {
      key: 'despachos',
      header: 'Envíos Asignados',
      render: (r: TransportistaData) => formatNumber(r.despachos),
      align: 'right' as const,
    },
  ];

  return (
    <ChartFrame
      title="Concentración de Flota (Índice HHI)"
      description="Cuota por transportista y nivel de dependencia de proveedores"
      ariaLabel="Gráfico de cuota de mercado por transportista e índice HHI"
      tableComponent={<DataTable data={data} columns={tableColumns} caption="Concentración de transportistas" />}
    >
      <div className="h-[280px] w-full min-w-0 pt-1 flex flex-col justify-between">
        {/* Badge Semáforo HHI */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-muted-foreground">Índice Herfindahl-Hirschman:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold tabular-nums text-xs ${
              isHighConcentration
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                : isModerateConcentration
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
            }`}
          >
            {isHighConcentration ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>HHI: {formatNumber(hhiScore)} pts</span>
            <span className="text-[10px] font-normal opacity-85">
              ({isHighConcentration ? 'Concentrado' : isModerateConcentration ? 'Moderado' : 'Diversificado'})
            </span>
          </span>
        </div>

        <div className="h-[225px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.slice(0, 6)}
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="category"
                dataKey="transportista"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                width={110}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as TransportistaData;
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs text-popover-foreground space-y-1">
                        <p className="font-semibold text-foreground">{d.transportista}</p>
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Cuota de carga:</span>
                            <strong className="text-amber-700 dark:text-amber-400 tabular-nums">
                              {formatPercent(d.cuotaPct)}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Cumplimiento OTIF:</span>
                            <span className="tabular-nums font-medium">{formatPercent(d.otifPct)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Envíos:</span>
                            <span className="tabular-nums font-medium">{formatNumber(d.despachos)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="cuotaPct"
                radius={[0, 4, 4, 0]}
                onClick={(entry: unknown) => {
                  const item = entry as { transportista?: string };
                  if (item?.transportista) {
                    onSelectTransportista?.(selectedTransportista === item.transportista ? null : item.transportista);
                  }
                }}
                className="cursor-pointer"
              >
                {data.slice(0, 6).map((entry, index) => {
                  const isSelected = selectedTransportista === entry.transportista;
                  const isFilteredOut = selectedTransportista && !isSelected;
                  return (
                    <Cell
                      key={`trans-cell-${index}`}
                      fill={isSelected ? '#b45309' : isFilteredOut ? '#fed7aa' : '#d97706'}
                      opacity={isFilteredOut ? 0.35 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartFrame>
  );
}
