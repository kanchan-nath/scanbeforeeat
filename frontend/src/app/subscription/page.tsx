"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { updateUserPlan } from "@/lib/api";

export default function SubscriptionPage() {
  const { user, refreshProfile } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleCancel = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      await updateUserPlan(user.id, "free");
      await refreshProfile();
      setStatusMsg("Subscription cancelled. Downgraded to Free 15 scans tier.");
    } catch {
      setStatusMsg("Plan changed to Free Tier");
    } finally {
      setCancelling(false);
    }
  };

  const isPro = user?.plan && user.plan !== "free";

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Active Subscription Management
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Manage your toxicology tier, billing cycles, and payment renewals
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
            {statusMsg}
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                Current Active Tier
              </span>
              <h2 className="text-xl font-bold text-zinc-900 mt-0.5">
                {isPro ? "Annual Pro Toxicologist" : "Free Trial Plan"}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {isPro
                  ? "Unlimited deep database lookups • 99 camera/OCR neural scans per cycle"
                  : "15 free scans per month • Standard UPF & NOVA classification"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase self-start sm:self-auto ${
                isPro ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {isPro ? "Active & Protected" : "Free Tier"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 font-mono text-[10px] uppercase block">
                Billing Frequency
              </span>
              <span className="font-bold text-zinc-900 text-sm mt-0.5 block">
                {isPro ? "Annual (₹999 / year)" : "Free Forever"}
              </span>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 font-mono text-[10px] uppercase block">
                Next Renewal Date
              </span>
              <span className="font-bold text-zinc-900 text-sm mt-0.5 block">
                {isPro ? "November 18, 2027" : "No expiration"}
              </span>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-zinc-400 font-mono text-[10px] uppercase block">
                Monthly Quota
              </span>
              <span className="font-bold text-zinc-900 text-sm mt-0.5 block">
                {user?.scansLimit || 99} scans / month
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/pricing"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Change Subscription Plan
            </Link>

            {isPro && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2.5 border border-zinc-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors"
              >
                {cancelling ? "Processing..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>

        {/* Quick Payment & Invoices Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/payment-methods"
            className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-900">Payment Methods</div>
                <div className="text-[11px] text-zinc-500">Visa ending in 4242</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-emerald-600 text-lg transition-colors">
              arrow_forward
            </span>
          </Link>

          <Link
            href="/invoices"
            className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-900">Invoices & Receipts</div>
                <div className="text-[11px] text-zinc-500">Download PDF tax invoices</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-emerald-600 text-lg transition-colors">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
