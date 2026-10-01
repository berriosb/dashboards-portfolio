'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { acentoDeRuta } from '@/lib/dashboard-accent';

interface ShareViewButtonProps {
  label?: string;
  className?: string;
}

export function ShareViewButton({
  label = 'Compartir vista',
  className = '',
}: ShareViewButtonProps) {
  const [copied, setCopied] = useState(false);
  // Este botón se monta en los tres dashboards: con emerald fijo metía un
  // segundo acento en Retail (azul) y Logística (ámbar). Toma el acento de la
  // ruta que lo monta, igual que el exportador CSV y el toggle de tema.
  const acento = acentoDeRuta(usePathname());

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
      // El nombre accesible cambia con el estado visible y en ambos casos
      // arranca por el texto que se ve (WCAG 2.5.3 Label in Name), para que
      // "Compartir vista" / "¡Enlace copiado!" activen el control por voz.
      aria-label={
        copied
          ? '¡Enlace copiado!'
          : `${label}: copiar enlace con filtros actuales al portapapeles`
      }
      className={`inline-flex items-center gap-1.5 text-xs font-medium min-h-11 px-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs ${className}`}
    >
      {copied ? (
        <>
          <Check className={`w-3.5 h-3.5 ${acento.text}`} />
          <span className={`${acento.text} font-semibold`}>
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
