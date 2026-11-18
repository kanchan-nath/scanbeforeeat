"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchHealthProfile, updateHealthProfile } from "@/lib/api";

export default function HealthProfilePage() {
  const { user } = useAuth();
  const [dietaryType, setDietaryType] = useState("Strict Clean Label & Low-UPF");
  const [riskTolerance, setRiskTolerance] = useState("Zero Tolerance (Strict EU Precautionary)");
  const [medicalConditions, setMedicalConditions] = useState(["Celiac Sensitivity", "Asthma Trigger Watch"]);
  const [dailyScanTarget, setDailyScanTarget] = useState(5);
  const [weightKg, setWeightKg] = useState(65.0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchHealthProfile(user.id)
      .then((p) => {
        if (p.dietaryProtocol) setDietaryType(p.dietaryProtocol);
        if (p.riskTolerance) setRiskTolerance(p.riskTolerance);
        if (p.dailyTarget) setDailyScanTarget(p.dailyTarget);
        if (p.conditions && p.conditions.length > 0) setMedicalConditions(p.conditions);
        if (p.weightKg) setWeightKg(p.weightKg);
      })
      .catch((err) => console.error("Could not load health profile:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      try {
        await updateHealthProfile(user.id, {
          dietaryProtocol: dietaryType,
          riskTolerance,
          dailyTarget: dailyScanTarget,
          conditions: medicalConditions,
          weightKg,
        });
      } catch (err) {
        console.error("Save error:", err);
      }
    }
    setShowEditModal(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const displayName = user?.displayName || "Dr. Elena Vance";

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Health & Diet Profile Overview
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Personalized toxicology calibration and biomarker risk baseline
            </p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Edit Profile Details</span>
          </button>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl font-medium">
            Health profile updated and calibrated with toxicology engine.
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold font-display shadow-sm shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-900">{displayName}</h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full uppercase self-center sm:self-auto">
                Pro Toxicologist
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{user?.email || "elena@science.org"}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-md font-medium">
                Primary Standard: {riskTolerance.split(" ")[0]}
              </span>
              <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-xs rounded-md font-medium">
                Diet: {dietaryType.split("&")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Calibration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">tune</span>
              <span>Dietary Filter Engine</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-zinc-400 font-mono text-[10px] uppercase block">
                  Dietary Protocol
                </span>
                <span className="font-semibold text-zinc-800 text-sm mt-0.5 block">{dietaryType}</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-zinc-400 font-mono text-[10px] uppercase block">
                  Risk Sensitivity Level
                </span>
                <span className="font-semibold text-zinc-800 text-sm mt-0.5 block">
                  {riskTolerance}
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-zinc-400 font-mono text-[10px] uppercase block">
                  Daily Scan Target
                </span>
                <span className="font-semibold text-zinc-800 text-sm mt-0.5 block">
                  {dailyScanTarget} scans/day
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-lg">medical_services</span>
              <span>Monitored Sensitivities & Allergens</span>
            </h3>

            <div className="space-y-2 text-xs">
              {medicalConditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-center justify-between"
                >
                  <span className="font-semibold text-amber-950">{cond}</span>
                  <span className="material-symbols-outlined text-amber-600 text-sm">priority_high</span>
                </div>
              ))}

              <div className="pt-2">
                <p className="text-[11px] text-zinc-500">
                  Any product scanned containing these compounds will trigger an instant high-contrast visual alarm.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900">Edit Health Profile</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Dietary Focus</label>
                  <input
                    type="text"
                    value={dietaryType}
                    onChange={(e) => setDietaryType(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Precautionary Threshold</label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Zero Tolerance (Strict EU Precautionary)">Zero Tolerance (Strict EU Precautionary)</option>
                    <option value="Moderate (EFSA Warnings Only)">Moderate (EFSA Warnings Only)</option>
                    <option value="Standard FDA Baseline">Standard FDA Baseline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Daily Target Scans</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={dailyScanTarget}
                    onChange={(e) => setDailyScanTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Body Weight (kg) - Calibrates Exposure mg/kg</label>
                  <input
                    type="number"
                    step="0.5"
                    min={30}
                    max={200}
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 65.0)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
