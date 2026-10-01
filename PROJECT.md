---
type: proyecto
created: 2026-09-29
updated: 2026-09-29
status: planning
stack: Next.js 16 + React 19 + TypeScript 5.7 + Tailwind 4
license: MIT
author: Bastián Berrios
goal: Vitrina showcase de dashboards para mercado chileno Data/BI
---

# dashboards-portfolio — Idea y especificación

## Objetivo

Crear un **proyecto showcase** (no un repositorio técnico más) que demuestre en 10 segundos que sabés hacer dashboards. Es el **front del portafolio**, no la evidencia dura.

**Este es front-end puro con datos embebidos y sintéticos generados por script.** El pipeline que produce y valida esos datos vive en `scripts/` de este mismo repo: los tres generadores con seed fijo, el validador de invariantes y el calibrador de bandas. No hay repos externos: la evidencia reproducible es el código de este repo, verificable con `pnpm data:generate` y `pnpm data:check`.

## Lo que NO es

- ❌ Un repositorio técnico con análisis reproducibles
- ❌ Un tutorial de dashboards
- ❌ Un clon de Power BI / Tableau
- ❌ Un dashboard empresarial de verdad (datos son sintéticos)
- ❌ Un producto SaaS (sin auth, sin persistencia, sin multi-tenant)

## Lo que este proyecto apunta a ser

Estado real: **planning**. Nada de lo siguiente está construido todavía; es el objetivo de la entrega.

- 🎯 Una **landing page** con 3 cards (retail / banca / logística)
- 🎯 **3 dashboards interactivos** completos (uno por industria)
- 🎯 Deployado en Vercel: `dashboards-portfolio.vercel.app`
- 🎯 Linkeado desde el profile README `berriosb/berriosb` como primer item
- 🎯 **Bonus de credibilidad:** los datasets sintéticos generados por un script
  determinista y validados por invariantes. Sin ser un repo de data engineering,
  demuestra rigor metodológico y evita el "datos inventados a mano".

## Stack — "el stack de oro"

| Capa | Tech | Por qué |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 | Estándar de la industria 2026, RSC, PPR |
| **Lenguaje** | TypeScript 5.7 strict | Type safety, mejor DX |
| **Estilos** | Tailwind CSS 4 + shadcn/ui | Velocidad de prototipado, `@theme` CSS-first sin configuración legacy |
| **Charts** | **Recharts 3.x** (puro) | Liviano, flexible, BI-grade. Se descarta Tremor por dependencias legacy de Tailwind v3 |
| **Heatmap & matriz** | CSS Grid + Radix Tooltips | Matriz RFM 5x5 nativa y accesible (evita hacks SVG en Recharts) |
| **Treemap** | **Descartado** → barra horizontal de cuotas | Recharts no tiene primitivo de treemap; se aplica el mismo criterio que en el heatmap |
| **Data viz icons** | Lucide icons + Radix primitives | Consistencia visual |
| **State & URL** | Zustand 5 + nuqs v2 | URL como única fuente de verdad de filtros; Zustand sólo para estado efímero de UI |
| **Tests** | Vitest | `lib/data-engine.ts` es lógica de negocio y es la única capa que merece tests |
| **Deploy** | **Vercel** (free tier) | Soporte Next.js nativo, HTTPS gratis, preview deploys por PR, $0/mes |
| **Package manager** | pnpm 9 | Rendimiento y estándar del ecosistema Next.js |

> ⚠️ **Versionado explícito:** Recharts queda pineado en la major `3.x` porque es la línea
> con soporte verificado de React 19. Al instalar, revisar `peerDependencies` antes de
> avanzar; el estimado de bundle (~144KB gzipped) depende de esta major.

## Estándares de Calidad y Skills de Agentes

El desarrollo de interfaz y el aseguramiento de calidad visual se rigen por las reglas documentadas en [`AGENTS.md`](./AGENTS.md) y las skills locales instaladas en `.agents/skills/` (ignoradas en git):

- **`impeccable` (`pbakaus/impeccable`)**: Modos `Operate` (dashboards densos y funcionales) y `Experience` (showcase de portafolio). Auditoría determinista de accesibilidad (`/impeccable audit`), calibración tipográfica (`/impeccable typeset`) y pulido final (`/impeccable polish`).
- **`interface-design` (`dammyjay93/interface-design`)**: Prevención de *design drift* para que los 3 dashboards compartan estrictamente tokens visuales, radios de bordes, escala de elevación y jerarquías de cards.
- **`baseline-ui` (`ibelick/ui-skills`)**: Reglas de craft estricto (`tabular-nums` obligatorio en datos numéricos, skeletons estructurales, 44px touch targets).

## Estructura del proyecto

```
dashboards-portfolio/
├── PROJECT.md                       ← este archivo
├── AGENTS.md                        ← directrices de desarrollo, reglas de diseño y skills para agentes
├── README.md                        ← descripción pública del showcase
├── LICENSE                          ← MIT (archivo real, aún no creado)
├── package.json                     ← pin de Recharts 3.x, pnpm 9
├── tsconfig.json                    ← strict: true
├── next.config.ts                   ← configuración Vercel estándar (sin output export)
├── vitest.config.ts                 ← unit tests de data-engine
├── .nvmrc                           ← versión de Node soportada por Next 16
├── .gitignore
├── scripts/                         ← reproducibilidad de los datos
│   ├── generate-data.ts             ← PRNG con seed fijo → escribe data/*.json
│   └── check-data.ts                ← valida invariantes (pnpm data:check)
├── app/
│   ├── layout.tsx                   ← root layout, metadata OG general, fuentes
│   ├── providers.tsx                ← 'use client': NuqsAdapter + ThemeProvider
│   ├── page.tsx                     ← server: landing con 3 cards + links a repos
│   ├── globals.css                  ← Tailwind 4 (@theme) + tokens shadcn + @media print
│   ├── sitemap.ts                   ← 4 rutas indexables
│   ├── robots.ts
│   ├── retail/page.tsx              ← server: metadata OG + <RetailDashboard />
│   ├── banca/page.tsx               ← server: metadata OG + <BancaDashboard />
│   └── logistica/page.tsx           ← server: metadata OG + <LogisticaDashboard />
├── components/
│   ├── ui/                          ← shadcn primitives (Button, Calendar, Sheet, Tooltip, Command…)
│   │   ├── GlossaryTooltip.tsx      ← tooltip explicativo de métricas chilenas (CMF, OTIF, HHI)
│   │   └── RepoLinkBadge.tsx        ← enlace a la evidencia técnica DuckDB/Python en GitHub
│   ├── cards/
│   │   └── DashboardCard.tsx        ← card de la landing con preview y KPIs clave
│   ├── insights/
│   │   └── InsightBanner.tsx        ← hallazgo y recomendación de negocio (recruiter hook)
│   ├── filters/
│   │   ├── FilterBar.tsx            ← barra desktop: fechas + slicers + "Limpiar"
│   │   ├── MobileFilterSheet.tsx    ← <Sheet side="bottom"> en < 768px
│   │   └── ActiveFilterChips.tsx    ← chips removibles + botón limpiar flotante
│   ├── layout/
│   │   ├── Header.tsx               ← navegación, switch de dashboards, status
│   │   ├── Footer.tsx               ← autor, links, disclaimer "datos sintéticos"
│   │   └── SyntheticDataBadge.tsx   ← badge persistente "Datos sintéticos" + fecha de corte
│   └── charts/
│       ├── ChartFrame.tsx           ← wrapper a11y: role="img" + aria-label + toggle a tabla
│       ├── DataTable.tsx            ← equivalente textual accesible de cualquier chart
│       ├── KpiCard.tsx              ← valor, delta vs anterior, sparkline, benchmark, tooltip
│       ├── LineChartCard.tsx        ← series temporales y tendencias
│       ├── BarChartCard.tsx         ← barras horizontales/verticales interactivas
│       ├── DonutChartCard.tsx       ← distribución por segmentos
│       ├── AreaChartCard.tsx        ← curvas de aging / acumuladas
│       ├── FunnelChart.tsx          ← etapas con drop-off
│       ├── RfmHeatmap.tsx           ← CSS Grid 5x5 + tooltips Radix (valor también en texto)
│       └── EmptyState.tsx           ← 0 registros tras filtrar, con acción "Limpiar filtros"
├── data/                            ← datasets sintéticos GENERADOS, editados a mano: nunca
│   ├── retail.json
│   ├── banca.json
│   └── logistica.json
├── lib/
│   ├── data-engine.ts               ← filtrado, agregación y cálculo de KPIs derivados
│   ├── metric-definitions.ts         ← data dictionary: fórmula, tipo, benchmark, fuente
│   ├── rfm.ts                       ← reglas de segmentación RFM y cálculo de scores
│   ├── format.ts                    ← CLP ($45.230 / $125,4M), % (12,3%), fechas es-CL
│   ├── dates.ts                     ← helpers de rango anclados a meta.periodoFin (no new Date())
│   └── constants.ts                 ← paletas por dashboard, textos de negocio
├── tests/
│   └── data-engine.test.ts          ← invariantes de agregación y deltas
└── public/
    ├── og-retail.png
    ├── og-banca.png
    ├── og-logistica.png
    └── favicon.svg
```

