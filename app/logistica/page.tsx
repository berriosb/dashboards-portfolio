import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import logisticaDataRaw from '@/data/logistica.json';
import { LogisticaDataset } from '@/lib/logistica-data-engine';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LogisticaDashboard } from '@/components/logistica/LogisticaDashboard';

import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';

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
        <Suspense fallback={<DashboardSkeleton />}>
          <LogisticaDashboard dataset={logisticaData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
