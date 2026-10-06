---
target: OmniBI Suite — landing + 3 dashboards (auditoría UI/UX completa)
total_score: 15
max_score: 20
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:/home/bastianberrios/Proyectos/dashboards-portfolio/app/page.tsx + components/{retail,banca,logistica}"
timestamp: 2026-10-06T13-01-21Z
slug: app-page-tsx-components-retail-banca-logistica
---
# Auditoría UI/UX — OmniBI Suite (dashboards-portfolio)

Target: landing `/` + dashboards `/retail`, `/banca`, `/logistica`
Método: dual (auditoría técnica en navegador + revisión de diseño en sub-agente aislado)

## Health Score — Auditoría Técnica

| # | Dimensión | Score | Hallazgo clave |
|---|-----------|-------|----------------|
| 1 | Accesibilidad | 3 | Lighthouse 100; 2 contrastes AA fallan en texto de gráficas |
| 2 | Performance | 3 | LCP 2.4s (dev), CLS 0.00, reflow 35ms en Recharts |
| 3 | Responsive | 4 | 0 overflow a 390px, 1 columna, Sheet bottom OK |
| 4 | Theming | 3 | 3 colores SVG hardcodeados sin variante dark |
| 5 | Integridad de implementación | 2 | Insight y funnel afirman datos que los filtros invalidan |
| **Total** | | **15/20** | **Bueno — atender las dimensiones débiles** |

## Health Score — Heurísticas (revisión de diseño)

| # | Heurística | Landing | Retail | Banca | Logística |
|---|-----------|---------|--------|-------|-----------|
| 1 | Visibilidad del estado | 3 | 2 | 2 | 2 |
| 2 | Match sistema ↔ mundo real | 3 | 2 | 2 | 2 |
| 3 | Control y libertad | 2 | 3 | 3 | 3 |
| 4 | Consistencia y estándares | 3 | 3 | 3 | 3 |
| 5 | Prevención de errores | 3 | 2 | 2 | 2 |
| 6 | Reconocimiento > recuerdo | 3 | 3 | 3 | 3 |
| 7 | Flexibilidad y eficiencia | n/a | 3 | 3 | 3 |
| 8 | Apariencia minimalista | 2 | 3 | 3 | 3 |
| 9 | Recuperación de errores | n/a | 2 | 2 | 2 |
| 10 | Ayuda y documentación | n/a | 2 | 2 | 2 |
| **Total** | | **19/28** | **25/40** | **25/40** | **25/40** |

## P0 — Bloqueantes
Ninguno. Nada impide completar una tarea.

## P1 — Mayor (corregir antes de publicar)

### P1-1 Insight y funnel ignoran los filtros
- Ubicación: `components/insights/InsightBanner.tsx`, `RetailDashboard.tsx:147-152` y `:305`
- Evidencia: con `?canal=online` el panel dice "255 de 1.000 registros", las ventas caen a $19,6M,
  pero el insight sigue diciendo "redujo su frecuencia en **tiendas físicas**" y el funnel mantiene
  "Visitantes 128.400". El banner se rotula "Informe Analítico Automatizado" siendo texto fijo.
- Impacto: es el primer movimiento de cualquier revisor BI (filtrar y comprobar). Daña la credibilidad
  justo en el momento de mayor compromiso del usuario.
- Fix: calcular insight y funnel desde `aggregated`, o rotularlos "dataset completo, no filtrado".

### P1-2 KPI OTIF reporta mal su propio estado
- Ubicación: `components/charts/KpiCard.tsx:126-137` y `:210-212`
- Evidencia: la card renderiza `Cumplimiento OTIF · 89,8% · Meta: 95% · 95%`. El "95%" de la derecha
  es el porcentaje de meta, se lee como cumplimiento, y la barra aparece casi llena.
  Es la única hero sin chip "Sobre/Bajo meta" (Lead Time P90 sí dice "Sobre meta").
- Impacto: el número headline de Logística es ambiguo sobre si el SLA se cumple.
- Fix: aplicar el chip de estado a las hero y rotular "94% de la meta" en vez de "95%" suelto.

### P1-3 Logística rompe la regla de un solo acento
- Ubicación: `components/logistica/OtifRoutesBarCard.tsx:134-141`, `SupplierHhiCard.tsx:74-92`
- Evidencia: las 9 barras usan `#e11d48` ×5, `#d97706` ×2, `#059669` ×2 (verificado en el DOM).
  El estado va solo en el color; la cifra al lado no dice "cumple/no cumple".
- Impacto: viola la regla del propio AGENTS.md §3.2 y AGENTS §3.3 (estado nunca solo por color).
- Fix: rampa ámbar monocromática + etiqueta textual e icono por barra.

