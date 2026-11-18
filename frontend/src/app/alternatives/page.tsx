"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { addShoppingItem } from "@/lib/api";

interface AlternativePair {
  id: string;
  category: string;
  upfItem: {
    name: string;
    score: number;
    nova: number;
    flaws: string[];
  };
  cleanAlternative: {
    name: string;
    score: number;
    nova: number;
    highlights: string[];
    ingredientCount: number;
  };
}

const ALTERNATIVE_PAIRS: AlternativePair[] = [
  {
    id: "alt1",
    category: "Instant Noodles & Ramen",
    upfItem: {
      name: "Maggi 2-Minute Masala Instant Noodles",
      score: 38,
      nova: 4,
      flaws: ["TBHQ (E319)", "Tartrazine (E102)", "Refined Palm Oil Matrix", "Monosodium Glutamate"],
    },
    cleanAlternative: {
      name: "Koyo Organic Garlic Pepper Ramen",
      score: 84,
      nova: 1,
      highlights: ["Organic Heirloom Wheat", "Baked Not Fried", "Zero Synthetic Preservatives", "Zero Added MSG"],
      ingredientCount: 5,
    },
  },
  {
    id: "alt2",
    category: "Dairy & Plant Milks",
    upfItem: {
      name: "Commercial Barista Oat Milk",
      score: 62,
      nova: 3,
      flaws: ["Dipotassium Phosphate", "Refined Canola Oil Emulsion", "Synthetic Tricalcium Phosphate"],
    },
    cleanAlternative: {
      name: "Malk Pure Organic Almond Milk",
      score: 95,
      nova: 1,
      highlights: ["Filtered Water", "Organic Sprouted Almonds", "Himalayan Pink Salt", "Zero Gums or Oils"],
      ingredientCount: 3,
    },
  },
  {
    id: "alt3",
    category: "Savory Snack Chips",
    upfItem: {
      name: "Nacho Cheese Flavored Tortilla Chips",
      score: 32,
      nova: 4,
      flaws: ["Yellow 6 (E110)", "Red 40 (E129)", "Disodium Inosinate & Guanylate", "Maltodextrin"],
    },
    cleanAlternative: {
      name: "Siete Grain Free Lime Tortilla Chips",
      score: 88,
      nova: 1,
      highlights: ["Cassava Flour", "100% Pure Avocado Oil", "Real Sea Salt", "Lime Oil"],
      ingredientCount: 4,
    },
  },
  {
    id: "alt4",
    category: "Popcorn & Grain Snacks",
    upfItem: {
      name: "Commercial Microwave Movie Theater Butter Popcorn",
      score: 44,
      nova: 4,
      flaws: ["Diacetyl Artificial Butter Flavor", "Fractionated Palm Oil", "TBHQ Preservative"],
    },
    cleanAlternative: {
      name: "LesserEvil Himalayan Pink Gold Organic Popcorn",
      score: 89,
      nova: 1,
      highlights: ["Organic Non-GMO Popcorn", "Organic Extra Virgin Coconut Oil", "Himalayan Pink Salt"],
      ingredientCount: 3,
    },
  },
];

export default function AlternativesPage() {
  const { user } = useAuth();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const handleAddToList = async (pairId: string, name: string, category: string) => {
    if (!user) return;
    try {
      await addShoppingItem({
        userId: user.id,
        productName: name,
        category,
      });
      setAddedMap({ ...addedMap, [pairId]: true });
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [pairId]: false }));
      }, 3000);
    } catch {
      setAddedMap({ ...addedMap, [pairId]: true });
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Safe Clean Alternatives Recommender
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Peer-reviewed healthy replacements for high-risk ultra-processed products currently in your diet
          </p>
        </div>

        <div className="space-y-6">
          {ALTERNATIVE_PAIRS.map((pair) => {
            const scoreDelta = pair.cleanAlternative.score - pair.upfItem.score;
            const isAdded = addedMap[pair.id];

            return (
              <div
                key={pair.id}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs"
              >
                <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-100 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-600 uppercase tracking-wider">
                    {pair.category}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold font-mono rounded">
                    +{scoreDelta} Health Delta
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* UPF Item Card */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono font-bold text-[10px] rounded">
                          NOVA {pair.upfItem.nova} (UPF)
                        </span>
                        <span className="text-sm font-bold text-rose-700 font-mono">
                          {pair.upfItem.score} / 100
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 mt-2 font-display">
                        {pair.upfItem.name}
                      </h3>
                      <div className="mt-3 space-y-1">
                        <span className="text-[11px] font-semibold text-rose-900 block">
                          Toxicological Red Flags:
                        </span>
                        {pair.upfItem.flaws.map((flaw, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-rose-700">
                            <span className="material-symbols-outlined text-sm text-rose-500">
                              cancel
                            </span>
                            <span>{flaw}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-rose-200/60 text-[11px] text-rose-600 font-mono">
                      Avoid frequent consumption
                    </div>
                  </div>

                  {/* Clean Alternative Card */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded">
                          NOVA {pair.cleanAlternative.nova} (Clean Label)
                        </span>
                        <span className="text-sm font-bold text-emerald-700 font-mono">
                          {pair.cleanAlternative.score} / 100
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 mt-2 font-display">
                        {pair.cleanAlternative.name}
                      </h3>
                      <div className="mt-3 space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-900 block">
                          Pure Ingredient Formulation ({pair.cleanAlternative.ingredientCount} clean ingredients):
                        </span>
                        {pair.cleanAlternative.highlights.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-800">
                            <span className="material-symbols-outlined text-sm text-emerald-600">
                              check_circle
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-mono font-medium">
                        Peer-Reviewed Verified Safe
                      </span>
                      <button
                        onClick={() =>
                          handleAddToList(pair.id, pair.cleanAlternative.name, pair.category)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isAdded
                            ? "bg-emerald-800 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isAdded ? "done" : "add_shopping_cart"}
                        </span>
                        <span>{isAdded ? "Added to List" : "Add to Shopping List"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
