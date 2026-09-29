import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface InsightBannerProps {
  titulo: string;
  descripcion: string;
  accionRecomendada: string;
  variant?: 'retail' | 'banca' | 'logistica';
}

export function InsightBanner({
  titulo,
  descripcion,
  accionRecomendada,
  variant = 'retail',
}: InsightBannerProps) {
  const styles = {
    retail: {
      bg: 'bg-blue-50/60 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-900/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
      actionText: 'text-blue-950 dark:text-blue-100',
    },
    banca: {
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
      actionText: 'text-emerald-950 dark:text-emerald-100',
    },
    logistica: {
      bg: 'bg-amber-50/60 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
      actionText: 'text-amber-950 dark:text-amber-100',
    },
  }[variant];

  return (
    <div
      className={`rounded-xl border ${styles.border} ${styles.bg} p-4 md:p-5 shadow-sm transition-all`}
      role="region"
      aria-label="Hallazgo analítico clave"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-3.5">
        <div className={`p-2 rounded-lg ${styles.iconBg} shrink-0 self-start`}>
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${styles.badge}`}>
              Hallazgo Analítico
            </span>
            <h3 className="font-semibold text-foreground text-sm md:text-base tracking-tight">
              {titulo}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {descripcion}
          </p>
          <div className="pt-2 flex items-start sm:items-center gap-2 text-xs md:text-sm font-medium">
            <span className="font-semibold text-foreground shrink-0 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              Acción recomendada:
            </span>
            <span className={`${styles.actionText} leading-tight`}>{accionRecomendada}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
