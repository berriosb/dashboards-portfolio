import { describe, it, expect } from 'vitest';
import retailData from '../data/retail.json';
import { filterAndAggregateRetail, FilterState, RetailDataset } from '../lib/data-engine';
import { calculateRfmScores } from '../lib/rfm';

const dataset = retailData as unknown as RetailDataset;

describe('Data Engine - Retail', () => {
  it('agrega el dataset completo correctamente', () => {
    const filters: FilterState = {
      dateRange: { start: '2025-10-01', end: '2026-09-30' },
      categories: [],
      channels: [],
      regions: [],
      rfmSegment: null,
    };

    const res = filterAndAggregateRetail(dataset, filters);
    expect(res.filteredCount).toBe(1000);
    expect(res.kpis.ventasNetas).toBeGreaterThan(0);
    expect(res.kpis.ticketPromedio).toBeGreaterThan(0);
    expect(res.kpis.margenBrutoPct).toBeGreaterThan(30);
    expect(res.kpis.margenBrutoPct).toBeLessThan(60);
    expect(res.ventasPorCategoria.length).toBe(10);
  });

  it('filtra correctamente por categoría específica', () => {
    const filters: FilterState = {
      dateRange: { start: '2025-10-01', end: '2026-09-30' },
      categories: ['Hogar'],
      channels: [],
      regions: [],
      rfmSegment: null,
    };

    const res = filterAndAggregateRetail(dataset, filters);
    expect(res.filteredCount).toBeLessThan(1000);
    expect(res.ventasPorCategoria.length).toBe(1);
    expect(res.ventasPorCategoria[0].categoria).toBe('Hogar');
  });

  it('filtra correctamente por canal online', () => {
    const filters: FilterState = {
      dateRange: { start: '2025-10-01', end: '2026-09-30' },
      categories: [],
      channels: ['online'],
      regions: [],
      rfmSegment: null,
    };

    const res = filterAndAggregateRetail(dataset, filters);
    expect(res.ventasPorCanal.length).toBe(1);
    expect(res.ventasPorCanal[0].canal).toBe('online');
  });

  it('calcula RFM scores correctamente con 5 segmentos', () => {
    const scores = calculateRfmScores(dataset.records, '2026-09-30');
    expect(scores.size).toBeGreaterThan(0);
    const firstScore = scores.values().next().value;
    expect(firstScore).toBeDefined();
    expect(firstScore?.recencyScore).toBeGreaterThanOrEqual(1);
    expect(firstScore?.recencyScore).toBeLessThanOrEqual(5);
    expect(['Champions', 'Loyal', 'Potential', 'At Risk', 'Hibernating']).toContain(firstScore?.segment);
  });
});
