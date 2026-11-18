import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "About ScanBeforeEat — Mission & Public Food Defense",
  description:
    "Learn why ScanBeforeEat was engineered: an independent, non-sponsored public food defense system fighting ultra-processed food deception with algorithmic transparency.",
  openGraph: {
    title: "About ScanBeforeEat — Mission & Public Food Defense",
    description:
      "An independent food intelligence system fighting grocery label deception with peer-reviewed science.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const commitments = [
    {
      icon: "science",
      title: "Scientific Rigor",
      desc: "Every additive penalty, allergen alert, and NOVA score is pegged directly to peer-reviewed toxicological studies and regulatory monographs (EFSA, FDA, WHO).",
    },
    {
      icon: "money_off",
      title: "Zero Corporate Funding",
      desc: "We accept zero capital, sponsorships, or board seats from food manufacturers, fast-food chains, or agricultural lobbies. Our incentives remain purely aligned with consumers.",
    },
    {
      icon: "security",
      title: "User Privacy First",
      desc: "Your dietary restrictions, scanned food logs, and health profiles are encrypted. We never sell consumer telemetry to third-party data brokers or insurance carriers.",
    },
    {
      icon: "code",
      title: "Open Methodology",
      desc: "Our scoring formulas, weight distributions, and additive dictionaries are publicly documented. No opaque black-box algorithms or proprietary paywalled scores.",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Header Hero */}
        <section className="bg-white border-b border-zinc-200 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-label text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Public Food Defense System
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-5 leading-[1.12]">
                Our Mission: Transparent Food Intelligence
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                ScanBeforeEat was founded on a simple premise: you have an absolute right to know what chemicals, emulsifiers, and industrial formulations you are putting into your body before you buy.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem We Solve */}
        <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                  The Crisis
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 mb-5 tracking-tight">
                  Why We Engineered a Public Food Defense System
                </h2>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed mb-4">
                  Over 60% of items on modern supermarket shelves qualify as ultra-processed formulations under the NOVA-4 epidemiological framework. Industrial packaging deploys deceptive health claims—&quot;high in fiber&quot;, &quot;all-natural&quot;, &quot;heart-healthy&quot;—while quietly packing products with synthetic surfactants, modified starches, and neurobehavioral azo dyes.
                </p>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                  Traditional calorie-counting apps reduce food to mere macronutrient numbers, completely missing the toxicological impact of industrial processing on the human microbiome. ScanBeforeEat exists to reverse this information asymmetry.
                </p>
              </div>

              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="space-y-4">
                  <div className="border-b border-zinc-100 pb-3">
                    <div className="font-label text-2xl font-extrabold text-emerald-600">57%+</div>
                    <div className="text-xs text-zinc-500">Of daily calories come from ultra-processed formulations</div>
                  </div>
                  <div className="border-b border-zinc-100 pb-3">
                    <div className="font-label text-2xl font-extrabold text-emerald-600">300+</div>
                    <div className="text-xs text-zinc-500">Industrial additives approved despite ongoing toxicological concerns</div>
                  </div>
                  <div>
                    <div className="font-label text-2xl font-extrabold text-emerald-600">0%</div>
                    <div className="text-xs text-zinc-500">Corporate food lobby funding accepted by ScanBeforeEat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architectural Commitments */}
        <section className="py-16 md:py-20 bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                Principles
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
                Our Architectural Commitments
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {commitments.map((c, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                      <Icon name={c.icon} className="text-xl" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-950 font-headline mb-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-white via-emerald-50/40 to-emerald-50/70 border-t border-emerald-100 text-zinc-900 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-headline mb-4 text-zinc-950">
              Join the Movement for Food Transparency
            </h2>
            <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
              Scan your kitchen pantry today. 15 free scans per month with zero subscription obligations.
            </p>
            <a
              href={siteConfig.scanUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
            >
              <Icon name="photo_camera" className="text-base" />
              <span>Start Scanning Free</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
