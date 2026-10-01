'use client';

import React, { useState, useMemo, useLayoutEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { formatCLP, formatNumber } from '@/lib/format';
import { Search, Landmark, ArrowUpDown } from 'lucide-react';
import { CreditoRecord } from '@/lib/banca-data-engine';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

interface BancaDrilldownDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filteredRecords: CreditoRecord[];
  selectedProduct?: string | null;
  selectedSegment?: string | null;
  selectedTramoMora?: string | null;
}

export function BancaDrilldownDrawer({
  isOpen,
  onOpenChange,
  filteredRecords,
  selectedProduct,
  selectedSegment,
  selectedTramoMora,
}: BancaDrilldownDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'saldo' | 'mora'>('saldo');

  const displayRecords = useMemo(() => {
    let result = filteredRecords;
    if (selectedProduct) {
      result = result.filter((r) => r.producto === selectedProduct);
    }
    if (selectedSegment) {
      result = result.filter((r) => r.segmento === selectedSegment);
    }
    if (selectedTramoMora) {
      result = result.filter((r) => r.tramoMora === selectedTramoMora);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.nombre.toLowerCase().includes(term) ||
          r.rut.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term) ||
          r.clienteId.toLowerCase().includes(term)
      );
    }

    return [...result].sort((a, b) =>
      sortField === 'saldo' ? b.saldo - a.saldo : b.diasMora - a.diasMora
    );
  }, [filteredRecords, selectedProduct, selectedSegment, selectedTramoMora, searchTerm, sortField]);

  const totalSaldoDisplay = useMemo(
    () => displayRecords.reduce((acc, r) => acc + r.saldo, 0),
    [displayRecords]
  );

  const maxSaldo = useMemo(
    () => Math.max(...displayRecords.map((r) => r.saldo), 1),
    [displayRecords]
  );

  // La cartera tiene 6.131 créditos y el drawer antes pintaba solo los
  // primeros 100: 6.031 quedan inalcanzables, ni con scroll ni con búsqueda
  // si el deudor está fuera del corte. Virtualizar deja recorrerlos todos
  // renderizando únicamente las filas visibles, así que el costo del DOM
  // sigue siendo de ~20 filas en vez de 6.131.
  // El elemento de scroll va en estado, no en un ref.
  //
  // useVirtualizer solo engancha el elemento en un layout effect SIN
  // dependencias, o sea en cada render. Radix monta el Sheet en un commit
  // posterior al que abre el drawer, así que con un `useRef` normal no existe
  // ningún render después de que el div exista y el virtualizador se queda
  // sin elemento: la tabla queda vacía aunque el alto total esté reservado.
  // El callback-ref-como-estado fuerza ese render al adjuntarse el div.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const FILAS_POR_COLUMNA = '2.2fr 1fr 1.2fr 0.7fr 1.1fr';

  const virtualizador = useVirtualizer({
    count: displayRecords.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => 41,
    overscan: 12,
  });

  // Y hay que re-medir cuando el elemento aparece: el primer rect puede caer
  // sobre un Sheet todavía oculto, con 0 px de alto.
  useLayoutEffect(() => {
    if (scrollEl) virtualizador.measure();
  }, [scrollEl, virtualizador]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-6">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base md:text-lg">
                Drill-down: Cartera de Créditos & Deudores
              </SheetTitle>
              <SheetDescription className="text-xs">
                Auditoría individual de colocaciones, días de atraso CMF y provisiones IFRS 9
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
              placeholder="Buscar por RUT, deudor o crédito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar:
            </span>
            <button
              type="button"
              onClick={() => setSortField('saldo')}
              className={`px-2 py-1 rounded-md transition-all ${
                sortField === 'saldo'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Saldo
            </button>
            <button
              type="button"
              onClick={() => setSortField('mora')}
              className={`px-2 py-1 rounded-md transition-all ${
                sortField === 'mora'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Días Mora
            </button>
            <ExportCsvButton
              data={displayRecords}
              filename="cartera_creditos_filtrada"
              columns={[
                { key: 'id', label: 'ID Operación' },
                { key: 'rut', label: 'RUT' },
                { key: 'nombre', label: 'Deudor' },
                { key: 'producto', label: 'Producto' },
                { key: 'segmento', label: 'Segmento' },
                { key: 'saldo', label: 'Saldo CLP', format: (v) => formatCLP(Number(v)) },
                { key: 'diasMora', label: 'Días Mora' },
                { key: 'tramoMora', label: 'Tramo Mora' },
                { key: 'provision', label: 'Provisión IFRS 9 CLP', format: (v) => formatCLP(Number(v)) },
              ]}
              label="CSV"
              className="h-7 text-xs ml-1"
            />
          </div>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground">Operaciones: </span>
            <strong className="text-foreground tabular-nums">{formatNumber(displayRecords.length)}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Saldo acumulado: </span>
            <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatCLP(totalSaldoDisplay)}
            </strong>
          </div>
        </div>

        {/* Tabla de Resultados. Virtualizada: el contenedor de scroll es el
            padre, el <tbody> reserva el alto total y cada fila visible se
            posiciona en su offset. `aria-rowcount`/`aria-rowindex` mantienen
            el conteo real para lectores de pantalla, que si no anuncian solo
            las filas montadas. */}
        <div ref={setScrollEl} className="flex-1 overflow-y-auto border border-border rounded-xl mt-3">
          <table className="w-full text-left text-xs border-collapse" aria-rowcount={displayRecords.length}>
            <thead
              className="bg-muted/50 sticky top-0 z-10 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider"
              style={{ display: 'grid' }}
            >
              <tr style={{ display: 'grid', gridTemplateColumns: FILAS_POR_COLUMNA }}>
                <th className="py-2.5 px-3 font-semibold">Crédito / RUT</th>
                <th className="py-2.5 px-3 font-semibold">Producto / Seg.</th>
                <th className="py-2.5 px-3 font-semibold text-right">Saldo CLP</th>
                <th className="py-2.5 px-3 font-semibold text-right">Mora</th>
                <th className="py-2.5 px-3 font-semibold text-right">Provisión</th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-border/60"
              style={{
                display: 'grid',
                height: `${virtualizador.getTotalSize()}px`,
                position: 'relative',
                width: '100%',
              }}
            >
              {virtualizador.getVirtualItems().map((filaVirtual) => {
                const cr = displayRecords[filaVirtual.index];
                return (
                  <tr
                    key={cr.id}
                    aria-rowindex={filaVirtual.index + 2}
                    className="hover:bg-muted/30 transition-colors"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: FILAS_POR_COLUMNA,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${filaVirtual.size}px`,
                      transform: `translateY(${filaVirtual.start}px)`,
                    }}
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground truncate">{cr.nombre}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {cr.rut} · {cr.id}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-foreground truncate">{cr.producto}</div>
                      <div className="text-[10px] text-muted-foreground">{cr.segmento}</div>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-foreground relative">
                      <div
                        className="absolute inset-y-1 right-1 bg-emerald-500/10 dark:bg-emerald-400/15 rounded-sm pointer-events-none transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, (cr.saldo / maxSaldo) * 100))}%` }}
                      />
                      <span className="relative z-10">{formatCLP(cr.saldo)}</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          cr.diasMora >= 90
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            : cr.diasMora >= 30
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : cr.diasMora > 0
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {cr.diasMora === 0 ? 'Al día' : `${cr.diasMora}d`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground font-mono text-[11px]">
                      {formatCLP(cr.provision)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {displayRecords.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron operaciones crediticias para los filtros seleccionados.
            </div>
          )}
        </div>

        <div className="pt-3 text-[11px] text-muted-foreground flex items-center justify-between gap-3">
          <span>
            <strong className="text-foreground tabular-nums">
              {formatNumber(displayRecords.length)}
            </strong>{' '}
            operaciones en la lista · scrolls para recorrerlas todas
          </span>
          <span className="italic text-right">Normativa CMF / IFRS 9 (Simulación determinista)</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
