'use client';

import React, { useState } from 'react';
import { Table, BarChart2 } from 'lucide-react';

interface ChartFrameProps {
  title: string;
  /**
   * `ReactNode` y no `string`: las descripciones que interpolan cifras
   * cambiantes (p. ej. "Mediana P50: 42 hrs") necesitan envolver el número en
   * un `<span className="tabular-nums">` para cumplir la regla de AGENTS §3 de
   * que ninguna cifra "baila" al cambiar de valor. Con `string` eso era
   * imposible y las cifras inevitably salían sin el tratamiento.
   */
  description?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  tableComponent?: React.ReactNode;
  headerAction?: React.ReactNode;
  ariaLabel: string;
  /**
   * Nivel del título de la card. Por defecto `h2`: cada card es una sección
   * hermana bajo el `h1` de la página, así que bajar a `h3`/`h4` dejaba saltos
   * en el outline (h1 → h3 → h4) que rompían la navegación por encabezados.
   */
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export function ChartFrame({
  title,
  description,
  badge,
  children,
  tableComponent,
  headerAction,
  ariaLabel,
  headingLevel: Heading = 'h2',
}: ChartFrameProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div
      className="bg-card rounded-xl border border-border p-4 md:p-5 shadow-xs flex flex-col justify-between min-w-0 w-full transition-all"
      role="region"
      aria-label={ariaLabel}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Heading className="font-semibold text-foreground text-sm md:text-base tracking-tight">
              {title}
            </Heading>
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground leading-normal">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}
          {tableComponent && (
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              aria-pressed={showTable}
              className="tap-target p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs flex items-center gap-1"
              title={showTable ? 'Ver gráfico' : 'Ver tabla de datos'}
              aria-label={showTable ? 'Ver gráfico' : 'Ver tabla de datos'}
            >
              {showTable ? <BarChart2 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="min-w-0 w-full flex-1 flex flex-col justify-center">
        {showTable && tableComponent ? tableComponent : children}
      </div>
    </div>
  );
}
