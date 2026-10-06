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

/* Umbrales del SLA OTIF del proyecto (ver OTIF_META en lib/metric-definitions).
   95% es la meta contractual del acuerdo de nivel de servicio; 90% es el piso
   operativo interno bajo el cual la ruta se considera crítica. */
const OTIF_META = 95;
const OTIF_PISO = 90;

/**
 * Rampa de un solo hue (ámbar, el acento de Logística) con tres niveles de
 * severidad, más la clave de lectura que el color solo nunca puede dar.
 *
 * Antes cada barra salía en uno de TRES colores (#e11d48/#d97706/#059669) y el
 * estado viajaba únicamente por el color, sin etiqueta: en escala de grises,
 * con daltonismo o impreso en B/N, el nivel de incumplimiento era indistinguible.
 * Además eran hex fijos, el único punto del componente que no respetaba el tema.
 *
 * Ahora la severidad se codifica en la INTENSIDAD de un solo hue y se usan las
 * utilidades `fill-*` de Tailwind, que resuelven light/dark ellas solas. La
 * longitud de la barra sigue siendo la señal primaria, que es la única que no
 * depende del color. */
const OTIF_RAMP = {
  critico: {
    fillClass: 'fill-amber-800 dark:fill-amber-600',
    swatchClass: 'bg-amber-800 dark:bg-amber-600',
    selectedClass: 'fill-amber-900 dark:fill-amber-700',
    label: 'Crítico',
    rango: `< ${OTIF_PISO}%`,
  },
  bajoMeta: {
    fillClass: 'fill-amber-600 dark:fill-amber-500',
    swatchClass: 'bg-amber-600 dark:bg-amber-500',
    selectedClass: 'fill-amber-700 dark:fill-amber-600',
    label: 'Bajo meta',
    rango: `${OTIF_PISO}–${OTIF_META - 1}%`,
  },
  enMeta: {
    fillClass: 'fill-amber-400 dark:fill-amber-400',
    swatchClass: 'bg-amber-400 dark:bg-amber-400',
    selectedClass: 'fill-amber-500 dark:fill-amber-500',
    label: 'En meta',
    rango: `≥ ${OTIF_META}%`,
  },
  desactivadoClass: 'fill-amber-200/70 dark:fill-amber-200/20',
} as const;

type OtifSeveridad = 'critico' | 'bajoMeta' | 'enMeta';

/** Sufijo del token de estado para el texto del rótulo de cada barra. */
const severidadTexto: Record<OtifSeveridad, 'critical' | 'warn' | 'good'> = {
  critico: 'critical',
  bajoMeta: 'warn',
  enMeta: 'good',
};

function otifSeverity(otifPct: number): OtifSeveridad {
  if (otifPct < OTIF_PISO) return 'critico';
  if (otifPct < OTIF_META) return 'bajoMeta';
  return 'enMeta';
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
                         dark. En `style` el var() sí se resuelve.

                         La severidad se escribe en palabras además del color
                         (AGENTS §3.3): en la etiqueta ya se lee si la ruta
                         está en meta o no, sin depender del tono de la barra. */
                      style={{
                        fill: `hsl(var(--status-${severidadTexto[otifSeverity(otif)]}))`,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatPercent(otif)}
                    </text>
                    <text
                      textAnchor="end"
                      dy={21}
                      fontSize={8}
                      fill="hsl(var(--muted-foreground))"
                    >
                      {OTIF_RAMP[otifSeverity(otif)].label}
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
            {/* `style` y no el atributo `fill`: una custom property NO resuelve dentro de
                un atributo de presentación SVG. Con #10b981 directo el rótulo
                quedaba en 2,54:1 sobre superficie clara, por debajo del 4,5:1
                de WCAG AA para texto normal; ahora usa el token --status-good,
                que ya está calibrado y tiene su variante dark. */}
            <ReferenceLine
              x={OTIF_META}
              stroke="hsl(var(--status-good))"
              strokeDasharray="3 3"
              label={{
                value: 'Meta 95%',
                position: 'top',
                fontSize: 10,
                style: { fill: 'hsl(var(--foreground))' },
              }}
            />
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
                /* Rampa ÁMBAR única, no tricolor.
                   AGENTS §3.2 fija un solo color de acento por dashboard y el de
                   Logística es el ámbar. Antes cada barra salía en uno de TRES
                   colores (#e11d48/#d97706/#059669) y el estado viajaba solo por
                   el color, sin etiqueta: en gris, daltónico o impreso en B/N
                   el nivel de incumplimiento era indistinguible.

                   Ahora la severidad se codifica en la INTENSIDAD de un solo
                   hue, y el estado textual ("Crítico" / "Bajo SLA" / "En meta")
                   va explícito junto al porcentaje. La longitud de la barra sigue
                   siendo la señal primaria, que es la que no depende del color. */
                const severidad = otifSeverity(entry.otifPct);
                return (
                  <Cell
                    key={`ruta-cell-${index}`}
                    className={
                      isFilteredOut
                        ? OTIF_RAMP.desactivadoClass
                        : isSelected
                          ? OTIF_RAMP[severidad].selectedClass
                          : OTIF_RAMP[severidad].fillClass
                    }
                    opacity={isFilteredOut ? 0.35 : 1}
                  />
                );
              })}
            </Bar>
            {/* Leyenda de estado: sin esto, la rampa es una escala de color sin
                decodificador. Cada nivel dice su nombre y su corte. */}
            <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {(['critico', 'bajoMeta', 'enMeta'] as const).map((nivel) => (
                <li key={nivel} className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className={`w-2.5 h-2.5 rounded-sm shrink-0 ${OTIF_RAMP[nivel].swatchClass}`}
                  />
                  <span className="font-medium text-foreground">{OTIF_RAMP[nivel].label}</span>
                  <span className="tabular-nums">{OTIF_RAMP[nivel].rango}</span>
                </li>
              ))}
            </ul>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
