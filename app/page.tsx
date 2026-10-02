import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RepoLinkBadge } from '@/components/ui/RepoLinkBadge';
import {
  ShoppingCart,
  Landmark,
  Truck,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  BarChart3,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function Home() {
  const dashboards = [
    {
      id: 'retail',
      title: 'Retail Omnicanal & Fidelización',
      industry: 'Retail & Consumo Masivo',
      status: 'active',
      statusLabel: 'Interactivo (0ms)',
      href: '/retail',
      accentColor: 'blue',
      description:
        'Monitoreo ejecutivo de transacciones omnicanal, márgenes por categoría, embudo digital y segmentación algorítmica de clientes RFM.',
      metrics: [
        { label: 'Ventas Netas', value: '$37,7M CLP', note: 'Margen bruto 42,9%' },
        { label: 'Margen Bruto', value: '42,9%', note: 'Meta: 40%' },
        { label: 'Ticket Promedio', value: '$153.372', note: 'Meta: $170.000' },
      ],
      features: [
        'Matriz RFM 5x5 nativa (CSS Grid + Radix Tooltips)',
        'Cross-filtering multidimensional instantáneo (0ms)',
        'Drill-down a nivel de SKU y clientes con búsqueda',
        'Sincronización en URL con nuqs para deep linking',
      ],
      benchmark: 'Cámara de Comercio de Santiago (CCS)',
      cta: 'Abrir Dashboard Retail',
    },
    {
      id: 'banca',
      title: 'Banca & Riesgo Crediticio',
      industry: 'Servicios Financieros & Banca',
      status: 'active',
      statusLabel: 'Interactivo (0ms)',
      href: '/banca',
      accentColor: 'emerald',
      description:
        'Gestión de cartera crediticia comercial y de consumo, mora temprana y tardía CMF, matrices de transición de riesgo y curvas vintage.',
      metrics: [
        { label: 'Cartera Vigente', value: '$198.454M CLP', note: 'Consumo y PyME' },
        { label: 'Mora CMF 90+', value: '1,7%', note: 'Banda de referencia: 1,5% - 2,9%' },
        { label: 'Cobertura Provisiones', value: '168,7%', note: 'Banda de referencia: 150% - 260%' },
      ],
      features: [
        'Curvas vintage de cosechas de crédito (12 a 36 meses)',
        'Diferenciación Mora 30+ CMF vs Mora 90+ Provisiones',
        'Cálculo de provisiones esperadas bajo IFRS 9',
        'Drill-down por deudor y crédito individual',
      ],
      benchmark: 'Comisión para el Mercado Financiero (CMF)',
      cta: 'Abrir Dashboard Banca',
    },
    {
      id: 'logistica',
      title: 'Logística & Cadena de Suministro',
      industry: 'Distribución & Última Milla',
      status: 'active',
      statusLabel: 'Interactivo (0ms)',
      href: '/logistica',
      accentColor: 'amber',
      description:
        'Control operacional de despachos en la Región Metropolitana, cumplimiento de entregas OTIF, costos unitarios y quiebres de inventario.',
      metrics: [
        { label: 'Cumplimiento OTIF', value: '89,4%', note: 'Meta EDI: 95%' },
        { label: 'Lead Time P90', value: '38,0 hrs', note: 'Límite superior SLA' },
        { label: 'HHI Proveedores', value: '1.820 pts', note: 'Concentración moderada' },
      ],
      features: [
        'Cumplimiento OTIF desglosado por ruta de transporte',
        'Distribución de lead times con percentiles P50 y P90',
        'Concentración de flota HHI bajo umbral DOJ/FTC',
        'Pareto de causas de fallas de entrega y drill-down',
      ],
      benchmark: 'Estándares EDI Logístico Chile & ASOEX',
      cta: 'Abrir Dashboard Logística',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Showcase BI & Frontend Engineering · Chile</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Dashboards interactivos de alto impacto para Data & BI
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Vitrina de soluciones analíticas con terminación SaaS de nivel Silicon Valley,{' '}
            <strong className="text-foreground font-semibold">0ms de latencia</strong> en cliente
            mediante un motor in-memory puro, y métricas adaptadas al mercado chileno (CLP, CCS, CMF y OTIF).
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/retail"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md"
            >
              <span>Explorar Dashboard Retail</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/banca"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-all shadow-xs"
            >
              <span>Banca & Crédito</span>
            </Link>
            <Link
              href="/logistica"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-all shadow-xs"
            >
              <span>Logística & OTIF</span>
            </Link>
          </div>
        </section>

        {/* 3 Showcase Artifact Cards */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Paneles de Control Especializados
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Diseñados bajo principios de densidad limpia, escaneabilidad visual y cero fricción cognitiva.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboards.map((dash) => {
              const borderAccent = {
                blue: 'hover:border-blue-500/50 hover:shadow-blue-500/5',
                emerald: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
                amber: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
              }[dash.accentColor];

              return (
                <div
                  key={dash.id}
                  id={dash.id}
                  className={`rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${borderAccent}`}
                >
                  <div className="space-y-5">
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`p-2.5 rounded-xl ${
                          dash.accentColor === 'blue'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : dash.accentColor === 'emerald'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {dash.accentColor === 'blue' && <ShoppingCart className="w-5 h-5" />}
                        {dash.accentColor === 'emerald' && <Landmark className="w-5 h-5" />}
                        {dash.accentColor === 'amber' && <Truck className="w-5 h-5" />}
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {dash.statusLabel}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {dash.industry}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                        {dash.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {dash.description}
                      </p>
                    </div>

                    {/* Previews de Métricas.
                        2 columnas en móvil en vez de 3: con tres, cada celda
                        queda ~95px a 375px y las notas de banda de referencia
                        salían truncadas e ilegibles a 9px. En 2 columnas el
                        texto tiene ancho para leerse sin `truncate`. */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 py-3 border-y border-border/70 text-center">
                      {dash.metrics.map((m) => (
                        <div key={m.label} className="space-y-0.5 min-w-0">
                          <div
                            className="text-[11px] text-muted-foreground leading-tight text-balance"
                            title={m.label}
                          >
                            {m.label}
                          </div>
                          <div className="text-sm font-bold text-foreground tabular-nums">
                            {m.value}
                          </div>
                          <div
                            className="text-[11px] text-muted-foreground leading-tight text-balance"
                            title={m.note}
                          >
                            {m.note}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Features clave */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                        Capacidades Técnicas
                      </div>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {dash.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer de la tarjeta con CTA y Evidencia Técnica */}
                  <div className="pt-5 mt-5 border-t border-border/70 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Benchmark:</span>
                        <strong className="text-foreground font-medium truncate max-w-[140px]" title={dash.benchmark}>
                          {dash.benchmark}
                        </strong>
                      </div>
                      <RepoLinkBadge label="Pipeline de datos" variant="pill" />
                    </div>

                    <Link
                      href={dash.href}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-semibold text-xs transition-all shadow-xs ${
                        dash.accentColor === 'blue'
                          ? 'bg-blue-700 hover:bg-blue-800'
                          : dash.accentColor === 'emerald'
                          ? 'bg-emerald-700 hover:bg-emerald-800'
                          : 'bg-amber-700 hover:bg-amber-800'
                      }`}
                    >
                      <span>{dash.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Principios de Ingeniería y Craft (Playbook) */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Estándares de Ingeniería & Calidad
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Pilares técnicos aplicados en cada pantalla para garantizar máxima precisión analítica y velocidad de ejecución.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-2 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 w-fit">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">0ms Latencia In-Memory</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sin bases de datos externas ni llamadas lentas de red. Agregaciones funcionales en cliente en &lt; 1ms para una experiencia ultra fluida.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                <code className="font-mono text-[13px]">tabular-nums</code> &amp; WCAG
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cifras fijas que no bailan durante la interacción. Estados acompañados de etiquetas e iconos para accesibilidad inclusiva.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-fit">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Deep Linking con nuqs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cada filtro, segmento RFM o rango de fechas se refleja en los searchParams de la URL, permitiendo compartir vistas exactas.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 w-fit">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Datos Sintéticos Deterministas</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Datasets modelados con PRNG Mulberry32 y seed constante, verificados con invariantes matemáticas automáticas (`pnpm data:check`).
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Arquitectura y Rendimiento */}
        <section className="rounded-2xl border border-border/80 bg-gradient-to-r from-blue-50/30 via-background to-emerald-50/20 dark:from-blue-950/20 dark:via-background dark:to-emerald-950/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              Arquitectura Frontend de Alto Rendimiento para BI
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              Diseñado con criterios estrictos de negocio, 0ms de latencia in-memory y serialización de filtros en la URL con nuqs para máxima reproducibilidad analítica.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link
              href="/retail"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs transition-all shadow-xs"
            >
              <span>Retail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/banca"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-all shadow-xs"
            >
              <span>Banca</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/logistica"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs transition-all shadow-xs"
            >
              <span>Logística</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
