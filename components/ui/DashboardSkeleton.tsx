'use client';

import React from 'react';

export function DashboardSkeleton() {
  return (
    /* `role="status"` + `aria-live`: con `aria-label` sobre un <div> sin rol el
       mensaje no se anunciaba, así que la carga de las tres rutas era silenciosa
       para un lector de pantalla. `sr-only` duplica el texto como contenido real
       porque un nombre accesible no sustituye a una región viva. */
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full space-y-6 pb-12 animate-pulse motion-reduce:animate-none"
    >
      <span className="sr-only">Cargando panel de control</span>
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-28 bg-muted rounded-full" />
            <div className="h-4 w-44 bg-muted/60 rounded" />
          </div>
          <div className="h-8 w-72 bg-muted rounded-lg" />
          <div className="h-4 w-96 bg-muted/60 rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-32 bg-muted rounded-lg" />
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Insight Banner Skeleton */}
      <div className="rounded-xl border border-border/80 bg-card p-5 h-28 flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-4 w-full bg-muted/70 rounded" />
          <div className="h-4 w-3/4 bg-muted/50 rounded" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-xl border border-border/80 bg-card p-3.5 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-36 bg-muted rounded-lg" />
          <div className="h-8 w-40 bg-muted rounded-lg hidden sm:block" />
          <div className="h-8 w-48 bg-muted rounded-lg hidden md:block" />
        </div>
        <div className="h-8 w-28 bg-muted rounded-lg" />
      </div>

      {/* 7 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`bg-card rounded-xl border border-border/80 p-3.5 h-[114px] flex flex-col justify-between ${
              i === 6 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="h-3.5 w-20 bg-muted rounded" />
              <div className="h-4 w-10 bg-muted/70 rounded" />
            </div>
            <div className="h-7 w-24 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted/50 rounded border-t border-border/40 pt-1" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-card rounded-xl border border-border/80 p-5 h-80 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-3.5 w-72 bg-muted/60 rounded" />
          </div>
          <div className="h-52 w-full bg-muted/30 rounded-lg border border-border/40" />
        </div>
        <div className="lg:col-span-4 bg-card rounded-xl border border-border/80 p-5 h-80 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-3.5 w-56 bg-muted/60 rounded" />
          </div>
          <div className="h-52 w-full bg-muted/30 rounded-full border border-border/40 max-w-[200px] mx-auto" />
        </div>
      </div>
    </div>
  );
}
