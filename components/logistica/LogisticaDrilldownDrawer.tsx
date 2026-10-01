'use client';

import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { formatCLP } from '@/lib/format';
import { Search, Truck, ArrowUpDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { DespachoRecord } from '@/lib/logistica-data-engine';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';

interface LogisticaDrilldownDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filteredRecords: DespachoRecord[];
  selectedRuta?: string | null;
  selectedTransportista?: string | null;
}

export function LogisticaDrilldownDrawer({
  isOpen,
  onOpenChange,
  filteredRecords,
  selectedRuta,
  selectedTransportista,
}: LogisticaDrilldownDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'leadTime' | 'costo'>('leadTime');

  const displayRecords = useMemo(() => {
    let result = filteredRecords;
    if (selectedRuta) {
      result = result.filter((r) => r.ruta === selectedRuta);
    }
    if (selectedTransportista) {
      result = result.filter((r) => r.transportista === selectedTransportista);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.cliente.toLowerCase().includes(term) ||
          r.ordenId.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term) ||
          r.ruta.toLowerCase().includes(term) ||
          r.transportista.toLowerCase().includes(term)
      );
    }

    return [...result].sort((a, b) =>
      sortField === 'leadTime' ? b.horasLeadTime - a.horasLeadTime : b.costo - a.costo
    );
  }, [filteredRecords, selectedRuta, selectedTransportista, searchTerm, sortField]);

  const maxLeadTime = useMemo(
    () => Math.max(...displayRecords.map((r) => r.horasLeadTime), 1),
    [displayRecords]
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-6">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base md:text-lg">
                Drill-down: Trazabilidad de Despachos y Guías
              </SheetTitle>
              <SheetDescription className="text-xs">
                Auditoría detallada de órdenes, tiempos de entrega y cumplimiento de SLA
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
              placeholder="Buscar cliente, orden o guía..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar:
            </span>
            <button
              type="button"
              onClick={() => setSortField('leadTime')}
              className={`px-2 py-1 rounded-md transition-all ${
                sortField === 'leadTime'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Lead Time
            </button>
            <button
              type="button"
              onClick={() => setSortField('costo')}
              className={`px-2 py-1 rounded-md transition-all ${
                sortField === 'costo'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Costo
            </button>
            <ExportCsvButton
              data={displayRecords}
              filename="trazabilidad_despachos_filtrados"
              columns={[
                { key: 'id', label: 'N° Guía' },
                { key: 'ordenId', label: 'Orden ID' },
                { key: 'cliente', label: 'Cliente' },
                { key: 'ruta', label: 'Ruta' },
                { key: 'transportista', label: 'Transportista' },
                { key: 'horasLeadTime', label: 'Horas Lead Time' },
                { key: 'otif', label: 'Cumple OTIF', format: (v) => (v ? 'Sí' : 'No') },
                { key: 'incidencia', label: 'Incidencia' },
                { key: 'costo', label: 'Costo CLP', format: (v) => formatCLP(Number(v)) },
              ]}
              label="CSV"
              className="h-7 text-xs ml-1"
            />
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="flex-1 overflow-y-auto border border-border rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 sticky top-0 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Guía / Cliente</th>
                <th className="py-2.5 px-3 font-semibold">Ruta / Flota</th>
                <th className="py-2.5 px-3 font-semibold text-right">Lead Time</th>
                <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                <th className="py-2.5 px-3 font-semibold text-right">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayRecords.slice(0, 100).map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-3">
                    <div className="font-medium text-foreground">{d.cliente}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {d.id} · {d.ordenId}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-foreground">{d.ruta}</div>
                    <div className="text-[10px] text-muted-foreground">{d.transportista}</div>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold relative">
                    <div
                      className="absolute inset-y-1 right-1 bg-amber-500/10 dark:bg-amber-400/15 rounded-sm pointer-events-none transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, (d.horasLeadTime / maxLeadTime) * 100))}%` }}
                    />
                    <span className="relative z-10">{d.horasLeadTime}h</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {d.otif ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        OTIF
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        title={d.incidencia || 'Entrega fuera de SLA'}
                      >
                        <AlertCircle className="w-3 h-3" />
                        Falla
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-foreground font-medium">
                    {formatCLP(d.costo)}
                  </td>
                </tr>
              ))}
              {displayRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No se encontraron despachos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-3 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>
            Mostrando{' '}
            <strong className="text-foreground tabular-nums">
              {Math.min(displayRecords.length, 100)}
            </strong>{' '}
            de <span className="tabular-nums">{displayRecords.length}</span> despachos
          </span>
          <span className="italic">Datos operativos reproducibles (Seed Mulberry32)</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
