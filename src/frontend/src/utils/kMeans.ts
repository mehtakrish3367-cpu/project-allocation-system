import type { Customer } from "../data/mallCustomers";

export type FeaturePair = "income-spending" | "age-spending";

export interface Point {
  x: number;
  y: number;
  customerIndex: number;
}

export interface KMeansResult {
  assignments: number[];
  centroids: { x: number; y: number }[];
  iterations: number;
}

function euclideanDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function extractPoints(
  customers: Customer[],
  featurePair: FeaturePair,
): Point[] {
  return customers.map((c, i) => ({
    x: featurePair === "income-spending" ? c.annualIncome : c.age,
    y: c.spendingScore,
    customerIndex: i,
  }));
}

function initializeCentroids(
  points: Point[],
  k: number,
): { x: number; y: number }[] {
  const centroids: { x: number; y: number }[] = [];

  const firstIdx = Math.floor(Math.random() * points.length);
  centroids.push({ x: points[firstIdx].x, y: points[firstIdx].y });

  for (let c = 1; c < k; c++) {
    const distances = points.map((p) => {
      const minDist = Math.min(
        ...centroids.map((cent) => euclideanDistance(p, cent)),
      );
      return minDist * minDist;
    });

    const totalDist = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalDist;

    let selectedIdx = 0;
    for (let i = 0; i < distances.length; i++) {
      rand -= distances[i];
      if (rand <= 0) {
        selectedIdx = i;
        break;
      }
    }

    centroids.push({ x: points[selectedIdx].x, y: points[selectedIdx].y });
  }

  return centroids;
}

function assignClusters(
  points: Point[],
  centroids: { x: number; y: number }[],
): number[] {
  return points.map((p) => {
    let minDist = Number.POSITIVE_INFINITY;
    let assignment = 0;
    centroids.forEach((c, i) => {
      const dist = euclideanDistance(p, c);
      if (dist < minDist) {
        minDist = dist;
        assignment = i;
      }
    });
    return assignment;
  });
}

function updateCentroids(
  points: Point[],
  assignments: number[],
  k: number,
): { x: number; y: number }[] {
  const newCentroids: { x: number; y: number }[] = [];

  for (let c = 0; c < k; c++) {
    const clusterPoints = points.filter((_, i) => assignments[i] === c);
    if (clusterPoints.length === 0) {
      newCentroids.push({ x: 0, y: 0 });
    } else {
      const avgX =
        clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
      const avgY =
        clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
      newCentroids.push({ x: avgX, y: avgY });
    }
  }

  return newCentroids;
}

function centroidsConverged(
  prev: { x: number; y: number }[],
  next: { x: number; y: number }[],
  tolerance = 0.0001,
): boolean {
  return prev.every((c, i) => euclideanDistance(c, next[i]) < tolerance);
}

export function runKMeans(
  customers: Customer[],
  k: number,
  featurePair: FeaturePair,
  maxIterations = 300,
): KMeansResult {
  const points = extractPoints(customers, featurePair);
  let centroids = initializeCentroids(points, k);
  let assignments: number[] = new Array(points.length).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations++;
    const newAssignments = assignClusters(points, centroids);
    const newCentroids = updateCentroids(points, newAssignments, k);

    if (centroidsConverged(centroids, newCentroids)) {
      assignments = newAssignments;
      centroids = newCentroids;
      break;
    }

    assignments = newAssignments;
    centroids = newCentroids;
  }

  return { assignments, centroids, iterations };
}

export { extractPoints };
