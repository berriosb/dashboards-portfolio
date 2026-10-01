'use client';

import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { formatCLP, formatNumber } from '@/lib/format';
import { Search, Package, Users, ArrowUpDown } from 'lucide-react';
import { RetailDataset, RetailTransaction } from '@/lib/data-engine';
import { calculateRfmScores } from '@/lib/rfm';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

interface DrilldownDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'skus' | 'customers';
  dataset: RetailDataset;
  filteredRecords: RetailTransaction[];
  selectedCategory?: string | null;
  selectedRfmSegment?: string | null;
}

export function DrilldownDrawer({
  isOpen,
  onOpenChange,
  type,
  dataset,
  filteredRecords,
  selectedCategory,
  selectedRfmSegment,
}: DrilldownDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'sales' | 'count'>('sales');

  // Calcular agregación para SKUs
  const skuData = useMemo(() => {
    if (type !== 'skus') return [];

    const skuMap = new Map<string, { units: number; sales: number }>();
    for (const r of filteredRecords) {
      if (r.isReturn) continue;
      const cur = skuMap.get(r.skuId) || { units: 0, sales: 0 };
      cur.units += 1;
      cur.sales += r.amount;
      skuMap.set(r.skuId, cur);
    }

    const result = dataset.skus
      .map((sku) => {
        const stats = skuMap.get(sku.id) || { units: 0, sales: 0 };
        return {
          id: sku.id,
          nombre: sku.nombre,
          categoria: sku.categoria,
          precio: sku.precio,
          unidades: stats.units,
          ventas: stats.sales,
        };
      })
      .filter((sku) => {
        if (selectedCategory && sku.categoria !== selectedCategory) return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            sku.nombre.toLowerCase().includes(term) ||
            sku.id.toLowerCase().includes(term) ||
            sku.categoria.toLowerCase().includes(term)
          );
        }
        return true;
      });

    return result.sort((a, b) =>
      sortField === 'sales' ? b.ventas - a.ventas : b.unidades - a.unidades
    );
  }, [type, dataset.skus, filteredRecords, selectedCategory, searchTerm, sortField]);

  // Calcular agregación para Clientes
  const customerData = useMemo(() => {
    if (type !== 'customers') return [];

    const rfmScores = calculateRfmScores(dataset.records, dataset.meta.periodoFin);
    const activeCustomerIds = new Set(filteredRecords.map((r) => r.customerId));

    const result = dataset.customers
      .filter((c) => activeCustomerIds.has(c.id))
      .map((c) => {
        const rfm = rfmScores.get(c.id);
        return {
          id: c.id,
          nombre: c.nombre,
          email: c.email,
          region: c.region,
          segmento: rfm?.segment || 'Sin datos',
          ordersCount: rfm?.orderCount || 0,
          totalSpent: rfm?.totalSpent || 0,
          daysSinceLastOrder: rfm?.recencyDays ?? 999,
          recencyScore: rfm?.recencyScore || 1,
          frequencyScore: rfm?.frequencyScore || 1,
        };
      })
      .filter((c) => {
        if (selectedRfmSegment && c.segmento !== selectedRfmSegment) return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            c.nombre.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.region.toLowerCase().includes(term) ||
            c.id.toLowerCase().includes(term)
          );
        }
        return true;
      });

    return result.sort((a, b) =>
      sortField === 'sales' ? b.totalSpent - a.totalSpent : b.ordersCount - a.ordersCount
    );
  }, [type, dataset.customers, dataset.records, dataset.meta.periodoFin, filteredRecords, selectedRfmSegment, searchTerm, sortField]);

  const maxSales = useMemo(() => Math.max(...skuData.map((s) => s.ventas), 1), [skuData]);
  const maxSpend = useMemo(() => Math.max(...customerData.map((c) => c.totalSpent), 1), [customerData]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-6">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {type === 'skus' ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <SheetTitle className="text-base md:text-lg">
                {type === 'skus' ? 'Drill-down: Catálogo de Productos' : 'Drill-down: Cartera de Clientes'}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {type === 'skus'
                  ? selectedCategory
                    ? `Filtrado por categoría: ${selectedCategory}`
                    : 'Explora el rendimiento por SKU en base al filtro activo'
                  : selectedRfmSegment
                  ? `Segmento RFM: ${selectedRfmSegment}`
                  : 'Explora el perfil de compra y scoring RFM de clientes'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Buscador y Controles */}
        <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={type === 'skus' ? 'Buscar producto o SKU...' : 'Buscar cliente o correo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar:
            </span>
            <button
              type="button"
              onClick={() => setSortField('sales')}
              className={`px-2 py-1 rounded-md transition-all ${
                sortField === 'sales'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Ventas
            </button>
            <button
              type="button"
              onClick={() => setSortField('count')}
              className={`px-2 py-1 rounded-md transition-all ${
                sortField === 'count'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'skus' ? 'Unidades' : 'Pedidos'}
            </button>
            {type === 'skus' ? (
              <ExportCsvButton
                data={skuData}
                filename="catalogo_skus_filtrado"
                columns={[
                  { key: 'id', label: 'SKU ID' },
                  { key: 'nombre', label: 'Producto' },
                  { key: 'categoria', label: 'Categoría' },
                  { key: 'precio', label: 'Precio CLP', format: (v) => formatCLP(Number(v)) },
                  { key: 'unidades', label: 'Unidades Vendidas' },
                  { key: 'ventas', label: 'Venta Neta CLP', format: (v) => formatCLP(Number(v)) },
                ]}
                label="CSV"
                className="h-7 text-xs ml-1"
              />
            ) : (
              <ExportCsvButton
                data={customerData}
                filename="cartera_clientes_filtrada"
                columns={[
                  { key: 'id', label: 'Cliente ID' },
                  { key: 'nombre', label: 'Nombre' },
                  { key: 'email', label: 'Email' },
                  { key: 'region', label: 'Región' },
                  { key: 'segmento', label: 'Segmento RFM' },
                  { key: 'ordersCount', label: 'Cant. Pedidos' },
                  { key: 'daysSinceLastOrder', label: 'Días Última Compra' },
                  { key: 'totalSpent', label: 'Gasto Acumulado CLP', format: (v) => formatCLP(Number(v)) },
                ]}
                label="CSV"
                className="h-7 text-xs ml-1"
              />
            )}
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="flex-1 overflow-y-auto border border-border rounded-xl">
          {type === 'skus' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 sticky top-0 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">SKU / Producto</th>
                  <th className="py-2.5 px-3 font-semibold">Categoría</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Precio</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Unid.</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Venta Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {skuData.map((sku) => (
                  <tr key={sku.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground">{sku.nombre}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{sku.id}</div>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{sku.categoria}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                      {formatCLP(sku.precio)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">
                      {formatNumber(sku.unidades)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600 dark:text-blue-400 relative">
                      <div
                        className="absolute inset-y-1 right-1 bg-blue-500/10 dark:bg-blue-400/15 rounded-sm pointer-events-none transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, (sku.ventas / maxSales) * 100))}%` }}
                      />
                      <span className="relative z-10">{formatCLP(sku.ventas)}</span>
                    </td>
                  </tr>
                ))}
                {skuData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No se encontraron productos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 sticky top-0 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Segmento</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Pedidos</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Última C.</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Gasto Acum.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customerData.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground">{c.nombre}</div>
                      <div className="text-[10px] text-muted-foreground">{c.region}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {c.segmento} (R{c.recencyScore}F{c.frequencyScore})
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">
                      {c.ordersCount}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                      {c.daysSinceLastOrder}d
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-blue-600 dark:text-blue-400 relative">
                      <div
                        className="absolute inset-y-1 right-1 bg-blue-500/10 dark:bg-blue-400/15 rounded-sm pointer-events-none transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, (c.totalSpent / maxSpend) * 100))}%` }}
                      />
                      <span className="relative z-10">{formatCLP(c.totalSpent)}</span>
                    </td>
                  </tr>
                ))}
                {customerData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No se encontraron clientes para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-3 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>
            Mostrando{' '}
            <strong className="text-foreground tabular-nums">
              {type === 'skus' ? skuData.length : customerData.length}
            </strong>{' '}
            registros
          </span>
          <span className="italic">Datos sintéticos reproducibles (PRNG Mulberry32)</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
