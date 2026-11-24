"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchPantryItems, addPantryItem, deletePantryItem, PantryItem } from "@/lib/api";

export default function PantryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNova, setFilterNova] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New item modal form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Canned Pantry");
  const [newItemNova, setNewItemNova] = useState(1);
  const [newItemScore, setNewItemScore] = useState(85);
  const [newItemExpiry, setNewItemExpiry] = useState("2027-06-30");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPantry();
    }
  }, [user?.id]);

  const loadPantry = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchPantryItems(user.id);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !user) return;
    setSubmitting(true);
    try {
      const created = await addPantryItem({
        userId: user.id,
        productName: newItemName,
        category: newItemCategory,
        novaGroup: newItemNova,
        healthScore: newItemScore,
        expiryDate: newItemExpiry,
        quantity: newItemQuantity,
      });
      setItems([created, ...items]);
      setShowAddModal(false);
      setNewItemName("");
    } catch {
      // Offline fallback item creation
      const localItem: PantryItem = {
        id: `p_${Date.now()}`,
        userId: user.id,
        productName: newItemName,
        category: newItemCategory,
        novaGroup: newItemNova,
        healthScore: newItemScore,
        expiryDate: newItemExpiry,
        quantity: newItemQuantity,
        addedAt: new Date().toISOString(),
      };
      setItems([localItem, ...items]);
      setShowAddModal(false);
      setNewItemName("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePantryItem(id);
    } catch {
      // Ignore
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    const matchesNova = filterNova === "all" || item.novaGroup === filterNova;
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNova && matchesSearch;
  });

  const totalCount = items.length;
  const upfCount = items.filter((i) => i.novaGroup === 4).length;
  const cleanRatio = totalCount > 0 ? Math.round(((totalCount - upfCount) / totalCount) * 100) : 100;

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Digital Pantry Inventory
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Real-time stock catalog and additive risk monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add Pantry Item</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase">Total Stock</div>
              <div className="text-2xl font-black text-zinc-900 mt-0.5">{totalCount} Items</div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase">UPF Warning</div>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                {upfCount} {upfCount === 1 ? "Item" : "Items"} (NOVA 4)
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase">Clean Ratio</div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{cleanRatio}% Safe</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setFilterNova("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterNova === "all"
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setFilterNova(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterNova === 1
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              NOVA 1 (Clean)
            </button>
            <button
              onClick={() => setFilterNova(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterNova === 2
                  ? "bg-emerald-700 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              NOVA 2
            </button>
            <button
              onClick={() => setFilterNova(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterNova === 3
                  ? "bg-amber-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              NOVA 3
            </button>
            <button
              onClick={() => setFilterNova(4)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterNova === 4
                  ? "bg-rose-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              NOVA 4 (UPF)
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search pantry items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-zinc-400 text-sm">
              search
            </span>
          </div>
        </div>

        {/* Pantry Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500">
            <span className="material-symbols-outlined text-4xl text-zinc-300">kitchen</span>
            <p className="mt-2 text-sm font-semibold">No items match your filter</p>
            <button
              onClick={() => {
                setFilterNova("all");
                setSearchQuery("");
              }}
              className="mt-3 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-emerald-500/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-mono font-bold uppercase rounded">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.novaGroup === 1
                          ? "bg-emerald-100 text-emerald-800"
                          : item.novaGroup === 2
                          ? "bg-teal-100 text-teal-800"
                          : item.novaGroup === 3
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      NOVA {item.novaGroup}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 mt-2 font-display">
                    {item.productName}
                  </h3>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Quantity: {item.quantity} • Expiry: {item.expiryDate || "N/A"}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Health Score</span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        item.healthScore >= 80
                          ? "text-emerald-700"
                          : item.healthScore >= 60
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {item.healthScore} / 100
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                  <Link
                    href={`/duel?p1=${encodeURIComponent(item.productName)}`}
                    className="flex-1 py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg text-center transition-colors"
                  >
                    Compare
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Pantry Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900">Add Item to Pantry</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Extra Virgin Olive Oil"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Category</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                    >
                      <option value="Canned Pantry">Canned Pantry</option>
                      <option value="Beverages & Dairy">Beverages & Dairy</option>
                      <option value="Healthy Snacks">Healthy Snacks</option>
                      <option value="Instant Meals">Instant Meals</option>
                      <option value="Condiments & Oils">Condiments & Oils</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">NOVA Group</label>
                    <select
                      value={newItemNova}
                      onChange={(e) => setNewItemNova(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                    >
                      <option value={1}>NOVA 1 (Unprocessed)</option>
                      <option value={2}>NOVA 2 (Culinary)</option>
                      <option value={3}>NOVA 3 (Processed)</option>
                      <option value={4}>NOVA 4 (Ultra-Processed)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Health Score (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newItemScore}
                      onChange={(e) => setNewItemScore(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newItemExpiry}
                    onChange={(e) => setNewItemExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                  >
                    {submitting ? "Adding..." : "Save to Pantry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
