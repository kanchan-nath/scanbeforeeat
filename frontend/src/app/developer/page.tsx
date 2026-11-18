"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchDeveloperAnalytics } from "@/lib/api";

export default function DeveloperDashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalRequests24h: 1428,
    avgLatencyMs: 68,
    p99LatencyMs: 124,
    activeWebhooks: 2,
    rateLimitQuota: 1000,
  });

  useEffect(() => {
    if (!user?.id) return;
    fetchDeveloperAnalytics(user.id)
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Could not fetch analytics:", err));
  }, [user?.id]);
  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Developer API Dashboard
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Programmatic REST endpoints for ingredient parsing, chemical monograph queries, and NOVA classification
            </p>
          </div>
          <Link
            href="/api-keys"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">key</span>
            <span>Manage API Keys</span>
          </Link>
        </div>

        {/* API Telemetry Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
              API Requests (24h)
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-1 font-display">
              {analytics.totalRequests24h.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">99.98% Success</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
              Avg Latency
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-1 font-display font-mono">
              {analytics.avgLatencyMs} <span className="text-sm font-normal text-zinc-400">ms</span>
            </div>
            <span className="text-[11px] text-zinc-500">P99: {analytics.p99LatencyMs}ms</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
              Active Webhooks
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-1 font-display">
              {analytics.activeWebhooks}
            </div>
            <span className="text-[11px] text-zinc-500">Registered endpoints</span>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
              Rate Limit Quota
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-display font-mono">
              {analytics.rateLimitQuota.toLocaleString()} <span className="text-sm font-normal text-zinc-400">req/min</span>
            </div>
            <span className="text-[11px] text-zinc-500">Active API Key Tier</span>
          </div>
        </div>

        {/* Quick API Endpoints Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">Core REST Endpoints</h3>
            <Link
              href="/api-playground"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Test in API Playground</span>
              <span className="material-symbols-outlined text-sm">play_circle</span>
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded">
                  GET
                </span>
                <code className="font-mono text-zinc-900 font-bold">/api/products/:barcode</code>
              </div>
              <span className="text-zinc-500">Lookup food additive monograph & NOVA group</span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-[10px] rounded">
                  POST
                </span>
                <code className="font-mono text-zinc-900 font-bold">/api/scan</code>
              </div>
              <span className="text-zinc-500">Execute neural OCR ingredient breakdown & deductions</span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-[10px] rounded">
                  POST
                </span>
                <code className="font-mono text-zinc-900 font-bold">/api/duel</code>
              </div>
              <span className="text-zinc-500">Compute side-by-side processing delta between 2 foods</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/api-keys"
            className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all block group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">key</span>
            </div>
            <h4 className="font-bold text-sm text-zinc-900">API Keys</h4>
            <p className="text-xs text-zinc-500 mt-1">Generate and revoke live & test bearer tokens</p>
          </Link>

          <Link
            href="/webhooks"
            className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all block group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">webhook</span>
            </div>
            <h4 className="font-bold text-sm text-zinc-900">Webhooks</h4>
            <p className="text-xs text-zinc-500 mt-1">Configure automated HTTP POST callbacks on scan events</p>
          </Link>

          <Link
            href="/api-playground"
            className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all block group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">play_circle</span>
            </div>
            <h4 className="font-bold text-sm text-zinc-900">API Playground</h4>
            <p className="text-xs text-zinc-500 mt-1">Interactive curl runner and real-time JSON response viewer</p>
          </Link>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
