'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface PrintReportButtonProps {
  label?: string;
  className?: string;
}

export function PrintReportButton({
  label = 'Informe PDF',
  className = '',
}: PrintReportButtonProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`inline-flex items-center gap-1.5 text-xs font-medium h-8 px-2.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      title="Generar o imprimir informe ejecutivo en PDF (formato A4 apaisado)"
      aria-label="Imprimir informe ejecutivo en PDF"
    >
      <Printer className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
