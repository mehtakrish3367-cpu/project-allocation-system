// Vibrant cluster colors optimized for dark backgrounds
// Using literal hex values for canvas/SVG rendering
export const CLUSTER_COLORS: string[] = [
  "#22d3ee", // cyan
  "#f97316", // orange
  "#a78bfa", // violet
  "#4ade80", // green
  "#fb7185", // rose
  "#facc15", // yellow
  "#38bdf8", // sky blue
  "#f472b6", // pink
  "#34d399", // emerald
  "#c084fc", // purple
];

export const CLUSTER_COLORS_MUTED: string[] = [
  "rgba(34, 211, 238, 0.15)",
  "rgba(249, 115, 22, 0.15)",
  "rgba(167, 139, 250, 0.15)",
  "rgba(74, 222, 128, 0.15)",
  "rgba(251, 113, 133, 0.15)",
  "rgba(250, 204, 21, 0.15)",
  "rgba(56, 189, 248, 0.15)",
  "rgba(244, 114, 182, 0.15)",
  "rgba(52, 211, 153, 0.15)",
  "rgba(192, 132, 252, 0.15)",
];

export function getClusterColor(index: number): string {
  return CLUSTER_COLORS[index % CLUSTER_COLORS.length];
}

export function getClusterColorMuted(index: number): string {
  return CLUSTER_COLORS_MUTED[index % CLUSTER_COLORS_MUTED.length];
}
