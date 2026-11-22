"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { performScan, fetchAiStatus, type AiStatusResponse } from "@/lib/api";
import BarcodeCamera from "@/components/scanner/BarcodeCamera";
import IngredientCamera from "@/components/scanner/IngredientCamera";
import { validateBarcode } from "@/lib/camera";

const PRESET_PRODUCTS = [
  { barcode: "8901058852331", name: "Maggi 2-Min Noodles", score: 38, nova: 4, type: "Ultra-Processed" },
  { barcode: "7321461144417", name: "Oatly Barista Oat Milk", score: 72, nova: 3, type: "Processed" },
  { barcode: "0855238004128", name: "LesserEvil Popcorn", score: 86, nova: 1, type: "Clean Label" },
  { barcode: "028400064088", name: "Doritos Nacho Cheese", score: 32, nova: 4, type: "High Risk Dyes" },
];

export default function ScannerPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"barcode" | "ocr" | "manual">("barcode");
  const [manualBarcode, setManualBarcode] = useState("8901058852331");
  const [rawText, setRawText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);

  // Fetch AI status telemetry on mount
  useEffect(() => {
    fetchAiStatus()
      .then((res) => setAiStatus(res))
      .catch((err) => console.warn("Could not fetch AI status:", err));
  }, []);

  const handleScan = async (
    codeToScan?: string,
    textToScan?: string,
    imageToScan?: string,
    imageType?: string
  ) => {
    setErrorMessage("");
    setIsScanning(true);

    const activeUserId = user?.id || "demo_pro";
    const targetBarcode = codeToScan || (activeTab === "manual" ? manualBarcode.trim() : undefined);
    const targetText = textToScan || (activeTab === "ocr" && !imageToScan ? rawText.trim() : undefined);

    // If manual barcode, validate format first
    if (activeTab === "manual" && targetBarcode) {
      const validation = validateBarcode(targetBarcode);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Please enter a valid numeric barcode.");
        setIsScanning(false);
        return;
      }
    }

    try {
      const result = await performScan({
        userId: activeUserId,
        barcode: targetBarcode,
        rawText: targetText,
        image: imageToScan,
        imageType: imageType,
      });

      await refreshProfile();
      router.push(`/product/${encodeURIComponent(result.product.barcode)}`);
    } catch (err: any) {
      const msg = err.message || "Scan failed or monthly quota exceeded. Please check your connection or upgrade.";
      setErrorMessage(msg);
      setIsScanning(false);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Top Header & Telemetry Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Live Food Scanner Console
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Position product barcode or snap ingredients label for instant AI toxicology breakdown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* AI Engine Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-zinc-200 border border-slate-800 shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.nvidiaConfigured ? "bg-emerald-400 animate-pulse" : "bg-sky-400"
                }`}
              />
              <span className="text-[11px] font-mono font-medium">
                {aiStatus?.nvidiaConfigured ? "NVIDIA NIM Cloud Active" : "Toxicology Engine Active"}
              </span>
            </div>

            {/* Quota Counter Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800">
                {user ? `${user.remainingScans}/${user.scansLimit} Scans Available` : "99 Scans Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div className="bg-white border border-zinc-200 rounded-xl p-1 shadow-xs flex items-center gap-1 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("barcode")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "barcode"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            <span>Barcode Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ocr")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ocr"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-base">document_scanner</span>
            <span>Ingredient Lens</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Manual Input</span>
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-base shrink-0">warning</span>
              <span className="font-medium">{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-xs text-rose-700 hover:text-rose-900 underline font-semibold"
              >
                Dismiss
              </button>
              {errorMessage.includes("quota") && (
                <Link
                  href="/pricing"
                  className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded-lg transition-colors"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: REAL-WORLD BARCODE CAMERA VIEWFINDER */}
        {activeTab === "barcode" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
            <BarcodeCamera
              onDetected={(barcode) => handleScan(barcode)}
              isScanning={isScanning}
              onSwitchToManual={() => setActiveTab("manual")}
              onSwitchToOcr={() => setActiveTab("ocr")}
            />

            {/* Quick Presets Grid */}
            <div className="pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  Or Test Preset Grocery Items:
                </span>
                <span className="text-[11px] text-zinc-400">Click to run sample scan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_PRODUCTS.map((p) => (
                  <button
                    key={p.barcode}
                    type="button"
                    onClick={() => handleScan(p.barcode)}
                    disabled={isScanning}
                    className="p-3.5 rounded-xl bg-zinc-50 hover:bg-emerald-50/50 border border-zinc-200 hover:border-emerald-500/50 text-left transition-all cursor-pointer flex flex-col justify-between group disabled:opacity-50"
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.barcode}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200/60">
                      <span className="text-[10px] font-mono font-bold text-zinc-500">
                        NOVA {p.nova}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          p.score >= 80
                            ? "text-emerald-700"
                            : p.score >= 60
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
                        {p.score}/100
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INGREDIENT LENS & MULTIMODAL AI CAMERA */}
        {activeTab === "ocr" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 font-display">
                Multimodal AI Ingredient Label Lens
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Snap or upload a photo of the ingredients panel. The AI extracts text, detects 120+ additives, flags allergens, and computes NOVA rating.
              </p>
            </div>

            <IngredientCamera
              onAnalyzeImage={(img, mime, text) => handleScan(undefined, text, img, mime)}
              onAnalyzeText={(text) => handleScan(undefined, text)}
              isScanning={isScanning}
              onSwitchToBarcode={() => setActiveTab("barcode")}
            />

            {/* Direct Paste Fallback Section */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <span className="block text-xs font-bold text-zinc-700">
                Or Paste Ingredient Text Directly:
              </span>
              <textarea
                rows={3}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste unformatted ingredients text here... (e.g. Wheat flour, Palm oil, Tartrazine E102, TBHQ E319, Monosodium glutamate E621, Salt)"
                className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-emerald-500 font-mono"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRawText(
                      "Wheat Flour, Refined Palm Oil, Iodised Salt, Flavor Enhancer (E621 Monosodium Glutamate), Tartrazine (E102), Preservative TBHQ (E319), Acidity Regulator (E330)"
                    )
                  }
                  className="py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors"
                >
                  Insert Sample UPF Ingredients
                </button>

                <button
                  type="button"
                  onClick={() => handleScan(undefined, rawText)}
                  disabled={isScanning || !rawText.trim()}
                  className="py-2 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">neurology</span>
                  <span>{isScanning ? "Analyzing..." : "Analyze Pasted Text"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL LOOKUP */}
        {activeTab === "manual" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 font-display">
                Lookup Barcode Manually
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Type an 8, 12, or 13-digit UPC/EAN barcode to query the database.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="8901058852331"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleScan(manualBarcode)}
                disabled={isScanning || !manualBarcode.trim()}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Lookup</span>
                <span className="material-symbols-outlined text-base">search</span>
              </button>
            </div>

            <div className="text-[11px] text-zinc-500">
              Tip: Try <code>8901058852331</code> (Maggi), <code>7321461144417</code> (Oatly), or <code>0855238004128</code> (LesserEvil).
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
