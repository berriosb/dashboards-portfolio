export type CompareMode = 'auto' | 'anioAnterior';

export interface DateWindow {
  start: string;
  end: string;
}

export interface DatasetPeriod {
  periodoInicio: string;
  periodoFin: string;
}

const MS_PER_DAY = 86_400_000;

export function toUtcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysInWindow(window: DateWindow): number {
  const start = toUtcDate(window.start).getTime();
  const end = toUtcDate(window.end).getTime();
  return Math.floor((end - start) / MS_PER_DAY) + 1;
}

export function daysInPeriod(period: DatasetPeriod): number {
  return daysInWindow({ start: period.periodoInicio, end: period.periodoFin });
}

/**
 * Fracción del dataset total que cubre la ventana activa.
 * Se usa para normalizar benchmarks que son acumulados del período completo
 * (ej. "meta anual de colocaciones") a la ventana visible.
 */
export function windowFraction(
  window: DateWindow,
  period: DatasetPeriod
): number {
  const total = daysInPeriod(period);
  if (total <= 0) return 0;
  const visible = daysInWindow(window);
  return Math.max(0, Math.min(1, visible / total));
}

/**
 * Calcula la ventana de comparación.
 *
 * - `auto`: misma longitud, inmediatamente anterior. Es la opción por defecto
 *   porque siempre es coherente con el filtro activo y no requiere UI.
 * - `anioAnterior`: mismo mes/año desplazado 12 meses (comparable contra estacionalidad).
 *
 * Devuelve `null` si la ventana cae fuera de la cobertura del dataset. En ese
 * caso el llamador debe omitir el delta en lugar de mostrar una variación inventada.
 */
export function previousWindow(
  window: DateWindow,
  period: DatasetPeriod,
  mode: CompareMode = 'auto'
): DateWindow | null {
  if (mode === 'anioAnterior') {
    const prevEnd = shiftYear(window.end, -1);
    const prevStart = shiftYear(window.start, -1);
    if (prevEnd < period.periodoInicio || prevStart > period.periodoFin) return null;
    return { start: prevStart, end: prevEnd };
  }

  const length = daysInWindow(window);
  if (length <= 0) return null;

  const prevEnd = addDays(window.start, -1);
  const prevStart = addDays(prevEnd, -(length - 1));

  if (prevEnd < period.periodoInicio || prevStart > period.periodoFin) return null;
  return { start: prevStart, end: prevEnd };
}

export function addDays(iso: string, days: number): string {
  const date = toUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function shiftYear(iso: string, years: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year + years, month - 1, day));
  return toIsoDate(date);
}

/**
 * Metadata de la ventana activa: qué días cubre, qué fracción del dataset
 * representa y contra qué ventana se compara.
 *
 * `previous` es `null` cuando la ventana comparable cae fuera de la cobertura
 * del dataset. Los llamadores deben entonces OMITIR el delta en vez de
 * mostrar 0%: un 0,0% acá significaría "no tengo dato", que se lee como
 * "no se movió".
 */
export interface WindowMeta {
  start: string;
  end: string;
  days: number;
  fraction: number;
  previous: DateWindow | null;
}

export function describeWindow(
  window: DateWindow,
  period: DatasetPeriod,
  mode: CompareMode = 'auto'
): WindowMeta {
  return {
    start: window.start,
    end: window.end,
    days: daysInWindow(window),
    fraction: windowFraction(window, period),
    previous: previousWindow(window, period, mode),
  };
}
