import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { GlossaryTooltip } from '@/components/ui/GlossaryTooltip';
import { formatCLP, formatPercent, formatNumber } from '@/lib/format';

interface KpiCardProps {
  label: string;
  value: number;
  previousValue?: number;
  unit: string;
  metricKey?: string;
  benchmark?: number;
  benchmarkSource?: string;
  highlightVariant?: 'retail' | 'banca' | 'logistica';
  trendDirection?: 'higher-is-better' | 'lower-is-better' | 'neutral';
}

export function KpiCard({
  label,
  value,
  previousValue,
  unit,
  metricKey,
  benchmark,
  benchmarkSource,
  trendDirection = 'higher-is-better',
}: KpiCardProps) {
  // Cálculo de delta porcentual
  let deltaPct: number | null = null;
  if (previousValue && previousValue > 0) {
    deltaPct = parseFloat((((value - previousValue) / previousValue) * 100).toFixed(1));
  }

  // Formato del valor principal
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
    formattedValue = `${value.toFixed(1)} hrs`;
  } else {
    formattedValue = formatNumber(value);
  }

  // Evaluación semántica del delta según trendDirection
  const isUp = deltaPct !== null && deltaPct > 0;
  const isDown = deltaPct !== null && deltaPct < 0;
  const isNeutral = deltaPct !== null && deltaPct === 0;

  let deltaColorClass = 'text-muted-foreground bg-muted';
  if (deltaPct !== null && !isNeutral) {
    if (trendDirection === 'neutral') {
      deltaColorClass = 'text-foreground bg-muted/80';
    } else if (trendDirection === 'lower-is-better') {
      // Subir es malo (rose), bajar es bueno (emerald)
      deltaColorClass = isUp
        ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/50 dark:border-rose-900/40'
        : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-900/40';
    } else {
      // higher-is-better: Subir es bueno (emerald), bajar es malo (rose)
      deltaColorClass = isUp
        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-900/40'
        : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/50 dark:border-rose-900/40';
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between min-h-[114px] transition-all duration-150 hover:border-border hover:shadow-xs">
      {/* Header: Label y Delta Badge */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5 min-w-0">
        <span
          className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1 leading-snug truncate"
          title={label}
        >
          <span className="truncate">{label}</span>
          {metricKey && <GlossaryTooltip metricKey={metricKey} />}
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
              {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
            </span>
          </div>
        )}
      </div>

      {/* Valor Hero Calibrado */}
      <div className="my-0.5">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums leading-tight">
          {formattedValue}
        </div>
      </div>

      {/* Benchmark o Footer Placeholder para alineación uniforme */}
      {benchmark !== undefined ? (
        <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between text-[10.5px] text-muted-foreground gap-1">
          <span className="truncate">
            Meta:{' '}
            <strong className="text-foreground font-medium tabular-nums">
              {unit === 'CLP' ? formatCLP(benchmark, { compact: true }) : `${benchmark}${unit}`}
            </strong>
          </span>
          {benchmarkSource && (
            <span className="truncate text-muted-foreground/75 text-[10px]" title={benchmarkSource}>
              {benchmarkSource}
            </span>
          )}
        </div>
      ) : (
        <div className="pt-2 mt-1 border-t border-transparent text-[10.5px] text-transparent select-none">
          -
        </div>
      )}
    </div>
  );
}
