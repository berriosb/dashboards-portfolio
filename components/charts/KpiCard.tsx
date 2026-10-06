import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Check, AlertTriangle } from 'lucide-react';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { formatCLP, formatPercent, formatNumber, formatDecimal } from '@/lib/format';
import { MiniSparkline } from './MiniSparkline';

interface KpiCardProps {
  label: string;
  value: number;
  /**
   * Valor del período comparable anterior.
   *
   * `null` significa "no hay período anterior dentro de la cobertura del
   * dataset" y la tarjeta se muestra SIN badge de variación. Antes se usaba un
   * número fijo (38,5 / 42000) o el propio valor por 0,94, lo que producía un
   * delta plausible que nunca cambiaba con el filtro.
   */
  previousValue?: number | null;
  unit: string;
  metricKey?: string;
  /**
   * Meta ya resuelta a la ventana visible. `null` oculta la fila de meta.
   * Para métricas `flow` la tarjeta recibe la meta prorateada y
   * `benchmarkProrated` lo declara en pantalla, en vez de comparar un filtro
   * de 30 días contra un presupuesto anual.
   */
  benchmark?: number | null;
  benchmarkSource?: string;
  benchmarkLabel?: string;
  benchmarkProrated?: boolean;
  highlightVariant?: 'retail' | 'banca' | 'logistica';
  trendDirection?: 'higher-is-better' | 'lower-is-better' | 'neutral';
  isHero?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
  targetProgress?: {
    current: number;
    target: number;
    label?: string;
  };
}

