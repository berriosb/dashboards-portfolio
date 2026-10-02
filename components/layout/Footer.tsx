'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-card/50 py-6 px-4 sm:px-6 lg:px-8 mt-auto no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Info y Propósito */}
        <div className="space-y-1 text-center md:text-left">
          <p className="font-semibold text-foreground tracking-tight">
            OmniBI Analytics Suite · Chile Enterprise Edition
          </p>
          <p className="text-[11px] leading-relaxed max-w-2xl text-muted-foreground">
            Modelamiento y simulación determinista para el mercado corporativo chileno bajo normativas CMF (Banca), estándares CCS (Retail) y acuerdos de nivel de servicio SLA / EDI (Logística). Datos sintéticos generados en memoria para benchmarking y toma de decisiones.
          </p>
        </div>

        {/* Gobernanza y Versionado */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] text-muted-foreground shrink-0">
          <span className="inline-flex items-center gap-1.5 font-mono">
            {/* Decorativo: el significado ("motor operativo") ya lo carga el
                texto contiguo, así que el punto no necesita ser anunciado ni
                depender del color para entenderse (WCAG 1.4.1). Se mantiene el
                verde de estado del sistema, que es el mismo que usa el badge
                del header; no es el acento de negocio del dashboard. */}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            0ms In-Memory Client Engine
          </span>
          {/* Separador decorativo: se oculta a lectores de pantalla porque es
              puntuación, no contenido. Va en muted-foreground y no en border
              para no quedar en 1.27:1 contra el fondo de la card. */}
          <span aria-hidden="true" className="hidden sm:inline text-muted-foreground">
            •
          </span>
          <span className="font-mono">v2.5 Enterprise Release</span>
        </div>
      </div>
    </footer>
  );
}
