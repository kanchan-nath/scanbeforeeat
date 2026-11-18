"use client";

import React from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";

export default function QuotaExceededPage() {
  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-xl mx-auto w-full my-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-4xl">speed</span>
        </div>

        <div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded-full uppercase">
            Rate Limit 429 • Quota Reached
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-2 font-display">
            Monthly Scan Quota Exceeded
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            You have used all 15 free scans allocated for this billing cycle. Upgrade to Monthly or Annual Pro to unlock 99 high-frequency supermarket scans.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 text-left text-xs space-y-3 shadow-xs">
          <div className="flex justify-between font-semibold text-zinc-800 border-b border-zinc-100 pb-2">
            <span>Current Plan</span>
            <span className="font-mono text-zinc-500">Free Trial (15/15 Used)</span>
          </div>
          <div className="flex justify-between font-semibold text-zinc-800 border-b border-zinc-100 pb-2">
            <span>Next Automatic Free Reset</span>
            <span className="font-mono text-zinc-500">12 Days</span>
          </div>
          <div className="flex justify-between font-semibold text-zinc-800">
            <span>Instant Pro Upgrade</span>
            <span className="font-mono text-emerald-700 font-bold">99 Scans Instantly</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pricing"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">upgrade</span>
            <span>Upgrade to Pro Plan</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
