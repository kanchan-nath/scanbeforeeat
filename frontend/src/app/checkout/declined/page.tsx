"use client";

import React from "react";
import Link from "next/link";

export default function DeclinedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-4xl">cancel</span>
        </div>

        <div>
          <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-mono font-bold rounded-full uppercase">
            Transaction Declined
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-2 font-display">
            Payment Could Not Be Completed
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Your issuing bank declined the charge. No funds were deducted from your account.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-left space-y-1">
          <span className="font-bold text-rose-950 block">Possible reasons:</span>
          <ul className="list-disc list-inside text-rose-800 space-y-0.5 text-[11px]">
            <li>3D Secure authentication session timed out</li>
            <li>International e-commerce card limits not enabled</li>
            <li>Incorrect CVV or expiration date entered</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/checkout"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>Try Another Card</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
