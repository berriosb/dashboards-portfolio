'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/icons';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-background/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        {/* Info y Propósito */}
        <div className="space-y-1 text-center md:text-left">
          <p className="font-semibold text-foreground">
            Chile Business Intelligence & Analytics Showcase
          </p>
          <p className="text-[11px] leading-relaxed max-w-xl">
            Desarrollado para demostrar capacidades técnicas de arquitectura frontend, modelamiento analítico en memoria (0ms) y diseño de dashboards ejecutivos según estándares chilenos (CCS, CMF, OTIF).
          </p>
        </div>

        {/* Stack Técnico */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-muted font-mono">Next.js 16</span>
          <span className="px-2 py-0.5 rounded bg-muted font-mono">React 19</span>
          <span className="px-2 py-0.5 rounded bg-muted font-mono">TypeScript 5.7</span>
          <span className="px-2 py-0.5 rounded bg-muted font-mono">Tailwind 4</span>
          <span className="px-2 py-0.5 rounded bg-muted font-mono">Recharts</span>
          <span className="px-2 py-0.5 rounded bg-muted font-mono">nuqs</span>
        </div>

        {/* Enlaces Sociales / Perfil */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/bastianberrios"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/bastianberrios"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
