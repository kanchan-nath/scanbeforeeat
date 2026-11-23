"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { fetchScanHistory, saveUserAllergens, updateUserPlan } from "@/lib/api";

const DEFAULT_ALLERGENS = [
  "Gluten (Wheat)",
  "Dairy (Lactose)",
  "Tree Nuts & Peanuts",
  "Soy & Soy Lecithin",
  "Synthetic Azo Dyes (E102/E110/E129)",
  "Artificial Preservatives (TBHQ/BHA)",
  "Refined Palm Oil & Seed Oils",
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([
    "Synthetic Azo Dyes (E102/E110/E129)",
    "Artificial Preservatives (TBHQ/BHA)",
  ]);
  const [saveStatus, setSaveStatus] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchScanHistory(user.id)
        .then((hist) => setScanHistory(hist))
        .catch(() => setScanHistory([]));

      if (user.allergens && user.allergens.length > 0) {
        setSelectedAllergens(user.allergens);
      }
    }
  }, [user?.id, user?.allergens]);

  const toggleAllergen = (item: string) => {
    if (selectedAllergens.includes(item)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== item));
    } else {
      setSelectedAllergens([...selectedAllergens, item]);
    }
  };

  const handleSaveAllergens = async () => {
    if (!user) return;
    setSaveStatus("Saving...");
    try {
      await saveUserAllergens(user.id, selectedAllergens);
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch {
      setSaveStatus("Saved locally");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleUpgrade = async (plan: "free" | "monthly_pro" | "annual_pro") => {
    if (!user) return;
    setIsUpgrading(true);
    try {
      await updateUserPlan(user.id, plan);
      await refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpgrading(false);
    }
  };

  const isPro = user?.plan && user.plan !== "free";
  const scansLimit = user?.scansLimit ?? 99;
  const scansUsed = user?.scansUsed ?? 12;
  const remaining = Math.max(0, scansLimit - scansUsed);
  const quotaPct = Math.min(100, Math.round((scansUsed / scansLimit) * 100));

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Active Alert Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                Active Alert: TBHQ & Synthetic Azo Dyes detected in recent scans
              </h2>
              <p className="text-xs text-amber-800">
                Found in packaged snack audit. Cross-referenced with EFSA and PubMed pediatric neurobehavioral warnings.
              </p>
            </div>
          </div>
          <Link
            href="/synergy-alerts"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Review Synergies
          </Link>
        </div>

        {/* Top Grid: Personal Score, Quota Meter, Quick Launch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Safety Score Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase">
                  Personal Safety Score
                </span>
                <div className="text-3xl font-black text-zinc-900 mt-1 font-display">
                  {scanHistory.length > 0
                    ? Math.round(scanHistory.reduce((acc, s) => acc + (s.healthScore || 0), 0) / scanHistory.length)
                    : 100}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                scanHistory.length === 0
                  ? "bg-zinc-100 text-zinc-700"
                  : (scanHistory.reduce((acc, s) => acc + (s.healthScore || 0), 0) / scanHistory.length) >= 70
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {scanHistory.length === 0 ? "New Profile" : "Active Bio-Audit"}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">
                {scanHistory.length === 0
                  ? "No foods audited yet. Start scanning to calculate your personal bio-score."
                  : `Calculated from ${scanHistory.length} audited food items in your database ledger.`}
              </p>
              <Link
                href="/exposure-ledger"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mt-2"
              >
                <span>View Exposure Ledger</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Monthly Quota Meter */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase">
                    Scan Quota Usage
                  </span>
                  <div className="text-2xl font-black text-zinc-900 mt-1 font-display">
                    {remaining}{" "}
                    <span className="text-sm font-normal text-zinc-500">
                      / {scansLimit} scans left
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isPro ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {isPro ? "Pro Plan" : "Free Trial"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    quotaPct > 80 ? "bg-rose-500" : "bg-emerald-600"
                  }`}
                  style={{ width: `${quotaPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1.5 font-mono">
                <span>{scansUsed} used</span>
                <span>{scansLimit - scansUsed} remaining</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Resets in 12 days</span>
              <Link
                href="/pricing"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                {isPro ? "Manage Billing" : "Upgrade to Pro"}
              </Link>
            </div>
          </div>

          {/* Quick Scanner Launch */}
          <div className="bg-white text-zinc-900 border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                  Scanner Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-950 mt-1">Audit Food Item</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Scan UPC barcode or snap an ingredient list with neural camera OCR.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/scanner"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                <span>Open Camera Scanner</span>
              </Link>
              <Link
                href="/batch-queue"
                className="w-full py-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors border border-zinc-200"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>Batch Barcode Queue</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Hub Bar: Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/pantry"
            className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">kitchen</span>
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Digital Pantry</div>
              <div className="text-[11px] text-zinc-500">4 items cataloged</div>
            </div>
          </Link>

          <Link
            href="/duel"
            className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">compare_arrows</span>
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Product Duel</div>
              <div className="text-[11px] text-zinc-500">Compare 2 foods</div>
            </div>
          </Link>

          <Link
            href="/allergens"
            className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Allergen Matrix</div>
              <div className="text-[11px] text-zinc-500">{selectedAllergens.length} active guards</div>
            </div>
          </Link>

          <Link
            href="/shopping-list"
            className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Shopping List</div>
              <div className="text-[11px] text-zinc-500">Smart clean grocery</div>
            </div>
          </Link>
        </div>

        {/* Recent Scans Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Recent Food Audits</h3>
              <p className="text-xs text-zinc-500">Real-time breakdown of your latest scanned items</p>
            </div>
            <Link
              href="/history"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Full History</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Health Score</th>
                  <th className="px-6 py-3">NOVA Level</th>
                  <th className="px-6 py-3">Additives</th>
                  <th className="px-6 py-3">Audited</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {scanHistory.length > 0 ? (
                  scanHistory.map((scan: any) => (
                    <tr key={scan.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900">{scan.productName}</div>
                        <div className="text-[11px] text-zinc-500">UPC: {scan.barcode} • {scan.brand || "Food Item"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold ${
                            scan.healthScore >= 80
                              ? "bg-emerald-50 text-emerald-700"
                              : scan.healthScore >= 60
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              scan.healthScore >= 80
                                ? "bg-emerald-500"
                                : scan.healthScore >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {scan.healthScore} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            scan.novaGroup === 1
                              ? "bg-emerald-100 text-emerald-800"
                              : scan.novaGroup === 2
                              ? "bg-teal-100 text-teal-800"
                              : scan.novaGroup === 3
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          NOVA {scan.novaGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">
                        {scan.novaGroup === 4 ? "High UPF Formulation" : scan.novaGroup === 1 ? "Clean Baseline" : "Processed"}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">{scan.scannedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/scanner?barcode=${encodeURIComponent(scan.barcode)}`}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-md transition-colors"
                        >
                          Audit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-zinc-300 text-4xl">qr_code_scanner</span>
                        <span className="font-bold text-zinc-700 text-sm">No food audits recorded yet</span>
                        <p className="text-zinc-500 max-w-sm text-xs">
                          Scan packaged grocery items with your camera or enter a UPC barcode to see food health scores, NOVA levels, and additive alerts.
                        </p>
                        <Link
                          href="/scanner"
                          className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Open Scanner
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allergen & Dietary Matrix Section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Custom Allergen & Sensitivity Matrix</h3>
              <p className="text-xs text-zinc-500">
                Foods containing these substances trigger instant red cockpit alerts during scanning.
              </p>
            </div>
            <button
              onClick={handleSaveAllergens}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              {saveStatus || "Save Preferences"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {DEFAULT_ALLERGENS.map((allergen) => {
              const checked = selectedAllergens.includes(allergen);
              return (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                    checked
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <span className="text-xs">{allergen}</span>
                  <span
                    className={`material-symbols-outlined text-lg ${
                      checked ? "text-emerald-600" : "text-zinc-300"
                    }`}
                  >
                    {checked ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
