"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";

export function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  const handleScanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/scanner");
    } else {
      router.push("/auth?redirect=/scanner");
    }
  };

  return (
    <section className="relative border-b border-zinc-200 overflow-hidden bg-white grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-5 sm:mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-label text-xs font-semibold text-emerald-800 tracking-tight">
                v2.4 Powered by Deep Ingredient Parsing & Peer-Reviewed Science
              </span>
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.08] mb-5 sm:mb-6">
              Know What You Eat. <br className="hidden sm:inline" />
              <span className="text-emerald-700">Before You Eat It.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mb-7 sm:mb-8">
              Scan any food barcode or paste ingredients. Get instant AI analysis of additives, allergens, ultra-processed markers, and a transparent health score backed by science — not corporate marketing.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-8 sm:mb-10">
              <Link
                href="/scanner"
                onClick={handleScanClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
              >
                <Icon name="photo_camera" className="text-base" />
                <span>{user ? "Open Live Scanner" : "Start Scanning (Sign In)"}</span>
                <Icon name="arrow_forward" className="text-base" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] transition-all"
              >
                <Icon name="play_circle" className="text-base" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 border-t border-zinc-200/80 pt-5 sm:pt-6 w-full">
              <Icon name="verified_user" className="text-emerald-600 text-base" />
              <span>
                Over 1.2M+ foods analyzed{" "}
                <span className="text-zinc-300 mx-1.5">•</span> 0% corporate food lobby sponsorship{" "}
                <span className="text-zinc-300 mx-1.5">•</span> 15 free scans with account
              </span>
            </div>
          </div>

          {/* Right Column / Scan Mockup Device */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl p-3 bg-slate-100 border border-slate-300/80 shadow-xl">
              {/* Top bar simulator */}
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 text-zinc-500 font-label text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="uppercase tracking-widest text-zinc-700 font-semibold">CAM_FEED // 60 FPS</span>
                </div>
                <span>ISO 120 • 4K HDR</span>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative w-full h-72 sm:h-80 rounded-xl bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center">
                {/* Barcode Graphic inside viewfinder */}
                <div className="w-48 h-28 opacity-30 flex items-center justify-center gap-1.5">
                  <div className="w-1 bg-white h-full"></div>
                  <div className="w-2 bg-white h-full"></div>
                  <div className="w-0.5 bg-white h-full"></div>
                  <div className="w-3 bg-white h-full"></div>
                  <div className="w-1 bg-white h-full"></div>
                  <div className="w-4 bg-white h-full"></div>
                  <div className="w-0.5 bg-white h-full"></div>
                  <div className="w-2 bg-white h-full"></div>
                  <div className="w-1 bg-white h-full"></div>
                  <div className="w-3 bg-white h-full"></div>
                  <div className="w-0.5 bg-white h-full"></div>
                  <div className="w-2 bg-white h-full"></div>
                </div>

                {/* Laser Scanline */}
                <div className="absolute left-6 right-6 h-[2px] bg-emerald-400 shadow-[0_0_12px_#34d399] animate-scanline"></div>

                {/* Viewfinder Corner Accents */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>

                <div className="absolute bottom-3 inset-x-0 text-center">
                  <span className="rounded bg-black/70 px-2.5 py-0.5 font-label text-[10px] text-emerald-400 tracking-wider">
                    TARGET: 8901058852331 MATCHED
                  </span>
                </div>
              </div>

              {/* Floating Instant Detection Card */}
              <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3.5 text-left shadow-xs">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-label text-emerald-700 uppercase tracking-wider font-semibold">
                      Detected Product
                    </span>
                    <h2 className="text-xs font-bold text-zinc-950 leading-tight">
                      Maggi 2-Minute Masala Noodles (70g)
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-label text-zinc-500 uppercase">Health Score</span>
                    <div className="text-base font-extrabold text-rose-500 font-label leading-none">
                      38<span className="text-[10px] text-zinc-400 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-[11px] mb-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>NOVA 4 (Ultra-Processed)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>4 Flagged Additives</span>
                  </div>
                </div>

                {/* Color-Coded Safety Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    High Risk (Red)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Moderate (Amber)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Safe (Emerald)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
