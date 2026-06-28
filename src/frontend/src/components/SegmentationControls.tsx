import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Play, Settings2 } from "lucide-react";
import React from "react";
import type { FeaturePair } from "../utils/kMeans";

interface SegmentationControlsProps {
  k: number;
  featurePair: FeaturePair;
  isRunning: boolean;
  onKChange: (k: number) => void;
  onFeaturePairChange: (fp: FeaturePair) => void;
  onRunSegmentation: () => void;
}

export function SegmentationControls({
  k,
  featurePair,
  isRunning,
  onKChange,
  onFeaturePairChange,
  onRunSegmentation,
}: SegmentationControlsProps) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Settings2 className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground">
          Segmentation Controls
        </h2>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Feature Axes
        </Label>
        <Select
          value={featurePair}
          onValueChange={(v) => onFeaturePairChange(v as FeaturePair)}
        >
          <SelectTrigger className="bg-secondary border-border text-foreground h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="income-spending">
              Annual Income vs Spending Score
            </SelectItem>
            <SelectItem value="age-spending">Age vs Spending Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Number of Clusters (k)
          </Label>
          <span className="text-lg font-display font-bold text-primary tabular-nums w-6 text-center">
            {k}
          </span>
        </div>
        <Slider
          min={2}
          max={10}
          step={1}
          value={[k]}
          onValueChange={([val]) => onKChange(val)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>2</span>
          <span>6</span>
          <span>10</span>
        </div>
      </div>

      <Button
        onClick={onRunSegmentation}
        disabled={isRunning}
        className="w-full font-display font-semibold tracking-wide h-10 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" />
            Running...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Run Segmentation
          </span>
        )}
      </Button>
    </div>
  );
}
