"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { performDuel, fetchScanHistory, fetchPantryItems, DuelResponse } from "@/lib/api";

interface ProductOption {
  barcode: string;
  label: string;
  source: string;
}

function DuelContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const queryP1 = searchParams.get("p1") || "";
  const queryP2 = searchParams.get("p2") || "";

  const [p1Code, setP1Code] = useState(queryP1);
  const [p2Code, setP2Code] = useState(queryP2);
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
  const [duelData, setDuelData] = useState<DuelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load user's real scan history and pantry items dynamically
  useEffect(() => {
    if (!user?.id) return;

    Promise.allSettled([
      fetchScanHistory(user.id),
      fetchPantryItems(user.id),
    ]).then(([historyRes, pantryRes]) => {
      const options: ProductOption[] = [];
      const seenBarcodes = new Set<string>();

      if (historyRes.status === "fulfilled" && Array.isArray(historyRes.value)) {
        for (const item of historyRes.value) {
          if (item.barcode && !seenBarcodes.has(item.barcode)) {
            seenBarcodes.add(item.barcode);
            options.push({
              barcode: item.barcode,
              label: `${item.productName || "Scanned Item"} (${item.barcode}) - Score: ${item.healthScore || 0}`,
              source: "Scan History",
            });
          }
        }
      }

      if (pantryRes.status === "fulfilled" && Array.isArray(pantryRes.value)) {
        for (const item of pantryRes.value) {
          // If pantry item has barcode or id
          const bCode = item.id.replace(/^p_/, "");
          if (!seenBarcodes.has(bCode)) {
            seenBarcodes.add(bCode);
            options.push({
              barcode: bCode,
              label: `${item.productName} (Pantry) - Score: ${item.healthScore || 0}`,
              source: "Pantry",
            });
          }
        }
      }

      setAvailableProducts(options);

      // If no query params provided, pick first two available if present
      if (!queryP1 && options.length > 0) {
        setP1Code(options[0].barcode);
      }
      if (!queryP2 && options.length > 1) {
        setP2Code(options[1].barcode);
      }
    });
  }, [user?.id, queryP1, queryP2]);

  // Execute duel when both barcodes are ready
  const executeDuel = async (code1: string, code2: string) => {
    const clean1 = code1.trim();
    const clean2 = code2.trim();
    if (!clean1 || !clean2) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await performDuel(clean1, clean2);
      setDuelData(res);
    } catch {
      setErrorMsg("Failed to duel the two products. Please check the barcodes and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (p1Code && p2Code) {
      executeDuel(p1Code, p2Code);
    }
  }, [p1Code, p2Code]);

  const p1 = duelData?.product1;
  const p2 = duelData?.product2;
  const winner = duelData?.winner;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Side-by-Side Product Duel
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Compare 2 grocery items against European EFSA toxicological bounds and NOVA 1-4 processing tiers
          </p>
        </div>
        <Link
          href="/scanner"
          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
          <span>Scan New Item</span>
        </Link>
      </div>

      {/* Selectors for Both Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item 1 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <label className="block text-zinc-900 text-xs font-bold uppercase tracking-wider font-mono">
            Item 1 (Baseline)
          </label>

          {availableProducts.length > 0 && (
            <div>
              <span className="text-[11px] text-zinc-500 block mb-1">Select from your scanned products:</span>
              <select
                value={p1Code}
                onChange={(e) => setP1Code(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="">-- Choose from your scan history --</option>
                {availableProducts.map((p) => (
                  <option key={`p1_${p.barcode}`} value={p.barcode}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <span className="text-[11px] text-zinc-500 block mb-1">Or enter any UPC barcode:</span>
            <input
              type="text"
              value={p1Code}
              onChange={(e) => setP1Code(e.target.value)}
              placeholder="Enter barcode for Item 1 (e.g. 8901058852331)"
              className="w-full px-3 py-2 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <label className="block text-zinc-900 text-xs font-bold uppercase tracking-wider font-mono">
            Item 2 (Challenger)
          </label>

          {availableProducts.length > 0 && (
            <div>
              <span className="text-[11px] text-zinc-500 block mb-1">Select from your scanned products:</span>
              <select
                value={p2Code}
                onChange={(e) => setP2Code(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="">-- Choose from your scan history --</option>
                {availableProducts.map((p) => (
                  <option key={`p2_${p.barcode}`} value={p.barcode}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <span className="text-[11px] text-zinc-500 block mb-1">Or enter any UPC barcode:</span>
            <input
              type="text"
              value={p2Code}
              onChange={(e) => setP2Code(e.target.value)}
              placeholder="Enter barcode for Item 2 (e.g. 0855238004128)"
              className="w-full px-3 py-2 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => executeDuel(p1Code, p2Code)}
          disabled={!p1Code.trim() || !p2Code.trim() || loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">
            {loading ? "sync" : "compare_arrows"}
          </span>
          <span>{loading ? "Calculating Duel..." : "Compare Products"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium text-center">
          {errorMsg}
        </div>
      )}

      {/* Comparison Cards */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-xs font-mono">
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
                      {p1.allergens.length > 0 ? p1.allergens.join(", ") : "None declared"}
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
                      {p2.allergens.length > 0 ? p2.allergens.join(", ") : "None declared"}
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
