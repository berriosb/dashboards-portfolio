import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import retailDataRaw from '@/data/retail.json';
import { RetailDataset } from '@/lib/data-engine';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RetailDashboard } from '@/components/retail/RetailDashboard';

const retailData = retailDataRaw as unknown as RetailDataset;

export const metadata: Metadata = {
  title: 'Dashboard Retail Omnicanal | BI Showcase Chile',
  description:
    'Dashboard ejecutivo interactivo de retail con cross-filtering en memoria (0ms), segmentación RFM 5x5, análisis de márgenes y drill-down de productos y clientes.',
  keywords: [
    'Business Intelligence Chile',
    'Dashboard Retail',
    'Matriz RFM',
    'Cross-filtering',
    'Recharts Next.js',
    'CLP Moneda Chilena',
  ],
};

export default function RetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Suspense
          fallback={
            <div className="w-full h-96 flex items-center justify-center text-muted-foreground text-sm">
              Cargando panel de control...
            </div>
          }
        >
          <RetailDashboard dataset={retailData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
