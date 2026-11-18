"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

interface AdditiveItem {
  eNumber: string;
  name: string;
  category: "Preservative" | "Color" | "Flavor Enhancer" | "Sweetener" | "Antioxidant" | "Emulsifier";
  functionDesc: string;
  riskLevel: "Safe" | "Low Risk" | "Moderate" | "High Risk" | "Critical / Banned";
  riskBadge: string;
  foundIn: string;
  efsaStatus: string;
}

const ADDITIVES_DATA: AdditiveItem[] = [
  {
    eNumber: "E102",
    name: "Tartrazine",
    category: "Color",
    functionDesc: "Synthetic lemon yellow azo dye",
    riskLevel: "High Risk",
    riskBadge: "bg-rose-100 text-rose-800 border-rose-300",
    foundIn: "Flavored chips, soft drinks, candies, seasonings",
    efsaStatus: "Mandatory warning label in EU (hyperactivity)",
  },
  {
    eNumber: "E110",
    name: "Sunset Yellow FCF",
    category: "Color",
    functionDesc: "Synthetic orange-yellow azo dye",
    riskLevel: "High Risk",
    riskBadge: "bg-rose-100 text-rose-800 border-rose-300",
    foundIn: "Sweets, packaged bakery, processed cheeses",
    efsaStatus: "Mandatory EU warning; strict ADI limits",
  },
  {
    eNumber: "E129",
    name: "Allura Red AC",
    category: "Color",
    functionDesc: "Synthetic petroleum-derived red azo dye",
    riskLevel: "High Risk",
    riskBadge: "bg-rose-100 text-rose-800 border-rose-300",
    foundIn: "Candy, flavored gelatin, fruit snacks, soda",
    efsaStatus: "Linked to pediatric neurobehavioral triggers",
  },
  {
    eNumber: "E171",
    name: "Titanium Dioxide",
    category: "Color",
    functionDesc: "Whitening & opacity nanoparticle agent",
    riskLevel: "Critical / Banned",
    riskBadge: "bg-red-200 text-red-900 border-red-400 font-bold",
    foundIn: "Chewing gum, frosted pastries, sauces, tablets",
    efsaStatus: "BANNED IN EU (2022) due to genotoxicity concerns",
  },
  {
    eNumber: "E211",
    name: "Sodium Benzoate",
    category: "Preservative",
    functionDesc: "Antimicrobial & antifungal preservative",
    riskLevel: "Moderate",
    riskBadge: "bg-amber-100 text-amber-800 border-amber-300",
    foundIn: "Carbonated beverages, fruit juices, salad dressings",
    efsaStatus: "ADI 5mg/kg; forms benzene in presence of Vit C",
  },
  {
    eNumber: "E250",
    name: "Sodium Nitrite",
    category: "Preservative",
    functionDesc: "Curing agent, fixative & botulism inhibitor",
    riskLevel: "High Risk",
    riskBadge: "bg-rose-100 text-rose-800 border-rose-300",
    foundIn: "Cured bacon, sausages, hot dogs, cold cuts",
    efsaStatus: "Precursor to carcinogenic N-nitrosamines when cooked",
  },
  {
    eNumber: "E300",
    name: "Ascorbic Acid (Vitamin C)",
    category: "Antioxidant",
    functionDesc: "Naturally occurring antioxidant & dough conditioner",
    riskLevel: "Safe",
    riskBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    foundIn: "Fruit juices, bread, cured meats, dried fruit",
    efsaStatus: "Safe; essential water-soluble human vitamin",
  },
  {
    eNumber: "E320",
    name: "Butylated Hydroxyanisole (BHA)",
    category: "Antioxidant",
    functionDesc: "Synthetic antioxidant preventing lipid rancidity",
    riskLevel: "High Risk",
    riskBadge: "bg-rose-100 text-rose-800 border-rose-300",
    foundIn: "Vegetable oils, potato chips, chewing gum, margarine",
    efsaStatus: "Classified as suspected endocrine disruptor",
  },
  {
    eNumber: "E330",
    name: "Citric Acid",
    category: "Antioxidant",
    functionDesc: "Acidity regulator & natural food chelator",
    riskLevel: "Safe",
    riskBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    foundIn: "Beverages, canned tomatoes, confectionery, jams",
    efsaStatus: "Safe (GRAS); naturally in citrus fruits",
  },
  {
    eNumber: "E433",
    name: "Polysorbate 80",
    category: "Emulsifier",
    functionDesc: "Synthetic surfactant & stabilizer",
    riskLevel: "Moderate",
    riskBadge: "bg-amber-100 text-amber-800 border-amber-300",
    foundIn: "Ice cream, processed dips, industrial baked goods",
    efsaStatus: "Erodes intestinal mucus layer in rodent trials",
  },
  {
    eNumber: "E466",
    name: "Carboxymethylcellulose (CMC)",
    category: "Emulsifier",
    functionDesc: "Synthetic cellulose gum thickener",
    riskLevel: "Moderate",
    riskBadge: "bg-amber-100 text-amber-800 border-amber-300",
    foundIn: "Low-fat dairy, diet dressings, frozen meals",
    efsaStatus: "Linked to gut microbiota dysbiosis & inflammation",
  },
  {
    eNumber: "E621",
    name: "Monosodium Glutamate (MSG)",
    category: "Flavor Enhancer",
    functionDesc: "Sodium salt of glutamic acid producing umami",
    riskLevel: "Moderate",
    riskBadge: "bg-amber-100 text-amber-800 border-amber-300",
    foundIn: "Instant noodles, potato chips, savory bouillon",
    efsaStatus: "Safe at moderate levels; ADI 30 mg/kg body weight",
  },
  {
    eNumber: "E951",
    name: "Aspartame",
    category: "Sweetener",
    functionDesc: "Non-nutritive artificial high-intensity sweetener",
    riskLevel: "Moderate",
    riskBadge: "bg-amber-100 text-amber-800 border-amber-300",
    foundIn: "Diet soda, sugar-free gum, flavored waters",
    efsaStatus: "IARC Group 2B (Possibly Carcinogenic to Humans)",
  },
  {
    eNumber: "E955",
    name: "Sucralose",
    category: "Sweetener",
    functionDesc: "Chlorinated synthetic non-caloric sweetener",
    riskLevel: "Moderate",
    riskBadge: "bg-amber-100 text-amber-800 border-amber-300",
    foundIn: "Protein powders, diet syrups, sugar-free baked goods",
    efsaStatus: "Under active review for gut microbiome disruption",
  },
];