## Reglas de arquitectura

Estas reglas resuelven ambigüedades que el spec original dejaba abiertas. Se aplican a todo el proyecto.

### 1. Frontera cliente/servidor (RSC)

| Capa | Tipo | Responsabilidad |
|---|---|---|
| `app/*/page.tsx` | **Server** | `metadata`/`generateMetadata`, OG image, carga inicial |
| `app/providers.tsx` | **Client** | `NuqsAdapter` (exigido por nuqs v2), theme |
| `app/page.tsx` (landing) | **Server** | Cards, sin Recharts en el bundle de esta ruta |
| `components/dashboard/*Dashboard.tsx` | **Client island** | Recharts, Zustand, drag & drop de filtros |
| `data/*.json` | — | **Se importa desde el Client Component del dashboard**, nunca desde el Server Component |

> **Por qué importa la última regla:** importar el JSON desde un Server Component lo
> serializa en el payload RSC de la página (HTML inicial). Importándolo desde el Client
> Component del dashboard, el dataset queda en el chunk JS de esa ruta y **no** infla la
> landing, que es la primera impresión.

### 2. Estado: nuqs es la única fuente de verdad

El spec original declaraba filtros en Zustand **y** en la URL, lo que produce estados
divergentes. Regla final:

- **nuqs / `searchParams` = fuente de verdad de todos los filtros** (fechas, categorías,
  cross-filters de charts). Es lo único que se serializa y se comparte.
- **Zustand = estado efímero de UI** únicamente: drawer de filtros abierto, tooltip
  visible, hover, tab activo. Nunca un filtro de negocio.
- **Regla de Oro:** todo cross-filtering de chart actualiza la URL. Si un click muta sólo
  Zustand, el botón "Compartir vista" comparte una vista que no corresponde a la pantalla.
- **Presets de fechas anclados a `meta.periodoFin`**, nunca a `new Date()` (ver abajo).

### 3. Clasificación de métricas: derivadas vs precomputadas

Para eliminar la doble fuente de verdad (KPIs precomputados que se contradicen con los
calculados desde `records`), **cada métrica declara su tipo**:

| Tipo | Significado | Ejemplos |
|---|---|---|
| `derived` | Se calcula desde `records` con la fórmula de `lib/metric-definitions.ts` | ticket, margen, OTIF, lead time, HHI, mora, churn |
| `precomputed` | **No es derivable** de una fact table: requiere datos que no existen (sesiones, encuestas) | tasa de conversión (funnel), NPS transaccional |

**Regla:** el 90% es `derived`. Sólo el funnel de conversión y el NPS van precomputados,
porque necesitan sesiones de website y respuestas de encuesta respectivamente. Si una
métrica puede derivarse y viene precomputada, es un bug.

**Invariante de reconciliación:** todo KPI `derived` declarado en `initialKpis` debe
coincidir con el valor recalculado desde `records` dentro de tolerancia (0,5% relativo).
`pnpm data:check` lo verifica. Esto es lo que impide que un screenshot con filtro y otro
sin filtro muestren números incompatibles.

### 4. Accesibilidad real, no declarativa

- **Nunca codificar información sólo por color.** El heatmap RFM muestra además el conteo
  en texto dentro de la celda; el donut incluye etiquetas directas.
- **Cada chart va envuelto en `ChartFrame.tsx`**, que expone `role="img"` + `aria-label`
  descriptivo con el headline real del dato, y un toggle "Ver tabla" que renderiza
  `DataTable.tsx` con los mismos números.
- **El cross-filtering debe ser accesible por teclado.** Recharts no expone los elementos
  del gráfico como nodos focables, así que todo filtro de chart tiene un equivalente
  textual: leyenda-botón, `ActiveFilterChips` y tabla. Clicar en la leyenda o en un chip
  filtra igual que hacer clic en la barra.
- **Objetivo Lighthouse Accessibility ≥ 95** en las 3 rutas.

### 5. Budgets de performance

- **LCP < 2,5s** en perfil 4G móvil. **CLS < 0,1** (alturas fijas en todos los containers).
- Bundle por ruta: landing **< 120KB gzipped** (sin Recharts), cada dashboard
  **< 300KB gzipped**. Se miden en el build, no se estiman.
- Toda generación de JSON se valida con `pnpm data:check` antes de `pnpm build`.

## Deploy — Vercel (decidido)

**Target de producción:** Vercel, conectado al repo `berriosb/dashboards-portfolio` en GitHub.

### Por qué Vercel y no GitHub Pages / Netlify

| Criterio | Vercel ⭐ | GitHub Pages | Netlify |
|---|---|---|---|
| Soporte Next.js nativo | ✅ First-class | ⚠️ Limitado (`next export`) | Bueno |
| Routing (App Router, RSC) | ✅ Automático | ❌ Frágil | Bueno |
| Deploy | `git push` y listo | Manual (build + push de `./out`) | `git push` + build config |
| HTTPS + custom domain | ✅ Gratis + auto | ⚠️ Manual | ✅ Gratis + auto |
| Preview deploys por PR | ✅ URL única por branch | ❌ No | ✅ Sí |
| Edge network global | ✅ Optimizado para Next | CDN GitHub | Bueno |
| Costo | $0/mes (100GB bandwidth) | $0 | $0/mes (100GB bandwidth) |
| Lock-in | Bajo (Next.js corre donde sea) | Nulo | Bajo |

**El factor decisivo:** Vercel es la empresa detrás de Next.js. Si algo no funciona, es bug de Vercel, no del setup. Para un showcase de portafolio es la opción sin fricción.

### Setup (5 minutos una sola vez)

**Opción A — vía web (recomendado para primer deploy):**
1. Ir a https://vercel.com/new
2. Conectar GitHub y seleccionar `berriosb/dashboards-portfolio`
3. Vercel auto-detecta Next.js 16 + pnpm
4. Deploy → URL: `https://dashboards-portfolio.vercel.app`

**Opción B — vía CLI:**
```bash
pnpm i -g vercel
vercel login
cd ~/Proyectos/dashboards-portfolio
vercel              # primer deploy (preview)
vercel --prod       # deploy a producción
```

> Nota: con pnpm, Vercel necesita `pnpm-lock.yaml` commiteado. Si el primer deploy falla
> por instalación de dependencias, es eso.

### URL objetivo

- **Producción:** `https://dashboards-portfolio.vercel.app`
- **Custom domain (opcional, no bloqueante):** `dashboards.berriosb.cl` vía NIC Chile → Vercel

### Después de conectado

- Cada `git push origin main` → deploy automático a producción
- Cada PR → preview URL única (útil para mostrar a recruiters sin tocar main)
- Dashboard de Vercel muestra deploys, bandwidth, errores en runtime
- **Vercel Analytics activado** (gratis): es la única forma de saber si el portafolio
  convierte (ver "Métricas de éxito")

### Riesgos eliminados vs GitHub Pages

- ~~`next export` con `basePath: '/dashboards-portfolio'`~~ → Vercel rutea limpio
- ~~404.html hack para SPA routing~~ → App Router funciona nativo
- ~~Bundle estático pesado en `./out/`~~ → Vercel optimiza automático

## Datasets — qué muestra cada dashboard

### Fuente de datos: JSON estático embebido, generado por script (decidido)

**Decisión 2026-09-29:** Los 3 dashboards consumen datos desde archivos JSON embebidos en el
bundle de Next.js (`data/retail.json`, `data/banca.json`, `data/logistica.json`), **producidos
por `scripts/generate-data.ts` con un PRNG de seed fijo**.

#### Por qué JSON estático y no Supabase / Insforge / Neon

