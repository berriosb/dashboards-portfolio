'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/70 bg-background/60 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        {/* Info y Propósito */}
        <div className="space-y-1 text-center md:text-left">
          <p className="font-semibold text-foreground">
            Chile Business Intelligence & Analytics Showcase
          </p>
          <p className="text-[11px] leading-relaxed max-w-xl">
            Demostración técnica de alto desempeño en arquitectura frontend, modelamiento analítico en memoria (0ms) y diseño de dashboards ejecutivos según estándares chilenos (CCS, CMF, OTIF).
          </p>
        </div>

        {/* Badges de Stack Técnico */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground">
          <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">Next.js 16</span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">React 19</span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">Tailwind 4</span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">Recharts 3</span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">nuqs v2</span>
        </div>
      </div>
    </footer>
  );
}
