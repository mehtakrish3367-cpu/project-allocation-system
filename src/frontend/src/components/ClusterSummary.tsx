import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import type React from "react";
import type { ClusterStats } from "../utils/clusterStats";
import { CLUSTER_COLORS, getClusterColorMuted } from "../utils/colorPalette";

interface ClusterSummaryProps {
  clusterStats: ClusterStats[];
  k?: number;
}

function StatItem({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

export function ClusterSummary({ clusterStats }: ClusterSummaryProps) {
  if (clusterStats.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Cluster Summary
        </h2>
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
          Run segmentation to see cluster statistics
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground">
        Cluster Summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
        {clusterStats.map((stat) => {
          const color =
            CLUSTER_COLORS[stat.clusterIndex % CLUSTER_COLORS.length];
          const bgMuted = getClusterColorMuted(stat.clusterIndex);
          return (
            <div
              key={stat.clusterIndex}
              className="rounded-lg p-4 border space-y-3 transition-transform hover:scale-[1.02]"
              style={{
                borderColor: `${color}40`,
                background: bgMuted,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}80`,
                    }}
                  />
                  <span
                    className="font-display font-bold text-sm"
                    style={{ color }}
                  >
                    Cluster {stat.clusterIndex + 1}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {stat.count}
                </span>
              </div>

              <div className="space-y-2">
                <StatItem
                  icon={<Users className="w-3.5 h-3.5" />}
                  label="Customers"
                  value={`${stat.count} (${Math.round((stat.count / 200) * 100)}%)`}
                />
                <StatItem
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Avg Age"
                  value={`${stat.avgAge} yrs`}
                />
                <StatItem
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  label="Avg Income"
                  value={`${stat.avgAnnualIncome}k$`}
                />
                <StatItem
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                  label="Avg Score"
                  value={`${stat.avgSpendingScore}/100`}
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Gender split
                </div>
                <div className="text-xs font-medium" style={{ color }}>
                  {stat.dominantGender === "Equal"
                    ? "50/50"
                    : `${stat.dominantGender} dominant`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
