'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, Check } from 'lucide-react';
import { acentoDeRuta } from '@/lib/dashboard-accent';

/**
 * Serialización a CSV.
 *
 * `serializeCsv` escapa comas, comillas y saltos de línea de cada celda del
 * CSV antes de serializarse. */
type CsvCellValue = unknown;

interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  format?: (value: CsvCellValue, row: T) => string | number;
}

interface ExportCsvButtonProps<T extends object> {
  data: readonly T[];
  filename: string;
  columns?: ColumnDef<T>[];
  label?: string;
  className?: string;
}

/**
 * Lee una clave arbitraria de una fila genérica sin `any`: se ensancha a un
 * registro indexado una sola vez, acá adentro, en vez de propagar `any` por las
 * props y por los call sites.
 */
function cellValue<T extends object>(row: T, key: keyof T | string): CsvCellValue {
  return (row as Record<string, CsvCellValue>)[String(key)];
}

export function ExportCsvButton<T extends object>({
  data,
  filename,
  columns,
  label = 'Exportar CSV',
  className = '',
}: ExportCsvButtonProps<T>) {
  const [downloaded, setDownloaded] = useState(false);
  const acento = acentoDeRuta(usePathname());

  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Determinar columnas
    const cols: ColumnDef<T>[] =
      columns ||
      Object.keys(data[0]).map((key) => ({
        key,
        label: key,
      }));

    // Escapar celdas para CSV RFC 4180
    const escapeCell = (val: CsvCellValue): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Header
    const headerRow = cols.map((c) => escapeCell(c.label)).join(',');

    // Body
    const rows = data.map((row) => {
      return cols
        .map((c) => {
          const raw = cellValue(row, c.key);
          return escapeCell(c.format ? c.format(raw, row) : raw);
        })
        .join(',');
    });

    const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={data.length === 0}
      className={`inline-flex items-center gap-1.5 text-xs font-medium tap-target min-h-11 px-2.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      title={downloaded ? '¡Archivo descargado!' : `Descargar ${data.length} registros en formato CSV`}
      aria-label={`Exportar datos a archivo CSV: ${filename}`}
    >
      {downloaded ? (
        <>
          {/* El estado se lee por ícono + texto, no por color: el acento solo
              refuerza. */}
          <Check className={`w-3.5 h-3.5 ${acento.text}`} />
          <span className={`${acento.text} font-semibold`}>Listo</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
      {/* Región viva persistente (mismo criterio que ShareViewButton): se
          anuncia el cambio de contenido, no el montaje del nodo. */}
      <span role="status" aria-live="polite" className="sr-only">
        {downloaded ? `Archivo ${filename}.csv descargado` : ''}
      </span>
    </button>
  );
}
