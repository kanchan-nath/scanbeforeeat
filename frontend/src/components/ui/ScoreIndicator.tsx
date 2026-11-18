import React from "react";
import { getScoreColor, getScoreLabel } from "@/lib/types";

export interface ScoreIndicatorProps {
  score: number;
  novaGroup: 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreIndicator({
  score,
  novaGroup,
  size = "md",
  showLabel = true,
  className = "",
}: ScoreIndicatorProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const novaStyles: Record<1 | 2 | 3 | 4, { bg: string; text: string; label: string }> = {
    1: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", label: "NOVA 1 (Unprocessed)" },
    2: { bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-800", label: "NOVA 2 (Culinary)" },
    3: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", label: "NOVA 3 (Processed)" },
    4: { bg: "bg-rose-50 border-rose-200", text: "text-rose-800", label: "NOVA 4 (Ultra-Processed)" },
  };

  const nova = novaStyles[novaGroup];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Score Box */}
      <div className="flex flex-col">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Health Score
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-black ${size === "lg" ? "text-3xl" : "text-2xl"} ${color}`}>
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-400">/100</span>
          {showLabel && (
            <span className={`ml-1 text-xs font-bold ${color}`}>
              {label}
            </span>
          )}
        </div>
      </div>

      {/* NOVA Badge */}
      <div className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${nova.bg} ${nova.text}`}>
        {nova.label}
      </div>
    </div>
  );
}