| Opción | Tiempo setup | Latencia | Costo | Complejidad deploy | Mejor para |
|---|---|---|---|---|---|
| **JSON estático** ⭐ | 0 | 0ms | $0 | Nula | Showcase visual rápido |
| Supabase | 1-2h | ~150ms | $0 (free tier 500MB) | Media (secrets, RLS) | Full-stack con auth |
| Insforge (beta) | 1-2h | N/A (nuevo) | Desconocido | Media | Alternativa moderna a Supabase |
| Neon | 1h | Baja | $0 (free tier 512MB) | Baja (solo DB) | Data engineering puro |
| Turso (libSQL) | 1h | Baja | $0 (9GB) | Baja | Edge-first |
| n8n + APIs reales | 2-3h | Variable | $0 | Alta (workflows) | Live data real-time |

**Razones para JSON estático en este proyecto:**

1. **La promesa del showcase es "rápido y bonito"** — un recruiter skimming 30 segundos no abre DevTools a ver si los datos vienen de una API. Ve los KPIs, los charts, el diseño.
2. **Tiempo de implementación:** 4-6h vs 6-8h con Supabase. La diferencia entre "lo termino este finde" y "lo dejo para más tarde".
3. **Cero complejidad operacional:** no hay secrets en Vercel, no hay rate limits, no hay RLS que configurar.
4. **Datos coherentes > datos reales con gaps:** un JSON sintético bien diseñado cuenta mejor la historia que datos públicos con outliers y errores.
5. **Upgrade path limpio:** si después queremos Supabase, el cambio es de 1 hora (sólo cambia el import de los datos).

#### Por qué *generados* y no escritos a mano

El spec original decía "600-1000 registros sintéticos" sin especificar cómo se producían. La
implicación — escribirlos a mano — no escala a 3 dominios y no es defendible en una entrevista.

`scripts/generate-data.ts` resuelve esto con un PRNG determinista (`mulberry32`, seed fijo y
documentado en el propio script), de modo que:

- **Reproducible:** `pnpm data:generate` dos veces da exactamente el mismo JSON.
- **Coherente por construcción:** las estacionalidades (Black Friday, CyberMonday, mora que
  se acumula, lead time estacional) se modelan como distribuciones explícitas, no como
  números sueltos.
- **Verificable:** `scripts/check-data.ts` corre las invariantes y falla el build si no cuadran.
- **Defendible en entrevista:** es la parte del proyecto que más se parece a un pipeline de
  datos real, sin abandonar el scope de front-end.

#### Cuándo SÍ migrar a Supabase / BaaS

| Trigger | Acción |
|---|---|
| Quieres **escritura o personalización por usuario** | Migrar a Supabase + RLS (guardar vistas/favoritos) |
| Datasets masivos (> 50.000 registros) con SQL pesado | Migrar a DuckDB-Wasm en cliente o Postgres backend |
| Quieres **datos que se actualicen solos** (scraping diario) | Migrar + n8n cron a Supabase |
| Quieres demostrar **full-stack skills** explícitamente | Migrar a Supabase (ya cubierto por `dash-bi`) |

> [!NOTE]
> **Filtros interactivos en memoria:** con 600-2.000 registros sintéticos, un helper puro en
> TypeScript (`lib/data-engine.ts`) filtra, agrupa y calcula deltas en menos de 1ms. Eso hace
> que el cross-filtering sea instantáneo y sin dependencias externas. El `NOTE` original
> decía "0ms"; lo correcto es "sub-milisegundo, no medido en producción".

#### Relación con el resto del portafolio

La señal de "sé integrar DBs reales" ya la dan otros repos del portafolio:

- `dash-bi` — Next.js + Postgres + Drizzle + multi-tenant + RLS (producto en producción)
- `chilecompra-anomalias-sql` — DuckDB + análisis SQL reproducible

El showcase **no necesita repetir esa señal**. Su rol distinto es la vitrina visual —
aunque el generador seeded le da un plus de rigor que antes no tenía.

### Definiciones de métricas (data dictionary)

**Ausente en el spec original y es lo más importante que agregué.** Para una postulación a
*Analista BI* esto es literalmente el criterio de evaluación: qué es el numerador, el
denominador, qué se excluye y cómo se agrega en el tiempo. Vive en
`lib/metric-definitions.ts` y se versiona junto al código.

Cada KPI declara: `formula`, `metricType` (`derived` | `precomputed`), `source`, `benchmark`,
`benchmarkSource` y `interpretation` (qué significa un valor alto o bajo).

#### Retail

| KPI | Fórmula | Tipo | Exclusiones |
|---|---|---|---|
| `ticketPromedio` | `sum(amount) / count(DISTINCT orderId)` | derived | `isReturn = true` |
| `margenBrutoPct` | `sum(amount - cost) / sum(amount) × 100` | derived | `isReturn = true` |
| `tasaConversion` | `compradores / visitantes` del bloque `precomputed.funnel` | precomputed | — |
| `nps` | `%promotores − %detractores` sobre `precomputed.nps.encuestas` | precomputed | — |
| `clientesRecurrentes` | `count(DISTINCT customerId con ≥2 orderId en el período)` | derived | — |
| `ventasNetas` | `sum(amount) − sum(amount WHERE isReturn)` | derived | — |

> **El margen se define sobre el mismo dataset que lo agrega.** Nada de `marginPct` por
> record: se deriva de `amount - cost`, que es la única forma de que el KPI no contradiga
> el desglose por categoría. (El schema original traía `marginPct` hardcodeado por record:
> dos fuentes de verdad para el mismo número.)

#### Banca

| KPI | Fórmula | Tipo | Nota de dominio |
|---|---|---|---|
| `captacionNeta` | `sum(deposits) − sum(retiros)` sobre `recordsMovimientos` | derived | En MM CLP |
| `moraCarteraPct` | `sum(saldo WHERE diasMora ≥ 30) / sum(saldo) × 100` | derived | **Morosidad CMF** |
| `moraVencida90Pct` | `sum(saldo WHERE diasMora ≥ 90) / sum(saldo) × 100` | derived | **Mora provisioning** |
| `coberturaProvisiones` | `provisiones / carteraVencida90` | derived | |
| `roa` / `roe` | `utilidadNeta / activosPromedio`, `/ patrimonioPromedio` | precomputed | Requiere estado de resultados, no es derivable de la cartera |
| `churnMensual` | `clientesRenovantes / clientesVencidos` por cohorte | derived | Cohorte = mes de vencimiento |
| `clientesActivos` | `count(DISTINCT clienteId con saldo > 0)` | derived | |

> **Distinción CMF que hay que mostrar explícitamente en el dashboard:** la tasa de mora de
> la CMF cuenta desde **30 días**, pero la mora que gatilla provisión es **90+ días**.
> Muchos dashboards de banca confunden estas dos definiciones. Mostrar ambas, con tooltip
> para cada una, es
> exactamente el tipo de detalle que diferencia a un candidato.

#### Logística

| KPI | Fórmula | Tipo |
|---|---|---|
| `otifPct` | `pedidos (entregaCompleta AND entregaATiempo) / pedidosTotales × 100` | derived |
| `otifParcialPct` | `pedidos (ATiempo pero Incompleto) / pedidosTotales × 100` | derived |
| `leadTimeP50` / `leadTimeP90` | percentiles de `fechaEntrega − fechaDespacho` en días | derived |
| `hhiProveedores` | `sum((participación_i)²)` con participación **en fracción** (0-1) | derived |
| `fillRatePct` | `volumenEntregado / volumenOrdenado × 100` | derived |
| `costoPorKm` | `costoTotal / kmTotalRecorridos` | derived |

#### Benchmarks e interpretación

El **umbral de interpretación** es la señal de seniority; la definición sola la tiene cualquiera.
Cada KPI lleva su benchmark y qué implica superarlo o quedarse corto.

| Métrica | Benchmark | Lectura |
|---|---|---|
| OTIF | ≥ 95% | Estándar de la industria; < 90% es crisis operacional |
| HHI proveedores | < 1.500 moderado · > 2.500 concentrado | Umbral DOJ/FTC; > 2.500 significa dependencia de un solo transportista |
| Mora CMF 30+ | < 2,5% | Por encima, problema de Originación |
| Mora 90+ | < 1% | Gatillo de provisión |
| Margen bruto retail | 35-45% | Por debajo del rango, revisar mix de categorías |
| NPS | ≥ 50 | Excelente; 0-30 es zona de riesgo |
| Lead time P90 | según ruta | Se compara contra el SLA pactado, no en absoluto |

