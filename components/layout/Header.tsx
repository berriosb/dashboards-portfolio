'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Landmark, Truck } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Retail',
      href: '/retail',
      icon: ShoppingCart,
      active: pathname === '/retail',
      accent: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold',
    },
    {
      label: 'Banca',
      href: '/banca',
      icon: Landmark,
      active: pathname === '/banca',
      accent: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold',
    },
    {
      label: 'Logística',
      href: '/logistica',
      icon: Truck,
      active: pathname === '/logistica',
      accent: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-50/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo / Portafolio Title */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none tracking-tight">BI Chile Showcase</span>
              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Dashboards de Alto Impacto
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 border-l border-border/60 pl-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    item.active
                      ? item.activeBg
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.accent}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Status Badge 0ms in-memory */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tabular-nums font-mono font-semibold">0ms</span>
            <span className="text-muted-foreground font-normal">In-Memory</span>
          </div>
        </div>
      </div>
    </header>
  );
}
