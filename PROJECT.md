---
type: proyecto
created: 2026-09-29
status: planning
stack: Next.js 16 + React 19 + TypeScript 5.7 + Tailwind 4
author: Bastián Berrios
goal: Vitrina showcase de dashboards para mercado chileno Data/BI
---

# dashboards-portfolio — Idea y especificación

## Objetivo

Crear un **proyecto showcase** (no un repositorio técnico más) que demuestre en 10 segundos que sabés hacer dashboards. Es el **front del portafolio**, no la evidencia dura.

A diferencia de los 3 repos técnicos (`retail-bi-chile`, `banca-chile-datos`, `logistica-chile-datos`) que tienen análisis reproducibles con Python + DuckDB, **este es puro front-end con datos embebidos**.

## Lo que NO es

- ❌ Un repositorio técnico con análisis reproducibles
- ❌ Un tutorial de dashboards
- ❌ Un clon de Power BI / Tableau
- ❌ Un dashboard empresarial de verdad (datos son sintéticos)

## Lo que SÍ es

- ✅ Una **landing page** con 3 cards (retail / banca / logística)
- ✅ **3 dashboards interactivos** completos (uno por industria)
- ✅ Deployado en GitHub Pages con dominio `berriosb.github.io/dashboards-portfolio`
- ✅ Linkeado desde el profile README `berriosb/berriosb` como primer item

## Stack — "el stack de oro"

| Capa | Tech | Por qué |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 | Estándar de la industria 2026, RSC, PPR |
| **Lenguaje** | TypeScript 5.7 strict | Type safety, mejor DX |
| **Estilos** | Tailwind CSS 4 + shadcn/ui | Velocidad de prototipado + componentes accesibles |
| **Charts** | Recharts o Tremor (BI-grade) | Componentes hechos para BI, no libs genéricas |
| **Data viz** | Lucide icons + Radix primitives | Consistencia visual |
| **State** | Zustand 5 (si hace falta) | Solo si algún dashboard requiere interacción compleja |
| **Deploy** | **Vercel** (free tier) | Creado por el equipo de Next.js, soporte nativo, HTTPS + custom domain gratis, preview deploys por PR, $0/mes |
| **Package manager** | pnpm 9 | Estándar del ecosistema Next.js |

## Estructura del proyecto

```
dashboards-portfolio/
├── PROJECT.md                       ← este archivo
├── README.md                        ← descripción pública del showcase
├── LICENSE                          ← MIT
├── package.json
├── next.config.ts                   ← output: 'export' para GitHub Pages
├── tsconfig.json                    ← strict: true
├── tailwind.config.ts
├── postcss.config.mjs
├── .gitignore
├── app/
│   ├── layout.tsx                   ← root layout
│   ├── page.tsx                     ← landing con 3 cards
│   ├── globals.css
│   ├── retail/
│   │   └── page.tsx                 ← dashboard retail
│   ├── banca/
│   │   └── page.tsx                 ← dashboard banca
│   └── logistica/
│       └── page.tsx                 ← dashboard logística
├── components/
│   ├── ui/                          ← shadcn primitives
│   ├── cards/
│   │   └── DashboardCard.tsx        ← card de la landing
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── charts/                      ← wrappers Recharts/Tremor
│       ├── KpiCard.tsx
│       ├── LineChartCard.tsx
│       ├── BarChartCard.tsx
│       └── RfmHeatmap.tsx
├── data/                            ←── datasets embebidos (sintéticos)
│   ├── retail.json                  ← Ripley-like retail
│   ├── banca.json                   ← BCO Falabella-like banca
│   └── logistica.json               ← Copec-like logística
├── lib/
│   ├── format.ts                    ← CLP, percent, dates
│   └── constants.ts                 ← paleta, KPIs, copy
└── public/
    ├── og-image.png                 ← OpenGraph card
    └── favicon.svg

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
4. Deploy → URL: `https://dashboards-portfolio-berriosb.vercel.app`

**Opción B — vía CLI:**
```bash
pnpm i -g vercel
vercel login
cd ~/Proyectos/dashboards-portfolio
vercel              # primer deploy (preview)
vercel --prod       # deploy a producción
```

### URL objetivo

- **Producción:** `https://dashboards-portfolio-berriosb.vercel.app`
- **Custom domain (opcional):** si tenés `berriosb.cl`, mapear a `dashboards.berriosb.cl` gratis desde el dashboard de Vercel

### Después de conectado

- Cada `git push origin main` → deploy automático a producción
- Cada PR → preview URL única (útil para mostrar a recruiters sin tocar main)
- Dashboard de Vercel muestra deploys, bandwidth, errores en runtime

### Riesgos eliminados vs GitHub Pages

- ~~`next export` con `basePath: '/dashboards-portfolio'`~~ → Vercel rutea limpio
- ~~404.html hack para SPA routing~~ → App Router funciona nativo
- ~~Bundle estático pesado en `./out/`~~ → Vercel optimiza automático

## Datasets — qué muestra cada dashboard

### 🛒 Retail (4-5 visualizaciones)