### Reglas de formato y arquitectura de los JSON

Para hacer posible el **cross-filtering y slicers dinámicos** en el cliente sin backend, cada
dataset sigue un modelo dimensional plano (fact tables sintéticas) más metadata de negocio.

**Reglas globales (aplican a los 3 archivos):**

- Sin campos `null` ni `undefined` (usar `0`, `""` o `[]` según corresponda)
- Fechas en ISO 8601 (`"2026-09-15"`), meses en `"YYYY-MM"`
- Montos en CLP como enteros **sin formatear** (el formateo lo hace `lib/format.ts`)
- Porcentajes como números decimales (`38.5`, no `"38.5%"`)
- Identificadores de entidad (`customerId`, `skuId`, `rutaId`, `transportistaId`) **siempre
  presentes** — sin ellos no hay drill-down posible
- Claves foráneas consistentes con los arrays de `lookups`
- Todo campo derivado se **calcula**, no se hardcodea en el record
- El dataset **nunca se edita a mano**: se regenera con `pnpm data:generate`

```jsonc
// data/retail.json — retail (modelo dimensional sintético)
{
  "meta": {
    "empresa": "Retail Omnicanal Chileno (simulación, 50 tiendas)",
    "periodoInicio": "2025-10-01",
    "periodoFin": "2026-09-30",
    "moneda": "CLP",
    "dataGeneratedAt": "2026-09-29",
    "seed": 20260929,
    "businessInsight": {
      "titulo": "Fuga de clientes VIP en canal tienda física",
      "descripcion": "El 34% de los clientes 'Champions' del segmento RFM redujo su frecuencia en tiendas físicas un 18% en el Q3, migrando parcialmente a canales digitales con un ticket 12% menor.",
      "accionRecomendada": "Activar campaña de fidelización omnicanal con Click & Collect y beneficios en servicios presenciales."
    }
  },
  "initialKpis": [
    { "key": "ticketPromedio", "label": "Ticket promedio", "value": 45230, "previousValue": 40280, "unit": "CLP", "metricType": "derived", "benchmark": 42000, "benchmarkSource": "ticket promedio declarado sector retail chileno" },
    { "key": "margenBrutoPct", "label": "Margen bruto", "value": 38.5, "previousValue": 36.4, "unit": "%", "metricType": "derived", "benchmark": 40, "benchmarkSource": "rango sector retail 35-45%" },
    { "key": "tasaConversion", "label": "Tasa conversión", "value": 3.8, "previousValue": 3.5, "unit": "%", "metricType": "precomputed", "benchmark": 3, "benchmarkSource": "mediana e-commerce CL" },
    { "key": "nps", "label": "NPS transaccional", "value": 64, "previousValue": 61, "unit": "pts", "metricType": "precomputed", "benchmark": 50, "benchmarkSource": "NPS benchmark general" }
  ],
  "lookups": {
    "categorias": ["Hogar", "Tecnología", "Moda Mujer", "Moda Hombre", "Electro", "Deco", "Deportes", "Belleza", "Infantil", "Supermercado"],
    "canales": ["online", "tienda", "ambos"],
    "regiones": ["RM", "Valparaíso", "Biobío", "Antofagasta", "Los Lagos"],
    "segmentosCliente": ["nuevo", "recurrente", "vip"],
    "segmentosRfm": ["Champions", "Loyal", "Potential", "At Risk", "Hibernating"]
  },
  "records": [
    {
      "id": "TX-1001",
      "orderId": "OR-55012",
      "customerId": "CU-0412",
      "skuId": "SKU-HOG-014",
      "date": "2026-09-28",
      "categoria": "Hogar",
      "canal": "online",
      "region": "RM",
      "segmentoCliente": "vip",
      "amount": 78900,
      "cost": 45000,
      "isReturn": false
    }
  ],
  "skus": [
    { "id": "SKU-HOG-014", "nombre": "Juego de sabanas 2 plazas", "categoria": "Hogar", "precio": 34990, "costo": 18900 }
  ],
  "precomputed": {
    "funnel": [
      { "step": "Visitantes", "value": 128400 },
      { "step": "Carrito", "value": 21400 },
      { "step": "Compra", "value": 4880 },
      { "step": "Repeat", "value": 1730 }
    ],
    "nps": { "encuestas": 1850, "promotores": 1420, "detractores": 690, "pasivos": 250 }
  }
}
```

> **Correcciones aplicadas al schema de retail respecto del spec original:**
> - Se agregan `orderId`, `customerId` y `skuId`. Sin `customerId` no hay RFM por cliente ni
>   el drill-down de "50 clientes del segmento"; sin `skuId` no hay "top 20 SKUs".
> - Se elimina `marginPct` y `recencyScore`/`frequencyScore` por record: se **derivan** de
>   los datos del cliente. Eran contradictorios con la recomputación de `data-engine.ts`.
> - Se agrega `segmentoCliente` (nuevo/recurrente/vip) que es lo que el slicer realmente pide;
>   `segmentoRfm` sigue existiendo pero es una **etiqueta derivada** en `lib/rfm.ts`, no un
>   campo de entrada.
> - Se elimina `rfmMatrix` precomputada: la matriz 5×5 se calcula desde `records`.
> - Se separa `precomputed` explícito (funnel + NPS) del resto, según la clasificación de
>   métricas de la sección de arquitectura.

```jsonc
// data/banca.json — banca (2 fact tables + dimensión mes conformada)
{
  "meta": { "empresa": "Banco chileno (simulación)", "periodoInicio": "2025-10-01", "periodoFin": "2026-09-30", "moneda": "CLP", "seed": 20260930, "businessInsight": { "...": "..." } },
  "initialKpis": [ /* captacionNeta, moraCarteraPct, roe, clientesActivos */ ],
  "lookups": {
    "productos": ["consumo", "hipotecario", "comercial", "tarjeta"],
    "segmentos": ["alto", "medio", "bajo"],
    "sucursales": ["SUC-001", "SUC-002", "..."],
    "regiones": ["RM", "Valparaíso", "Biobío", "Antofagasta", "Los Lagos"]
  },
  // Fact 1: cartera de colocaciones
  "records": [
    {
      "id": "CR-2026-00871",
      "clienteId": "CL-88901",
      "producto": "consumo",
      "segmento": "medio",
      "sucursal": "SUC-012",
      "region": "RM",
      "fechaOtorgamiento": "2025-04-18",
      "fechaVencimiento": "2027-04-18",
      "monto": 850000,
      "saldo": 612000,
      "diasMora": 0,
      "provision": 0
    }
  ],
  // Fact 2: movimientos de caja (conformed por mes) — habilita captación neta
  "recordsMovimientos": [
    { "id": "MV-77120", "clienteId": "CL-88901", "mes": "2026-09", "tipo": "deposito", "monto": 450000 },
    { "id": "MV-77121", "clienteId": "CL-88901", "mes": "2026-09", "tipo": "retiro", "monto": 120000 }
  ],
  "precomputed": {
    "resultado": [ /* estado de resultados mensual: utilidad, patrimonio, activos */ ]
  }
}
```

> **El spec original no definía ningún campo para banca**, pese a que le pedía aging de mora
> 30/60/90+, churn por cohorte, Mora CMF, captaciones y ROE. Con `diasMora` + `saldo` y esta
> segunda fact table de movimientos, todas esas visualizaciones son derivables.
> `resultado` va precomputado porque el ROE/ROA requieren un estado de resultados que no se
> deduce de una cartera de créditos.

```jsonc
// data/logistica.json — logística (fact de despachos)
{
  "meta": { "empresa": "Operador logístico chileno (simulación)", "periodoInicio": "2025-10-01", "periodoFin": "2026-09-30", "moneda": "CLP", "seed": 20260931, "businessInsight": { "...": "..." } },
  "initialKpis": [ /* otifPct, leadTimeP50, hhiProveedores, fillRatePct */ ],
  "lookups": {
    "rutas": ["R-01 Santiago–Antofagasta", "..."],   // 15 rutas
    "transportistas": ["TR-01", "..."],               // 20 transportistas
    "tiposProducto": [" refrigerado", "seco", "frágil", "granel" ],
    "prioridades": ["estandar", "express", "critico" ]
  },
  "records": [
    {
      "id": "DS-904112",
      "clienteId": "CL-2044",
      "rutaId": "R-01",
      "transportistaId": "TR-07",
      "tipoProducto": "refrigerado",
      "prioridad": "estandar",
      "fechaDespacho": "2026-09-20",
      "fechaEntregaPrometida": "2026-09-23",
      "fechaEntregaReal": "2026-09-24",
      "ordenado": 1200,
      "entregado": 1180,
      "costo": 485000,
      "km": 1180,
      "incidencias": 1
    }
  ]
}
```

