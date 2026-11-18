"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchScanHistory, getDataExportUrl } from "@/lib/api";

export default function HistoryPage() {
  const { user, loginDemo } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) loginDemo("monthly_pro");
  }, [user, loginDemo]);

  useEffect(() => {
    if (user?.id) {
      fetchScanHistory(user.id)
        .then((data) => setHistory(data))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const filtered = history.filter(
    (h) =>
      h.productName.toLowerCase().includes(search.toLowerCase()) ||
      h.barcode.includes(search)
  );

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Toxicological Audit History Log
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Immutable ledger of all food products, chemical additives, and risk ratings analyzed
            </p>
          </div>
          <button
            onClick={() => {
              const url = getDataExportUrl(user?.id || "demo-user-1", "csv");
              window.open(url, "_blank");
            }}
            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs font-bold rounded-xl hover:bg-zinc-50 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Audit Dossier</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Search history by food name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-zinc-400 text-sm">
              search
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Barcode</th>
                  <th className="px-6 py-3">Health Score</th>
                  <th className="px-6 py-3">NOVA Level</th>
                  <th className="px-6 py-3">Audit Date</th>
                  <th className="px-6 py-3 text-right">Monograph</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      No scan history found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900">{item.productName}</div>
                        <div className="text-[11px] text-zinc-500">{item.brand || "Packaged Grocery"}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-600">{item.barcode}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold ${
                            item.healthScore >= 80
                              ? "bg-emerald-50 text-emerald-800"
                              : item.healthScore >= 60
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {item.healthScore} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">
                        {item.scannedAt}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/product/${item.barcode}`}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-md transition-colors"
                        >
                          View Monograph
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
