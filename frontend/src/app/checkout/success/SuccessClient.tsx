"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "annual_pro";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>

        <div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full uppercase">
            Payment Confirmed
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-2 font-display">
            Pro Toxicology Activated!
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Your account has been upgraded. 99 scans and chemical synergy alerts are now live across all your devices.
          </p>
        </div>

        <div className="bg-zinc-50 rounded-xl p-4 text-xs space-y-2 border border-zinc-100 text-left">
          <div className="flex justify-between">
            <span className="text-zinc-500">Tier</span>
            <span className="font-bold text-zinc-800 uppercase font-mono">{plan.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Scan Allowance</span>
            <span className="font-mono font-bold text-emerald-700">99 Neural Scans / Month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Transaction ID</span>
            <span className="font-mono text-zinc-600">tx_{Date.now().toString(36)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/scanner"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">qr_code_scanner</span>
              <span>Start Scanning</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center"
            >
              Open Dashboard
            </Link>
          </div>

          <Link
            href="/invoices"
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            <span>View & Download GST Tax Invoices</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
