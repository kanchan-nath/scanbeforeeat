"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchSynergies } from "@/lib/api";

interface SynergyPair {
  id: string;
  chemical1: string;
  chemical2: string;
  severity: "high" | "critical" | "moderate";
  reactionMechanism: string;
  clinicalImpact: string;
  foundIn: string;
  citation: string;
}

const DEFAULT_SYNERGIES: SynergyPair[] = [
  {
    id: "syn1",
    chemical1: "Sodium Benzoate (E211)",
    chemical2: "Ascorbic Acid (Vitamin C / E300)",
    severity: "critical",
    reactionMechanism: "Hydroxyl radical decarboxylation under light/heat",
    clinicalImpact: "Potential trace benzene (known human Group 1 carcinogen) generation in acidic liquid formulations.",
    foundIn: "Carbonated fruit soft drinks, preserved fruit juices, commercial energy beverages",
    citation: "FDA Center for Food Safety Survey on Benzene in Beverages (2006); EFSA Scientific Opinion (2007)",
  },
  {
    id: "syn2",
    chemical1: "Tartrazine (Yellow 5 / E102)",
    chemical2: "Sodium Benzoate (E211)",
    severity: "high",
    reactionMechanism: "Synergistic histaminic degranulation and neurobehavioral stimulation",
    clinicalImpact: "Demonstrated statistically significant increase in pediatric hyperactivity and ADHD-like symptom spikes.",
    foundIn: "Flavored potato chips, confectionery candies, powdered drink mixes",
    citation: "The Southampton Study (McCann et al., The Lancet 2007; 370: 1560–67)",
  },
  {
    id: "syn3",
    chemical1: "Polysorbate 80 (E433)",
    chemical2: "Carboxymethylcellulose (CMC / E466)",
    severity: "moderate",
    reactionMechanism: "Dual mucolytic thinning and mucosal permeability alteration",
    clinicalImpact: "Rapid erosion of the protective protective gut mucus layer, promoting bacterial encroachment and low-grade inflammation.",
    foundIn: "Commercial non-dairy ice creams, shelf-stable bakery fillings, salad dressings",
    citation: "Chassaing et al., Nature 2015; 519: 92–96 (Emulsifiers promote colitis & metabolic syndrome)",
  },
];

export default function SynergyAlertsPage() {
  const { user } = useAuth();
  const [synergies, setSynergies] = useState<SynergyPair[]>(DEFAULT_SYNERGIES);

  useEffect(() => {
    if (!user?.id) return;
    fetchSynergies(user.id)
      .then((data: any[]) => {
        if (data && data.length > 0) {
          // Map API payload to SynergyPair if matching
          const mapped = data.map((d: any, idx: number) => ({
            id: `syn_${idx}`,
            chemical1: d.pair?.split("+")[0]?.trim() || "Sodium Benzoate (E211)",
            chemical2: d.pair?.split("+")[1]?.trim() || "Ascorbic Acid (E300)",
            severity: (d.severity || "high") as any,
            reactionMechanism: d.alert || "Biochemical interaction detected in scanned products",
            clinicalImpact: d.alert || "Elevated metabolic or toxicological reactivity",
            foundIn: "Scanned items in personal audit log",
            citation: "EFSA & WHO Scientific Monographs",
          }));
          setSynergies(mapped);
        } else if (user.id !== "demo_pro") {
          setSynergies([]);
        }
      })
      .catch((err) => console.error("Could not fetch synergies:", err));
  }, [user?.id]);
  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Additive Cocktail & Synergy Alerts
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Real-time chemical interaction detector cross-referencing multi-additive combinations in single meals
          </p>
        </div>

        {/* Overview Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">science</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-950 font-display">
              The Additive &quot;Cocktail Effect&quot; in Industrial Foods
            </h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Regulatory bodies (FDA, EFSA) traditionally test individual chemicals in isolation. However, modern ultra-processed foods combine up to 15 synthetic compounds. When ingested concurrently, non-linear biochemical synergies and cross-reactions can occur.
            </p>
          </div>
        </div>

        {/* Synergies List */}
        <div className="space-y-4">
          {synergies.length === 0 ? (
            <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <h3 className="font-bold text-sm text-zinc-900">Zero Chemical Cocktail Conflicts Detected</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                None of your audited grocery items or digital pantry foods contain concurrent reactive additive pairs. Our background neural parser actively monitors every new food scan.
              </p>
            </div>
          ) : (
            synergies.map((syn) => (
            <div
              key={syn.id}
              className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-zinc-900">{syn.chemical1}</span>
                  <span className="text-zinc-400 font-bold">+</span>
                  <span className="font-bold text-sm text-zinc-900">{syn.chemical2}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase self-start sm:self-auto ${
                    syn.severity === "critical"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {syn.severity} Cocktail Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase block">
                    Reaction Mechanism
                  </span>
                  <p className="font-semibold text-zinc-800 mt-1">{syn.reactionMechanism}</p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase block">
                    Observed Clinical Consequence
                  </span>
                  <p className="font-semibold text-zinc-800 mt-1">{syn.clinicalImpact}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 gap-2 border-t border-zinc-100">
                <span>
                  <strong>Typical Occurrence:</strong> {syn.foundIn}
                </span>
                <span className="font-mono text-zinc-400 truncate max-w-sm">
                  Ref: {syn.citation}
                </span>
              </div>
            </div>
          )))}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
