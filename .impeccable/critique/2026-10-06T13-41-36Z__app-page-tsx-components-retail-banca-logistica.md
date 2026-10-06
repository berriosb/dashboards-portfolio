---
target: OmniBI Suite — landing + 3 dashboards (post-fix)
total_score: 19
max_score: 20
p0_count: 0
p1_count: 0
target_identity: "file:/home/bastianberrios/Proyectos/dashboards-portfolio/app/page.tsx + components/{retail,banca,logistica}"
timestamp: 2026-10-06T13-41-36Z
slug: app-page-tsx-components-retail-banca-logistica
---
# Auditoría UI/UX — OmniBI Suite (post-fix)

Los 4 hallazgos P1 y los 5 P2 del snapshot anterior quedaron cerrados y verificados en navegador.

## Correcciones aplicadas

| ID | Corrección | Verificación |
|----|-----------|--------------|
| P1-1 | Insight declara su alcance; funnel escala por proporción de pedidos con la nota de supuesto | `?canal=online`: banner avisa y funnel pasa 128.400 → 32.493 |
| P1-2 | Chip de estado en todas las hero y rótulo "% de la meta" | OTIF: "89,8% · Meta: 95% · 95% de la meta" |
| P1-3 | Rampa ámbar de una sola familia + leyenda con cortes + palabra de estado por barra | DOM: 3 fills de un solo hue; leyenda "Crítico < 90% / Bajo meta 90–94% / En meta ≥ 95%" |
| P1-4 | Métricas de la landing derivadas de los tres motores | HHI: landing y dashboard ahora coinciden en 1.463 pts · Diversificado |
| P2-1 | Los 2 contrastes SVG reales pasan a token | 0 fallos de contraste en claro y dark (medido) |
| P2-2 | Separador decimal es-CL unificado vía `formatDecimal` | "-83,3% fuga" junto a "16,7%"; deltas "-7,3%" |
| P2-3 | Ejes RFM contiguos y leyenda de donut a 44px | R5 ≤46d / R4 47-99d / R3 100-124d / R2 125-211d / R1 >211d; 0 targets <44px |
| P2-4 | Fin del `truncate` en el valor de meta | Meta y banco con stack; la fuente pasa a segunda línea |
| P2-5 | RFM en español y `K` → `mil` | "Campeones / Fieles / Potenciales / En riesgo / Inactivos"; "Meta: $170 mil" |
| P3 | Card de landing 100% clicable, marca única, autor visible | enlace cubre 573×619 de 574×620 |

## Corrección de la auditoría original

Dos hallazgos del informe eran falsos positivos de mi propia medición y se descartaron:
- La leyenda de Banca no tenía 3.77:1. SVG pinta con `fill`, no con `color`; la regla CSS
  de `globals.css` sí aplica y el texto queda en 19.9:1.
- "Biolio" era "Biobío" bien escrito; lo deformé al leer el árbol de accesibilidad.

Quedan 2 contrastes reales, ambos corregidos: "Meta 95%" a 2.54:1 y "Meta mensual" a 3.85:1 en dark.

## Estado final

Lint limpio · 48 tests · build estático OK · Lighthouse a11y 100 en /retail, /banca y /logistica · detector sin hallazgos.
