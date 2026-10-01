export interface CustomerRfmScore {
  customerId: string;
  recencyDays: number;
  orderCount: number;
  totalSpent: number;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  segment: 'Champions' | 'Loyal' | 'Potential' | 'At Risk' | 'Hibernating';
}

/**
 * Rango de valores realmente observado dentro de un quintil, derivado de la
 * distribución de la población y no de un umbral fijo escrito a mano.
 *
 * El heatmap rotula sus ejes con estos rangos, así que la etiqueta y el corte
 * que usa el motor no pueden desincronizarse: ambos salen del mismo cálculo.
 */
export interface RfmQuintileBand {
  score: 1 | 2 | 3 | 4 | 5;
  /** Menor valor observado en el quintil. */
  min: number;
  /** Mayor valor observado en el quintil. */
  max: number;
  /** Cuántos clientes quedaron en el quintil. */
  count: number;
}

export interface RfmAxes {
  recency: RfmQuintileBand[];
  frequency: RfmQuintileBand[];
  monetary: RfmQuintileBand[];
}

export interface RfmResult {
  scores: Map<string, CustomerRfmScore>;
  axes: RfmAxes;
  /** Clientes con al menos una compra, o sea la población que se quintiliza. */
  population: number;
}

/**
 * Parte la población en 5 grupos de igual tamaño (quintiles por rango).
 *
 * Antes usaba cortes absolutos escritos a mano (monetario 80k/150k/250k/400k),
 * que con esta distribución dejaban al 45% de los clientes en M5 en vez del 20%
 * esperado, y el README lo anunciaba como "Modelo Quintil". Un quintil es por
 * definición una partición en cinco grupos iguales, así que ahora el corte sale
 * de la posición en el ranking y no de un número redondo.
 *
 * El desempate de empates (dos clientes con la misma frecuencia quedan en
 * quintiles contiguos) es inherente al corte por rango: con frecuencias enteras
 * bajas no se puede partir en cinco grupos iguales sin separar empates. Por eso
 * el eje se rotula con el rango REAL observado en cada quintil y no con un
 * "3-4 compras" inventado que después no corresponde a nadie.
 */
function quintileBands(
  values: Array<{ key: string; value: number }>
): Map<string, { score: 1 | 2 | 3 | 4 | 5; band: RfmQuintileBand }> {
  const sorted = [...values].sort(
    (a, b) => a.value - b.value || a.key.localeCompare(b.key)
  );
  const n = sorted.length;
  const out = new Map<string, { score: 1 | 2 | 3 | 4 | 5; band: RfmQuintileBand }>();
  if (n === 0) return out;

  const bands = new Map<1 | 2 | 3 | 4 | 5, { min: number; max: number; count: number }>();
  for (let i = 0; i < n; i++) {
    // Grupo 1 = quintil inferior (20% más bajos), grupo 5 = quintil superior.
    const group = (Math.floor((i * 5) / n) + 1) as 1 | 2 | 3 | 4 | 5;
    const v = sorted[i].value;
    const prev = bands.get(group);
    bands.set(group, {
      min: prev ? Math.min(prev.min, v) : v,
      max: prev ? Math.max(prev.max, v) : v,
      count: (prev?.count ?? 0) + 1,
    });
  }

  for (let i = 0; i < n; i++) {
    const group = (Math.floor((i * 5) / n) + 1) as 1 | 2 | 3 | 4 | 5;
    const b = bands.get(group)!;
    out.set(sorted[i].key, {
      score: group,
      band: { score: group, min: b.min, max: b.max, count: b.count },
    });
  }
  return out;
}

function bandsToArray(
  map: Map<string, { score: 1 | 2 | 3 | 4 | 5; band: RfmQuintileBand }>,
  invert = false
): RfmQuintileBand[] {
  const byGroup = new Map<number, RfmQuintileBand>();
  for (const { band } of map.values()) byGroup.set(band.score, band);
  // En recencia el grupo 1 son los clientes que compraron más tarde (menos días),
  // y ese es el MEJOR quintil, así que el score RFM es el espejo del grupo.
  // Traducir acá evita que la UI tenga que saber en qué eje va invertido.
  const toRfmScore = (group: number): 1 | 2 | 3 | 4 | 5 =>
    (invert ? 6 - group : group) as 1 | 2 | 3 | 4 | 5;
  const result = [1, 2, 3, 4, 5].map((group) => {
    const b =
      byGroup.get(group) ?? { score: group as 1 | 2 | 3 | 4 | 5, min: 0, max: 0, count: 0 };
    return { ...b, score: toRfmScore(group) };
  });
  // De score 5 a 1, que es como el heatmap dibuja los ejes.
  return result.sort((a, b) => b.score - a.score);
}

