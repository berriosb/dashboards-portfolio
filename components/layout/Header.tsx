'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Landmark, Truck, Sparkles } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Retail',
      href: '/retail',
      icon: ShoppingCart,
      active: pathname === '/retail',
      badge: 'Nivel 2',
      accent: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Banca',
      href: '/banca',
      icon: Landmark,
      active: pathname === '/banca',
      badge: 'Nivel 2',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Logística',
      href: '/logistica',
      icon: Truck,
      active: pathname === '/logistica',
      badge: 'Nivel 2',
      accent: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Logo / Portafolio Title */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">BI Chile Showcase</span>
              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Dashboards de Alto Impacto
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 border-l border-border/70 pl-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    item.active
                      ? 'bg-muted text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.accent}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                        item.active
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Acciones y Metadatos Senior */}
        <div className="flex items-center gap-2.5">
          {/* Badge 0ms in-memory */}
          <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>0ms Latencia (In-Memory)</span>
          </div>

          {/* Enlace GitHub */}
          <a
            href="https://github.com/bastianberrios"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors border border-border/80"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
