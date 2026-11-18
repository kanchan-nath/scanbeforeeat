import { siteConfig } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";

export function CtaBanner() {
  return (
    <section className="bg-white py-16 sm:py-24" id="start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white via-emerald-50/40 to-emerald-50/70 border border-emerald-200/80 text-zinc-900 p-8 md:p-14 text-center shadow-lg">
          {/* Subtle background radial glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/10 blur-[100px] pointer-events-none rounded-full"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300/80 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span className="font-label text-xs font-semibold text-emerald-800">Ready in 30 seconds</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline text-zinc-950">
              Start scanning your food today.
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 mb-8 max-w-xl mx-auto leading-relaxed">
              15 free scans, no credit card required. Know exactly what goes into your body.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={siteConfig.scanUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
              >
                <Icon name="photo_camera" className="text-base" />
                <span>Get Started Free</span>
                <Icon name="arrow_forward" className="text-base" />
              </a>
              <span className="text-xs font-label text-zinc-500">Instant access in your mobile browser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