### P1-4 HHI contradictorio entre landing y dashboard
- Ubicación: `app/page.tsx:82` vs `components/logistica/SupplierHhiCard.tsx:88-90`
- Evidencia: la landing dice "1.820 pts · Concentración moderada"; el dashboard calcula
  "1463 pts · (Diversificado)". Mismo indicador, conclusiones opuestas.
- Fix: derivar la landing del mismo motor, no de strings literales.

## P2 — Menor

### P2-1 Dos contrastes AA fallan en texto de gráficas
- `CmfMoraLineCard.tsx:53` — `COLOR_MORA_90 = '#059669'` se usa como color de texto de la leyenda
  Recharts: "Mora 90+ (indicador CMF)" mide **3.77:1** (necesita 4.5:1). El propio repo ya corrigió
  este patrón exacto en el heatmap OTIF.
- `OtifRoutesBarCard.tsx:185` — `fill="#10b981"` en "Meta 95%" mide **2.54:1**.
- `LineChartCard.tsx:132` — `fill: '#2563eb'` en "Meta mensual $7,7M" mide **3.85:1 en dark**;
  en light pasa. Es el único de los tres sin variante dark.

### P2-2 Separador decimal inconsistente
- `FunnelChartCard.tsx:43` usa `.toFixed(1)` → "83.3 % fuga", "77.2", "64.5" con punto, mientras
  todo el resto de la app usa coma chilena ("16,7%", "3,8%", "1,3%").
- Los deltas de KPI también: "-7.3%", "-0.5%", "-10.3%" junto a valores "$37,7M".

### P2-3 Etiquetas del eje RFM se solapan y dejan huecos
- Render: R4 "47-100d" y R3 "100-125d" comparten el 100; R2 "125-207d" y R1 ">211d" dejan
  208-211d sin cubrir. `recencyLabel()` usa min/max observados por quintil, no cortes contiguos.

### P2-4 Botones de leyenda del donut bajo 44px en móvil
- 4 botones de 20px de alto en Banca ("PyME:25,6%", "Banca Empresa:25,5%", "Banca Personas:24,8%",
  "Banca Preferente:24,1%") sin `tap-target`. Los tooltips de glosario sí están mitigated (44×44
  vía `.tap-target::after`, verificado en dark y mobile).

### P2-5 Metas truncadas en tarjetas secundarias
- `KpiCard.tsx:250-269`: `benchmarkLabel` y `benchmarkSource` compiten en el mismo flex con
  `truncate` en ambos; el valor de la meta queda cortado en retail, banca y logística.

### P2-6 Vocabulario que se escapa de es-CL
- RFM en inglés ("Champions", "At Risk", "Hibernating"), `format.ts` emite `$XXXK`,
  y el footer del header dice "Biolio" (Biobío).

## P3 — Polish

- La card de la landing es un `<div>` (`app/page.tsx:162`): ~90% del área visible no es clicable;
  solo el botón CTA del pie es enlace.
- Tres nombres de marca distintos: "OmniBI Suite" (header), "OmniBI Analytics Suite · Chile Enterprise
  Edition" (footer), "OmniBI Suite | Enterprise Business Intelligence Chile" (title).
- Sin identidad del autor en la UI, pese a que AGENTS.md §4 declara objetivo de conversión a reclutadores.
- Los presets de fecha del filtro móvil rotulan trimestres desplazados respecto al calendario chileno.
- `PROJECT.md:106` documenta `components/filters/ActiveFilterChips.tsx`, que no existe.

## Positivos

- Sistema de tokens completo en `app/globals.css` con contraste AA verificado por cálculo.
- Foco visible global en la capa base, no en 18 componentes sueltos.
- `prefers-reduced-motion` anula duración sin destruir el cambio de estado (correcto).
- Procedencia de métricas diseñada: fórmula + fuente + meta prorateada en un solo lugar
  (`lib/metric-definitions.ts`).
- Cross-filtering recíproco y deep-linking con nuqs funcionan.
- Heatmap RFM en CSS Grid nativo `grid-cols-5` + Radix Tooltip, como exige AGENTS.md §3.5.
- 48 tests pasan; detector determinista sin hallazgos; 0 overflow horizontal a 390px.

## Recomendaciones

1. **P1** Recomputar insight y funnel desde `aggregated` (`$impeccable harden`)
2. **P1** Chip de estado en KPIs hero + rótulo "94% de la meta" (`$impeccable clarify`)
3. **P1** Rampa ámbar única + etiquetas de estado en Logística (`$impeccable colorize`)
4. **P1** Derivar métricas de la landing del motor (`$impeccable polish`)
5. **P2** Corregir 3 contrastes SVG con tokens y variante dark (`$impeccable audit`)
6. **P2** Unificar separador decimal es-CL (`$impeccable clarify`)
7. **P2** Etiquetas RFM contiguas + tap targets de leyenda (`$impeccable adapt`)
8. **P2** Quitar truncate del valor de meta (`$impeccable layout`)
9. **Final** `$impeccable polish`
