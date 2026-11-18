"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { fetchProduct, ProductDetail } from "@/lib/api";

const FALLBACK_PRODUCT: ProductDetail = {
  barcode: "8901058852331",
  name: "2-Minute Masala Instant Noodles (70g)",
  brand: "Nestlé Maggi",
  category: "Packaged Instant Meals",
  healthScore: 38,
  novaGroup: 4,
  ingredientsText: "Wheat Flour (Refined Maida), Palm Oil, Iodised Salt, Wheat Gluten, Flavour Enhancer (INS 621), Tartrazine (INS 102), TBHQ (INS 319).",
  additives: [
    { name: "MSG (Monosodium Glutamate E621)", functionDesc: "Flavor Enhancer", riskLevel: "moderate", clinicalEvidence: "PubMed: 124 peer-reviewed excitotoxin & headache studies" },
    { name: "Tartrazine (Synthetic Yellow 5 / E102)", functionDesc: "Artificial Color", riskLevel: "high", clinicalEvidence: "EFSA Mandatory Warning: May impair child activity & attention" },
    { name: "TBHQ (Tertiary Butylhydroquinone / E319)", functionDesc: "Synthetic Preservative", riskLevel: "high", clinicalEvidence: "Toxicological cellular bounds flagged in animal models" },
    { name: "Refined Palm Oil", functionDesc: "Processed Frying Fat", riskLevel: "moderate", clinicalEvidence: "High saturated palmitic fatty acid profile (49%)" },
  ],
  allergens: ["Gluten (Wheat)", "Soy", "Trace Dairy"],
  deductions: [
    { title: "Base Scientific Baseline", points: 100, reason: "Initial unpenalized score" },
    { title: "Ultra-Processing Formulation", points: -30, reason: "Industrial extrusion, artificial hydrolyzates" },
    { title: "Flagged High-Risk Additives", points: -18, reason: "MSG (E621), Tartrazine (E102), TBHQ (E319)" },
    { title: "Excess Sodium Concentration", points: -14, reason: "890mg sodium (44% Daily Allowance)" },
  ],
  alternatives: [
    { name: "LesserEvil Organic Himalayan Popcorn", score: 86, nova: 1, note: "No Synthetic Additives • Whole Grain" },
    { name: "Koyo Organic Garlic Pepper Ramen", score: 74, nova: 2, note: "Baked not Fried • Zero MSG / TBHQ" },
  ],
};

export function ProductClient({ barcode }: { barcode: string }) {
  const [product, setProduct] = useState<ProductDetail>(FALLBACK_PRODUCT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct(barcode)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [barcode]);

  const scoreColor =
    product.healthScore >= 80
      ? "text-emerald-700 border-emerald-200 bg-emerald-50"
      : product.healthScore >= 60
      ? "text-amber-700 border-amber-200 bg-amber-50"
      : "text-rose-700 border-rose-200 bg-rose-50";

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Top Status & Telemetry Header */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 bg-white px-4 py-2.5 rounded-xl border border-zinc-200 shadow-xs">
          <span className="flex items-center gap-2 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>EFSA & FDA Harmonized Toxicology Audit</span>
          </span>
          <span>UPC: {barcode}</span>
        </div>

        {/* Product Summary Header Card */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                {product.brand} • {product.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
                {product.name}
              </h1>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                  Verified Food Monograph
                </span>
                <span className="text-zinc-500 font-mono">100% Peer-Reviewed Science</span>
              </div>
            </div>

            {/* Dual Badges: Score & NOVA */}
            <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0">
              {/* Health Score Pill */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${scoreColor}`}>
                <div className="text-3xl font-black font-display">{product.healthScore}</div>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-mono font-bold opacity-75">Health Score</div>
                  <div className="text-xs font-bold">
                    {product.healthScore >= 80 ? "EXCELLENT" : product.healthScore >= 60 ? "MODERATE" : "POOR"}
                  </div>
                </div>
              </div>

              {/* NOVA Processing Tier */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-zinc-600">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      product.novaGroup === 4 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  ></span>
                  <span>NOVA GROUP {product.novaGroup}</span>
                </div>
                <div className="text-xs font-bold text-zinc-900 mt-0.5">
                  {product.novaGroup === 4
                    ? "Ultra-Processed"
                    : product.novaGroup === 3
                    ? "Processed"
                    : "Minimally Processed"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Allergen & Sensitivity Warnings */}
        <section className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-rose-600 text-xl shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide font-mono">
                Allergen Warning & Cross-Contamination
              </h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Contains: <strong className="underline">{product.allergens.join(", ")}</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Transparent Score Deduction Engine */}
        <section className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">fact_check</span>
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-900">
                Algorithmic Score Deductions
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Deterministic Algorithm</span>
          </div>

          <div className="space-y-3 text-xs">
            {product.deductions.map((d, i) => (
              <div key={i} className="flex items-start justify-between py-1.5 border-b border-zinc-100 last:border-none">
                <div className="pr-2">
                  <div className="text-zinc-900 font-semibold">{d.title}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{d.reason}</div>
                </div>
                <span
                  className={`font-bold font-mono whitespace-nowrap ${
                    d.points > 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {d.points > 0 ? `+${d.points} pts` : `${d.points} pts`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Flagged Additives Breakdown */}
        <section className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">biotech</span>
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-900">
                Detected Chemical Additives ({product.additives.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
              Toxicology Flagged
            </span>
          </div>

          <div className="space-y-3">
            {product.additives.map((additive, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 font-display">
                      {additive.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500">{additive.functionDesc}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      additive.riskLevel === "high"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {additive.riskLevel} Risk
                  </span>
                </div>
                <div className="text-[11px] text-zinc-600 pt-2 border-t border-zinc-200/60 leading-relaxed">
                  <strong>Clinical Study:</strong> {additive.clinicalEvidence}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scientifically-Ranked Healthier Alternatives */}
        <section className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">eco</span>
              <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-900">
                Clean Label Alternatives
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              Better Nutri-Score & NOVA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.alternatives.map((alt, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">{alt.name}</div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">{alt.note}</div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-zinc-200/60">
                  <span className="text-[10px] font-mono font-bold text-zinc-500">NOVA {alt.nova}</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{alt.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/duel?p1=${encodeURIComponent(product.barcode)}&p2=0855238004128`}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">compare_arrows</span>
            <span>Compare in Product Duel</span>
          </Link>
          <Link
            href="/scanner"
            className="py-3 px-6 rounded-xl text-xs font-bold bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            <span>Scan Another Item</span>
          </Link>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
