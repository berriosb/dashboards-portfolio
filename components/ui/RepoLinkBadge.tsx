import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

/**
 * Dueño y repositorio de este portfolio. El badge apunta acá y no a repos
 * hermanos: la evidencia reproducible (generadores con seed fijo, validador de
 * invariantes y calibración de bandas) vive en `scripts/` de este mismo repo y
 * se verifica con `pnpm data:generate`. Prometer repos externos que no existen
 * convertía el hook de empleabilidad en un enlace roto en la landing y en el
 * header de cada dashboard.
 */
const REPO_OWNER = 'berriosb';
const REPO_NAME = 'dashboards-portfolio';

/** Carpeta con los tres generadores, el validador y el calibrador de bandas. */
export const PIPELINE_PATH = '/tree/main/scripts';

interface RepoLinkBadgeProps {
  /** Qué artefacto muestra el badge, p. ej. "Pipeline de datos". */
  label: string;
  /** Ruta dentro del repo a la que lleva el enlace. */
  path?: string;
  description?: string;
  variant?: 'pill' | 'button';
}

export function RepoLinkBadge({
  label,
  path = PIPELINE_PATH,
  description = 'Evidencia técnica',
  variant = 'button',
}: RepoLinkBadgeProps) {
  const targetUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}${path}`;
  const repoFullName = `${REPO_OWNER}/${REPO_NAME}`;

  if (variant === 'pill') {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 min-h-11 tap-target px-3 rounded-full border border-border/80 bg-card/80 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title={`Generadores con seed fijo y validador de invariantes en github.com/${repoFullName}`}
      >
        <GithubIcon className="w-3.5 h-3.5 text-foreground transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline text-muted-foreground">{description}:</span>
        <span className="font-semibold text-foreground underline decoration-muted-foreground/40 underline-offset-2 group-hover:decoration-foreground">
          {label}
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
        {/* Sin aria-label para no romper WCAG 2.5.3: el nombre accesible sale del
            contenido visible y el destino se agrega por acá. */}
        <span className="sr-only">, ver el pipeline que genera estos datos</span>
      </a>
    );
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      title={`Pipeline reproducible: seed fijo, validador de invariantes y calibración de bandas en github.com/${repoFullName}`}
    >
      <GithubIcon className="w-3.5 h-3.5 text-foreground transition-transform group-hover:scale-110" />
      <span className="hidden 2xl:inline text-muted-foreground">{description}:</span>
      <span className="font-semibold text-foreground">{label}</span>
      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
      <span className="sr-only">, ver el pipeline que genera estos datos</span>
    </a>
  );
}
