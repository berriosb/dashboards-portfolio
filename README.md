# dashboards-portfolio

> Showcase público de dashboards para el mercado chileno Data/BI.

Vitrine visual interactiva con 3 dashboards completos:

- 🛒 **Retail** — RFM, ticket, NPS, conversión
- 🏦 **Banca** — KPIs CMF, captaciones, mora, churn
- 🚚 **Logística** — OTIF, lead time, HHI proveedores, fill rate

## Qué es (y qué no)

**Es:** una demostración visual de dashboards interactivos sobre datos sintéticos del mercado chileno. Puro front-end, sin backend, sin auth.

**No es:** un repositorio técnico con análisis reproducibles. Para eso están `retail-bi-chile`, `banca-chile-datos`, `logistica-chile-datos`.

## Stack

| Capa | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Lenguaje | TypeScript 5.7 strict |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |
| Iconos | Lucide |
| Deploy | GitHub Pages / Netlify / Vercel |
| Package manager | pnpm |

## Estructura

```
dashboards-portfolio/
├── app/
│   ├── page.tsx              ← landing con 3 cards
│   ├── retail/page.tsx       ← dashboard retail
│   ├── banca/page.tsx        ← dashboard banca
│   └── logistica/page.tsx    ← dashboard logística
├── components/
│   ├── charts/               ← wrappers Recharts
│   └── cards/                ← DashboardCard
├── data/                     ← datasets sintéticos (JSON embebidos)
└── lib/                      ← format, constants
```

## Quickstart

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

## Deploy

```bash
pnpm build
# → output en ./out
```

Subir `./out` a GitHub Pages, Netlify o Vercel.

## Datos

Todos los datasets son **sintéticos** y generados para reflejar patrones del mercado chileno (Ripley-like retail, BCO Falabella-like banca, Copec-like logística). Nada de datos reales ni privados.

## Offer-mapping

| Dashboard | Oferta que ayuda a cerrar |
|---|---|
| Retail | Confidencial Retail (Analista BI Customer Insight, Las Condes, 2026-09-29) |
| Banca | BancoEstado BECO (Analista Procesos, etapa 2 AIRA activo) |
| Logística | Logística San Bernardo (Analista Datos BI, Ley 21.015, 2026-09-25) |

## Licencia

MIT