/**
 * Calcula los scores RFM por quintiles y devuelve también los ejes, para que la
 * UI rotule con los rangos reales y no con cortes que ya no existen.
 *
 * `referenceDateStr` debe ser el cierre de la ventana que el usuario está
 * mirando, no la fecha de fin del dataset: anclar la recencia a una fecha fija
 * hacía que el heatmap mintiera sobre la recencia bajo cualquier filtro
 * temporal (93 de 106 clientes cambiaban de score al filtrar un trimestre).
 */
export function calculateRfm(
  records: Array<{ customerId: string; date: string; amount: number; orderId: string; isReturn: boolean }>,
  referenceDateStr: string
): RfmResult {
  const refTime = new Date(referenceDateStr).getTime();
  const customerMap = new Map<string, { lastDate: string; orders: Set<string>; totalSpent: number }>();

  for (const r of records) {
    if (r.isReturn) continue;
    let entry = customerMap.get(r.customerId);
    if (!entry) {
      entry = { lastDate: r.date, orders: new Set(), totalSpent: 0 };
      customerMap.set(r.customerId, entry);
    }
    if (r.date > entry.lastDate) {
      entry.lastDate = r.date;
    }
    entry.orders.add(r.orderId);
    entry.totalSpent += r.amount;
  }

  const metrics = new Map<string, { recencyDays: number; orderCount: number; totalSpent: number }>();
  for (const [customerId, data] of customerMap.entries()) {
    const lastTime = new Date(data.lastDate).getTime();
    const recencyDays = Math.max(0, Math.floor((refTime - lastTime) / (1000 * 60 * 60 * 24)));
    metrics.set(customerId, {
      recencyDays,
      orderCount: data.orders.size,
      totalSpent: data.totalSpent,
    });
  }

  // Recencia: menos días = mejor, así que el quintil 1 (los que más tarde
  // compraron) es el score 5. Frecuencia y monetario: más = mejor.
  const recencyQuintiles = quintileBands(
    [...metrics].map(([key, m]) => ({ key, value: m.recencyDays }))
  );
  const frequencyQuintiles = quintileBands(
    [...metrics].map(([key, m]) => ({ key, value: m.orderCount }))
  );
  const monetaryQuintiles = quintileBands(
    [...metrics].map(([key, m]) => ({ key, value: m.totalSpent }))
  );

  const scores = new Map<string, CustomerRfmScore>();
  for (const [customerId, m] of metrics.entries()) {
    const recencyScore = (6 - recencyQuintiles.get(customerId)!.score) as 1 | 2 | 3 | 4 | 5;
    const frequencyScore = frequencyQuintiles.get(customerId)!.score;
    const monetaryScore = monetaryQuintiles.get(customerId)!.score;

    // Asignación de segmentos estándar RFM
    let segment: CustomerRfmScore['segment'] = 'Hibernating';
    if (recencyScore >= 4 && frequencyScore >= 4) {
      segment = 'Champions';
    } else if (recencyScore >= 3 && frequencyScore >= 3) {
      segment = 'Loyal';
    } else if (recencyScore >= 3 && frequencyScore <= 2) {
      segment = 'Potential';
    } else if (recencyScore <= 2 && frequencyScore >= 3) {
      segment = 'At Risk';
    } else {
      segment = 'Hibernating';
    }

    scores.set(customerId, {
      customerId,
      recencyDays: m.recencyDays,
      orderCount: m.orderCount,
      totalSpent: m.totalSpent,
      recencyScore,
      frequencyScore,
      monetaryScore,
      segment,
    });
  }

  return {
    scores,
    axes: {
      recency: bandsToArray(recencyQuintiles, true),
      frequency: bandsToArray(frequencyQuintiles),
      monetary: bandsToArray(monetaryQuintiles),
    },
    population: metrics.size,
  };
}

/**
 * Compatibilidad hacia atrás para los call sites que solo necesitan el mapa de
 * scores. Emite un warning en desarrollo si se usa con la fecha de fin del
 * dataset, que es el error que producía el heatmap mentiroso.
 */
export function calculateRfmScores(
  records: Array<{ customerId: string; date: string; amount: number; orderId: string; isReturn: boolean }>,
  referenceDateStr: string = '2026-09-30'
): Map<string, CustomerRfmScore> {
  return calculateRfm(records, referenceDateStr).scores;
}
