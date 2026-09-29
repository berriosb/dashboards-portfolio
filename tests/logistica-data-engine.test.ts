import { describe, it, expect } from 'vitest';
import rawData from '../data/logistica.json';
import { filterAndAggregateLogistica, LogisticaDataset } from '../lib/logistica-data-engine';

const dataset = rawData as unknown as LogisticaDataset;

describe('Data Engine - Logística & Cadena de Suministro', () => {
  it('agrega el dataset completo de logística correctamente', () => {
    const result = filterAndAggregateLogistica(dataset, {
      dateRange: { start: '2025-10-01', end: '2026-09-30' },
      rutas: [],
      transportistas: [],
      tiposCarga: [],
      prioridades: [],
    });

    expect(result.filteredCount).toBe(dataset.records.length);
    expect(result.kpis.otifPct).toBeGreaterThan(80);
    expect(result.kpis.fillRatePct).toBeGreaterThan(90);
    expect(result.kpis.leadTimeP50).toBeGreaterThan(0);
    expect(result.kpis.leadTimeP90).toBeGreaterThanOrEqual(result.kpis.leadTimeP50);
    expect(result.kpis.hhiProveedores).toBeGreaterThan(1000);
    expect(result.otifPorRuta.length).toBe(dataset.lookups.rutas.length);
    expect(result.distribucionLeadTime.length).toBe(5);
  });

  it('filtra correctamente por ruta específica', () => {
    const targetRuta = dataset.lookups.rutas[0];
    const result = filterAndAggregateLogistica(dataset, {
      dateRange: { start: '2025-10-01', end: '2026-09-30' },
      rutas: [targetRuta],
      transportistas: [],
      tiposCarga: [],
      prioridades: [],
    });

    expect(result.filteredCount).toBeLessThan(dataset.records.length);
    expect(result.filteredCount).toBeGreaterThan(0);
    expect(result.filteredRecords.every((r) => r.ruta === targetRuta)).toBe(true);
  });

  it('filtra sólo incidencias operacionales', () => {
    const result = filterAndAggregateLogistica(dataset, {
      dateRange: { start: '2025-10-01', end: '2026-09-30' },
      rutas: [],
      transportistas: [],
      tiposCarga: [],
      prioridades: [],
      soloIncidencias: true,
    });

    expect(result.filteredCount).toBeGreaterThan(0);
    expect(result.filteredRecords.every((r) => !r.otif)).toBe(true);
  });
});
