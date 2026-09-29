import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import logisticaDataRaw from '@/data/logistica.json';
import { LogisticaDataset } from '@/lib/logistica-data-engine';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LogisticaDashboard } from '@/components/logistica/LogisticaDashboard';

const logisticaData = logisticaDataRaw as unknown as LogisticaDataset;

export const metadata: Metadata = {
  title: 'Dashboard Logística & Cadena de Suministro | BI Showcase Chile',
  description:
    'Dashboard ejecutivo de control de despachos y logística: cumplimiento OTIF (On-Time In-Full), percentiles de lead time P50/P90, concentración HHI de transportistas y causas de incidencias.',
  keywords: [
    'Logística Chile',
    'OTIF On-Time In-Full',
    'Lead Time P50 P90',
    'Cadena de Suministro',
    'HHI Transportistas',
    'Despacho Última Milla',
  ],
};

export default function LogisticaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Suspense
          fallback={
            <div className="w-full h-96 flex items-center justify-center text-muted-foreground text-sm">
              Cargando panel de logística y distribución...
            </div>
          }
        >
          <LogisticaDashboard dataset={logisticaData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
