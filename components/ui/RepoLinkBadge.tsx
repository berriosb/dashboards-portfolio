import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

interface RepoLinkBadgeProps {
  repoName: string;
  repoUrl?: string;
  description?: string;
  variant?: 'pill' | 'button';
}

export function RepoLinkBadge({
  repoName,
  repoUrl,
  description = 'Evidencia técnica',
  variant = 'button',
}: RepoLinkBadgeProps) {
  const targetUrl =
    repoUrl || `https://github.com/berriosb/${repoName}`;

  if (variant === 'pill') {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-card/80 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <GithubIcon className="w-3.5 h-3.5 text-foreground transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline text-muted-foreground">{description}:</span>
        <span className="font-semibold text-foreground underline decoration-muted-foreground/40 underline-offset-2 group-hover:decoration-foreground">
          {repoName}
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
        {/* Sin aria-label para no romper WCAG 2.5.3: el nombre accesible sale del
            contenido visible y el destino se agrega por acá. */}
        <span className="sr-only">, ver código fuente en GitHub</span>
      </a>
    );
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      title={`Ver pipeline analítico reproducible en github.com/berriosb/${repoName}`}
    >
      <GithubIcon className="w-3.5 h-3.5 text-foreground transition-transform group-hover:scale-110" />
      <span className="hidden 2xl:inline text-muted-foreground">{description}:</span>
      <span className="font-semibold text-foreground">
        {repoName}
      </span>
      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
      <span className="sr-only">, ver código fuente reproducible en GitHub</span>
    </a>
  );
}