| Visualización | Qué muestra | Datos sintéticos |
|---|---|---|
| **KPI cards** (4) | Ticket promedio, margen bruto %, conversión %, NPS | Mes actual vs mes anterior |
| **Ventas por categoría** (bar chart) | Top 10 categorías por venta | 12 categorías con venta mensual |
| **RFM heatmap** | Segmentación de clientes (Recency × Frequency × Monetary) | 1000 clientes simulados |
| **Funnel conversión** | Visitantes → Carrito → Compra → Repeat | 4 etapas con drop-off |
| **Tendencia mensual** (line chart) | Ventas últimos 12 meses | Serie temporal con estacionalidad |

### 🏦 Banca (4-5 visualizaciones)

| Visualización | Qué muestra | Datos sintéticos |
|---|---|---|
| **KPI cards** (4) | Captación neta, mora %, ROE, clientes activos | Mes actual vs mes anterior |
| **Colocaciones por producto** (stacked bar) | Préstamos consumo, hipotecario, comercial, tarjetas | 12 meses apilados |
| **Distribución de morosidad** (area chart) | Mora 30, 60, 90+ días | Curva de aging |
| **Tasa de fuga mensual** (line chart) | Churn rate por cohorte | 12 meses |
| **Segmento de clientes** (donut) | Alto / medio / bajo valor | Distribución porcentual |

### 🚚 Logística (4-5 visualizaciones)

| Visualización | Qué muestra | Datos sintéticos |
|---|---|---|
| **KPI cards** (4) | OTIF %, lead time promedio, HHI proveedores, fill rate | Mes actual |
| **OTIF por ruta** (bar chart) | Cumplimiento por destino | 15 rutas |
| **Lead time distribution** (histogram) | Distribución de días entrega | 1000 envíos simulados |
| **Concentración de proveedores** (HHI treemap) | Cuota de mercado por proveedor | Top 20 proveedores |
| **Costo por km** (line chart) | Evolución costo transporte | 12 meses |

## Mapping a ofertas reales

| Dashboard | Ofertas que ayuda a cerrar |
|---|---|
| Retail | Confidencial Retail (2026-09-29, Analista BI Customer Insight, Las Condes, $1.9M) + Autoplanet (Analista Datos Clientes, Quilicura) |
| Banca | BancoEstado BECO (Analista Procesos, etapa 2 AIRA activo) + Banco Falabella (Data Analyst Junior) |
| Logística | Logística San Bernardo (2026-09-25, Ley 21.015) + First EST CAP/Copec (2026-09-25, $2.0M) |

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

### Sprint 1 — Landing + 1 dashboard completo (1 día)

1. Init Next.js 16 con TypeScript + Tailwind 4
2. Instalar shadcn + Recharts/Tremor
3. Landing con 3 cards navegables
4. **Dashboard retail completo** (4-5 visualizaciones)
5. Deploy a GitHub Pages manual

### Sprint 2 — Banca + Logística (1 día)

1. Dashboard banca con 4-5 visualizaciones
2. Dashboard logística con 4-5 visualizaciones
3. Navegación consistente entre los 3
4. OG image + favicon
5. Deploy final

### Sprint 3 — Polish + release (medio día)

1. Animaciones de entrada en gráficos
2. Dark mode (nice-to-have)
3. Responsive mobile
4. README con screenshots
5. Primer GitHub release con ZIP de artefactos

**Esfuerzo total estimado:** 2-3 días de trabajo focalizado.

## Decisiones técnicas

| # | Decisión | Elección | Estado |
|---|---|---|---|
| 1 | **Charts lib** | Recharts (liviano, BI-grade) | ✅ Definido |
| 2 | **Deploy target** | **Vercel** (free tier, soporte Next.js nativo) | ✅ **Definido 2026-09-29** |
| 3 | **Landing style** | Cards con íconos Lucide + descripción + CTA | ⏳ Pendiente |
| 4 | **Tipografía** | Geist Sans (default Next 16) | ⏳ Pendiente |
| 5 | **Paleta** | 1 color por dashboard (retail=azul, banca=verde, logística=naranja) | ⏳ Pendiente |
| 6 | **Datos sintéticos** | Generados a mano en JSON estático (no Faker en runtime) | ⏳ Pendiente |

## Riesgos identificados

- **Tamaño del bundle**: Recharts + Tremor pesan ~200KB. Aceptable para showcase, no para producción.
- **Vercel free tier limits**: 100GB bandwidth/mes. Para un portafolio es más que suficiente; si un repo se viraliza y pasa eso, evaluar plan Pro ($20/mes) o self-host.
- **Custom domain**: Si se quiere `dashboards.berriosb.cl` hay que tener el dominio registrado en NIC Chile o similar (no incluido en este plan).

## Lo que sigue

1. ~~Confirmar las decisiones técnicas de la tabla~~ → Deploy definido como Vercel ✅
2. ~~Decidir deploy target~~ → Vercel ✅
3. Empezar Sprint 1: `pnpm create next-app` + landing + dashboard retail
4. Conectar repo a Vercel y verificar primer deploy
5. Sprint 2: banca + logística
6. Sprint 3: polish + OG image + release