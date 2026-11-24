"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEMO_PRODUCTS, DemoProduct } from "./mockScanData";
import { siteConfig } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";

export function ScanDemo() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct>(DEMO_PRODUCTS[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/scanner");
    } else {
      router.push("/auth?redirect=/scanner");
    }
  };

  const handleSelect = (prod: DemoProduct) => {
    setIsScanning(true);
    setTimeout(() => {
      setSelectedProduct(prod);
      setIsScanning(false);
    }, 250);
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200 text-emerald-800";
    if (score >= 60) return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-rose-50 border-rose-200 text-rose-800";
  };

  const getNovaColorClass = (nova: number) => {
    if (nova === 1) return "bg-emerald-950 text-white";
    if (nova === 2) return "bg-blue-950 text-white";
    if (nova === 3) return "bg-amber-950 text-white";
    return "bg-rose-950 text-white";
  };

  const getRiskBadge = (level: "low" | "moderate" | "high") => {
    switch (level) {
      case "high":
        return "bg-red-600 text-white shadow-xs";
      case "moderate":
        return "bg-amber-100 text-amber-800 border border-amber-300";
      case "low":
      default:
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    }
  };

  return (
    <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold font-label bg-zinc-200/80 text-zinc-800 mb-3">
            <Icon name="sync" className="text-xs" />
            <span>Transparent Methodology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight font-headline">
            See It In Action
          </h2>
          <p className="text-zinc-600 mt-2 text-sm sm:text-base">
            From UPC barcode to peer-reviewed scientific breakdown in sub-500 milliseconds.
          </p>
        </div>

        {/* 3-Step Horizontal Stepper (Desktop) */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-12">
          <div className="relative bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">
                  <Icon name="photo_camera" className="text-xl" />
                </div>
                <span className="font-label text-xs font-bold text-zinc-400">STEP 01</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">Scan Barcode</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Point camera at any packaged item or snap nutrition label with instant lens auto-detection.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-zinc-100 font-label text-[11px] text-zinc-400 flex items-center gap-1">
              <Icon name="check_circle" className="text-xs" />
              <span>Supports UPC, EAN-13, QR</span>
            </div>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200">
                  <Icon name="memory" className="text-xl" />
                </div>
                <span className="font-label text-xs font-bold text-emerald-700">STEP 02</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">AI Analyzes Ingredients</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Cross-referenced against EFSA, FDA & PubMed peer-reviewed toxicology and nutrition papers.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-zinc-100 font-label text-[11px] text-zinc-400 flex items-center gap-1">
              <Icon name="check_circle" className="text-xs" />
              <span>Over 80,000 additives cataloged</span>
            </div>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">
                  <Icon name="verified" className="text-xl" />
                </div>
                <span className="font-label text-xs font-bold text-zinc-400">STEP 03</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-2">Get Transparent Results</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Clear risk ratings with exact citations and healthier alternative recommendations.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-zinc-100 font-label text-[11px] text-zinc-400 flex items-center gap-1">
              <Icon name="check_circle" className="text-xs" />
              <span>100% unbiased scientific formula</span>
            </div>
          </div>
        </div>

        {/* 3-Step Stepper (Mobile Thumb-Friendly from Stitch mobile-landing.html) */}
        <div className="grid md:hidden grid-cols-3 gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200 mb-6">
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-slate-100 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
              <Icon name="photo_camera" className="text-base" />
            </span>
            <span className="font-mono-code text-[10px] text-slate-400 font-semibold">01 SCAN</span>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Barcode/Label</span>
          </div>
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-slate-100 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
              <Icon name="memory" className="text-base" />
            </span>
            <span className="font-mono-code text-[10px] text-slate-400 font-semibold">02 PARSE</span>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">AI Engine</span>
          </div>
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-slate-100 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
              <Icon name="shield" className="text-base" />
            </span>
            <span className="font-mono-code text-[10px] text-slate-400 font-semibold">03 REVEAL</span>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Clinical Truth</span>
          </div>
        </div>

        {/* Sample Item Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-xs font-label text-slate-500 mr-2 uppercase tracking-wider font-semibold">
            Select Sample Grocery Item:
          </span>
          {DEMO_PRODUCTS.map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => handleSelect(prod)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedProduct.id === prod.id
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500/50"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {prod.shortName}{" "}
              <span
                className={`ml-1 font-bold ${
                  prod.healthScore >= 80
                    ? "text-emerald-400"
                    : prod.healthScore >= 60
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                ({prod.healthScore}/100)
              </span>
            </button>
          ))}
        </div>

        {/* === MOBILE CARD VIEW (< md:hidden) — EXACT 1:1 STITCH mobile-landing.html === */}
        <div
          className={`block md:hidden bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col transition-opacity duration-200 ${
            isScanning ? "opacity-40" : "opacity-100"
          }`}
        >
          {/* Card Top Bar with EAN code */}
          <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono-code text-xs font-medium tracking-wide">LIVE CLINICAL AUDIT</span>
            </div>
            <span className="font-mono-code text-[10px] text-slate-400 tracking-wider">
              UPC: {selectedProduct.barcode}
            </span>
          </div>

          <div className="p-3.5 flex flex-col gap-3">
            {/* Product Name & Category */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-mono-code uppercase font-semibold">
                  {selectedProduct.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {selectedProduct.productName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedProduct.brand} • {selectedProduct.manufacturer}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                <Icon name="restaurant" className="text-slate-600 text-xl" />
              </div>
            </div>

            {/* Dual Major Warning Badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-xl p-2.5 flex flex-col ${getScoreBadgeClass(selectedProduct.healthScore)}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider font-label">Health Score</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-xl font-extrabold font-mono-code ${getScoreColorClass(selectedProduct.healthScore)}`}>
                    {selectedProduct.healthScore}
                  </span>
                  <span className="text-xs font-bold">
                    / 100 {selectedProduct.healthScore >= 80 ? "EXCELLENT" : selectedProduct.healthScore >= 60 ? "MODERATE" : "POOR"}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-2.5 flex flex-col justify-between ${getNovaColorClass(selectedProduct.novaGroup)}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider font-label text-slate-300">
                  NOVA System
                </span>
                <div className="text-[11px] font-extrabold leading-tight mt-0.5">
                  Group {selectedProduct.novaGroup} - {
                    selectedProduct.novaGroup === 4
                      ? "Ultra-Processed Food"
                      : selectedProduct.novaGroup === 3
                      ? "Processed Food"
                      : "Unprocessed / Minimal"
                  }
                </div>
              </div>
            </div>

            {/* Allergen Alert Callout */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded-r-lg flex items-start gap-2">
              <Icon name="warning" className="text-amber-600 text-base shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-snug">
                <strong className="font-semibold">Allergen Notice:</strong> {selectedProduct.allergens.join(", ")}.
              </div>
            </div>

            {/* High-Density Clinical Ingredient Rows */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1 font-label uppercase">
                <span>Detected Compound</span>
                <span>Rigor Assessment</span>
              </div>
              {selectedProduct.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                    ing.riskLevel === "high"
                      ? "bg-red-50/70 border-red-100"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex flex-col pr-2">
                    <span className="font-semibold text-slate-900">{ing.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono-code">
                      {ing.function} • {ing.evidence.slice(0, 42)}...
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getRiskBadge(ing.riskLevel)}`}>
                    {ing.riskLevel === "high" ? "High Risk" : ing.riskLevel === "moderate" ? "Moderate Risk" : "Low Risk"}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA App Action */}
            <Link
              href={siteConfig.scanUrl}
              onClick={handleScanClick}
              className="w-full mt-1 border border-slate-200 hover:border-slate-300 py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 bg-slate-50 active:scale-[0.99] transition-all"
            >
              <Icon name="qr_code_scanner" className="text-slate-600 text-base" />
              <span>Scan Your Own Food Product Now</span>
            </Link>
          </div>
        </div>

        {/* === DESKTOP CARD VIEW (hidden md:block) — EXACT 1:1 STITCH landing.html === */}
        <div
          className={`hidden md:block bg-white rounded-xl border border-zinc-300 shadow-lg overflow-hidden transition-opacity duration-200 ${
            isScanning ? "opacity-40" : "opacity-100"
          }`}
          id="results"
        >
          {/* Header Bar */}
          <div className="p-6 md:p-8 border-b border-zinc-200 bg-zinc-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-label text-zinc-500 mb-1">
                  <span>{selectedProduct.brand}</span>
                  <span>•</span>
                  <span>{selectedProduct.category}</span>
                  <span>•</span>
                  <span>UPC: {selectedProduct.barcode}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-950 tracking-tight font-headline">
                  {selectedProduct.productName}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-label uppercase text-zinc-500 tracking-wider">Health Score</div>
                  <div className={`text-5xl font-extrabold font-label leading-none ${getScoreColorClass(selectedProduct.healthScore)}`}>
                    {selectedProduct.healthScore}
                    <span className="text-base text-zinc-400 font-normal">/100</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-label uppercase tracking-wider ${
                    selectedProduct.healthScore >= 80
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : selectedProduct.healthScore >= 60
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}>
                    {selectedProduct.healthScore >= 80 ? "EXCELLENT" : selectedProduct.healthScore >= 60 ? "MODERATE" : "POOR"}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-label tracking-wide ${getNovaColorClass(selectedProduct.novaGroup)}`}>
                    NOVA {selectedProduct.novaGroup} ({
                      selectedProduct.novaGroup === 4
                        ? "Ultra-Processed"
                        : selectedProduct.novaGroup === 3
                        ? "Processed"
                        : "Unprocessed"
                    })
                  </span>
                </div>
              </div>
            </div>

            {/* Allergen & Health Warning Alert */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200 bg-white text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800">Allergen Notice:</span>
                <span className="text-zinc-600">{selectedProduct.allergens.join(", ")}</span>
              </div>
              {selectedProduct.healthScore < 50 && (
                <div className="flex items-center gap-1.5 font-semibold text-rose-600">
                  <Icon name="warning" className="text-sm" />
                  <span>High ultra-processing markers & additives detected</span>
                </div>
              )}
            </div>
          </div>

          {/* Transparent Algorithmic Deduction Breakdown */}
          <div className="p-6 md:p-8 border-b border-zinc-200 bg-zinc-50/20">
            <h4 className="text-xs font-label uppercase tracking-wider text-zinc-500 mb-4 font-semibold">
              Transparent Algorithmic Deduction Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedProduct.deductions.map((ded, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-zinc-200 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-800">{ded.category}</span>
                    <span className={`font-label text-sm font-bold ${
                      ded.points > 0 ? "text-zinc-900" : "text-rose-600"
                    }`}>
                      {ded.points > 0 ? `+${ded.points}` : `${ded.points}`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{ded.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Chemical & Nutrient Assessment Table */}
          <div className="overflow-x-auto">
            <div className="px-6 md:px-8 pt-6 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-label uppercase tracking-wider text-zinc-500 font-semibold">
                Detailed Chemical & Nutrient Assessment ({selectedProduct.ingredients.length} items)
              </h4>
              <span className="text-xs font-label text-zinc-400">Source: EFSA & PubMed Indexed</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 font-label text-xs uppercase text-zinc-500 font-semibold">Ingredient / Additive</th>
                  <th className="px-6 py-3 font-label text-xs uppercase text-zinc-500 font-semibold">Function in Formulation</th>
                  <th className="px-6 py-3 font-label text-xs uppercase text-zinc-500 font-semibold">Risk Level</th>
                  <th className="px-6 py-3 font-label text-xs uppercase text-zinc-500 font-semibold">Clinical Evidence & Studies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm">
                {selectedProduct.ingredients.map((ing, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{ing.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{ing.function}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold font-label uppercase ${
                        ing.riskLevel === "high"
                          ? "bg-rose-100 text-rose-800"
                          : ing.riskLevel === "moderate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ing.riskLevel === "high"
                            ? "bg-rose-500"
                            : ing.riskLevel === "moderate"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}></span>
                        {ing.riskLevel === "high" ? "High" : ing.riskLevel === "moderate" ? "Moderate" : "Low"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600">{ing.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scientifically-Ranked Healthier Alternatives */}
          <div className="bg-zinc-50 p-6 md:p-8 border-t border-zinc-200">
            <h4 className="text-xs font-label uppercase tracking-wider text-zinc-500 mb-4 font-semibold">
              Scientifically-Ranked Healthier Alternatives
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-label text-emerald-600 font-semibold uppercase">Clean Label Alternative</span>
                  <div className="font-bold text-zinc-900 text-sm">LesserEvil Organic Himalayan Popcorn</div>
                  <div className="text-xs text-zinc-500">NOVA 1 • No Synthetic Additives • Whole Grain</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-emerald-600 font-label">86</div>
                  <div className="text-[10px] text-zinc-400 font-label">SCORE</div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-label text-emerald-600 font-semibold uppercase">Organic Whole Noodle</span>
                  <div className="font-bold text-zinc-900 text-sm">Koyo Organic Garlic Pepper Ramen</div>
                  <div className="text-xs text-zinc-500">NOVA 2 • Baked not Fried • Zero MSG / TBHQ</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-emerald-600 font-label">74</div>
                  <div className="text-[10px] text-zinc-400 font-label">SCORE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
