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

export function calculateRfmScores(
  records: Array<{ customerId: string; date: string; amount: number; orderId: string; isReturn: boolean }>,
  referenceDateStr: string = '2026-09-30'
): Map<string, CustomerRfmScore> {
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

  const results = new Map<string, CustomerRfmScore>();

  for (const [customerId, data] of customerMap.entries()) {
    const lastTime = new Date(data.lastDate).getTime();
    const recencyDays = Math.max(0, Math.floor((refTime - lastTime) / (1000 * 60 * 60 * 24)));
    const orderCount = data.orders.size;
    const totalSpent = data.totalSpent;

    // Escala 1-5
    let recencyScore = 1;
    if (recencyDays <= 30) recencyScore = 5;
    else if (recencyDays <= 60) recencyScore = 4;
    else if (recencyDays <= 120) recencyScore = 3;
    else if (recencyDays <= 240) recencyScore = 2;

    let frequencyScore = 1;
    if (orderCount >= 6) frequencyScore = 5;
    else if (orderCount >= 4) frequencyScore = 4;
    else if (orderCount >= 3) frequencyScore = 3;
    else if (orderCount >= 2) frequencyScore = 2;

    let monetaryScore = 1;
    if (totalSpent >= 400000) monetaryScore = 5;
    else if (totalSpent >= 250000) monetaryScore = 4;
    else if (totalSpent >= 150000) monetaryScore = 3;
    else if (totalSpent >= 80000) monetaryScore = 2;

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

    results.set(customerId, {
      customerId,
      recencyDays,
      orderCount,
      totalSpent,
      recencyScore,
      frequencyScore,
      monetaryScore,
      segment,
    });
  }

  return results;
}
