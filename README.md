# Dashboards Portfolio — BI & Data Showcase Chile 🇨🇱

> Vitrina interactiva de alto impacto para el mercado chileno de Business Intelligence & Data Analytics.

Una plataforma frontend moderna, accesible y de rendimiento instantáneo (0ms en cliente) que presenta 3 tableros analíticos de nivel directivo para sectores estratégicos de Chile:

- 🛒 **Retail Omnicanal & Fidelización (`/retail`)** — Matriz RFM 5x5 algorítmica, embudo de conversión digital, margen comercial, ticket promedio y NPS.
- 🏦 **Banca Comercial & Riesgo Crediticio (`/banca`)** — Calidad de cartera, Mora CMF temprana (30+) vs vencida (90+), aging de provisiones IFRS 9, liquidez y ROE.
- 🚚 **Logística & Cadena de Suministro (`/logistica`)** — Cumplimiento de entregas OTIF (On-Time In-Full), distribución de lead time P50/P90, concentración de proveedores HHI y Pareto de incidencias.

🌐 **Demo en vivo:** [dashboards-portfolio-berriosb.vercel.app](https://dashboards-portfolio-berriosb.vercel.app)

---

## 🎯 Propósito y Enfoque

- **Front-end puro & Performance 0ms:** Todos los cálculos, cross-filtering, segmentaciones y agregaciones se resuelven en el cliente en memoria con datasets sintéticos estructurados.
- **Deep Linking Total con `nuqs`:** Cualquier filtro seleccionado (categorías, segmentos, rangos temporales, tramos de mora, transportistas) se serializa en la URL del navegador. Incluye botón interactivo `<ShareViewButton />` para compartir vistas exactas.
- **Craft Visual & Sin "Design Drift":** Diseñado bajo principios de UI de alto estándar (modo `Operate` para densidad limpia en dashboards, modo `Experience` en landing). Regla estricta de un único color de acento semántico por tablero (Azul para Retail, Verde Esmeralda para Banca, Ámbar para Logística) y tipografía con cifras numéricas tabulares obligatorias (`tabular-nums`).
- **Exportación Ejecutiva `@media print`:** Hojas de estilo calibradas para imprimir o exportar a PDF en alta fidelidad, ocultando controles interactivos, barras de navegación y forzando colores exactos de gráficos.

---

## 💼 Hooks de Seniority y Empleabilidad

Cada uno de los 3 tableros incorpora 3 componentes clave diseñados para directores de data y reclutadores técnicos:

1. **`<InsightBanner />`:** Banner superior que sintetiza el hallazgo analítico más relevante del período y entrega una recomendación de negocio inmediata y accionable.
2. **`<GlossaryTooltip />`:** Glosario contextual con tooltip accesible sobre cada KPI, explicando la fórmula y el estándar del mercado chileno (normativa CMF, índices CCS, estándares EDI Chile, DOJ/FTC).
3. **`<RepoLinkBadge />`:** Acceso directo a la evidencia de ingeniería de datos y pipelines reproducibles en GitHub ([`retail-bi-chile`](https://github.com/berriosb/retail-bi-chile), [`banca-chile-datos`](https://github.com/berriosb/banca-chile-datos), [`logistica-chile-datos`](https://github.com/berriosb/logistica-chile-datos)).

---

## 📊 Matriz de Métricas y Benchmarks Locales

| Dashboard | KPI Principal | Definición / Fórmula | Benchmark Mercado Chileno |
|---|---|---|---|
| **Retail** | **Facturación Total** | Suma neta de ingresos por ventas en CLP | Reconciliado con seed determinista |
| **Retail** | **Margen Bruto** | `(Ventas - Costos) / Ventas` | 32.0% (Promedio retail especializado) |
| **Retail** | **Segmentación RFM** | Matriz 5x5 algorítmica de Recencia, Frecuencia y Monto | Modelo Quintil (Campeones, Leales, En Riesgo, Dormidos) |
| **Retail** | **Conversión Embudo** | `Sesiones → Carrito → Checkout → Pago` | 2.5% (Tasa conversión e-commerce CCS) |
| **Banca** | **Mora 30+ CMF** | Saldo vencido > 30 días / Cartera Bruta | 2.5% (Umbral regulatorio de alerta CMF) |
| **Banca** | **Mora 90+ CMF** | Saldo vencido > 90 días / Cartera Bruta | 1.0% (Gatillo provisiones castigadas) |
| **Banca** | **Cobertura Provisiones** | Provisiones constituidas / Cartera con mora | 130.0% (Estándar de solvencia IFRS 9) |
| **Banca** | **ROE Anualizado** | Utilidad neta anualizada / Patrimonio promedio | 14.5% (Promedio sistema bancario ABIF/CMF) |
| **Logística** | **Cumplimiento OTIF** | % de órdenes entregadas a tiempo y completas | 95.0% (Estándar logístico EDI Chile) |
| **Logística** | **Lead Time P50 / P90** | Percentiles 50 y 90 de duración en tránsito (hrs) | 18.0 hrs P50 / 36.0 hrs P90 (SLA estándar) |
| **Logística** | **Concentración HHI** | Índice Herfindahl-Hirschman de flota: $\sum s_i^2$ | < 1,800 pts (Mercado moderadamente concentrado) |
| **Logística** | **Fill Rate** | Unidades despachadas / Unidades solicitadas | 98.0% (Exactitud en picking de CD) |

---

## 🛠️ Stack Tecnológico

| Capa | Herramienta | Justificación Técnica |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** + **React 19** | Renderizado estático de rutas, RSC y compatibilidad con React Server Actions. |
| **Lenguaje** | **TypeScript 5.7 (Strict)** | Tipado exhaustivo de esquemas de datos, agregaciones y filtros sin `any`. |
| **Estilos** | **Tailwind CSS 4 (`@theme`)** + **shadcn/ui** | Configuración CSS-first, variables semánticas HSL, modo claro/oscuro nativo. |
| **Visualizaciones** | **Recharts 3.x puro** | Gráficos reactivos (`ResponsiveContainer`), tooltips tipados y paleta unificada. |
| **Heatmap RFM** | **CSS Grid Nativo + Radix Tooltip** | Cuadrícula 5x5 ultra-liviana sin hacks de SVG, totalmente accesible. |
| **Estado URL** | **`nuqs` v2** | Serialización determinista tipo Type-Safe SearchParams para deep linking y sharing. |
| **Tests** | **Vitest** | Cobertura de suites para motores analíticos y reconciliación de invariantes. |
| **Iconografía** | **Lucide React** | Iconografía SVG coherente con semántica de negocio. |
| **Gestor Paquetes** | **pnpm** | Instalaciones deterministas y ejecución veloz de scripts. |

---

## 📁 Arquitectura del Repositorio

```
dashboards-portfolio/
├── app/
│   ├── page.tsx               # Landing interactiva con cards de los 3 dashboards
│   ├── retail/page.tsx        # Dashboard Retail & RFM
│   ├── banca/page.tsx         # Dashboard Banca & Riesgo Crediticio
│   ├── logistica/page.tsx     # Dashboard Logística & Cadena de Suministro
│   ├── globals.css            # Tokens Tailwind 4 (@theme) + reglas @media print
│   ├── sitemap.ts             # Generación dinámica de sitemap para SEO
│   └── robots.ts              # Reglas de indexación para motores de búsqueda
├── components/
│   ├── charts/                # KpiCard, ChartFrame, wrappers Recharts con tabular-nums
│   ├── insights/              # InsightBanner y GlossaryTooltip
│   ├── ui/                    # EmptyState, ShareViewButton, RepoLinkBadge, ThemeToggle
│   ├── retail/                # FilterBar, RfmHeatmap (CSS Grid), DrilldownDrawer, Charts
│   ├── banca/                 # BancaFilterBar, AgingChartCard, BancaDrilldownDrawer
│   └── logistica/             # LogisticaFilterBar, OtifRoutesBarCard, DrilldownDrawer
├── data/                      # Datasets sintéticos JSON (deterministas, generados)
├── lib/
│   ├── data-engine.ts         # Motor analítico de agregación en memoria (Retail)
│   ├── banca-data-engine.ts   # Motor analítico de riesgo y provisiones (Banca)
│   ├── logistica-data-engine.ts # Motor analítico de OTIF, percentiles y HHI (Logística)
│   └── rfm.ts                 # Algoritmo de quintiles RFM y segmentación de clientes
├── scripts/
│   ├── generate-data.ts       # Generador determinista de datos sintéticos con seed fijo
│   └── check-data.ts          # Validador de invariantes numéricas y reconciliación de KPIs
└── tests/
    ├── data-engine.test.ts    # Tests unitarios del motor Retail
    ├── banca-engine.test.ts   # Tests unitarios del motor Banca
    └── logistica-engine.test.ts # Tests unitarios del motor Logística
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- Node.js >= 20.x
- pnpm >= 9.x

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/berriosb/dashboards-portfolio.git
cd dashboards-portfolio

# 2. Instalar dependencias
pnpm install

# 3. Generar datasets sintéticos (deterministas con seed fijo)
pnpm data:generate

# 4. Validar invariantes matemáticas y reconciliación de KPIs
pnpm data:check

# 5. Ejecutar tests unitarios
pnpm test

# 6. Iniciar servidor de desarrollo
pnpm dev
```

Visita [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la aplicación.

---

## 🧪 Comandos de Calidad y Verificación

```bash
pnpm test             # Ejecuta los 10 tests unitarios con Vitest
pnpm data:check       # Verifica invariantes de integridad en los 3 datasets
pnpm tsc --noEmit     # Comprobación de tipos en TypeScript estricto
pnpm build            # Compilación de producción en Next.js (SSG/ISR)
```

---

## 🔒 Privacidad y Generación de Datos

Todos los registros incluidos en esta vitrina son **100% sintéticos y anónimos**:
- No contienen información confidencial, RUTs reales, razones sociales ni nombres de clientes.
- Las series temporales y comportamientos de distribución emulan fielmente la estacionalidad del comercio, finanzas y logística en Chile (CyberDays, estacionalidad agrícola/minera, calendarios CMF).
- La generación es 100% determinista mediante semillas pseudoaleatorias controladas en `scripts/generate-data.ts`.

---

## 📄 Licencia

Este proyecto está liberado bajo la licencia [MIT](./LICENSE).
