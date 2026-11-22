"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchShoppingItems,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  ShoppingItem,
} from "@/lib/api";

export default function ShoppingListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Clean Produce");

  useEffect(() => {
    if (user?.id) loadItems();
  }, [user?.id]);

  const loadItems = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchShoppingItems(user.id);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, checked: i.checked === 1 ? 0 : 1 } : i)));
    try {
      await toggleShoppingItem(id);
    } catch {
      // Keep optimistic update
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !user) return;
    try {
      const created = await addShoppingItem({
        userId: user.id,
        productName: newItemName,
        category: newItemCategory,
      });
      setItems([created, ...items]);
      setNewItemName("");
    } catch {
      const local: ShoppingItem = {
        id: `s_${Date.now()}`,
        userId: user.id,
        productName: newItemName,
        category: newItemCategory,
        checked: 0,
        addedAt: new Date().toISOString(),
      };
      setItems([local, ...items]);
      setNewItemName("");
    }
  };

  const handleDelete = async (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    try {
      await deleteShoppingItem(id);
    } catch {
      // Keep optimistic
    }
  };

  const pendingItems = items.filter((i) => i.checked === 0);
  const completedItems = items.filter((i) => i.checked === 1);

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Smart Grocery Shopping List
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Scientifically vetted clean-label items & safe pantry replenishment
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold rounded-lg border border-emerald-200">
              {pendingItems.length} to buy • {completedItems.length} purchased
            </span>
          </div>
        </div>

        {/* Add item input bar */}
        <form
          onSubmit={handleAdd}
          className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              required
              placeholder="Add clean grocery item (e.g. Organic Rolled Oats)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-zinc-400 text-sm">
              add_shopping_cart
            </span>
          </div>

          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white"
          >
            <option value="Clean Produce">Clean Produce</option>
            <option value="Clean Dairy Alternative">Clean Dairy Alternative</option>
            <option value="Pantry Staples">Pantry Staples</option>
            <option value="Clean Snack">Clean Snack</option>
            <option value="Whole Grain Noodle">Whole Grain Noodle</option>
            <option value="Oils & Condiments">Oils & Condiments</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add Item</span>
          </button>
        </form>

        {/* Recommended Clean Swaps Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">eco</span>
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-emerald-950">AI Clean Swap Recommended</div>
            <p className="text-emerald-800 mt-0.5">
              Replace standard instant ramen with <strong>Koyo Organic Garlic Pepper Ramen</strong> (Baked, 0 TBHQ, 0 Synthetic Flavors).
            </p>
          </div>
          <Link
            href="/alternatives"
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
          >
            Browse Swaps
          </Link>
        </div>

        {/* To Buy Items List */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">Items to Buy ({pendingItems.length})</h3>
            <span className="text-[11px] text-zinc-400">Click item to mark purchased</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {pendingItems.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Your shopping list is clear! Add items above or import clean alternatives.
              </div>
            ) : (
              pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
                >
                  <div
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <span className="material-symbols-outlined text-zinc-300 group-hover:text-emerald-600 text-xl transition-colors">
                      check_box_outline_blank
                    </span>
                    <div>
                      <div className="font-semibold text-xs text-zinc-900">{item.productName}</div>
                      <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-mono mt-0.5">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-zinc-300 hover:text-rose-600 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden opacity-75">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-600">
                Purchased & Cataloged ({completedItems.length})
              </h3>
            </div>

            <div className="divide-y divide-zinc-100">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                  <div
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 line-through text-zinc-400"
                  >
                    <span className="material-symbols-outlined text-emerald-600 text-xl">
                      check_box
                    </span>
                    <div>
                      <div className="text-xs text-zinc-500">{item.productName}</div>
                      <span className="text-[10px] text-zinc-400 font-mono">{item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-zinc-300 hover:text-rose-600 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
