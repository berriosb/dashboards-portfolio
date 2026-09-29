# Guía de Desarrollo y Calidad para Agentes (AGENTS.md)

Este documento define las reglas de ingeniería, diseño y estándares de calidad para cualquier agente o subagente que opere en `dashboards-portfolio`.

---

## 1. Misión del Proyecto

Vitrina showcase de dashboards interactivos de alto impacto para el mercado chileno de Data/BI.
- **Enfoque:** Front-end puro, rendimiento instantáneo (0ms en cliente con datos sintéticos en memoria) y terminación visual de nivel Silicon Valley / SaaS de primer nivel (Stripe, Linear, Datadog).
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript 5.7 strict + Tailwind CSS 4 (`@theme` CSS-first) + shadcn/ui + Recharts puro + Zustand 5 + `nuqs`.

---

## 2. Skills de UI y Diseño Obligatorias

El proyecto cuenta con skills de craft instaladas localmente en `.agents/skills/`. Todo agente que diseñe, construya, refactorice o audite componentes de interfaz **DEBE** consultarlas y seguir sus principios:

### A. `impeccable` (`.agents/skills/impeccable/SKILL.md`)
Marco integral de calidad frontend creado por Paul Bakaus.
- **Modos de diseño según superficie:**
  - **Modo `Operate`** para los dashboards (`/retail`, `/banca`, `/logistica`): Priorizar escaneabilidad de datos, densidad limpia, consistencia métrica y cero fricción cognitiva. La marca vive en la precisión de los detalles.
  - **Modo `Experience`** para la landing (`/`): La interfaz general retrocede con sobriedad para que los 3 artefactos (cards de dashboards) sean los protagonistas indiscutibles.
- **Flujo de comandos y revisiones:**
  - `/impeccable layout`: Calibrar ritmo vertical, grillas y padding uniforme en tarjetas.
  - `/impeccable typeset`: Jerarquía tipográfica ajustada (`tracking-tight`, `leading-none` en KPIs).
  - `/impeccable audit`: Auditoría determinista de accesibilidad (WCAG), rendimiento y responsividad.
  - `/impeccable polish`: Pasada final de craft y eliminación de cualquier residuo genérico antes de mergear o liberar un sprint.

### B. `interface-design` (`.agents/skills/interface-design/SKILL.md`)
Especializada en consistencia para paneles SaaS y dashboards de datos.
- **Cero Design Drift:** Los 3 dashboards deben compartir estrictamente los mismos radios de bordes (`rounded-xl` o `rounded-2xl`), alturas base de cards, escala de sombras y arquitectura de componentes.
- **Diseño con sentido de negocio:** Un número en pantalla no es diseño sin contexto; debe reflejar qué significa para el tomador de decisiones.

### C. `baseline-ui` (`.agents/skills/baseline-ui/SKILL.md`)
Conjunto de reglas anti-slop de aplicación inmediata:
- Usar primitivas accesibles de Radix UI (`@radix-ui/react-*`) para todo comportamiento de teclado/foco.
- Loading skeletons estructurales (`<Skeleton />` con la forma del chart/card) en lugar de spinners flotantes.
- Áreas táctiles mínimas de 44x44px en controles interactivos.

---

## 3. Reglas de Oro de Craft para Data/BI (Playbook)

1. **`use-tabular-nums-for-data` (Estricto):**
   Toda cifra numérica, monto en CLP, delta porcentual o conteo en tablas y cards KPI debe llevar la clase `tabular-nums` de Tailwind. Los números jamás deben "bailar" al cambiar de valor.
2. **`limit-accent-color-usage`:**
   Máximo un color de acento semántico por dashboard:
   - 🛒 **Retail:** Azul (`blue-600` / acentos cielo).
   - 🏦 **Banca:** Verde (`emerald-600` / acentos menta).
   - 🚚 **Logística:** Naranja (`amber-600` / acentos cálidos).
   Fondos, bordes y superficies secundarias deben ser neutros (`zinc-900`/`zinc-800` en dark, `slate-50`/`slate-100` en light). Prohibido el efecto "arcoíris".
3. **`pair-status-with-labels` (Accesibilidad WCAG):**
   Nunca comunicar estado (mora, alerta, caída de ventas) exclusivamente con color rojo/verde. Siempre acompañar con icono (`ArrowUp`, `ArrowDown`, `AlertTriangle`) y texto legible.
4. **`group-with-space-not-lines`:**
   Agrupar secciones con espaciado consistente (`gap-4`, `p-6`) antes de trazar líneas divisorias (`border-b`). Reducir el ruido visual para favorecer la lectura de datos.
5. **Componentes no nativos en Recharts:**
   - **Heatmap RFM:** Debe implementarse con **CSS Grid nativo de Tailwind (`grid-cols-5`) + Radix Tooltip** (`RfmHeatmap.tsx`). Jamás forzar hacks con SVG en Recharts.

---

## 4. Hooks de Empleabilidad (Seniority en Cada Vista)

Todo dashboard debe incluir obligatoriamente los 3 elementos de conversión para reclutadores:
1. `<InsightBanner />`: Tarjeta superior visible con hallazgo analítico crítico y recomendación de negocio accionable.
2. `<GlossaryTooltip />`: Tooltip con icono `Info` en métricas técnicas locales (Mora CMF 90+, OTIF, HHI, RFM).
3. `<RepoLinkBadge />`: Enlace visible a la evidencia técnica reproducible en GitHub (`retail-bi-chile`, etc.).

---

## 5. Responsive Mobile

- Layout a 1 columna en `< 768px`.
- Envolver contenedores de Recharts con `min-w-0` y `w-full` para evitar overflow horizontal.
- Filtros colapsables en un `<Sheet side="bottom">` en pantallas móviles.
