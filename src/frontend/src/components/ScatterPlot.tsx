import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Customer } from "../data/mallCustomers";
import { CLUSTER_COLORS } from "../utils/colorPalette";
import type { FeaturePair, KMeansResult } from "../utils/kMeans";

interface TooltipData {
  x: number;
  y: number;
  customer: Customer;
  cluster: number;
}

interface ScatterPlotProps {
  customers: Customer[];
  result: KMeansResult | null;
  featurePair: FeaturePair;
  k: number;
}

const PADDING = { top: 30, right: 30, bottom: 60, left: 65 };

function getFeatureValue(
  customer: Customer,
  featurePair: FeaturePair,
  axis: "x" | "y",
): number {
  if (axis === "x") {
    return featurePair === "income-spending"
      ? customer.annualIncome
      : customer.age;
  }
  return customer.spendingScore;
}

function getAxisLabels(featurePair: FeaturePair): { x: string; y: string } {
  return {
    x: featurePair === "income-spending" ? "Annual Income (k$)" : "Age",
    y: "Spending Score (1-100)",
  };
}

export function ScatterPlot({
  customers,
  result,
  featurePair,
  k,
}: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });

  const xValues = customers.map((c) => getFeatureValue(c, featurePair, "x"));
  const yValues = customers.map((c) => getFeatureValue(c, featurePair, "y"));
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const xPad = (xMax - xMin) * 0.08;
  const yPad = (yMax - yMin) * 0.08;

  const toCanvasX = useCallback(
    (val: number, w: number) => {
      return (
        PADDING.left +
        ((val - (xMin - xPad)) / (xMax + xPad - (xMin - xPad))) *
          (w - PADDING.left - PADDING.right)
      );
    },
    [xMin, xMax, xPad],
  );

  const toCanvasY = useCallback(
    (val: number, h: number) => {
      return (
        h -
        PADDING.bottom -
        ((val - (yMin - yPad)) / (yMax + yPad - (yMin - yPad))) *
          (h - PADDING.top - PADDING.bottom)
      );
    },
    [yMin, yMax, yPad],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(300, width),
          height: Math.max(300, Math.min(500, width * 0.65)),
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    const xTicks = 6;
    const yTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const xVal = xMin - xPad + (i / xTicks) * (xMax + xPad - (xMin - xPad));
      const cx = toCanvasX(xVal, width);
      ctx.beginPath();
      ctx.moveTo(cx, PADDING.top);
      ctx.lineTo(cx, height - PADDING.bottom);
      ctx.stroke();
    }
    for (let i = 0; i <= yTicks; i++) {
      const yVal = yMin - yPad + (i / yTicks) * (yMax + yPad - (yMin - yPad));
      const cy = toCanvasY(yVal, height);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, cy);
      ctx.lineTo(width - PADDING.right, cy);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PADDING.left, PADDING.top);
    ctx.lineTo(PADDING.left, height - PADDING.bottom);
    ctx.lineTo(width - PADDING.right, height - PADDING.bottom);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = `${11 * Math.min(1, width / 500)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    for (let i = 0; i <= xTicks; i++) {
      const xVal = xMin - xPad + (i / xTicks) * (xMax + xPad - (xMin - xPad));
      const cx = toCanvasX(xVal, width);
      ctx.fillText(
        Math.round(xVal).toString(),
        cx,
        height - PADDING.bottom + 18,
      );
    }
    ctx.textAlign = "right";
    for (let i = 0; i <= yTicks; i++) {
      const yVal = yMin - yPad + (i / yTicks) * (yMax + yPad - (yMin - yPad));
      const cy = toCanvasY(yVal, height);
      ctx.fillText(Math.round(yVal).toString(), PADDING.left - 8, cy + 4);
    }

    const labels = getAxisLabels(featurePair);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `600 ${12 * Math.min(1, width / 500)}px Space Grotesk, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      labels.x,
      PADDING.left + (width - PADDING.left - PADDING.right) / 2,
      height - 10,
    );
    ctx.save();
    ctx.translate(
      14,
      PADDING.top + (height - PADDING.top - PADDING.bottom) / 2,
    );
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(labels.y, 0, 0);
    ctx.restore();

    customers.forEach((customer, i) => {
      const cx = toCanvasX(getFeatureValue(customer, featurePair, "x"), width);
      const cy = toCanvasY(getFeatureValue(customer, featurePair, "y"), height);
      const clusterIdx = result ? result.assignments[i] : 0;
      const color = result
        ? CLUSTER_COLORS[clusterIdx % CLUSTER_COLORS.length]
        : "#22d3ee";

      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = `${color}30`;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    if (result) {
      result.centroids.forEach((centroid, i) => {
        const cx = toCanvasX(centroid.x, width);
        const cy = toCanvasY(centroid.y, height);
        const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        const size = 10;
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
        const diagSize = 7;
        ctx.beginPath();
        ctx.moveTo(-diagSize, -diagSize);
        ctx.lineTo(diagSize, diagSize);
        ctx.moveTo(diagSize, -diagSize);
        ctx.lineTo(-diagSize, diagSize);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#0d1117";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
    }
  }, [
    customers,
    result,
    featurePair,
    dimensions,
    toCanvasX,
    toCanvasY,
    xMin,
    xMax,
    xPad,
    yMin,
    yMax,
    yPad,
  ]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { width, height } = dimensions;
      let closest: TooltipData | null = null;
      let minDist = 12;
      customers.forEach((customer, i) => {
        const cx = toCanvasX(
          getFeatureValue(customer, featurePair, "x"),
          width,
        );
        const cy = toCanvasY(
          getFeatureValue(customer, featurePair, "y"),
          height,
        );
        const dist = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = {
            x: e.clientX,
            y: e.clientY,
            customer,
            cluster: result ? result.assignments[i] : 0,
          };
        }
      });
      setTooltip(closest);
    },
    [customers, result, featurePair, dimensions, toCanvasX, toCanvasY],
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const labels = getAxisLabels(featurePair);
  const activeK = result ? k : 0;

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display font-semibold text-base text-foreground">
          Customer Segments — {labels.x} vs {labels.y}
        </h2>
        {result && (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            {result.iterations} iterations · {customers.length} customers
          </span>
        )}
      </div>

      <div ref={containerRef} className="w-full relative">
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: `${dimensions.height}px`,
            cursor: "crosshair",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
          >
            <div className="bg-popover border border-border rounded-lg p-3 shadow-card text-xs space-y-1 min-w-[160px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      CLUSTER_COLORS[tooltip.cluster % CLUSTER_COLORS.length],
                  }}
                />
                <span className="font-display font-semibold text-foreground">
                  Cluster {tooltip.cluster + 1}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                <span>ID:</span>
                <span className="text-foreground font-medium">
                  {tooltip.customer.customerID}
                </span>
                <span>Gender:</span>
                <span className="text-foreground font-medium">
                  {tooltip.customer.gender}
                </span>
                <span>Age:</span>
                <span className="text-foreground font-medium">
                  {tooltip.customer.age}
                </span>
                <span>Income:</span>
                <span className="text-foreground font-medium">
                  {tooltip.customer.annualIncome}k$
                </span>
                <span>Score:</span>
                <span className="text-foreground font-medium">
                  {tooltip.customer.spendingScore}
                </span>
              </div>
            </div>
          </div>
        )}

        {!result && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-2">
              <div className="text-4xl opacity-20">◎</div>
              <p className="text-muted-foreground text-sm">
                Run segmentation to see clusters
              </p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Array.from({ length: activeK }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: legend items keyed by position
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
                }}
              />
              <span className="text-muted-foreground">Cluster {i + 1}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs ml-2">
            <div className="w-3 h-3 flex items-center justify-center">
              <span className="text-muted-foreground font-bold text-base leading-none">
                ✕
              </span>
            </div>
            <span className="text-muted-foreground">Centroid</span>
          </div>
        </div>
      )}
    </div>
  );
}
