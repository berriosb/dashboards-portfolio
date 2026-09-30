import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import bancaDataRaw from '@/data/banca.json';
import { BancaDataset } from '@/lib/banca-data-engine';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BancaDashboard } from '@/components/banca/BancaDashboard';

import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';

const bancaData = bancaDataRaw as unknown as BancaDataset;

export const metadata: Metadata = {
  title: 'Dashboard Banca & Riesgo Crediticio | BI Showcase Chile',
  description:
    'Dashboard ejecutivo de colocaciones bancarias, morosidad temprana vs vencida CMF (30+ vs 90+ días), curvas de aging, provisiones IFRS 9 y captaciones netas.',
  keywords: [
    'Riesgo Crediticio Chile',
    'Morosidad CMF',
    'Dashboard Banca',
    'Provisiones IFRS 9',
    'Colocaciones Bancarias',
    'CLP Moneda Chilena',
  ],
};

export default function BancaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Suspense fallback={<DashboardSkeleton />}>
          <BancaDashboard dataset={bancaData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
