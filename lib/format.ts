export function formatCLP(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      const b = (amount / 1_000_000_000).toFixed(1).replace('.', ',');
      return `$${b}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      const m = (amount / 1_000_000).toFixed(1).replace('.', ',');
      return `$${m}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      const k = (amount / 1_000).toFixed(0);
      return `$${k}K`;
    }
  }

  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('es-CL').format(rounded);
  return `$${formatted}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  const formatted = value.toFixed(decimals).replace('.', ',');
  return `${formatted}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CL').format(Math.round(value));
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
