import { describe, it, expect } from 'vitest';
import rawData from '../data/banca.json';
import { filterAndAggregateBanca, BancaDataset } from '../lib/banca-data-engine';

const dataset = rawData as unknown as BancaDataset;

describe('Data Engine - Banca & Riesgo Crediticio', () => {
  it('agrega el dataset completo correctamente', () => {
    const result = filterAndAggregateBanca(dataset, {
      dateRange: { start: '2024-01-01', end: '2027-12-31' },
      productos: [],
      segmentos: [],
      regiones: [],
      tramoMora: null,
    });

    expect(result.filteredCount).toBe(dataset.records.length);
    expect(result.kpis.carteraTotal).toBeGreaterThan(0);
    expect(result.kpis.carteraVigente).toBeGreaterThan(0);
    expect(result.kpis.moraCarteraPct).toBeGreaterThan(0);
    expect(result.kpis.moraVencida90Pct).toBeGreaterThan(0);
    expect(result.kpis.moraCarteraPct).toBeGreaterThanOrEqual(result.kpis.moraVencida90Pct);
    expect(result.agingCartera.length).toBe(5);
    expect(result.colocacionesPorProducto.length).toBe(4);
  });

  it('filtra correctamente por producto Consumo', () => {
    const result = filterAndAggregateBanca(dataset, {
      dateRange: { start: '2024-01-01', end: '2027-12-31' },
      productos: ['Consumo'],
      segmentos: [],
      regiones: [],
      tramoMora: null,
    });

    expect(result.filteredCount).toBeLessThan(dataset.records.length);
    expect(result.filteredCount).toBeGreaterThan(0);
    expect(result.filteredRecords.every((r) => r.producto === 'Consumo')).toBe(true);
  });

  it('filtra correctamente por tramo de mora 90+d', () => {
    const result = filterAndAggregateBanca(dataset, {
      dateRange: { start: '2024-01-01', end: '2027-12-31' },
      productos: [],
      segmentos: [],
      regiones: [],
      tramoMora: 'Mora 90+d',
    });

    expect(result.filteredCount).toBeGreaterThan(0);
    expect(result.filteredRecords.every((r) => r.diasMora >= 90)).toBe(true);
  });
});
