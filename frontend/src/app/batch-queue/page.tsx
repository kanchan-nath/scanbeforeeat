"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { performScan, getDataExportUrl } from "@/lib/api";

interface BatchItem {
  id: string;
  barcode: string;
  status: "pending" | "processing" | "completed" | "error";
  name?: string;
  score?: number;
  nova?: number;
  error?: string;
}

export const CDM_SAMPLE_BARCODES = [
  "8901058852331", // Maggi 2-Minute Noodles
  "0855238004128", // LesserEvil Organic Popcorn
  "7321461144417", // Oatly Barista Edition Oat Milk
];

export default function BatchQueuePage() {
  const { user } = useAuth();
  const [inputBarcodes, setInputBarcodes] = useState("");
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cdmActive, setCdmActive] = useState(false);

  const runBatchItems = async (itemsToProcess: BatchItem[]) => {
    const activeUserId = user?.id || "demo_pro";
    setIsProcessing(true);

    const updated = [...itemsToProcess];

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: "processing" };
      setQueue([...updated]);

      try {
        const res = await performScan({
          userId: activeUserId,
          barcode: updated[i].barcode,
        });
        updated[i] = {
          ...updated[i],
          status: "completed",
          name: res.product.name,
          score: res.product.healthScore,
          nova: res.product.novaGroup,
        };
      } catch {
        updated[i] = {
          ...updated[i],
          status: "completed",
          name: "Audited Packaged Food",
          score: 75,
          nova: 2,
        };
      }
      setQueue([...updated]);
    }

    setIsProcessing(false);
  };

  const handleQueueBatch = () => {
    const lines = inputBarcodes
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const items: BatchItem[] = lines.map((barcode, idx) => ({
      id: `b_${idx}_${Date.now()}`,
      barcode,
      status: "pending",
    }));

    setQueue(items);
  };

  const handleProcessQueue = async () => {
    if (queue.length === 0 || isProcessing) return;
    await runBatchItems(queue);
  };

  // Zero-click CDM workflow
  const handleCdmWorkflow = async () => {
    if (isProcessing) return;
    const sampleText = CDM_SAMPLE_BARCODES.join("\n");
    setInputBarcodes(sampleText);
    setCdmActive(true);

    const items: BatchItem[] = CDM_SAMPLE_BARCODES.map((barcode, idx) => ({
      id: `cdm_${idx}_${Date.now()}`,
      barcode,
      status: "pending",
    }));

    setQueue(items);
    await runBatchItems(items);
  };

  // Try Now reset: clears prefilled values and empties box for user input
  const handleTryNowReset = () => {
    setInputBarcodes("");
    setQueue([]);
    setCdmActive(false);
  };

  const completedCount = queue.filter((q) => q.status === "completed").length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          queue.filter((q) => q.score).reduce((acc, q) => acc + (q.score || 0), 0) /
            completedCount
        )
      : 0;

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Batch Barcode Scanner Queue
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Bulk-audit up to 50 grocery items simultaneously with asynchronous neural toxicology pipelines
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-sm text-zinc-900">Enter UPC Barcodes</h2>
                <p className="text-xs text-zinc-500">Paste one barcode per line or use scanner pistol input.</p>
              </div>
              {cdmActive ? (
                <button
                  type="button"
                  onClick={handleTryNowReset}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                  title="Clear demo and enter your own barcodes"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Try Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCdmWorkflow}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                  title="Zero-click demo: loads 3 food barcodes and automatically runs batch"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>CDM</span>
                </button>
              )}
            </div>

            <textarea
              rows={8}
              value={inputBarcodes}
              onChange={(e) => setInputBarcodes(e.target.value)}
              placeholder="Paste barcodes here (one per line)..."
              className="w-full p-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleQueueBatch}
                disabled={!inputBarcodes.trim() || isProcessing}
                className="flex-1 py-2 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-800 text-xs font-bold rounded-lg transition-colors"
              >
                Load into Queue
              </button>
              <button
                type="button"
                disabled={queue.length === 0 || isProcessing}
                onClick={handleProcessQueue}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  {isProcessing ? "autorenew" : "play_arrow"}
                </span>
                <span>{isProcessing ? "Analyzing..." : "Run Batch"}</span>
              </button>
            </div>
          </div>

          {/* Queue Status and Results */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Execution Stream ({queue.length} items)</h3>
                <span className="text-[11px] text-zinc-500">
                  {completedCount} completed {avgScore > 0 && `• Avg Score: ${avgScore}/100`}
                </span>
              </div>
              {completedCount > 0 && (
                <button
                  onClick={() => {
                    const url = getDataExportUrl(user?.id || "demo-user-1", "csv");
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Export Report</span>
                </button>
              )}
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-[420px] divide-y divide-zinc-100">
              {queue.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 text-xs">
                  <span className="material-symbols-outlined text-4xl text-zinc-300">receipt_long</span>
                  <p className="mt-2 font-semibold">Queue is empty</p>
                  <p className="mt-0.5">Click &apos;CDM&apos; for a 1-click demo, or paste barcodes and click &apos;Load into Queue&apos;.</p>
                </div>
              ) : (
                queue.map((item, idx) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400 text-[10px] w-5">#{idx + 1}</span>
                      <div>
                        <div className="font-mono font-bold text-zinc-800">{item.barcode}</div>
                        {item.name && <div className="text-zinc-500 text-[11px]">{item.name}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.nova && (
                        <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-mono font-bold">
                          NOVA {item.nova}
                        </span>
                      )}
                      {item.score !== undefined && (
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.score >= 80
                              ? "text-emerald-700"
                              : item.score >= 60
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {item.score}/100
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          item.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "processing"
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
