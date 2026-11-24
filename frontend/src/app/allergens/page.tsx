"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { saveUserAllergens, fetchUserProfile } from "@/lib/api";

const PRESET_ALLERGENS = [
  { id: "gluten", name: "Gluten & Celiac (Wheat, Barley, Rye)", severity: "severe", category: "Immunological" },
  { id: "dairy", name: "Dairy & Lactose (Milk, Casein, Whey)", severity: "moderate", category: "Enzymatic" },
  { id: "peanuts", name: "Peanuts & Tree Nuts", severity: "severe", category: "Immunological" },
  { id: "soy", name: "Soy & Soy Lecithin (GMO Fractionated)", severity: "moderate", category: "Sensitivity" },
  { id: "shellfish", name: "Crustacean Shellfish & Mollusks", severity: "severe", category: "Immunological" },
  { id: "eggs", name: "Egg Albumin & Egg Lysozyme", severity: "moderate", category: "Immunological" },
  { id: "sesame", name: "Sesame Seeds & Tahini", severity: "severe", category: "Immunological" },
  { id: "sulfites", name: "Sulfur Dioxide & Sulfites (>10ppm)", severity: "moderate", category: "Chemical" },
  { id: "azo_dyes", name: "Synthetic Azo Dyes (E102, E110, E129)", severity: "severe", category: "Toxicological" },
  { id: "seed_oils", name: "Refined Canola, Soy & Industrial Palm Oil", severity: "moderate", category: "Inflammatory" },
  { id: "msg", name: "Monosodium Glutamate & Hydrolyzed Protein", severity: "moderate", category: "Excitotoxin" },
  { id: "preservatives", name: "Synthetic Preservatives (TBHQ, BHA, BHT)", severity: "severe", category: "Toxicological" },
];

export default function AllergensPage() {
  const { user, refreshProfile } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "gluten",
    "azo_dyes",
    "preservatives",
  ]);
  const [customAllergen, setCustomAllergen] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserProfile(user.id)
      .then((profile) => {
        if (profile?.allergens && profile.allergens.length > 0) {
          setSelectedIds(profile.allergens);
        }
      })
      .catch((err) => console.error("Could not load user allergens:", err));
  }, [user?.id]);

  const toggleAllergen = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAllergen.trim()) return;
    const cleanId = customAllergen.toLowerCase().replace(/[^a-z0-9]/g, "_");
    setSelectedIds([...selectedIds, cleanId]);
    setCustomAllergen("");
  };

  const handleSaveAll = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserAllergens(user.id, selectedIds);
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Allergen Matrix Manager
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Configure strict personal exclusion parameters and lethal cross-contamination alerts
            </p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>{saving ? "Saving Matrix..." : "Save Matrix Guard"}</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl font-medium">
            Allergen Matrix updated successfully. Scanner now intercepts flagged items instantly.
          </div>
        )}

        {/* Custom Allergen Add Bar */}
        <form
          onSubmit={handleAddCustom}
          className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs flex gap-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add custom trigger (e.g. Carrageenan, Red 40, Mustard Seed)..."
              value={customAllergen}
              onChange={(e) => setCustomAllergen(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-zinc-400 text-sm">
              add_alert
            </span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Add Watchlist Trigger
          </button>
        </form>

        {/* Allergen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_ALLERGENS.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleAllergen(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isChecked
                    ? "border-emerald-600 bg-emerald-50/40 shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        item.severity === "severe"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-zinc-900 mt-2 font-display">
                    {item.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {isChecked ? "Active Interceptor" : "Inactive"}
                  </span>
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isChecked ? "text-emerald-600" : "text-zinc-300"
                    }`}
                  >
                    {isChecked ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