> Con `ordenado`/`entregado` se derivan OTIF, fill rate y HHI; con las tres fechas se derivan
> lead time y cumplimiento. **No hace falta treemap** (ver decisión #10).

### Reglas de fechas (crítico)

> ⚠️ **Todos los presets y rangos se anclan a `meta.periodoFin`, nunca a `new Date()`.**

El dataset es fijo y termina el 2026-09-30. Si "Últimos 7 días" se calcula contra la fecha
real del visitante, desde octubre 2026 en adelante devuelve cero registros y el dashboard se
ve roto — que es exactamente lo que le va a pasar a un recruiter que abra el link 2 meses
después del deploy.

`lib/dates.ts` centraliza esto:

- Todos los presets se calculan relativos a `meta.periodoFin`
- El banner de estado muestra **"Datos al 30-09-2026"** de forma permanente
- El estado vacío de un filtro sin resultados dice explícitamente *"Sin datos en este
  rango: el dataset simulado llega hasta el 30-09-2026"*, no un spinner infinito
- La comparación con período anterior **se deriva moviendo la ventana** sobre los mismos
  `records` (el dataset cubre 12 meses), **no** sumando un "dataset fantasma" duplicado

### Por industria (6 visualizaciones cada uno)

Regla: **6-8 visuales por página** (best practice Power BI), nunca más.

| Visualización | Qué muestra | Tipo de métrica |
|---|---|---|
| **KPI cards** (4) | Ticket promedio, margen bruto %, conversión %, NPS | derived + precomputed |
| **Ventas por categoría** (bar horizontal) | 10 categorías, ordenadas por venta | derived |
| **RFM heatmap** | Matriz 5×5 Recency × Frequency, color + conteo en texto | derived |
| **Funnel de conversión** | Visitantes → Carrito → Compra → Repeat, con drop-off % | precomputed |
| **Tendencia mensual** (line) | Ventas 12 meses con estacionalidad (Black Friday, CyberMonday) | derived |
| **Ticket por canal** (bar agrupado) | Online vs Tienda vs Ambos, con delta | derived |

| Visualización | Qué muestra | Tipo de métrica |
|---|---|---|
| **KPI cards** (4) | Captación neta, mora 30+ CMF, ROE, clientes activos | derived + precomputed |
| **Colocaciones por producto** (bar apilado) | Consumo, hipotecario, comercial, tarjetas | derived |
| **Aging de morosidad** (area/bar) | Mora 30 / 60 / 90+ días, sobre saldo | derived |
| **Mora 30+ vs 90+** (línea doble) | Las dos definiciones CMF comparadas | derived |
| **Churn por cohorte** (línea) | Cohorte de vencimiento × mes | derived |
| **Distribución de clientes** (donut) | Segmentos alto / medio / bajo valor | derived |

| Visualización | Qué muestra | Tipo de métrica |
|---|---|---|
| **KPI cards** (4) | OTIF %, lead time P90, HHI proveedores, fill rate % | derived |
| **OTIF por ruta** (bar horizontal) | 15 rutas, ordenadas por cumplimiento | derived |
| **Lead time distribution** (histograma) | Distribución de días de entrega, con P50 y P90 marcados | derived |
| **Concentración de proveedores** (bar) | Cuota por transportista + tarjeta HHI con umbral DOJ/FTC | derived |
| **OTIF vs fill rate** (línea) | Los dos componentes del servicio, mes a mes | derived |
| **Incidencias por transportista** (bar) | Incidencias y su tasa por cada uno | derived |

## Interactividad — qué filtros y capacidades tendrá cada dashboard

**Decisión 2026-09-29:** Los 3 dashboards tendrán **interactividad nivel 2** (exploratory),
basado en patrones de UX de Power BI / Tableau / Looker documentados en diseño de dashboards BI 2026.

### Los 3 niveles de interactividad (referencia)

| Nivel | Capacidad | Ejemplo |
|---|---|---|
| **Nivel 1: Display** | Solo lectura + selectores básicos (date picker, dropdowns) | Looker Studio, Infogram |
| **Nivel 2: Exploratory** ⭐ | Cross-filtering + drill-down + comparison toggle | Power BI, Tableau, Metabase, Looker |
| **Nivel 3: Generative** | Layout + charts + filtros generados desde texto | ThoughtSpot, Qlik Sense |

**Vamos nivel 2**: lo que el 90% de los recruiters BI espera ver cuando abren un dashboard, sin meternos en AI/LLM todavía.

### Modelo de estado

Ver "Reglas de arquitectura §2". Resumen operativo:

- Filtros → `searchParams` vía **nuqs** (única fuente de verdad, compartible)
- UI efímera → **Zustand** (drawer, tooltip, hover)
- Toda mutación de filtro pasa por un setter de nuqs. No hay setters de filtro en Zustand.

### Capacidades de interactividad por dashboard

#### 1. Filtro de rango de fechas (siempre presente)

- **Tipo:** preset selector + custom date picker
- **Presets:** "Últimos 7 días" / "Últimos 30 días" / "Este mes" / "Mes anterior" / "YTD" / "Todo el período" / "Custom"
- **Implementación:** `<DateRangeFilter>` con shadcn Calendar + botones de preset
- **Anclaje:** todos los presets son relativos a `meta.periodoFin` (ver "Reglas de fechas")
- **Comportamiento:** todos los charts de la página filtran al cambiar
- **Comparación:** toggle "Comparar con período anterior" que **mueve la ventana** sobre los
  mismos `records` y muestra delta %. No hay dataset duplicado.
- **Fuera de rango:** si el usuario pide un rango sin datos, se muestra `EmptyState` explicativo,
  no un gráfico vacío

**Patrón UX (referencia Power BI / Metabase):**
```
[Este mes ▼] [Comparar ✓]   Showing: Sep 1 – Sep 30, 2026 vs Ago 1 – Ago 31, 2026
Datos al 30-09-2026
```

#### 2. Filtros de dimensión (segmentación)

| Dashboard | Slicers |
|---|---|
| Retail | Categoría (multi), Región, Canal (online/tienda/ambos), Segmento cliente (nuevo/recurrente/vip) |
| Banca | Producto (consumo/hipotecario/comercial/tarjeta), Segmento (alto/medio/bajo), Región, Bucket de mora (0/30+/60+/90+) |
| Logística | Ruta, Transportista, Tipo de producto, Prioridad (estándar/express/crítico) |

> **Corrección:** el spec original pedía un slicer de "Segmento cliente (nuevo/recurrente/VIP)"
> que no existía en el modelo de datos. Se agregó `segmentoCliente` al schema. El segmentado
> RFM es un filtro distinto, exponible como quinto slicer, y se deriva de `lib/rfm.ts`.

- **Tipo:** dropdown multi-select (shadcn Command)
- **Estado:** URL search params (`?categoria=hogar,tecnologia&canal=online`)
- **Comportamiento:** los charts refiltran; los KPIs recalculan
- **Accesible:** cada slicer es un popover navegable por teclado, sin depender del chart

#### 3. Cross-filtering entre charts (lo más impactante)

- **Patrón:** click en un bar/segment de cualquier chart → todos los demás filtran a esa dimensión
- **Implementación:** click handler → setter de nuqs (nunca Zustand)
- **Visual feedback:** elemento clickeado se resalta; charts no relacionados muestran estado atenuado
- **Reset:** botón "Limpiar filtros" arriba a la derecha + chips removibles
- **Accesible por teclado:** además del click, cada categoría tiene una leyenda-botón y
  aparece como chip. Sin click en SVG.

**Ejemplo en retail:**
- Click en "Hogar" del chart de ventas por categoría → RFM heatmap muestra sólo clientes que compraron hogar; el funnel recalcula; la tendencia mensual se filtra a hogar.
- Click en celda RFM "Champions" → todos los charts filtran a ese segmento.

#### 4. Drill-down en clicks (jerarquía de detalle)

- **Patrón:** click en un elemento → drawer lateral derecho con detalle
- **Implementación:** shadcn `<Sheet>` + datos ya cargados en el JSON (sin fetch)
- **Reversible:** botón "Cerrar" + breadcrumb visible
- **Accesible:** foco atrapado en el Sheet, ESC cierra, y el drawer es alcanzable desde la
  tabla de datos, no sólo desde el chart

| Dashboard | Click en | Abre drawer con |
|---|---|---|
| Retail | Categoría | Top 20 SKUs de la categoría con precio, margen, unidades vendidas |
| Retail | Segmento RFM | Lista de 50 clientes: última compra, ticket promedio, LTV, nº de órdenes |
| Banca | Producto | Aging de mora (30/60/90+) del producto, ticket promedio, tasa de aprobación |
| Banca | Segmento | Distribución etaria, productos contratados, canal de adquisición |
| Logística | Ruta | Volumen y OTIF por transportista en la ruta, top 10 clientes de la ruta |
| Logística | Transportista | Participación y contribution al HHI, lead time P50/P90, incidencias |

> **Corrección:** se eliminó el "link a ver producto" del drawer de retail. No existe página de
> producto; un link roto en un portafolio resta más de lo que aporta.

#### 5. Heatmap RFM accesible (CSS Grid)

- **Patrón:** matriz 5×5 (Recency en X, Frequency en Y)
- **Implementación:** Recharts no tiene `<Heatmap />` nativo → **CSS Grid puro de Tailwind
  (`grid-cols-5`) + Radix UI Tooltip**
- **Accesible de verdad:** cada celda muestra el **conteo de clientes en texto**, no sólo color
  (WCAG 1.4.1), es un `button` enfocable, y su contenido se anuncia en el `aria-label`
- **Interacción:** activar la celda filtra todos los charts a ese segmento
- **Reglas de segmentación** en `lib/rfm.ts`, documentadas y testeadas:
  Champions (R≥4 ∧ F≥4) · Loyal (R≥3 ∧ F≥3 ∧ R<4 ∨ F<4) · Potential (R≥4 ∧ F<4) ·
  At Risk (R=2 ∨ (R=3 ∧ F=2)) · Hibernating (R=1)

#### 6. Tooltips ricos (hover)

- **Implementación:** `<Tooltip>` de Recharts con `<CustomTooltip>` propio
- **Contenido típico:**
  ```
  Marzo 2026
  Ventas: $125,4M
  vs Feb: +12,3% ↑
  vs Mar 2025: +8,1% ↑
  [▁▂▃▅▇▆▅▆▇]  ← sparkline 12 meses
  ```
- **Ojo:** los sparklines dentro del tooltip usan caracteres, no SVG, para no anidar
  contextos de Recharts dentro del portal del tooltip

#### 7. Comparación con período anterior

- **Cada KPI card** muestra valor actual + delta % + sparkline + benchmark de referencia
- **Color** verde/rojo según delta, ícono ↑/↓, y el tooltip explica qué período se compara
- El delta se **calcula moviendo la ventana** sobre `records`, no leyendo un
  `previousValue` hardcodeado. `previousValue` queda sólo como valor de fallback cuando el
  rango elegido no tiene período previo equivalente.
- **Regla de honestidad visual:** color **nunca** es el único indicador; siempre va con
  ícono y con el número con signo.

#### 8. Export / Share

- **Share URL:** los filtros actuales se serializan a URL vía `nuqs`; el botón "Compartir
  vista" copia el link **con los filtros activos incluidos**
- **Export PNG:** botón por chart con `html-to-image`, **sujeto al riesgo documentado**
  (ver Riesgos). Fallback obligatorio: "Guardar imagen como" nativo del navegador
- **Print friendly:** estilos `@media print` en `globals.css`

### Estados de la interfaz (faltaba en el spec)

Cada vista que consume datos debe tener los tres estados implementados, no implícitos:

| Estado | Cuándo | Qué muestra |
|---|---|---|
| **Cargando** | Navegación entre rutas de dashboard | Skeleton con la grilla real, sin layout shift (CLS < 0,1) |
| **Vacío** | Filtros activos sin registros | `EmptyState` con causa probable y botón "Limpiar filtros" |
| **Error** | Fallo de import/render | Mensión acotada con link a GitHub Issues. Nunca pantalla blanca |

El caso "sin datos porque el dataset llega hasta el 30-09-2026" **debe** resolverse con un
mensaje explícito, no con un chart en blanco.

### Estrategia Mobile y Responsive

Dado que un alto porcentaje de reclutadores y contactos en LinkedIn abren enlaces desde smartphones:

- **Layout adaptable:**
  - Desktop (`lg`): Grid de 2-3 columnas, 4 KPIs en fila superior.
  - Tablet (`md`): Grid de 2 columnas, KPIs en 2×2.
  - Mobile (`< 768px`): 1 columna. KPIs en 2×2 compacto. Charts con altura fija
    (`h-[280px]`–`h-[320px]`) con `ResponsiveContainer` y `min-w-0` en los padres para
    evitar desbordes de SVG.
- **Drawer de filtros en mobile:**
  - Desktop: barra horizontal superior con fechas y slicers.
  - Mobile: botón compacto *"Filtros (N activos)"* que abre `<Sheet side="bottom">`.
- **Interacción táctil:** área mínima de toque 44×44px; botón flotante "Limpiar filtros"
  cuando hay dimensiones activas; el heatmap RFM tiene celdas de 48px mínimo en mobile.
- **Orden de charts en mobile:** KPIs → Insight → chart principal → resto. Nunca un chart
  de 6 barras como primer elemento.

### Hooks de Negocio y Empleabilidad (Recruiter-Ready)

Para diferenciar este showcase de un proyecto meramente estético y posicionar un perfil de **Data Analyst Senior**, cada dashboard incluye 5 palancas de conversión:

1. **Insight Banner de Negocio (`InsightBanner.tsx`):**
   - Tarjeta superior visible antes de los gráficos con un hallazgo crítico y su recomendación.
   - *Ejemplo Banca:*
     > 💡 **Hallazgo:** El 42% del incremento en mora a 60 días proviene del segmento de consumo no bancarizado tras la baja de tasas del Q2. **Acción:** ajustar cupos preaprobados y activar cobranza temprana en día 25.
   - Los insights se **redactan a partir de los datos generados**, no se inventan aparte: el
     generador produce un `businessInsight` coherente con las series que produce.

2. **Glosario de Métricas Chilenas con Tooltips (`GlossaryTooltip.tsx`):**
   - Ícono `Info` en KPIs técnicos chilenos con definición oficial, benchmark y umbral.
   - **Banca:** Mora CMF 30+ vs 90+ (Compendio CMF de cartera vencida), Cartera Bruta, Cobertura de Provisiones.
   - **Logística:** OTIF (estándar industria > 95%), HHI (con umbral DOJ/FTC), Lead Time P90.
   - **Retail:** RFM, NPS Transaccional, Margen bruto.
   - **Cada tooltip enlaza a su fuente oficial** (CMF, Ley 21.015, DOJ/FTC). Un benchmark sin
     fuente citada no entra al spec.

3. **Banner de Credibilidad Técnica (`RepoLinkBadge.tsx`):**
   - Banner persistente conectando con la evidencia dura:
     > *"¿Quieres ver el pipeline ETL, modelado dimensional DuckDB y análisis Python reproducible de este caso? [Ver repo técnico en GitHub →]"*

4. **OpenGraph Cards dedicadas:**
   - `generateMetadata` por ruta + `og-retail.png`, `og-banca.png`, `og-logistica.png` para
     que al compartir en LinkedIn o WhatsApp se previsualice el dashboard respectivo.

5. **Disclaimer permanente (`SyntheticDataBadge.tsx`):**
   - Badge **"Datos sintéticos"** visible en el header de cada dashboard, con la fecha de corte
     del dataset. No basta con decirlo en el README: el screenshot que se comparte en LinkedIn
     es el que circula, y un número sin ese badge se puede leer como real.

### Patrones de layout (referencia dashboards BI)

| Patrón | Cuándo usarlo | Aplicación |
|---|---|---|
| **F-pattern** | Dashboards densos con mucha data | Logística (15 rutas + despachos) |
| **Z-pattern** | Dashboards simples con flujo narrativo | Retail (4 KPIs → Insight → 5 charts) |
| **Grid 2x2 / 3x3** | Dashboards balanceados | Banca (KPIs + Insight + 5 charts) |

**Regla de los 6-8 visuales por página** (Power BI best practice). Cada dashboard tiene
**6 visuales + 4 KPI cards**, ni uno más.

### Lo que NO vamos a hacer (consciente)

| Feature descartada | Por qué |
|---|---|
| AI / LLM para generar charts | Complejo, distrae del foco y agrega latencia |
| Real-time data via WebSocket | Innecesario con datos sintéticos |
| Anomaly detection automático | Requiere modelo en producción, fuera de scope |
| Multi-tenant / auth | Showcase público, no producto SaaS |
| Mobile native app | Web responsive optimizado es suficiente |
| Comentarios colaborativos | Requiere backend y base de datos de usuarios |
| **Treemap** | Recharts no lo tiene; la barra horizontal comunica la concentración igual o mejor |
| **Comparación Year-over-Year** | El dataset cubre 12 meses justos; no hay período YoY completo |

### Stack final para interactividad

| Feature | Librería | Justificación |
|---|---|---|
| Charts base | **Recharts 3.x** | Liviano, estándar, flexible. Tremor descartado por incompatibilidad con Tailwind 4 |
| Heatmap RFM | CSS Grid + Radix Tooltip | 0 dependencias extra, accesible y render nativo |
| Filtros | shadcn/ui Calendar + Command + Popover | Componentes accesibles y estilizados con Tailwind 4 |
| Drawer | shadcn Sheet (Radix UI) | Drill-downs y filtros móviles |
| Estado (UI) | Zustand 5 | Sólo estado efímero de UI. Los filtros viven en la URL |
| Estado (filtros) | nuqs v2 | Fuente de verdad de filtros + `NuqsAdapter` en `app/providers.tsx` |
| Export PNG | `html-to-image` | Sujeto a verificación temprana (ver Riesgos) |
| Animaciones | CSS transitions nativas | Sin dependencia extra en el bundle crítico |
| Tooltips custom | Custom Recharts `<Tooltip>` | Contexto de negocio, deltas y benchmarks |

**Bundle por ruta (presupuesto, medido en el build):** landing **< 120KB gzipped** (sin
Recharts), cada dashboard **< 300KB gzipped**. El estimado original de "220-260KB" mezclaba
la landing y los dashboards; acá se separa.

## Criterios de aceptación (Definition of Done)

El spec original no tenía ninguno, lo que hacía los sprints imposibles de cerrar. Estos
criterios aplican **por sprint** y **al proyecto completo**.

### Globales (aplican a las 4 rutas)

- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO 100
- [ ] LCP < 2,5s y CLS < 0,1 en emulación móvil 4G
- [ ] 0 errores de consola y 0 errores de hidratación en las 3 rutas de dashboard
- [ ] Bundle dentro del presupuesto por ruta
- [ ] TypeScript `strict` sin `any` implícito y `pnpm build` limpio
- [ ] Cada chart wrapped en `ChartFrame` con `aria-label` y tabla equivalente
- [ ] Todo filtro de chart replicable por teclado
- [ ] Estados de carga, vacío y error presentes
- [ ] `pnpm data:check` en verde: sin nulls, FK válidas, y KPIs `derived` reconciliados
      contra `initialKpis` dentro de 0,5%
- [ ] `pnpm test` en verde sobre `data-engine.ts` y las reglas de `lib/rfm.ts`
- [ ] Diseño responsive verificado a 375px, 768px y 1440px, sin scroll horizontal
- [ ] `LICENSE` MIT presente en el repo

### Por dashboard

- [ ] 4 KPI cards con valor, delta, sparkline, benchmark y tooltip de glosario con fuente
- [ ] 6 visualizaciones, todas reactivas a los filtros activos
- [ ] Los 4 tipos de slicer funcionando y serializados en la URL
- [ ] Presets de fecha anclados a `meta.periodoFin`, con período anterior correcto
- [ ] Cross-filtering en ≥ 3 charts, con chips visibles y botón de limpiar
- [ ] ≥ 2 drill-downs funcionando con el `Sheet` lateral
- [ ] `businessInsight` presente y coherente con las series del dataset
- [ ] `generateMetadata` con OG image específica de la industria
- [ ] Badge "Datos sintéticos" + fecha de corte visibles sin hacer scroll

### Landing

- [ ] 3 cards con nombre, industria, 3 KPIs clave y CTA directo
- [ ] Links a los 3 repos técnicos de evidencia
- [ ] Sin Recharts en el bundle de esta ruta
- [ ] Value proposition entendible en 10 segundos (ver "Métricas de éxito")

## Métricas de éxito del portafolio

El objetivo declarado es "demuestrar en 10 segundos". Eso es medible, y el spec no lo medía.

| Métrica | Cómo se mide | Objetivo |
|---|---|---|
| Tiempo hasta el primer insight | % de visitantes que hacen scroll > 50% en < 30s (Vercel Analytics) | > 40% |
| Profundidad de exploración | Sesiones con ≥ 1 cross-filter aplicado | > 25% |
| Dashboard más valorado | Sesiones por ruta `/retail` vs `/banca` vs `/logistica` | informar, no optimizar |
| Salida hacia la evidencia | Clics en `RepoLinkBadge` hacia GitHub | > 10% de sesiones |
| Éxito real | Cuántas entrevistas salen de este link | se registra a mano |

> Vercel Analytics es gratuito en el plan elegido. Se activa en el Sprint 1 porque el
> costo de activarlo después es no tener histórico.

## Privacidad y qué se publica

> ⚠️ **Este archivo también es público.** Una regla de privacidad escrita *citando* lo que no
> debe publicarse sigue publicándolo. Por eso esta sección describe la regla sin reproducir
> ningún dato sensible: ni remuneraciones, ni nombres de empresas, ni estados de proceso.

Una versión anterior de este spec incluía una tabla de mapeo a ofertas concretas con
remuneración, empresa nombrada y estado del proceso. Eso no debe estar en un repositorio
público: es información de candidatura —y vincular una empresa confidencial con un dato
concreto expone a las dos partes—. La tabla se eliminó del documento.

| Regla | Detalle |
|---|---|
| **Offer-mapping: fuera del repo** | Ningún detalle de postulaciones (remuneración, empresa, etapa del proceso, ciudad) aparece en este repositorio, ni siquiera como ejemplo en la documentación. |
| **Qué sí se publica** | "Construido para casos de Retail, Banca y Logística del mercado chileno" — industrias, nada más. |
| **Dónde vive el detalle** | Documento privado fuera del repo. No se enlaza desde el README por defecto. |
| **Nombres de empresas reales** | Los datasets usan nombres genéricos ("Retail Omnicanal Chileno (simulación)"). Los nombres reales deRetailers, bancos y operadores logísticos **no aparecen ni en la UI ni en los JSON**. Se pueden mencionar en conversación de entrevista, donde hay contexto y acuerdo. |
| **Disclaimer en la UI** | Badge "Datos sintéticos" + fecha de corte en cada dashboard, no sólo en el README: el screenshot que se comparte en LinkedIn es el que circula. |
| **Datos que nunca entran** | Sin datos personales, sin RUT, sin correos, sin nombres de clientes. Los IDs son sintéticos (`CU-0412`). |

## Mapping a industrias objetivo

| Dashboard | Industrias que cubre |
|---|---|
| Retail | Retail y e-commerce chileno: customer insight, ticket, RFM, conversión |
| Banca | Banca y Monumentos Financieros Chilenos: mora CMF, captaciones, churn, riesgo |
| Logística | Logística y distribución: OTIF, lead time, concentración de proveedores |

> El detalle de ofertas concretas se mantiene fuera de este repositorio. Ver "Privacidad".

## Relación con el resto del portafolio

```
berriosb/berriosb                       ← profile README (lista TODO)
├── dashboards-portfolio (ESTE)         ← showcase visual rápido
├── retail-bi-chile                     ← evidencia dura retail (Python + DuckDB)
├── banca-chile-datos                   ← evidencia dura banca (Python + DuckDB)
├── logistica-chile-datos               ← evidencia dura logística (Python + DuckDB)
├── chilecompra-anomalias-sql           ← SQL público + visualización
├── sql-portfolio                       ← queries SQL puras
├── powerbi-models-tmdl                 ← modelos Power BI sin .pbix
├── optimacx-reclamos (privado)         ← full-stack en producción
└── ... (AI/dev tools)
```

## Estado y plan de ejecución

> **Re-estimación:** el plan original asignaba 1 día al Sprint 1 completo (init + shadcn +
> landing + dashboard retail con heatmap, insight, glosario y cross-filtering) y 2-3 días
> los 3 dashboards con todo el nivel-2 de interactividad. Es un objetivo vendible pero no
> realizable, y un sprint que no cierra erosiona la confianza en todo lo demás.
>
> **Nuevo enfoque — profundidad sobre amplitud:**
> - **1 dashboard a profundidad máxima** (retail, nivel 2 completo).
> - **2 dashboards a nivel 1.5** (KPI cards, filtros, insight banner, charts reactivos;
>   sin cross-filtering entre charts ni drill-down).
>
> Un dashboard que se puede explorar entero convence más que tres que se ven iguales y
> superficiales. Si sobra tiempo, logística sube a nivel 2 antes que banca.

### Sprint 1 — Base + Retail completo (2-3 días)

1. `pnpm create next-app` (Next 16, TS strict, Tailwind 4) + `.nvmrc` + `LICENSE`
2. `scripts/generate-data.ts` con seed fijo → retail.json; `scripts/check-data.ts` con invariantes
3. shadcn/ui + Recharts 3.x + Zustand + nuqs; `app/providers.tsx` con `NuqsAdapter`
4. `lib/metric-definitions.ts` (data dictionary) y `lib/data-engine.ts` + tests Vitest
5. Landing con 3 cards, sin Recharts en el bundle
6. **Dashboard retail completo:** KPIs con deltas y benchmarks, Insight Banner, glosario, 6
   charts, heatmap RFM accesible, 4 slicers, cross-filtering, 2 drill-downs
7. `ChartFrame` + `DataTable` (accesibilidad de todos los charts)
8. Vercel Analytics + primer deploy + verificación de preview deploys

**DoD:** todos los criterios globales + los de "Por dashboard" aplicados a retail.

### Sprint 2 — Banca + Logística nivel 1.5 (2 días)

1. Extender el generador a banca (2 fact tables) y logística; `data:check` en verde
2. Dashboard banca: KPIs CMF con las dos definiciones de mora, aging, churn, colocaciones
3. Dashboard logística: OTIF, lead time con P50/P90, HHI con umbral DOJ/FTC, fill rate
4. Insight Banner por dashboard, derivado de los datos generados
5. `generateMetadata` + OG images por dashboard + favicon + sitemap
6. Deploy a producción

**DoD:** criterios globales + "Por dashboard" sin los ítems de cross-filtering y drill-down.

### Sprint 3 — Mobile + a11y + polish (1-2 días)

1. Drawer móvil `<Sheet side="bottom">` con contador de filtros activos
2. Chips de filtro activos + botón flotante "Limpiar"
3. Export a PNG con `html-to-image` **con fallback obligatorio** a "Guardar imagen como"
4. Animaciones de entrada, estados vacío/carga/error
5. Verificación responsive a 375/768/1440 y auditoría Lighthouse
6. README final con capturas y badge "datos sintéticos"
7. Primer release de GitHub

**Esfuerzo total estimado: 5-7 días de trabajo focalizado** (frente a los 2-3 del estimate original,
que era optimista en ~2,5×).

## Decisiones técnicas

| # | Decisión | Elección | Estado |
|---|---|---|---|
| 1 | **Charts lib** | Recharts **3.x** (Tremor descartado por Tailwind 4) | ✅ Definido 2026-09-29 |
| 2 | **Deploy target** | Vercel free tier | ✅ Definido 2026-09-29 |
| 3 | **Heatmap RFM** | CSS Grid 5×5 + Radix Tooltip, con conteo en texto | ✅ Definido 2026-09-29 |
| 4 | **Motor de interactividad** | Filtrado en memoria + **nuqs como fuente de verdad**, Zustand sólo UI | ✅ Definido 2026-09-29 |
| 5 | **Hooks de reclutador** | Insight Banner + Glosario benchmarks con fuente + Repo Link Badge + badge sintético | ✅ Definido 2026-09-29 |
| 6 | **Landing style** | Cards con íconos Lucide + 3 KPIs clave + CTA directo | ✅ Definido 2026-09-29 |
| 7 | **Tipografía** | Geist Sans (default de Next 16) | ✅ Definido 2026-09-29 |
| 8 | **Paleta** | Base neutra shadcn + 1 color de acento por dashboard (retail azul, banca verde, logística naranja) | ✅ Definido 2026-09-29 |
| 9 | **Datos sintéticos** | JSON embebido, **generado por script con seed fijo**, nunca editado a mano | ✅ Definido 2026-09-29 |
| 10 | **Treemap de HHI** | **Descartado** → barra horizontal de cuotas + tarjeta HHI con umbral | ✅ Definido 2026-09-29 |
| 11 | **Métricas** | Data dictionary en `lib/metric-definitions.ts`, con tipo `derived`/`precomputed` y reconciliación por `data:check` | ✅ Definido 2026-09-29 |
| 12 | **Frontera RSC** | Páginas server, dashboard como Client island, JSON importado desde el Client Component | ✅ Definido 2026-09-29 |
| 13 | **Modo de color** | **Light por defecto**, con `prefers-color-scheme` como enhancement. Las OG images son light | ✅ Definido 2026-09-29 |
| 14 | **Tests** | Vitest sobre `data-engine.ts` y `rfm.ts`. Sin E2E: el scope es 3 rutas estáticas | ✅ Definido 2026-09-29 |
| 15 | **Profundidad de sprints** | 1 dashboard nivel 2 + 2 dashboards nivel 1.5 | ✅ Definido 2026-09-29 |

## Riesgos identificados

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| 1 | **Presets de fecha contra `new Date()`** | El dashboard devuelve vacío y se ve roto | Anclaje obligatorio a `meta.periodoFin` en `lib/dates.ts` + banner "Datos al 30-09-2026" + `EmptyState` explicativo |
| 2 | **KPIs precomputados que contradicen a los derivados** | Dos screenshots con filtros distintos muestran números incompatibles | Clasificación `derived`/`precomputed` + reconciliación en `data:check` |
| 3 | **`html-to-image` con Recharts** | PNG con áreas recortadas o sin estilos: Recharts usa `clipPath` e IDs generados | Verificar en Sprint 1, no en el 3. Fallback obligatorio a "Guardar imagen como" |
| 4 | **Tamaño del bundle** | Carga lenta = el mensaje "rápido y bonito" se contradice | Presupuesto por ruta medido en el build. JSON importado desde el Client Component para no inflar la landing |
| 5 | **SVG de Recharts en mobile** | Desborde horizontal en pantallas chicas | `min-w-0` + `w-full` en padres de `ResponsiveContainer`, alturas fijas, test a 375px |
| 6 | **Cross-filtering sin React 19** | Filtros que no re-renderizan oady warnings de hydration | `useSyncExternalStore` vía nuqs v2; verificar peer deps de Recharts 3.x en el install |
| 7 | **Accesibilidad declarada pero no real** | Auditoría falla o queda sólo color | `ChartFrame` con `aria-label` + tabla equivalente + celdas RFM con conteo en texto |
| 8 | **Vercel free tier** | 100GB bandwidth/mes | Sobra para un portafolio; si se viraliza, plan Pro ($20/mes) o CDN externo |
| 9 | **Custom domain** | Ninguno | Opcional y no bloqueante: `dashboards.berriosb.cl` vía NIC Chile |
| 10 | **pnpm + Vercel** | Primer deploy falla instalando dependencias | `pnpm-lock.yaml` commiteado |
| 11 | **Publicar datos de candidatura** | Exposición de remuneración, empresa y estado de proceso | Ver sección "Privacidad y qué se publica" — la regla se escribe sin citar los datos |
| 12 | **Generador determinista** | Cambiar el seed rompe la coherencia con screenshots ya publicados | Seed fijo y documentado; regenerar sólo con motivo explícito y regenerar las OG images |

## Lo que sigue

1. ✅ Decisiones técnicas — cerradas las 15
2. ✅ Arquitectura de datos — data dictionary, schemas de los 3 dominios, invariantes
3. **Sprint 1:** `pnpm create next-app` + generador seeded + landing + retail nivel 2
4. **Sprint 1:** conectar a Vercel, activar Analytics, primer deploy
5. **Sprint 2:** banca + logística nivel 1.5 + OG images
6. **Sprint 3:** mobile drawer, export PNG, auditoría Lighthouse, release
7. (Opcional futuro) Migrar a Supabase sólo si se requiere persistencia multi-usuario o streaming en vivo
8. (Opcional futuro) Subir logística a nivel 2 completo si queda tiempo
