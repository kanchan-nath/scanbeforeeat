import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "The Definitive Guide to Ultra-Processed Foods (UPF) & NOVA Groups",
  description:
    "Learn what defines Ultra-Processed Foods (UPF) according to the NOVA framework. Understand food matrix disruption, health consequences, and clean grocery swaps.",
  openGraph: {
    title: "The Definitive Guide to Ultra-Processed Foods (UPF) | ScanBeforeEat",
    description:
      "Understand NOVA groups 1 to 4, food matrix disruption, and discover clean label swaps for your pantry.",
  },
  alternates: {
    canonical: "/upf-guide",
  },
};

export default function UpfGuidePage() {
  const novaGroups = [
    {
      group: "NOVA 1",
      name: "Unprocessed & Minimally Processed",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: "eco",
      desc: "Edible parts of plants or animals subjected to minimal physical actions: cleaning, freezing, pasteurizing, or drying without adding substances.",
      examples: ["Fresh fruits & vegetables", "Raw nuts & seeds", "Pasteurized milk", "Eggs", "Dried lentils & beans"],
      impact: "Preserves natural cellular matrix, intact dietary fiber, and bioavailable micronutrients.",
    },
    {
      group: "NOVA 2",
      name: "Processed Culinary Ingredients",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
      icon: "blender",
      desc: "Substances extracted directly from Group 1 foods by pressing, refining, or mining. Used in kitchens to season and cook Group 1 foods.",
      examples: ["Extra virgin olive oil", "Butter", "Iodized table salt", "Pure cane sugar", "Natural vinegar"],
      impact: "High calorie density; intended to be used in modest quantities to prepare balanced homemade meals.",
    },
    {
      group: "NOVA 3",
      name: "Processed Foods",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      icon: "inventory_2",
      desc: "Relatively simple food products manufactured by combining Group 1 with Group 2 ingredients to prolong shelf life or enhance taste.",
      examples: ["Canned legumes in brine", "Freshly baked artisan sourdough", "Canned sardines in olive oil", "Salted roasted nuts"],
      impact: "Retains the core structure of the original food while adding moderate sodium, oil, or sugar for preservation.",
    },
    {
      group: "NOVA 4",
      name: "Ultra-Processed Foods (UPF)",
      badge: "bg-rose-100 text-rose-800 border-rose-300",
      icon: "warning",
      desc: "Industrial formulations containing 5+ ingredients rarely found in home kitchens: inverted sugars, emulsifiers, modified starches, and artificial flavors.",
      examples: ["Carbonated soft drinks", "Instant noodles", "Packaged commercial cookies", "Reconstituted meat nuggets", "Flavored sweetened yogurts"],
      impact: "Destroys cellular food matrix, induces hyper-palatability, accelerates gut transit, and degrades metabolic regulation.",
    },
  ];

  const swaps = [
    {
      category: "Breakfast Staples",
      upfName: "Commercial Frosted Cereal",
      upfBadge: "NOVA 4 • Score 28/100",
      upfIssues: "Refined wheat flour, high-fructose corn syrup, artificial food dyes, BHT preservative.",
      cleanName: "Organic Rolled Oats with Berries & Walnuts",
      cleanBadge: "NOVA 1 • Score 92/100",
      cleanBenefits: "Intact beta-glucan fiber, zero synthetic sweeteners, clean anti-inflammatory omega-3s.",
    },
    {
      category: "Snack Foods",
      upfName: "Commercial Flavored Tortilla Chips",
      upfBadge: "NOVA 4 • Score 34/100",
      upfIssues: "Deconstructed corn meal, monosodium glutamate (MSG), maltodextrin, artificial cheddar flavor.",
      cleanName: "Organic Stone-Ground Corn Chips with Sea Salt",
      cleanBadge: "NOVA 3 • Score 78/100",
      cleanBenefits: "Only 3 ingredients (organic corn, organic high-oleic sunflower oil, sea salt).",
    },
    {
      category: "Condiments",
      upfName: "Bottled 'Light' Creamy Ranch",
      upfBadge: "NOVA 4 • Score 22/100",
      upfIssues: "Soybean oil, modified food starch, polysorbate 60, calcium disodium EDTA, artificial flavoring.",
      cleanName: "Homemade Greek Yogurt & Herb Dressing",
      cleanBadge: "NOVA 1 • Score 88/100",
      cleanBenefits: "Whole food dairy protein, live active probiotic cultures, extra virgin olive oil.",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "UPF Guide", url: "/upf-guide" },
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Header Hero */}
        <section className="bg-white border-b border-zinc-200 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span className="font-label text-xs font-semibold text-rose-800 uppercase tracking-wider">
                  Public Health Dossier • NOVA Classification
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-5 leading-[1.12]">
                The Complete Guide to Ultra-Processed Foods (UPF)
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                Over 60% of calories consumed in modern households now originate from ultra-processed formulations. Discover how industrial transformation degrades the food matrix and alters long-term metabolic health.
              </p>
            </div>
          </div>
        </section>

        {/* NOVA 1-4 Framework */}
        <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200" id="nova-groups">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                Epidemiological Framework
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
                The Scientific NOVA Framework
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Developed by the Center for Epidemiological Studies in Health and Nutrition at the University of São Paulo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {novaGroups.map((group) => (
                <div
                  key={group.group}
                  className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold font-label border ${group.badge}`}>
                        {group.group}
                      </span>
                      <Icon name={group.icon} className="text-zinc-400" />
                    </div>

                    <h3 className="text-lg font-bold text-zinc-950 font-headline mb-2">
                      {group.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6">
                      {group.desc}
                    </p>

                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 mb-6">
                      <span className="text-[11px] font-label uppercase tracking-wider text-zinc-500 block mb-2 font-semibold">
                        Typical Examples
                      </span>
                      <ul className="text-xs text-zinc-700 space-y-1">
                        {group.examples.map((ex, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                    <strong className="text-zinc-900">Health Impact: </strong>
                    {group.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clean Alternatives / Food Swaps */}
        <section className="py-16 md:py-20 bg-white border-b border-zinc-200" id="swaps">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
                Pantry Optimization
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
                UPF Catalog & Clean Alternatives
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 mt-2">
                Replace hyper-processed convenience items with unadulterated whole-food counterparts.
              </p>
            </div>

            <div className="space-y-6">
              {swaps.map((swap, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-50 rounded-2xl p-6 sm:p-8 border border-zinc-200"
                >
                  <div className="text-xs font-label uppercase tracking-wider text-zinc-500 font-bold mb-4">
                    {swap.category}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* UPF Side */}
                    <div className="bg-white rounded-xl p-5 border border-rose-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-label font-bold text-rose-700 uppercase">
                          AVOID // Ultra-Processed
                        </span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-label">
                          {swap.upfBadge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-zinc-950 mb-2 font-headline">
                        {swap.upfName}
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        <strong className="text-zinc-800">Flagged: </strong>
                        {swap.upfIssues}
                      </p>
                    </div>

                    {/* Clean Swap Side */}
                    <div className="bg-white rounded-xl p-5 border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-label font-bold text-emerald-700 uppercase">
                          RECOMMENDED // Clean Alternative
                        </span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-label">
                          {swap.cleanBadge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-zinc-950 mb-2 font-headline">
                        {swap.cleanName}
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        <strong className="text-zinc-800">Advantage: </strong>
                        {swap.cleanBenefits}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-white via-emerald-50/40 to-emerald-50/70 border-t border-emerald-100 text-zinc-900 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-headline mb-4 text-zinc-950">
              Scan any product to check its NOVA classification instantly.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 mb-8 max-w-xl mx-auto leading-relaxed">
              15 free scans per month. Point your camera at any food barcode to reveal hidden emulsifiers, modified starches, and ultra-processing markers.
            </p>
            <a
              href={siteConfig.scanUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
            >
              <Icon name="photo_camera" className="text-base" />
              <span>Start Free Scan</span>
              <Icon name="arrow_forward" className="text-base" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
