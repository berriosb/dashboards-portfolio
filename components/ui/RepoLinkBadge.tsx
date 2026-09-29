import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

interface RepoLinkBadgeProps {
  repoName: string;
  repoUrl?: string;
  description?: string;
}

export function RepoLinkBadge({
  repoName,
  repoUrl = 'https://github.com/bastianberrios/dashboards-portfolio',
  description = 'Evidencia técnica reproducible',
}: RepoLinkBadgeProps) {
  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`Ver código fuente en GitHub: ${repoName}`}
    >
      <GithubIcon className="w-3.5 h-3.5 text-foreground transition-transform group-hover:scale-110" />
      <span>{description}:</span>
      <span className="font-semibold text-foreground underline decoration-muted-foreground/40 underline-offset-2 group-hover:decoration-foreground">
        {repoName}
      </span>
      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
    </a>
  );
}
