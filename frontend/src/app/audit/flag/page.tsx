"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { useAuth } from "@/lib/auth-context";
import { submitFlaggedProduct } from "@/lib/api";

export default function FlagProductPage() {
  const { user } = useAuth();
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFlaggedProduct({
        userId: user?.id || "demo-user-1",
        barcode,
        productName,
        brand,
        ingredientsText,
      });
    } catch (err) {
      console.error("Flag submission error:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 font-display">
            Flag New Product for Toxicological Audit
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Submit uncataloged grocery barcodes for expert peer-review toxicology verification
          </p>
        </div>

        {submitted ? (
          <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Product Queued for Verification</h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Thank you! Our automated neural parser and biochemist review team have received <strong>{productName}</strong>. You will be notified when the monograph is indexed.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors inline-block"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4 text-xs"
          >
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">UPC / EAN Barcode Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 8901058852331"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisan Sourdough Boule"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Manufacturer / Brand</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rustic Bakery Co."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Raw Ingredients Text (From packaging)
              </label>
              <textarea
                rows={4}
                required
                placeholder="Paste the ingredient list from the label..."
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>Submit for Indexing</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthenticatedShell>
  );
}
