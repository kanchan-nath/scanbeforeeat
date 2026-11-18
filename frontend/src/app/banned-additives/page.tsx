"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import {
  fetchBannedAdditives,
  addBannedAdditive,
  deleteBannedAdditive,
  BannedAdditive,
} from "@/lib/api";

export default function BannedAdditivesPage() {
  const { user, loginDemo } = useAuth();
  const [bannedList, setBannedList] = useState<BannedAdditive[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) loginDemo("monthly_pro");
  }, [user, loginDemo]);

  useEffect(() => {
    if (user?.id) loadList();
  }, [user?.id]);

  const loadList = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchBannedAdditives(user.id);
      setBannedList(data);
    } catch {
      setBannedList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !user) return;
    setSubmitting(true);
    try {
      const created = await addBannedAdditive({
        userId: user.id,
        code,
        name,
        reason: reason || "Personal chemical exclusion",
      });
      setBannedList([
        {
          id: `b_${Date.now()}`,
          userId: user.id,
          code,
          name,
          reason,
          createdAt: new Date().toISOString(),
        },
        ...bannedList,
      ]);
      setCode("");
      setName("");
      setReason("");
    } catch {
      setBannedList([
        {
          id: `b_${Date.now()}`,
          userId: user.id,
          code,
          name,
          reason,
          createdAt: new Date().toISOString(),
        },
        ...bannedList,
      ]);
      setCode("");
      setName("");
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBannedList(bannedList.filter((b) => b.id !== id));
    try {
      await deleteBannedAdditive(id);
    } catch {
      // Optimistic
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Custom Banned Additives Engine
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Build your personal blacklist of chemicals, E-numbers, and synthetic colorants
          </p>
        </div>

        {/* Add Banned Additive Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3"
        >
          <h3 className="font-bold text-sm text-zinc-900">Blacklist New Food Chemical</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">E-Number / Code</label>
              <input
                type="text"
                required
                placeholder="e.g. E951 or BHA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Chemical Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aspartame"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Scientific Exclusion Reason</label>
              <input
                type="text"
                placeholder="e.g. IARC Group 2B classification"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">block</span>
              <span>Blacklist Chemical</span>
            </button>
          </div>
        </form>

        {/* Current Blacklist */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              Active Blacklisted Additives ({bannedList.length})
            </h3>
            <span className="text-[11px] text-zinc-400">Enforced across all scan modes</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {bannedList.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No custom banned additives added yet.
              </div>
            ) : (
              bannedList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-1 bg-rose-100 text-rose-800 font-mono font-bold text-xs rounded">
                      {item.code}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-zinc-900">{item.name}</div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{item.reason}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-zinc-300 hover:text-rose-600 rounded transition-colors"
                    title="Remove from blacklist"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
