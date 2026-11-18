"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { performDuel, DuelResponse } from "@/lib/api";

const PRESET_OPTIONS = [
  { barcode: "8901058852331", label: "Maggi 2-Min Noodles (Score: 38)" },
  { barcode: "0855238004128", label: "LesserEvil Popcorn (Score: 86)" },
  { barcode: "7321461144417", label: "Oatly Barista Oat Milk (Score: 72)" },
  { barcode: "028400064088", label: "Doritos Nacho Cheese (Score: 32)" },
];

function DuelContent() {
  const searchParams = useSearchParams();
  const initialP1 = searchParams.get("p1") || "8901058852331";
  const initialP2 = searchParams.get("p2") || "0855238004128";

  const [p1Code, setP1Code] = useState(initialP1);
  const [p2Code, setP2Code] = useState(initialP2);
  const [duelData, setDuelData] = useState<DuelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    performDuel(p1Code, p2Code)
      .then((res) => {
        setDuelData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [p1Code, p2Code]);

  const p1 = duelData?.product1;
  const p2 = duelData?.product2;
  const winner = duelData?.winner;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
          Side-by-Side Product Duel
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 mt-1">
          Compare 2 grocery items against European EFSA toxicological bounds and NOVA 1-4 processing tiers
        </p>
      </div>

      {/* Selectors for Both Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <label className="block text-zinc-700 text-xs font-bold mb-2">Item 1 (Baseline)</label>
          <select
            value={p1Code}
            onChange={(e) => setP1Code(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 bg-white"
          >
            {PRESET_OPTIONS.map((p) => (
              <option key={p.barcode} value={p.barcode}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <label className="block text-zinc-700 text-xs font-bold mb-2">Item 2 (Challenger)</label>
          <select
            value={p2Code}
            onChange={(e) => setP2Code(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 bg-white"
          >
            {PRESET_OPTIONS.map((p) => (
              <option key={p.barcode} value={p.barcode}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-xs">
          Calculating nutritional & chemical divergence delta...
        </div>
      ) : (
        p1 &&
        p2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product 1 Card */}
              <div
                className={`bg-white rounded-xl p-6 border shadow-xs relative flex flex-col justify-between ${
                  winner === "product1" ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-zinc-200"
                }`}
              >
                {winner === "product1" && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded-full uppercase">
                    WINNER (Superior Profile)
                  </span>
                )}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-mono font-bold">
                      NOVA {p1.novaGroup}
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900">
                      {p1.healthScore} / 100
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mt-3">{p1.name}</h3>
                  <div className="text-xs text-zinc-500">{p1.brand}</div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Flagged Additives</span>
                    <span className="font-bold text-zinc-800">{p1.additives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Allergens</span>
                    <span className="font-bold text-zinc-800 truncate max-w-[150px]">
                      {p1.allergens.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product 2 Card */}
              <div
                className={`bg-white rounded-xl p-6 border shadow-xs relative flex flex-col justify-between ${
                  winner === "product2" ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-zinc-200"
                }`}
              >
                {winner === "product2" && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded-full uppercase">
                    WINNER (Superior Profile)
                  </span>
                )}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-mono font-bold">
                      NOVA {p2.novaGroup}
                    </span>
                    <span className="text-2xl font-black font-mono text-zinc-900">
                      {p2.healthScore} / 100
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mt-3">{p2.name}</h3>
                  <div className="text-xs text-zinc-500">{p2.brand}</div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Flagged Additives</span>
                    <span className="font-bold text-zinc-800">{p2.additives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Allergens</span>
                    <span className="font-bold text-zinc-800 truncate max-w-[150px]">
                      {p2.allergens.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-700 text-2xl shrink-0">
                verified
              </span>
              <div className="text-xs">
                <div className="font-bold text-emerald-950 uppercase font-mono tracking-wider">
                  Delta Verdict: +{duelData?.scoreDelta} Point Difference
                </div>
                <div className="text-emerald-800 mt-0.5">{duelData?.verdict}</div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function DuelPage() {
  return (
    <AuthenticatedShell>
      <Suspense
        fallback={
          <div className="p-12 text-center text-zinc-400 text-xs font-mono">
            Loading duel engine...
          </div>
        }
      >
        <DuelContent />
      </Suspense>
    </AuthenticatedShell>
  );
}