export function KpiCard({
  label,
  value,
  previousValue,
  unit,
  metricKey,
  benchmark,
  benchmarkSource,
  benchmarkLabel,
  benchmarkProrated = false,
  highlightVariant = 'retail',
  trendDirection = 'higher-is-better',
  isHero = false,
  sparklineData,
  sparklineColor,
  targetProgress,
}: KpiCardProps) {
  // Variación contra el período comparable. `null` = no hay comparación
  // posible, y en ese caso NO se muestra nada. Un 0,0% acá se leería como
  // "no se movió", que es un dato distinto de "no tengo el anterior".
  let deltaPct: number | null = null;
  if (previousValue !== undefined && previousValue !== null && previousValue > 0) {
    deltaPct = parseFloat((((value - previousValue) / previousValue) * 100).toFixed(1));
  }

  let formattedValue = '';
  if (unit === 'CLP') {
    if (Math.abs(value) >= 10_000_000) {
      formattedValue = formatCLP(value, { compact: true });
    } else {
      formattedValue = formatCLP(value);
    }
  } else if (unit === '%') {
    formattedValue = formatPercent(value);
  } else if (unit === 'pts') {
    formattedValue = `${Math.round(value)} pts`;
  } else if (unit === 'hrs') {
    // `toFixed` devuelve punto y el valor grande de la card convive con otros
    // porcentajes de la misma fila: "38.0 hrs" al lado de "89,4%".
    formattedValue = `${formatDecimal(value, 1)} hrs`;
  } else {
    formattedValue = formatNumber(value);
  }

  const isUp = deltaPct !== null && deltaPct > 0;
  const isDown = deltaPct !== null && deltaPct < 0;
  const isNeutral = deltaPct !== null && deltaPct === 0;

  // `text-muted-foreground` sobre `bg-muted` daba 4.40:1, apenas bajo el 4.5:1 de
  // WCAG AA. Un delta de 0% no necesita color para leerse, así que va en
  // foreground: neutro igual, pero legible.
  let deltaColorClass = 'text-foreground bg-muted';
  if (deltaPct !== null && !isNeutral) {
    if (trendDirection === 'neutral') {
      deltaColorClass = 'text-foreground bg-muted/80';
    } else if (trendDirection === 'lower-is-better') {
      deltaColorClass = isUp
        ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/50 dark:border-rose-900/40'
        : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-900/40';
    } else {
      deltaColorClass = isUp
        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-900/40'
        : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/50 dark:border-rose-900/40';
    }
  }

  const defaultSparklineColor = {
    retail: '#2563eb',
    banca: '#059669',
    logistica: '#d97706',
  }[highlightVariant];

  const activeSparklineColor = sparklineColor || defaultSparklineColor;

  const hasBenchmark = typeof benchmark === 'number' && benchmark > 0;
  const isLowerBetter = trendDirection === 'lower-is-better' && hasBenchmark;

  // Cumplimiento de la meta. Para "más es mejor" es value/benchmark y se
  // muestra sin tope: 130% de meta y 105% son cosas distintas y antes ambas se
  // veían como 100% por el clamp.
  //
  // Para "menos es mejor" (mora, lead time, costo) una barra de "avance" al
  // revés se lee mal — 2,4% de mora contra meta 2,5% es una barra casi llena
  // cuando en realidad se está cumpliendo. Ahí se muestra estado con texto e
  // icono, nunca color solo (WCAG).
  const cumplimientoPct = hasBenchmark
    ? trendDirection === 'lower-is-better'
      ? null
      : (value / benchmark) * 100
    : null;

  const barPct =
    targetProgress && targetProgress.target > 0
      ? Math.min(100, Math.max(0, (targetProgress.current / targetProgress.target) * 100))
      : cumplimientoPct !== null
        ? Math.min(100, Math.max(0, cumplimientoPct))
        : null;

  const cumpleMeta = isLowerBetter ? value <= (benchmark as number) : true;
  const formatMeta = (n: number) => (unit === 'CLP' ? formatCLP(n, { compact: true }) : `${n}${unit}`);

  /* Estado de cumplimiento, para hero y no-hero alike.
     Antes el chip "Sobre/Bajo meta" solo se pintaba en la rama `isLowerBetter`
     (mora, lead time, costo), así que la KPI hero más importante de
     Logística —Cumplimiento OTIF— quedaba sin ninguno: se leía "89,8% · Meta:
     95% · 95%" y el "95%" de la derecha, que es el porcentaje de meta, se
     tomaba por el valor. Para "más es mejor" el estado sale de la misma
     comparación, con icono y texto para no depender del color (AGENTS §3.3). */
  const cumpleObjetivo =
    hasBenchmark && (trendDirection === 'lower-is-better' ? value <= benchmark : value >= benchmark);

  return (
    <div
      className={`bg-card rounded-xl border border-border/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between transition-all duration-150 hover:border-border hover:shadow-xs ${
        isHero ? 'min-h-[148px] space-y-2' : 'min-h-[108px]'
      }`}
    >
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <span
          className={`flex items-center gap-1 leading-snug truncate ${
            isHero
              ? 'text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'
              : 'text-[11px] sm:text-xs font-medium text-muted-foreground'
          }`}
          title={label}
        >
          <span className="truncate">{label}</span>
          {metricKey && (
            <GlossaryTooltip
              metricKey={metricKey}
              benchmark={hasBenchmark ? (benchmark as number) : undefined}
              benchmarkSource={benchmarkSource}
              benchmarkLabel={benchmarkProrated ? benchmarkLabel : undefined}
            />
          )}
        </span>

        {deltaPct !== null && (
          <div
            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${deltaColorClass}`}
            title={`Variación vs período anterior: ${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
          >
            {isUp && <ArrowUpRight className="w-2.5 h-2.5" />}
            {isDown && <ArrowDownRight className="w-2.5 h-2.5" />}
            {isNeutral && <Minus className="w-2.5 h-2.5" />}
            <span className="tabular-nums font-mono">
              {/* Coma decimal: el delta se leía "-7.3%" mientras el valor de la
                  misma tarjeta decía "$37,7M". Dos convenciones numéricas en
                  dos líneas contiguas de la misma card. */}
              {deltaPct > 0 ? '+' : ''}
              {formatDecimal(deltaPct, 1)}%
            </span>
          </div>
        )}
      </div>

      <div className="my-0.5 flex items-baseline justify-between gap-2">
        <div
          className={`font-bold tracking-tight text-foreground tabular-nums leading-tight ${
            isHero ? 'text-2xl sm:text-3xl font-extrabold' : 'text-xl sm:text-2xl'
          }`}
        >
          {formattedValue}
        </div>
      </div>

      {isHero && sparklineData && sparklineData.length > 1 && (
        <div className="py-1">
          <MiniSparkline data={sparklineData} color={activeSparklineColor} height={26} />
        </div>
      )}

      {/* Barra de meta para métricas donde "más es mejor". El porcentaje se
          muestra sin clipear: exceder la meta es información, no un tope. */}
      {isHero && barPct !== null && (
        <div className="space-y-1 pt-1.5 border-t border-border/60">
          <div className="flex items-center justify-between gap-2 text-[10.5px] text-muted-foreground">
            <span className="min-w-0 truncate">
              {benchmarkLabel ?? 'Meta'}:{' '}
              <strong className="text-foreground font-medium tabular-nums">
                {hasBenchmark ? formatMeta(benchmark as number) : '—'}
              </strong>
            </span>
            {/* Rótulo explícito del porcentaje. Un "95%" suelto al lado de
                "Meta: 95%" se leía como el valor de la métrica, que era
                justamente lo que pasaba en Cumplimiento OTIF. Además el estado
                se dice con icono y palabra, no solo con color (AGENTS §3.3). */}
            <span
              className="shrink-0 inline-flex items-center gap-1 font-semibold text-foreground text-[10px] tabular-nums"
              title={`${Math.round(cumplimientoPct as number)}% de la meta ${formatMeta(benchmark as number)}`}
            >
              {cumpleObjetivo ? (
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              )}
              {Math.round(cumplimientoPct as number)}% de la meta
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${barPct}%`,
                backgroundColor: activeSparklineColor,
              }}
            />
          </div>
          {benchmarkProrated && (
            <p className="text-[9.5px] text-muted-foreground leading-tight">
              Meta anual prorateada a la ventana visible
            </p>
          )}
        </div>
      )}

      {/* Estado con texto para métricas donde "menos es mejor" */}
      {isLowerBetter && (
        <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between gap-1 text-[10.5px]">
          <span className="truncate text-muted-foreground">
            {benchmarkLabel ?? 'Límite'}:{' '}
            <strong className="text-foreground font-medium tabular-nums">{formatMeta(benchmark as number)}</strong>
          </span>
          <span
            className={`inline-flex items-center gap-1 font-medium shrink-0 ${
              cumpleMeta ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {cumpleMeta ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {cumpleMeta ? 'Bajo meta' : 'Sobre meta'}
          </span>
        </div>
      )}

      {/* Referencia simple para el resto de tarjetas no-hero.

          `benchmarkLabel` y `benchmarkSource` competían por el mismo flex con
          `truncate` en ambos, y el que perdía era siempre el VALOR de la meta:
          se veía "Meta: $2…" y "Meta del período visible (pror…". Un objetivo
          que no se puede leer no permite calcular el gap, que es justo para lo
          que está. Ahora el valor nunca se recorta y la fuente pasa a una
          segunda línea, que sí tiene ancho para leerse completa. */}
      {!isHero && !isLowerBetter && (
        <div className="pt-2 mt-1 border-t border-border/50 flex flex-col gap-0.5 text-[10.5px] text-muted-foreground">
          {hasBenchmark ? (
            <>
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate">
                  {benchmarkLabel ?? 'Meta'}:{' '}
                  <strong className="text-foreground font-medium tabular-nums">{formatMeta(benchmark)}</strong>
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-medium shrink-0 ${
                    cumpleObjetivo
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {cumpleObjetivo ? (
                    <Check className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  )}
                  {cumpleObjetivo ? 'Cumple' : 'No cumple'}
                </span>
              </span>
              {benchmarkSource && (
                <span className="text-[10px] leading-tight" title={benchmarkSource}>
                  {benchmarkSource}
                </span>
              )}
            </>
          ) : (
            <span className="truncate text-muted-foreground">
              {benchmarkSource ?? 'Sin meta de referencia'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
