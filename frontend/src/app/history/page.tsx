"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchScanHistory, getDataExportUrl } from "@/lib/api";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchScanHistory(user.id)
        .then((data) => setHistory(data))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const filtered = history.filter(
    (h) =>
      (h.productName && h.productName.toLowerCase().includes(search.toLowerCase())) ||
      (h.barcode && h.barcode.includes(search)) ||
      (h.brand && h.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const totalAudits = history.length;
  const avgHealthScore = totalAudits > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.healthScore || 0), 0) / totalAudits)
    : 0;
  const ultraProcessedCount = history.filter((h) => h.novaGroup === 4).length;
  const cleanBaselineCount = history.filter((h) => h.novaGroup === 1 || h.novaGroup === 2).length;

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Toxicological Audit History Log
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Live audit database of all scanned foods, chemical additives, and risk ratings persisted in Supabase
            </p>
          </div>
          <button
            onClick={() => {
              const url = getDataExportUrl(user?.id || "demo_pro", "csv");
              window.open(url, "_blank");
            }}
            className="px-4 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs font-bold rounded-xl hover:bg-zinc-50 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Audit Dossier</span>
          </button>
        </div>

        {/* Live Metrics Grid from Database */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total Scans</div>
            <div className="text-2xl font-black text-zinc-900 mt-1 font-mono">{totalAudits}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Persisted in Supabase</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Average Health Score</div>
            <div className="text-2xl font-black text-zinc-900 mt-1 font-mono flex items-baseline gap-1">
              <span>{avgHealthScore}</span>
              <span className="text-xs text-zinc-400 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Aggregated audit profile</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Ultra-Processed (NOVA 4)</div>
            <div className="text-2xl font-black text-rose-600 mt-1 font-mono">{ultraProcessedCount}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Formulations with additives</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Clean Label (NOVA 1-2)</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{cleanBaselineCount}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Whole / minimally processed</div>
          </div>
        </div>

        {/* Search bar & Live Filter Feedback */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search history by food name, brand, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-zinc-400 text-sm">
              search
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          {search && (
            <div className="text-xs text-zinc-500 flex items-center justify-between px-1">
              <span>
                Found <strong className="text-zinc-900 font-semibold">{filtered.length}</strong> matching item{filtered.length === 1 ? "" : "s"} out of <strong className="text-zinc-900 font-semibold">{totalAudits}</strong> total audits
              </span>
              <button
                onClick={() => setSearch("")}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-xs"
              >
                Reset filter
              </button>
            </div>
          )}
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-emerald-600">progress_activity</span>
                        <span>Retrieving audit records from Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      {search ? `No audit records matched "${search}".` : "No scan history found in your account."}
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
                          href={`/scanner?barcode=${encodeURIComponent(item.barcode)}`}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>View Monograph</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
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
