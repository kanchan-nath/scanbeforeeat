"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticatedShell from "@/components/AuthenticatedShell";
import { fetchProduct, ProductDetail } from "@/lib/api";
import { ScanResultCard } from "@/components/scanner/ScanResultCard";

export function ProductClient({ barcode }: { barcode: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    fetchProduct(barcode)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [barcode]);

  return (
    <AuthenticatedShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {loading && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-base font-bold text-zinc-900 font-display">
              Querying Food Toxicology Monograph...
            </h2>
            <p className="text-xs text-zinc-500 font-mono">
              Fetching catalog monograph for barcode: {barcode}
            </p>
          </div>
        )}

        {!loading && notFound && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 text-center shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 font-display">
              Product Not Indexed in Live Catalog
            </h2>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Barcode <code className="bg-zinc-100 px-2 py-0.5 rounded font-mono font-bold">{barcode}</code> has not been audited yet or is uncataloged.
              Scan it now using our Multimodal AI Scanner to analyze its ingredients and generate a clinical toxicology audit.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/scanner"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                <span>Open AI Scanner</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && product && (
          <ScanResultCard
            product={product}
            onScanAnother={() => router.push("/scanner")}
          />
        )}
      </div>
    </AuthenticatedShell>
  );
}
