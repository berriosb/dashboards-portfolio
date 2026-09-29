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
}

export function KpiCard({
  label,
  value,
  previousValue,
  unit,
  metricKey,
  benchmark,
  benchmarkSource,
}: KpiCardProps) {
  // Cálculo de delta porcentual
  let deltaPct: number | null = null;
  if (previousValue && previousValue > 0) {
    deltaPct = parseFloat((((value - previousValue) / previousValue) * 100).toFixed(1));
  }

  // Formato del valor principal
  let formattedValue = '';
  if (unit === 'CLP') {
    if (Math.abs(value) >= 1_000_000_000) {
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

  // Calibración tipográfica responsiva para evitar desbordes en cifras largas
  const textSizeClass =
    formattedValue.length >= 10
      ? 'text-lg sm:text-xl lg:text-[19px] xl:text-[18px]'
      : formattedValue.length >= 8
      ? 'text-xl sm:text-2xl lg:text-xl xl:text-xl'
      : 'text-2xl sm:text-3xl lg:text-2xl xl:text-2xl';

  // Delta positivo o negativo
  const isPositive = deltaPct !== null && deltaPct > 0;
  const isNegative = deltaPct !== null && deltaPct < 0;
  const isNeutral = deltaPct !== null && deltaPct === 0;

  return (
    <div className="bg-card/90 dark:bg-card/60 rounded-xl border border-border/70 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between transition-all duration-150 hover:border-border">
      <div className="flex items-start justify-between gap-1 mb-1.5 min-w-0">
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1 leading-snug" title={label}>
          <span>{label}</span>
          {metricKey && <GlossaryTooltip metricKey={metricKey} />}
        </span>

        {deltaPct !== null && (
          <div
            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1 py-0.5 rounded shrink-0 ${
              isPositive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : isNegative
                ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                : 'text-muted-foreground bg-muted'
            }`}
            title={`Variación vs anterior: ${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
          >
            {isPositive && <ArrowUpRight className="w-2.5 h-2.5" />}
            {isNegative && <ArrowDownRight className="w-2.5 h-2.5" />}
            {isNeutral && <Minus className="w-2.5 h-2.5" />}
            <span className="tabular-nums font-mono">
              {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
            </span>
          </div>
        )}
      </div>

      <div className="my-1">
        <div className={`${textSizeClass} font-extrabold tracking-tight text-foreground tabular-nums leading-none truncate`}>
          {formattedValue}
        </div>
      </div>

      {benchmark !== undefined && (
        <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between text-[10.5px] text-muted-foreground gap-1">
          <span className="truncate">
            Meta: <strong className="text-foreground font-medium tabular-nums">{unit === 'CLP' ? formatCLP(benchmark, { compact: true }) : `${benchmark}${unit}`}</strong>
          </span>
          {benchmarkSource && (
            <span className="truncate text-muted-foreground/75 text-[10px]" title={benchmarkSource}>
              {benchmarkSource}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