export default function AdditivesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Preservative",
    "Color",
    "Emulsifier",
    "Sweetener",
    "Flavor Enhancer",
    "Antioxidant",
  ];

  const filteredAdditives = useMemo(() => {
    return ADDITIVES_DATA.filter((item) => {
      const matchesSearch =
        item.eNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.functionDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.foundIn.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Additives & E-Numbers", url: "/additives" },
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-20">
        {/* Header Hero */}
        <section className="bg-white border-b border-zinc-200 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-label text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Toxicological Registry • EFSA / FDA Monographs
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-4">
                Food Additives & E-Number Database
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-8">
                Search over 300+ approved and restricted industrial chemicals, synthetic colorants, emulsifiers, and artificial preservatives.
              </p>

              {/* Interactive Search Bar */}
              <div className="relative max-w-xl mb-6">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by E-number (e.g. E102), name (e.g. Tartrazine), or food..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Counter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="flex items-center justify-between mb-4 text-xs text-zinc-500 font-label">
            <span>
              SHOWING {filteredAdditives.length} OF {ADDITIVES_DATA.length} REGISTERED MONOGRAPHS
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-label uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">E-Number</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Function</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Commonly Found In</th>
                  <th className="py-3.5 px-4">Regulatory (EFSA/FDA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {filteredAdditives.map((item) => (
                  <tr key={item.eNumber} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono-code font-bold text-zinc-950">
                      {item.eNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 max-w-xs">
                      {item.functionDesc}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-label ${item.riskBadge}`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 max-w-xs">
                      {item.foundIn}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-zinc-500 font-label">
                      {item.efsaStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Visible on mobile/tablet) */}
          <div className="lg:hidden space-y-4">
            {filteredAdditives.map((item) => (
              <div
                key={item.eNumber}
                className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-extrabold text-base text-zinc-950">
                      {item.eNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-label ${item.riskBadge}`}>
                    {item.riskLevel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-600 mb-3">
                  {item.functionDesc}
                </p>

                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 text-xs space-y-1.5 mb-3">
                  <div>
                    <span className="text-[10px] font-label uppercase text-zinc-400 font-semibold block">
                      Found In:
                    </span>
                    <span className="text-zinc-700">{item.foundIn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-label uppercase text-zinc-400 font-semibold block">
                      Regulatory Status:
                    </span>
                    <span className="text-zinc-600 text-[11px] font-label">{item.efsaStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border border-emerald-200 text-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-headline text-emerald-950">
                Scan a product to check all its additives instantly.
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                Point your mobile camera at any barcode or ingredient list to parse every E-number.
              </p>
            </div>
            <a
              href={siteConfig.scanUrl}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap active:scale-[0.98] transition-all shadow-xs"
            >
              Start Free Scan
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
