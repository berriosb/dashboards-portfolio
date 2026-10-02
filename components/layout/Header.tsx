'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Landmark, Truck, Menu } from 'lucide-react';
import { PrintReportButton } from '@/components/ui/PrintReportButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Retail Omnicanal',
      href: '/retail',
      icon: ShoppingCart,
      active: pathname === '/retail',
      accent: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-secondary text-secondary-foreground font-semibold shadow-2xs',
    },
    {
      label: 'Banca & Riesgo',
      href: '/banca',
      icon: Landmark,
      active: pathname === '/banca',
      accent: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-secondary text-secondary-foreground font-semibold shadow-2xs',
    },
    {
      label: 'Cadena Logística',
      href: '/logistica',
      icon: Truck,
      active: pathname === '/logistica',
      accent: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-secondary text-secondary-foreground font-semibold shadow-2xs',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo / Enterprise Suite Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="tap-target flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none tracking-tight">OmniBI Suite</span>
              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Enterprise BI Chile
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 border-l border-border/60 pl-5 h-14">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 h-10 text-xs font-medium transition-all ${
                    item.active
                      ? item.activeBg
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.accent}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Controles y Status Institucional */}
        <div className="flex items-center gap-2.5">
          {/* Navegación Móvil.
              El <nav> de desktop es `hidden md:flex` y no existía ninguna
              alternativa: bajo 768px la única forma de pasar de un dashboard a
              otro era volver al logo. Este trigger reproduce el mismo
              vocabulario (icono + acento por dashboard) en un Sheet lateral. */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir navegación entre dashboards"
                className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-border/80 bg-background text-foreground hover:bg-muted transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 max-w-xs p-0">
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
                <SheetTitle className="text-sm">Dashboards</SheetTitle>
                <SheetDescription className="text-xs">
                  Elige la vertical de análisis para navegar.
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={item.active ? 'page' : undefined}
                      className={`inline-flex items-center gap-2.5 px-3 min-h-11 rounded-lg text-sm transition-colors ${
                        item.active
                          ? 'bg-secondary text-secondary-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.accent}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/"
                  aria-current={pathname === '/' ? 'page' : undefined}
                  className={`inline-flex items-center gap-2.5 px-3 min-h-11 rounded-lg text-sm transition-colors ${
                    pathname === '/'
                      ? 'bg-secondary text-secondary-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-foreground" />
                  <span>Vitrina</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Status SLA Institucional sin animación agresiva */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-[11px] font-medium text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="tabular-nums font-mono font-semibold">0ms</span>
            <span className="text-muted-foreground font-normal">Motor In-Memory</span>
          </div>

          <PrintReportButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
