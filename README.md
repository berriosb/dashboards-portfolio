# dashboards-portfolio

> Showcase público de dashboards para el mercado chileno Data/BI.

Vitrina visual interactiva con 3 dashboards:

- 🛒 **Retail** — RFM, ticket, margen, conversión, NPS
- 🏦 **Banca** — Mora CMF, captaciones, colocaciones, churn
- 🚚 **Logística** — OTIF, lead time, concentración de proveedores, fill rate

**Estado:** en construcción. Ver [PROJECT.md](./PROJECT.md) para el spec completo y el plan.

## Qué es (y qué no)

**Es:** una demostración visual de dashboards interactivos sobre **datos sintéticos** del mercado chileno. Puro front-end, sin backend, sin auth, sin datos reales.

**No es:** un repositorio de análisis reproducibles. Para eso están [`retail-bi-chile`](https://github.com/berriosb), [`banca-chile-datos`](https://github.com/berriosb) y [`logistica-chile-datos`](https://github.com/berriosb), que tienen pipelines con Python + DuckDB.

## Stack

| Capa | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Lenguaje | TypeScript 5.7 strict |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts 3.x |
| Iconos | Lucide |
| Estado | nuqs (URL como fuente de verdad) + Zustand (UI) |
| Tests | Vitest |
| **Deploy** | **Vercel** — [dashboards-portfolio-berriosb.vercel.app](https://dashboards-portfolio-berriosb.vercel.app) |
| Package manager | pnpm |

## Estructura

```
dashboards-portfolio/
├── app/                     ← rutas (server) + providers cliente
│   ├── page.tsx             ← landing con 3 cards
│   ├── retail/page.tsx      ← dashboard retail
│   ├── banca/page.tsx       ← dashboard banca
│   └── logistica/page.tsx   ← dashboard logística
├── components/
│   ├── charts/              ← wrappers Recharts + ChartFrame accesible
│   ├── cards/               ← DashboardCard
│   └── insights/            ← InsightBanner
├── data/                    ← datasets sintéticos (generados, no editados a mano)
├── lib/                     ← data-engine, metric-definitions, rfm, format, dates
├── scripts/                 ← generate-data (seed fijo) + check-data (invariantes)
└── tests/                   ← invariantes de agregación y segmentación
```

## Quickstart

```bash
pnpm install
pnpm data:generate   # genera data/*.json de forma determinista
pnpm data:check      # valida invariantes y reconcilia KPIs
pnpm dev
# → http://localhost:3000
```

## Datos

**Todos los datasets son sintéticos y se generan por script con un seed fijo** (`scripts/generate-data.ts`), de modo que son reproducibles y sus cifras se reconcilian con los KPIs que muestra cada dashboard (`scripts/check-data.ts`).

Los datos reflejan patrones del mercado chileno de retail, banca y logística. **No contienen información real, nombres de empresas reales, ni datos personales**: los identificadores (`CU-0412`) son sintéticos y cada dashboard muestra un badge "Datos sintéticos" con su fecha de corte.

**Interactividad:** los filtros (cross-filtering, rangos de fechas, slicers) operan **100% en el cliente, en memoria**, con latencia sub-milisegundo y sin dependencias de red. El estado de los filtros vive en la URL, así que cualquier vista se puede compartir y abrir con los filtros ya aplicados.

## Enlaces

| | |
|---|---|
| Spec completo | [PROJECT.md](./PROJECT.md) |
| Definiciones de métricas | [PROJECT.md — data dictionary](./PROJECT.md#definiciones-de-métricas-data-dictionary) |
| Criterios de aceptación | [PROJECT.md — Definition of Done](./PROJECT.md#criterios-de-aceptación-definition-of-done) |

## Licencia

MIT — ver [LICENSE](./LICENSE).
