import { useCallback, useState } from "react";
import { mallCustomers } from "../data/mallCustomers";
import { type ClusterStats, computeClusterStats } from "../utils/clusterStats";
import {
  type FeaturePair,
  type KMeansResult,
  runKMeans,
} from "../utils/kMeans";

export interface KMeansState {
  k: number;
  featurePair: FeaturePair;
  result: KMeansResult | null;
  clusterStats: ClusterStats[];
  isRunning: boolean;
}

export function useKMeans() {
  const [k, setK] = useState<number>(5);
  const [featurePair, setFeaturePair] =
    useState<FeaturePair>("income-spending");
  const [result, setResult] = useState<KMeansResult | null>(null);
  const [clusterStats, setClusterStats] = useState<ClusterStats[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSegmentation = useCallback(() => {
    setIsRunning(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const kmeansResult = runKMeans(mallCustomers, k, featurePair);
      const stats = computeClusterStats(
        mallCustomers,
        kmeansResult.assignments,
        k,
      );
      setResult(kmeansResult);
      setClusterStats(stats);
      setIsRunning(false);
    }, 50);
  }, [k, featurePair]);

  return {
    k,
    setK,
    featurePair,
    setFeaturePair,
    result,
    clusterStats,
    isRunning,
    runSegmentation,
  };
}
