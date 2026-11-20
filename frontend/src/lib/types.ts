export const siteConfig = {
  name: "ScanBeforeEat",
  description:
    "AI-powered food ingredient scanner. Scan any food barcode or ingredient list for instant analysis of additives, allergens, and ultra-processed markers.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://scanbeforeeat.onrender.com").replace(/\/+$/, ""),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app-scanbeforeeat.com",
  ogImage: "/og-image.png",
} as const;

export type RiskLevel = "low" | "moderate" | "high";

export interface Ingredient {
  name: string;
  function: string;
  riskLevel: RiskLevel;
  evidence: string;
}

export interface ScanResult {
  productName: string;
  manufacturer: string;
  category: string;
  barcode: string;
  healthScore: number;
  novaGroup: 1 | 2 | 3 | 4;
  allergens: string[];
  ingredients: Ingredient[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  featured?: boolean;
}

export interface JobListing {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export interface Additive {
  eNumber: string;
  name: string;
  category: string;
  function: string;
  riskLevel: RiskLevel;
  commonlyFoundIn: string;
  efsaStatus: string;
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "bg-emerald-50 text-emerald-800 border-emerald-200",
    moderate: "bg-amber-50 text-amber-800 border-amber-200",
    high: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return colors[level];
}

export function getRiskDot(level: RiskLevel): string {
  const dots: Record<RiskLevel, string> = {
    low: "bg-emerald-600",
    moderate: "bg-amber-500",
    high: "bg-rose-600",
  };
  return dots[level];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "GOOD";
  if (score >= 50) return "MODERATE";
  return "POOR";
}
