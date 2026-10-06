/**
 * Formateo numérico de es-CL.
 *
 * Las cifras salen de un solo lugar. Si el separador decimal o el de miles se
 * escriben a mano en un componente, el mismo número aparece con dos formatos
 * distintos en dos tarjetas de la misma pantalla, y en un dashboard chileno eso
 * se lee como scaffolding sin terminar.
 */

/**
 * Separador decimal chileno (coma) con un número fijo de decimales.
 *
 * Existe porque `Number.prototype.toFixed` SIEMPRE devuelve punto, y su
 * resultado se estaba pintando directo en el embudo: "83.3% fuga" al lado de
 * "16,7%" en la misma tarjeta. `.toFixed` no tiene formato de locale, por eso
 * el componente no podía arreglarse solo.
 */
export function formatDecimal(value: number, decimals: number = 1): string {
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Pesos chilenos en notación compacta.
 *
 * Decisiones que importan en el mercado local:
 *
 * - Miles van como `"mil"`, no `K`. La `K` es anglicismo y convivía con el
 *   resto de la app íntegramente en español.
 * - Millones van como `"M"` y, desde mil millones, se conserva la misma unidad
 *   con separador de miles: `$198.454M`. Antes se usaba `"B"` para 10⁹, y eso
 *   no es solo un anglicismo: en español chileno "billón" es 10¹², así que
 *   rotular 10⁹ como "billones" sería directamente falso.
 * - Nunca se inventa una abreviación nueva por debajo de mil: bajo ese
 *   umbral el número se muestra entero.
 */
export function formatCLP(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    const abs = Math.abs(amount);

    // Desde mil millones, la misma "M" con separador de miles: $198.454M.
    if (abs >= 1_000_000_000) {
      return `$${formatNumber(amount / 1_000_000)}M`;
    }
    if (abs >= 1_000_000) {
      return `$${formatDecimal(amount / 1_000_000, 1)}M`;
    }
    if (abs >= 1_000) {
      return `$${formatNumber(amount / 1_000)} mil`;
    }
  }

  return `$${formatNumber(amount)}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${formatDecimal(value, decimals)}%`;
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