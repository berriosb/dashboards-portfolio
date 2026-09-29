'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareViewButtonProps {
  label?: string;
  className?: string;
}

export function ShareViewButton({
  label = 'Compartir vista',
  className = '',
}: ShareViewButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Fallback si clipboard API falla
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copiar enlace con filtros actuales al portapapeles"
      className={`inline-flex items-center gap-1.5 text-xs font-medium h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            ¡Enlace copiado!
          </span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
