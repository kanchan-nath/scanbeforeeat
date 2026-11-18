import React from "react";
import { RiskLevel, getRiskColor, getRiskDot } from "@/lib/types";

export interface BadgeProps {
  children: React.ReactNode;
  risk?: RiskLevel;
  variant?: "default" | "outline" | "solid";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  risk,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  if (risk) {
    const riskStyle = getRiskColor(risk);
    const dotStyle = getRiskDot(risk);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border font-mono ${riskStyle} ${sizeClasses} ${className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
        {children}
      </span>
    );
  }

  if (variant === "outline") {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-slate-300 bg-white font-medium text-slate-700 ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-600 font-medium text-white ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 font-medium text-slate-800 ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}
