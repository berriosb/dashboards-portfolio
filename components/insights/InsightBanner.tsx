import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface InsightBannerProps {
  titulo: string;
  descripcion: string;
  accionRecomendada: string;
  variant?: 'retail' | 'banca' | 'logistica';
  /**
   * Nivel del título. Por defecto `h2`: el banner es la primera sección después
   * del `h1` de la página y antes iba en `h3`, dejando un salto h1 → h3.
   */
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export function InsightBanner({
  titulo,
  descripcion,
  accionRecomendada,
  variant = 'retail',
  headingLevel: Heading = 'h2',
}: InsightBannerProps) {
  const config = {
    retail: {
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      severity: 'Impacto Comercial',
    },
    banca: {
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      // Antes decía "Alerta Regulatoria CMF", pero el hallazgo del banner es
      // sobre mora 30+, que NO es un indicador reportado a la CMF: es el umbral
      // interno de alerta temprana. Rotularlo como regulatorio contradecía la
      // corrección aplicada al chart, que separa la banda de referencia del
      // proyecto de los límites regulatorios.
      severity: 'Alerta Temprana Interna',
    },
    logistica: {
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      severity: 'Eficiencia Operacional SLA',
    },
  }[variant];

  return (
    <div
      className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs transition-all"
      role="region"
      aria-label="Resumen ejecutivo y hallazgo analítico"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Ícono de Inteligencia de Negocio */}
        <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border/60 flex items-center justify-center shrink-0 self-start">
          <Lightbulb className={`w-4 h-4 ${config.iconColor}`} />
        </div>

        {/* Contenido Analítico */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border font-mono ${config.badge}`}
            >
              {config.severity}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Informe Analítico Automatizado
            </span>
          </div>

          <Heading className="font-bold text-foreground text-sm sm:text-base tracking-tight leading-snug">
            {titulo}
          </Heading>

          <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed text-pretty">
            {descripcion}
          </p>

          {/* Bloque de Acción Ejecutiva Recomendada */}
          <div className="mt-2.5 pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-muted/30 -mx-1 px-3 py-2 rounded-lg border">
            <div className="flex items-start sm:items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-foreground shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                Decisión Sugerida:
              </span>
              <span className="text-foreground/90 font-medium leading-normal">{accionRecomendada}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
