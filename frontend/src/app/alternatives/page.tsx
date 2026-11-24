"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserAlternatives,
  fetchShoppingItems,
  addShoppingItem,
  AlternativePair,
  ShoppingItem,
} from "@/lib/api";

export default function AlternativesPage() {
  const { user } = useAuth();
  const [pairs, setPairs] = useState<AlternativePair[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [altData, shopData] = await Promise.all([
        fetchUserAlternatives(user.id).catch(() => []),
        fetchShoppingItems(user.id).catch(() => []),
      ]);
      setPairs(altData);
      setShoppingItems(shopData);
    } catch (err) {
      console.error("Failed loading clean alternatives:", err);
    } finally {
      setLoading(false);
    }
  };

  const isItemInShoppingList = (cleanName: string) => {
    if (!cleanName) return false;
    const target = cleanName.trim().toLowerCase();
    return shoppingItems.some(
      (item) => item.productName && item.productName.trim().toLowerCase() === target
    );
  };

  const handleAddToList = async (pairId: string, name: string, category: string) => {
    if (!user?.id || isItemInShoppingList(name)) return;
    setAddingId(pairId);
    try {
      const created = await addShoppingItem({
        userId: user.id,
        productName: name,
        category,
      });
      setShoppingItems((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to add clean alternative to shopping list:", err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Safe Clean Alternatives Recommender
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Peer-reviewed healthy replacements dynamically synthesized from your scanned food audits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/shopping-list"
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">shopping_cart</span>
              <span>View Shopping List ({shoppingItems.length})</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-emerald-600">sync</span>
            <span>Synthesizing clean-label alternatives from your scan history...</span>
          </div>
        ) : pairs.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 md:p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="font-bold text-lg text-zinc-900 font-display">
              No Ultra-Processed Food Scans Yet
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 mt-2 leading-relaxed">
              Clean alternatives are dynamically personalized based on the packaged foods you scan. Scan items with the Live Scanner to automatically discover scientifically vetted, clean-label swaps.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/scanner"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">barcode_scanner</span>
                <span>Open Live Scanner</span>
              </Link>
              <Link
                href="/batch-queue"
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">layers</span>
                <span>Run Batch Queue (CDM)</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {pairs.map((pair) => {
              const scoreDelta = pair.cleanAlternative.score - pair.upfItem.score;
              const isAdded = isItemInShoppingList(pair.cleanAlternative.name);

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
                        Avoid frequent consumption • UPF Formulation
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

                      <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] text-emerald-700 font-mono font-medium">
                          Peer-Reviewed Verified Safe
                        </span>

                        {isAdded ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white flex items-center gap-1 shadow-xs">
                              <span className="material-symbols-outlined text-sm">done</span>
                              <span>Added to List</span>
                            </span>
                            <Link
                              href="/shopping-list"
                              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium underline flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleAddToList(pair.id, pair.cleanAlternative.name, pair.category)
                            }
                            disabled={addingId === pair.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {addingId === pair.id ? "sync" : "add_shopping_cart"}
                            </span>
                            <span>{addingId === pair.id ? "Adding..." : "Add to Shopping List"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}