"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { performScan } from "@/lib/api";

const PRESET_PRODUCTS = [
  { barcode: "8901058852331", name: "Maggi 2-Min Noodles", score: 38, nova: 4, type: "Ultra-Processed" },
  { barcode: "7321461144417", name: "Oatly Barista Oat Milk", score: 72, nova: 3, type: "Processed" },
  { barcode: "0855238004128", name: "LesserEvil Popcorn", score: 86, nova: 1, type: "Clean Label" },
  { barcode: "028400064088", name: "Doritos Nacho Cheese", score: 32, nova: 4, type: "High Risk Dyes" },
];

export default function ScannerPage() {
  const router = useRouter();
  const { user, loginDemo, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"barcode" | "ocr" | "manual">("barcode");
  const [manualBarcode, setManualBarcode] = useState("8901058852331");
  const [rawText, setRawText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [torchActive, setTorchActive] = useState(false);

  // Auto-login as demo if user arrives without login
  useEffect(() => {
    if (!user) {
      loginDemo("monthly_pro");
    }
  }, [user, loginDemo]);

  const handleScan = async (codeToScan?: string, textToScan?: string) => {
    setErrorMessage("");
    setIsScanning(true);

    const activeUserId = user?.id || "demo_pro";
    const targetBarcode = codeToScan || (activeTab === "manual" ? manualBarcode : undefined);
    const targetText = textToScan || (activeTab === "ocr" ? rawText : undefined);

    try {
      const result = await performScan({
        userId: activeUserId,
        barcode: targetBarcode,
        rawText: targetText,
      });

      await refreshProfile();
      router.push(`/product/${encodeURIComponent(result.product.barcode)}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Scan failed or monthly quota exceeded. Please upgrade.");
      setIsScanning(false);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Top Header & Telemetry Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
              Live Food Scanner Console
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              Position item inside the reticle or paste ingredients for instant AI toxicology breakdown
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
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
            <span>Label OCR</span>
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

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-base">warning</span>
              <span>{errorMessage}</span>
            </div>
            <Link
              href="/pricing"
              className="text-xs font-bold text-white bg-rose-600 px-3 py-1 rounded-lg"
            >
              Upgrade
            </Link>
          </div>
        )}

        {/* TAB 1: BARCODE SCANNER VIEWFINDER */}
        {activeTab === "barcode" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Viewfinder Lens Viewport Box */}
            <div
              onClick={() => handleScan("8901058852331")}
              className="relative w-full h-80 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center cursor-pointer group overflow-hidden shadow-inner"
            >
              {/* Corner reticle brackets */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400 rounded-tl shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400 rounded-tr shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400 rounded-bl shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400 rounded-br shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>

              {/* Animated Scan Beam */}
              <div className="absolute inset-x-6 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981,0_0_24px_#10b981] animate-scanline z-10 pointer-events-none"></div>

              {/* Barcode Graphic Inside Box */}
              <div className="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <span className="material-symbols-outlined text-5xl">barcode_scanner</span>
                <span className="font-mono text-xs tracking-wider uppercase text-zinc-300">
                  Click to scan sample: Maggi Noodles (8901058852331)
                </span>
                <span className="text-[11px] text-zinc-500 font-sans">
                  Optical auto-focus active • 60 FPS
                </span>
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-20">
                  <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono text-xs text-emerald-300 font-bold uppercase tracking-wider">
                    Parsing Toxicological Monograph...
                  </span>
                </div>
              )}
            </div>

            {/* Quick Presets Grid */}
            <div className="pt-2">
              <span className="block text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider mb-3">
                Or Select Preset Grocery Item:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_PRODUCTS.map((p) => (
                  <button
                    key={p.barcode}
                    type="button"
                    onClick={() => handleScan(p.barcode)}
                    disabled={isScanning}
                    className="p-3.5 rounded-xl bg-zinc-50 hover:bg-emerald-50/50 border border-zinc-200 hover:border-emerald-500/50 text-left transition-all cursor-pointer flex flex-col justify-between group"
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

        {/* TAB 2: OCR TEXT READER */}
        {activeTab === "ocr" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 font-display">
                Optical Character Recognition (OCR) Reader
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Paste ingredient text directly from unformatted foreign labels, obscure imports, or recipe sheets.
              </p>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste unformatted ingredients text here... (e.g. Wheat flour, Palm oil, Tartrazine E102, TBHQ, Monosodium glutamate, Disodium inosinate, Sodium benzoate)"
              className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-emerald-500 font-mono"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setRawText(
                    "Wheat Flour, Refined Palm Oil, Iodised Salt, Flavor Enhancer (E621), Tartrazine (E102), Preservative (E319), Acidity Regulator (E330)"
                  )
                }
                className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors"
              >
                Insert Sample Text
              </button>
              <button
                type="button"
                onClick={() => handleScan(undefined, rawText)}
                disabled={isScanning || !rawText.trim()}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">document_scanner</span>
                <span>{isScanning ? "Analyzing..." : "Analyze Ingredients"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL INPUT */}
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
              Tip: Try <code>8901058852331</code> (Maggi), <code>7394376616037</code> (Oatly), or <code>0855238004128</code> (LesserEvil).
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
