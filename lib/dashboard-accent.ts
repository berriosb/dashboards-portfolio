/**
 * Acento semántico por dashboard.
 *
 * AGENTS.md exige un MÁXIMO de un color de acento por dashboard (Retail azul,
 * Banca emerald, Logística ámbar) y prohibe el efecto arcoíris. Varios
 * componentes compartidos por los tres tableros (el toggle de tema del header,
 * el exportador CSV de las filter bars) no pueden fijar un color, porque el
 * mismo componente se monta en dashboards con acentos distintos y su color fijo
 * introducía un segundo acento en cada uno.
 *
 * La solución es derivar el acento del dashboard anfitrión a partir de la ruta,
 * con un fallback neutro fuera de los dashboards (landing, 404, SSR). Está en
 * `lib/` para que haya una sola fuente de verdad: antes estaba duplicado en
 * `components/ui/ThemeToggle.tsx` y `components/ui/ExportCsvButton.tsx`, y cada
 * copia podía derivar en un color distinto.
 */

type Acento = {
  /** Clases de texto del color de acento. */
  text: string;
  /** Color literal, para lo que Recharts exige pintar dentro del SVG. */
  hex: string;
};

/** Neutral para la landing y cualquier render fuera de router. */
export const ACENTO_NEUTRO: Acento = {
  text: 'text-muted-foreground',
  hex: '#64748b',
};

const ACENTOS: ReadonlyArray<readonly [string, Acento]> = [
  ['/retail', { text: 'text-blue-600 dark:text-blue-400', hex: '#2563eb' }],
  ['/banca', { text: 'text-emerald-600 dark:text-emerald-400', hex: '#059669' }],
  ['/logistica', { text: 'text-amber-600 dark:text-amber-400', hex: '#d97706' }],
];

/**
 * Resuelve el acento del dashboard que contiene la ruta dada.
 * `pathname` puede ser `null` durante el render en servidor.
 */
export function acentoDeRuta(pathname: string | null | undefined): Acento {
  if (!pathname) return ACENTO_NEUTRO;
  const entrada = ACENTOS.find(
    ([prefijo]) => pathname === prefijo || pathname.startsWith(`${prefijo}/`)
  );
  return entrada ? entrada[1] : ACENTO_NEUTRO;
}
