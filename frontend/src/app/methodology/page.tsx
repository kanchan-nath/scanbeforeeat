import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Scientific Methodology & Algorithm Architecture",
  description:
    "Explore the open, peer-reviewed scientific methodology behind ScanBeforeEat. Our 4-pillar algorithmic engine combines NOVA classification, EFSA/FDA toxicology, and clinical epidemiology.",
  openGraph: {
    title: "Scientific Methodology & Algorithm Architecture | ScanBeforeEat",
    description:
      "Explore the open, peer-reviewed scientific scoring methodology behind ScanBeforeEat.",
  },
  alternates: {
    canonical: "/methodology",
  },
};

export default function MethodologyPage() {
  const pillars = [
    {
      num: "01",
      icon: "account_tree",
      title: "NOVA Food Processing Classification",
      category: "Structural Integrity",
      desc: "Evaluates the degree and purpose of industrial food transformation using the University of São Paulo's 4-tier NOVA framework. Penalizes industrial extrusion, high-pressure homogenization, and synthetic cosmetic alteration.",
      weight: "-35 pts max penalty",
      badge: "NOVA 1-4 Tiers",
    },
    {
      num: "02",
      icon: "biotech",
      title: "Toxicological & Regulatory Profiling",
      category: "Chemical Safety",
      desc: "Cross-references every additive against EFSA, FDA, IARC, and WHO monographs. Evaluates ADI (Acceptable Daily Intake), potential endocrine disruption, gut microbiome erosion, and international bans.",
      weight: "-40 pts max penalty",
      badge: "EFSA / FDA Monographs",
    },
    {
      num: "03",
      icon: "local_dining",
      title: "Nutrient Density & Macro Balance",
      category: "Biochemical Profile",
      desc: "Examines dietary fiber, whole protein quality, micronutrient density, and penalizes synthetic trans isomers, ultra-refined seed oils, and high-glycemic free sugars per 100g.",
      weight: "-25 pts max penalty",
      badge: "WHO Nutrient Profiling",
    },
    {
      num: "04",
      icon: "science",
      title: "Clinical & Epidemiological Evidence",
      category: "Empirical Studies",
      desc: "Incorporates prospective cohort data from NutriNet-Santé, BMJ clinical trials, and Lancet studies linking chemical combinations and emulsifiers to chronic metabolic diseases.",
      weight: "+15 pts bonus cap",
      badge: "Peer-Reviewed DOIs",
    },
  ];

  const riskTiers = [
    {
      tier: "Safe & Nutritive",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      color: "text-emerald-700",
      examples: "Ascorbic Acid (E300), Curcumin (E100), Pectin (E440)",
      description: "Naturally occurring substances with clear nutritional value and zero adverse clinical markers.",
    },
    {
      tier: "Low Risk",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
      color: "text-blue-700",
      examples: "Citric Acid (E330), Guar Gum (E412), Calcium Carbonate (E170)",
      description: "Widely evaluated non-toxic additives with high ADI margins and negligible allergenic incidence.",
    },
    {
      tier: "Moderate Caution",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      color: "text-amber-800",
      examples: "Polysorbate 80 (E433), Xanthan Gum (E415), Sucralose (E955)",
      description: "Evidence of mucosal degradation, mild dysbiosis, or controversial non-caloric metabolic effects.",
    },
    {
      tier: "High Risk",
      badge: "bg-orange-100 text-orange-800 border-orange-300",
      color: "text-orange-800",
      examples: "Sodium Nitrite (E250), BHA (E320), BHT (E321), Allura Red AC (E129)",
      description: "Suspected endocrine disruptors, precursors to carcinogenic nitrosamines, or pediatric neurobehavioral triggers.",
    },
    {
      tier: "Critical / Restricted",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
      color: "text-rose-800",
      examples: "Titanium Dioxide (E171 - Banned in EU), Potassium Bromate (E924)",
      description: "Substances banned or severely restricted in Tier-1 regulatory bodies due to genotoxicity or direct carcinogenicity.",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Methodology", url: "/methodology" },
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
                  Open Science • Algorithmic Transparency
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-5 leading-[1.12]">
                Our Scientific Methodology: How ScanBeforeEat Evaluates Food
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                We believe you have the fundamental right to know how your food is graded. ScanBeforeEat does not sell sponsored placements, accept food industry funding, or keep our scoring formulas secret.
              </p>
            </div>
          </div>
        </section>

        {/* 4-Pillar Algorithmic Architecture */}
        <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200" id="pillars">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                Core Engine
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
                Four-Pillar Algorithmic Architecture
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Every scanned ingredient deck is parsed through four parallel computational modules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar) => (
                <div
                  key={pillar.num}
                  className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-label text-2xl font-extrabold text-zinc-300">
                        {pillar.num}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold font-label">
                        {pillar.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={pillar.icon} className="text-emerald-600" />
                      <h3 className="text-lg font-bold text-zinc-950 font-headline">
                        {pillar.title}
                      </h3>
                    </div>

                    <div className="text-[11px] font-label text-emerald-700 uppercase tracking-wider font-semibold mb-3">
                      {pillar.category}
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Impact Coefficient:</span>
                    <span className="font-label font-bold text-zinc-900 bg-zinc-50 px-2.5 py-1 rounded border border-zinc-200">
                      {pillar.weight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exact Scoring Formula Section */}
        <section className="py-16 md:py-20 bg-white border-b border-zinc-200" id="formula">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-10">
              <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                Mathematical Model
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
                Scoring Formula & Weight Allocation
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Our score is strictly bounded and deterministic. Zero black-box AI hallucinations.
              </p>
            </div>

            {/* Formula Code Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-zinc-200 text-zinc-900 mb-10 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
                <span className="font-label text-xs uppercase tracking-wider text-emerald-700 font-semibold">
                  Composite Index Engine v2.4 // Deterministic Specification
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-label text-[10px] border border-zinc-200">
                  VERIFIED SHA-256
                </span>
              </div>

              <div className="font-mono-code text-sm sm:text-base bg-emerald-950 text-emerald-300 p-4 sm:p-6 rounded-xl border border-emerald-900 overflow-x-auto mb-6 shadow-inner">
                <code>
                  Score = max(15, min(95, round(70 + B_whole + B_fiber + B_protein - P_nova - P_additives - P_sugar - P_trans)))
                </code>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-body">
                <div className="p-4 rounded-xl bg-slate-50 border border-zinc-200">
                  <span className="text-emerald-700 font-bold font-label block text-sm mb-1">
                    Baseline: 70 pts
                  </span>
                  <span className="text-zinc-600">
                    Neutral starting point. Unadulterated food decks earn bonuses; chemical additives deduct points.
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-zinc-200">
                  <span className="text-emerald-700 font-bold font-label block text-sm mb-1">
                    Bonuses: Up to +15 pts
                  </span>
                  <span className="text-zinc-600">
                    Whole ingredients (fruits, vegetables, nuts, legumes), high dietary fiber, and quality protein.
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-zinc-200">
                  <span className="text-rose-600 font-bold font-label block text-sm mb-1">
                    Deductions: -10 to -40 pts
                  </span>
                  <span className="text-zinc-600">
                    Severe penalties for NOVA-4 ultra-processing, synthetic emulsifiers, artificial sweeteners, and dyes.
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-zinc-200">
                  <span className="text-amber-700 font-bold font-label block text-sm mb-1">
                    Bounded: 15 to 95 pts
                  </span>
                  <span className="text-zinc-600">
                    Clamped strictly between 15 and 95. Absolute 0 or 100 are forbidden to eliminate false absolutism. Returns null if data is insufficient.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Tier Additive Risk Matrix */}
        <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200" id="matrix">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                Safety Taxonomy
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
                5-Tier Additive Risk Classification Matrix
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                We evaluate every additive on a strict toxicological spectrum based on European Food Safety Authority (EFSA) and international standards.
              </p>
            </div>

            <div className="space-y-4">
              {riskTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="md:w-1/4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border font-label ${tier.badge}`}>
                      {tier.tier}
                    </span>
                  </div>

                  <div className="md:w-1/2">
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="md:w-1/4 md:text-right">
                    <span className="text-[11px] font-label text-zinc-400 uppercase tracking-wider block mb-1">
                      Key Examples
                    </span>
                    <span className="text-xs font-semibold text-zinc-800">
                      {tier.examples}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The ScanBeforeEat Independence Charter */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold font-label mb-6">
              <Icon name="verified_user" className="text-sm text-emerald-600" />
              <span>Our Code of Ethics</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-headline tracking-tight mb-6">
              The ScanBeforeEat Independence Charter
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-10">
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
                <Icon name="money_off" className="text-2xl text-emerald-600 mb-3" />
                <h3 className="font-bold text-zinc-950 text-base mb-2 font-headline">
                  Zero Food Brand Sponsorships
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We never accept compensation from food manufacturers or agricultural conglomerates to alter, boost, or suppress health scores.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
                <Icon name="menu_book" className="text-2xl text-emerald-600 mb-3" />
                <h3 className="font-bold text-zinc-950 text-base mb-2 font-headline">
                  Open Citation Architecture
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Every flagged ingredient is accompanied by its corresponding PubMed ID, EFSA scientific opinion, or clinical trial DOI.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
                <Icon name="lock_open" className="text-2xl text-emerald-600 mb-3" />
                <h3 className="font-bold text-zinc-950 text-base mb-2 font-headline">
                  Reproducible Algorithms
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Our calculations are deterministic and mathematical. Two users scanning the identical product will always receive the identical health score.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <a
                href={siteConfig.scanUrl}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
              >
                <Icon name="photo_camera" className="text-base" />
                <span>Test the Scoring Engine Free</span>
                <Icon name="arrow_forward" className="text-base" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
