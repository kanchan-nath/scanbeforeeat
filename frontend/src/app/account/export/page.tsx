"use client";

import React, { useState } from "react";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { getDataExportUrl } from "@/lib/api";

export default function DataExportPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleExport = (format: "json" | "csv" | "pdf") => {
    setDownloading(true);
    const userId = user?.id || "demo-user-1";
    const exportFormat = format === "csv" ? "csv" : "json";
    const downloadUrl = getDataExportUrl(userId, exportFormat);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `scanbeforeeat-dossier-${userId}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloading(false);
    }, 800);
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Data Export & Privacy Dossier
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Download your full nutritional telemetry, chemical audit history, and personal dietary metadata under GDPR Article 20
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">cloud_download</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 font-display">
                Download Your Personal Health Dossier
              </h2>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Your archive includes complete barcode scans, chemical additive ratings, digital pantry inventory, active allergen rules, and personal exposure timelines in machine-readable open formats.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
            <button
              onClick={() => handleExport("json")}
              disabled={downloading}
              className="p-5 border border-zinc-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                JSON
              </div>
              <div className="font-bold text-sm text-zinc-900">Raw JSON Archive</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Structured machine-readable data</div>
            </button>

            <button
              onClick={() => handleExport("csv")}
              disabled={downloading}
              className="p-5 border border-zinc-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                CSV
              </div>
              <div className="font-bold text-sm text-zinc-900">Spreadsheet CSV</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Compatible with Excel & Sheets</div>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={downloading}
              className="p-5 border border-zinc-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                PDF
              </div>
              <div className="font-bold text-sm text-zinc-900">Clinical PDF Summary</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Ready for doctor/allergist consultation</div>
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Archive generated on demand directly from your SQLite encrypted storage</span>
            {downloading && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                <span>Generating archive...</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
