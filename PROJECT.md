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

### Fuente de datos: JSON estático embebido (decidido)

**Decisión 2026-09-29:** Los 3 dashboards consumen datos desde archivos JSON estáticos embebidos en el bundle de Next.js (`data/retail.json`, `data/banca.json`, `data/logistica.json`).

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
5. **Upgrade path limpio:** si después queremos Supabase, el cambio es de 1 hora (solo cambia el import de los datos).

#### Cuándo SÍ migrar a Supabase / BaaS

| Trigger | Acción |
|---|---|
| Quieres demostrar **full-stack skills** explícitamente | Migrar a Supabase + RLS |
| Quieres **filtros interactivos** que cambien los datos | Migrar (JSON no permite queries dinámicas eficientes) |
| Quieres **datos que se actualicen solos** (scraping diario) | Migrar + n8n cron |
| Tienes 3+ dashboards con **datos relacionados** que se conectan | Migrar (relaciones SQL) |

**Para este showcase ninguno de estos triggers aplica.** Es demo, no producto.

#### Relación con el resto del portafolio

La señal de "sé integrar DBs reales" ya la dan otros repos del portafolio:

- `dash-bi` — Next.js + Postgres + Drizzle + multi-tenant + RLS (producto en producción)
- `chilecompra-anomalias-sql` — DuckDB + análisis SQL reproducible

El showcase **no necesita repetir esa señal**. Su rol es distinto: vitrina visual rápida.

### Formato de los JSON

```typescript
// data/retail.json (ejemplo de shape, no contenido final)
{
  "kpis": [
    { "label": "Ticket promedio", "value": 45230, "delta": 12.3, "unit": "CLP" },
    { "label": "Margen bruto", "value": 38.5, "delta": 2.1, "unit": "%" }
  ],
  "ventasPorCategoria": [
    { "categoria": "Hogar", "ventas": 125000000 },
    ...
  ],
  "rfmSegments": [...],
  "funnel": [...],
  "tendenciaMensual": [...]
}
```

**Reglas:**
- Sin campos `null` (usar `0` o `[]` según corresponda)
- Fechas en ISO 8601 (`"2026-09-15"`)
- Montos en CLP como enteros (sin separadores de miles, sin símbolo)
- Porcentajes como números (no strings), el consumidor decide formato

### Por industria (4-5 visualizaciones)

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

## Interactividad — qué filtros y capacidades tendrá cada dashboard

**Decisión 2026-09-29:** Los 3 dashboards tendrán **interactividad nivel 2** (exploratory), basado en patrones de UX de Power BI / Tableau / Looker documentados en diseño de dashboards BI 2026.

### Los 3 niveles de interactividad (referencia)

| Nivel | Capacidad | Ejemplo |
|---|---|---|
| **Nivel 1: Display** | Solo lectura + selectores básicos (date picker, dropdowns) | Looker Studio, Infogram |
| **Nivel 2: Exploratory** ⭐ | Cross-filtering + drill-down + comparison toggle | Power BI, Tableau, Metabase, Looker |
| **Nivel 3: Generative** | Layout + charts + filtros generados desde texto | ThoughtSpot, Qlik Sense |

**Vamos nivel 2**: lo que el 90% de los recruiters BI espera ver cuando abren un dashboard, sin meternos en AI/LLM todavía.

### Capacidades de interactividad por dashboard

Cada uno de los 3 dashboards tendrá las siguientes capacidades implementadas:

#### 1. Filtro de rango de fechas (siempre presente)

- **Tipo:** preset selector + custom date picker
- **Presets:** "Últimos 7 días" / "Últimos 30 días" / "Este mes" / "Mes anterior" / "YTD" / "Custom"
- **Implementación:** componente `<DateRangeFilter>` con shadcn Calendar + presets buttons
- **Comportamiento:** todos los charts de la página filtran al cambiar
- **Comparación:** toggle "Comparar con período anterior" (suma un dataset fantasma y muestra delta %)

**Patrón UX (referencia Power BI / Metabase):**
```
[Este mes ▼] [Comparar ✓]   Showing: Sep 1 – Sep 30, 2026 vs Ago 1 – Ago 31, 2026
```

#### 2. Filtros de dimensión (segmentación)

Cada dashboard tendrá 2-4 slicers de dimensión según su naturaleza:

| Dashboard | Slicers |
|---|---|
| Retail | Categoría (multi-select), Región, Canal (online/tienda/ambos), Segmento cliente (nuevo/recurrente/VIP) |
| Banca | Producto (consumo/hipotecario/comercial/tarjeta), Segmento (alto/medio/bajo valor), Sucursal, Mora bucket |
| Logística | Ruta, Transportista, Tipo producto, Prioridad (estándar/express) |

- **Tipo:** dropdown multi-select (shadcn `<MultiSelect>` o Command)
- **Implementación:** estado en URL search params (`?categoria=hogar,tecnologia&canal=online`) para que los filtros sean compartibles
- **Comportamiento:** charts refilterizan al cambiar; KPIs recalculan

#### 3. Cross-filtering entre charts (lo más impactante)

