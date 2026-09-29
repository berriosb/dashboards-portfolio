import React from 'react';
import { FilterX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  variant?: 'retail' | 'banca' | 'logistica';
}

export function EmptyState({
  title = 'No se encontraron registros',
  description = 'No existen operaciones que coincidan con la combinación de filtros aplicada para este período.',
  onResetFilters,
  variant = 'retail',
}: EmptyStateProps) {
  const accentBtn = {
    retail: 'bg-blue-600 hover:bg-blue-700',
    banca: 'bg-emerald-600 hover:bg-emerald-700',
    logistica: 'bg-amber-600 hover:bg-amber-700',
  }[variant];

  return (
    <div
      role="status"
      className="w-full rounded-2xl border border-dashed border-border bg-card/60 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 my-6"
    >
      <div className="p-3.5 rounded-full bg-muted text-muted-foreground">
        <FilterX className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all shadow-xs ${accentBtn}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer todos los filtros</span>
        </button>
      )}
    </div>
  );
}
