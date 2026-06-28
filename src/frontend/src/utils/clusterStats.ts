import type { Customer } from "../data/mallCustomers";

export interface ClusterStats {
  clusterIndex: number;
  count: number;
  avgAge: number;
  avgAnnualIncome: number;
  avgSpendingScore: number;
  dominantGender: "Male" | "Female" | "Equal";
}

export function computeClusterStats(
  customers: Customer[],
  assignments: number[],
  k: number,
): ClusterStats[] {
  const stats: ClusterStats[] = [];

  for (let c = 0; c < k; c++) {
    const clusterCustomers = customers.filter((_, i) => assignments[i] === c);

    if (clusterCustomers.length === 0) {
      stats.push({
        clusterIndex: c,
        count: 0,
        avgAge: 0,
        avgAnnualIncome: 0,
        avgSpendingScore: 0,
        dominantGender: "Equal",
      });
      continue;
    }

    const count = clusterCustomers.length;
    const avgAge = clusterCustomers.reduce((s, c) => s + c.age, 0) / count;
    const avgAnnualIncome =
      clusterCustomers.reduce((s, c) => s + c.annualIncome, 0) / count;
    const avgSpendingScore =
      clusterCustomers.reduce((s, c) => s + c.spendingScore, 0) / count;
    const maleCount = clusterCustomers.filter(
      (c) => c.gender === "Male",
    ).length;
    const femaleCount = count - maleCount;
    const dominantGender: "Male" | "Female" | "Equal" =
      maleCount > femaleCount
        ? "Male"
        : femaleCount > maleCount
          ? "Female"
          : "Equal";

    stats.push({
      clusterIndex: c,
      count,
      avgAge: Math.round(avgAge * 10) / 10,
      avgAnnualIncome: Math.round(avgAnnualIncome * 10) / 10,
      avgSpendingScore: Math.round(avgSpendingScore * 10) / 10,
      dominantGender,
    });
  }

  return stats;
}
