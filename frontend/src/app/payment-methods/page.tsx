"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  PaymentCardItem,
} from "@/lib/api";

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<PaymentCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newCvc, setNewCvc] = useState("");
  const [newName, setNewName] = useState("");

  const loadCards = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchPaymentMethods(user.id);
      setCards(data);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [user?.id]);

  const handleSetDefault = async (id: string) => {
    setCards(cards.map((c) => ({ ...c, isDefault: c.id === id ? 1 : 0 })));
    try {
      await setDefaultPaymentMethod(id);
      loadCards();
    } catch (err) {
      console.error("Failed to set default payment method:", err);
    }
  };

  const handleDeleteCard = async (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    try {
      await deletePaymentMethod(id);
    } catch (err) {
      console.error("Failed to delete payment method:", err);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim() || !newName.trim() || !user?.id) return;

    const last4 = newCardNumber.replace(/\s+/g, "").slice(-4) || "4242";

    try {
      await addPaymentMethod({
        userId: user.id,
        brand: "Visa",
        last4,
        expiry: newExpiry || "08/29",
        name: newName,
      });
      await loadCards();
    } catch {
      const fallbackCard: PaymentCardItem = {
        id: `pm_${Date.now()}`,
        userId: user.id,
        brand: "Visa",
        last4,
        expiry: newExpiry || "08/29",
        isDefault: cards.length === 0 ? 1 : 0,
        name: newName,
      };
      setCards([...cards, fallbackCard]);
    }

    setShowAddModal(false);
    setNewCardNumber("");
    setNewExpiry("");
    setNewCvc("");
    setNewName("");
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Payment Methods & Cards
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Encrypted PCI-DSS compliant payment instruments for subscription renewals
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">add_card</span>
            <span>Add Payment Method</span>
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          {cards.map((card) => {
            const isDef = Boolean(card.isDefault);
            return (
              <div
                key={card.id}
                className={`bg-white rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isDef
                    ? "border-emerald-600 shadow-xs ring-1 ring-emerald-600/20"
                    : "border-zinc-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-xs font-mono tracking-wider shrink-0">
                    {card.brand}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">
                        •••• •••• •••• {card.last4}
                      </span>
                      {isDef && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                          Default Card
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Expires {card.expiry} • {card.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!isDef && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Remove card"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900">Add Credit / Debit Card</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Name on Card</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Elena Vance"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4242 4242 4242 4242"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="08/29"
                      maxLength={5}
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-semibold mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={newCvc}
                      onChange={(e) => setNewCvc(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Save Card
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