- **Patrón:** click en un bar/segment de cualquier chart → todos los demás charts de la página filtran a esa dimensión
- **Visual feedback:** elemento clickeado se resalta, otros charts muestran contexto reducido
- **Reset:** botón "Limpiar filtros" arriba a la derecha
- **Implementación:** estado global con Zustand (`useDashboardFilters` hook) + listeners en cada chart

**Ejemplo en retail:**
- Click en la barra "Hogar" del chart de ventas por categoría → RFM heatmap muestra solo clientes que compraron hogar; funnel conversión muestra conversión de clientes de hogar; tendencia mensual muestra serie solo de hogar.
- Click en una celda del RFM heatmap (segmento "Champions") → todos los demás charts filtran a ese segmento.

#### 4. Drill-down en clicks (jerarquía de detalle)

- **Patrón:** click en un elemento → drawer lateral derecho se abre con detalle
- **Implementación:** shadcn `<Sheet>` (drawer) + datos cargados desde el JSON por id
- **Reversible:** botón "Cerrar" obvio + breadcrumb visible

**Drill-downs por dashboard:**

| Dashboard | Click en | Abre drawer con |
|---|---|---|
| Retail | Categoría | Top 20 SKUs de la categoría, con precio, margen, unidades vendidas, link a "ver producto" |
| Retail | Segmento RFM | Lista de 50 clientes del segmento, con última compra, ticket promedio, LTV estimado |
| Banca | Producto | Aging de mora detalle (cuántos clientes en 30/60/90+), ticket promedio, tasa de aprobación |
| Banca | Segmento | Distribución etaria, productos contratados, canal de adquisición |
| Logística | Ruta | Volumen por transportista, %OTIF histórico, top 10 clientes de esa ruta |
| Logística | Proveedor | Cuota HHI detalle, lead time P50/P90, incidentes del período |

#### 5. Tooltips ricos (hover)

- **Patrón:** tooltip custom que muestra contexto + valor + delta + sparkline mini
- **Implementación:** `<Tooltip>` de Recharts con `<CustomTooltip>` que arma el contenido
- **Contenido típico:**
  ```
  Marzo 2026
  Ventas: $125.4M
  vs Feb: +12.3% ↑
  vs Mar 2025: +8.1% ↑
  [▁▂▃▅▇▆▅▆▇]  ← sparkline 12 meses
  ```

#### 6. Comparación con período anterior

- **Patrón:** cada KPI card muestra valor actual + delta % + sparkline
- **Visual:** color verde/rojo según delta, ícono ↑/↓, tooltip explica qué se compara
- **Implementación:** JSON incluye campo `previousValue` por cada KPI

#### 7. Export / Share

- **Export PNG:** botón en cada chart para descargar como PNG (vía `html-to-image` o `dom-to-image`)
- **Share URL:** filtros actuales se serializan a URL params; botón "Compartir vista" copia el link
- **Print friendly:** layout responsive que no rompe al imprimir

### Patrones de layout (referencia dashboards BI)

| Patrón | Cuándo usarlo | Aplicación |
|---|---|---|
| **F-pattern** | Dashboards densos con mucha data | Logística (15 rutas + 1000 envíos) |
| **Z-pattern** | Dashboards simples con flujo narrativo | Retail (4 KPIs → 4 charts) |
| **Grid 2x2 / 3x3** | Dashboards balanceados | Banca (KPIs + 4 charts balanceados) |

**Regla de los 5-8 visuales por página** (Power BI best practice). Cada dashboard tendrá **6-8 visuales máximo**, no más.

### Lo que NO vamos a hacer (consciente)

| Feature descartada | Por qué |
|---|---|
| AI / LLM para generar charts | Complejo, fuera de scope showcase |
| Real-time data via WebSocket | Innecesario con datos estáticos |
| Anomaly detection automático | Requiere modelo, no es showcase |
| Multi-tenant / auth | Showcase público, no producto |
| Mobile native app | Web responsive es suficiente |
| Comentarios colaborativos | Requiere backend |

### Stack final para interactividad

| Feature | Librería |
|---|---|
| Charts base | Recharts (144KB gzipped, 57M weekly downloads) |
| Filtros | shadcn/ui Calendar + Command + Select |
| Drawer | Shadcn Sheet (Radix UI) |
| Estado compartido | Zustand 5 |
| URL state | `nuqs` (sync con searchParams) |
| Export PNG | `html-to-image` (~12KB) |
| Animaciones | Framer Motion (~50KB, opcional) |
| Tooltips custom | Custom Recharts `<Tooltip>` |

**Bundle total estimado:** ~250-300KB gzipped, comparable con Tremor (~280KB) pero con más flexibilidad.

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
| 6 | **Datos sintéticos** | JSON estático embebido en `data/*.json` (no Faker runtime, no DB) | ✅ **Definido 2026-09-29** |

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
7. (Opcional futuro) Evaluar migración a Supabase si quieres filtros interactivos o live data — ver `PROJECT.md` § "Cuándo SÍ migrar a Supabase / BaaS"