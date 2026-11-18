"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { updateUserPlan } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";

const PLANS = [
  {
    id: "free",
    name: "Free Plan",
    price: "₹0",
    period: "forever",
    description: "Essential label checking for casual shoppers wanting instant ingredient clarity.",
    scans: "15 free scans per month",
    features: [
      "15 free scans per month",
      "Camera barcode & OCR packaging parser",
      "Full E-Number & additive lookup",
      "Standard NOVA 1-4 processing score",
      "Allergen warning flags",
    ],
    cta: "Current Free Tier",
    current: true,
  },
  {
    id: "monthly_pro",
    name: "Monthly Pro",
    price: "₹199",
    period: "month",
    description: "For individuals who grocery shop weekly and demand deep toxicology insights.",
    scans: "99 scans included",
    features: [
      "99 scans per month",
      "Chemical cocktail & synergy alerts",
      "Full PubMed & EFSA research citations",
      "Side-by-side product duel comparison",
      "Priority AI analysis response time",
      "Custom banned additives engine",
    ],
    cta: "Get Monthly Pro",
    popular: false,
  },
  {
    id: "six_month_saver",
    name: "6-Month Saver",
    price: "₹499",
    period: "6 months",
    equivalent: "₹83 / month equivalent",
    description: "Half-year protection for health-conscious families wanting steady coverage.",
    scans: "99 scans included",
    badge: "Save 58%",
    features: [
      "99 scans included",
      "All Monthly Pro features",
      "Multi-device scan synchronization",
      "Extended scan history & audit log",
      "Priority AI analysis queue",
    ],
    cta: "Get 6-Month Plan",
    popular: false,
  },
  {
    id: "annual_pro",
    name: "Annual Pro",
    price: "₹999",
    period: "year",
    equivalent: "₹83 / month equivalent",
    description: "Full 365-day nutrition transparency for households serious about clean eating.",
    scans: "99 scans included",
    badge: "BEST VALUE • SAVE 58%",
    features: [
      "99 scans included",
      "All 6-Month Saver features",
      "Family allergen & additive watchlists",
      "Export personal nutritional dossiers (JSON)",
      "VIP early access to new AI models",
      "Developer API access (1,000 req/mo)",
    ],
    cta: "Get Annual Plan",
    popular: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("annual_pro");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      if (user) {
        setLoadingPlan("free");
        await updateUserPlan(user.id, "free");
        await refreshProfile();
        setLoadingPlan(null);
      }
      return;
    }
    router.push(`/checkout?plan=${planId}`);
  };

  const currentPlan = user?.plan || "free";

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold rounded-full uppercase tracking-wider">
            TRANSPARENT PRICING • ZERO HIDDEN COSTS
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 font-display mt-3">
            Simple, Honest Plans for Pure Food Clarity
          </h1>
          <p className="text-sm text-zinc-600 mt-2">
            Start with 15 free scans every month. Upgrade when you need deep chemical cocktail alerts, PubMed citations, and high-frequency supermarket scanning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const isUserCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                  plan.popular
                    ? "border-2 border-emerald-600 shadow-md"
                    : "border border-zinc-200 shadow-xs hover:border-zinc-300"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-zinc-900">{plan.name}</h3>
                      <p className="text-[11px] text-zinc-500 mt-1 min-h-[32px]">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-zinc-900 font-display">{plan.price}</span>
                      <span className="text-xs text-zinc-500">/ {plan.period}</span>
                    </div>
                    {plan.equivalent && (
                      <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                        {plan.equivalent}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                      <Icon name="check_circle" className="text-base text-emerald-700" />
                      <span>{plan.scans}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-zinc-600">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Icon name="check" className="text-emerald-600 text-sm shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100">
                  <button
                    disabled={isUserCurrent || loadingPlan === plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isUserCurrent
                        ? "bg-zinc-100 text-zinc-400 cursor-default"
                        : plan.popular
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                    }`}
                  >
                    <span>{isUserCurrent ? "Active Plan" : plan.cta}</span>
                    {!isUserCurrent && (
                      <Icon name="arrow_forward" className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
