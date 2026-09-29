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
  highlightVariant = 'retail',
}: KpiCardProps) {
  // Cálculo de delta porcentual
  let deltaPct: number | null = null;
  if (previousValue && previousValue > 0) {
    deltaPct = parseFloat((((value - previousValue) / previousValue) * 100).toFixed(1));
  }

  // Formato del valor principal
  let formattedValue = '';
  if (unit === 'CLP') {
    formattedValue = formatCLP(value);
  } else if (unit === '%') {
    formattedValue = formatPercent(value);
  } else if (unit === 'pts') {
    formattedValue = `${Math.round(value)} pts`;
  } else {
    formattedValue = formatNumber(value);
  }

  // Delta positivo o negativo
  const isPositive = deltaPct !== null && deltaPct > 0;
  const isNegative = deltaPct !== null && deltaPct < 0;
  const isNeutral = deltaPct !== null && deltaPct === 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-border/80">
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1">
          {label}
          {metricKey && <GlossaryTooltip metricKey={metricKey} />}
        </span>

        {deltaPct !== null && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : isNegative
                ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                : 'text-muted-foreground bg-muted'
            }`}
            title={`Variación respecto al período anterior: ${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            <span className="tabular-nums">
              {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 my-1">
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground tabular-nums leading-none">
          {formattedValue}
        </div>
      </div>

      {benchmark !== undefined && (
        <div className="pt-2.5 mt-1 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Meta: <strong className="text-foreground font-medium tabular-nums">{unit === 'CLP' ? formatCLP(benchmark) : `${benchmark}${unit}`}</strong>
          </span>
          {benchmarkSource && (
            <span className="truncate max-w-[120px] md:max-w-[150px] text-muted-foreground/75" title={benchmarkSource}>
              {benchmarkSource}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
