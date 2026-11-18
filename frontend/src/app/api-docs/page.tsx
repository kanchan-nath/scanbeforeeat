import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Developer REST API & Bio-Informatics Documentation",
  description:
    "Integrate ScanBeforeEat's deterministic food scoring, NOVA classification, and E-number toxicology engine into your application via REST API.",
  openGraph: {
    title: "Developer REST API | ScanBeforeEat",
    description:
      "Programmatic food ingredient toxicology analysis, E-number parsing, and NOVA classification API.",
  },
  alternates: {
    canonical: "/api-docs",
  },
};

export default function ApiDocsPage() {
  const exampleJson = `{
  "status": "success",
  "engine_version": "2.4.11-PROD",
  "data": {
    "product_name": "Instant Masala Noodles",
    "composite_health_score": 38,
    "nova_classification": {
      "group": 4,
      "tier": "Ultra-Processed Food",
      "markers": ["industrial_extrusion", "synthetic_flavoring", "fractionated_palm_oil"]
    },
    "flagged_additives": [
      {
        "code": "E621",
        "name": "Monosodium Glutamate",
        "category": "Flavor Enhancer",
        "risk_level": "moderate",
        "citations": ["EFSA-Q-2016-00445"]
      },
      {
        "code": "E102",
        "name": "Tartrazine",
        "category": "Synthetic Azo Colorant",
        "risk_level": "high",
        "warning": "May have an adverse effect on activity and attention in children"
      }
    ],
    "deductions": {
      "nova_penalty": -30,
      "toxicology_deductions": -18,
      "nutrient_balance": -14
    }
  }
}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "API Documentation", url: "/api-docs" },
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
                  Developer Hub // REST API v2.4
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-4">
                ScanBeforeEat Developer API
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                Direct programmatic access to our ingredient parsing pipeline, NOVA classification models, and international chemical toxicology database.
              </p>
            </div>
          </div>
        </section>

        {/* API Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          {/* Endpoint Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs mb-10">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-mono-code font-bold text-xs uppercase">
                POST
              </span>
              <code className="text-sm sm:text-base font-bold text-zinc-900 font-mono-code">
                /v2/analyze/ingredients
              </code>
              <span className="text-xs text-zinc-400 font-label">application/json</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 mb-6 leading-relaxed">
              Analyzes raw text ingredient decks or barcode identifiers to return structured toxicology scores, flagged E-numbers, and NOVA-4 processing markers.
            </p>

            {/* Example Response */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <div className="bg-zinc-900 px-4 py-2 text-zinc-400 text-xs font-label flex items-center justify-between border-b border-zinc-800">
                <span>SAMPLE JSON RESPONSE (200 OK)</span>
                <span className="text-emerald-400">LATENCY: 42MS</span>
              </div>
              <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono-code text-xs overflow-x-auto leading-relaxed">
                <code>{exampleJson}</code>
              </pre>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200">
              <span className="font-label text-xs uppercase tracking-wider text-emerald-700 font-bold block mb-1">
                Free Developer Tier
              </span>
              <div className="text-2xl font-extrabold text-zinc-950 font-label mb-2">
                100 req / day
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Designed for indie hackers and developers prototyping clean food applications.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200">
              <span className="font-label text-xs uppercase tracking-wider text-emerald-700 font-bold block mb-1">
                Commercial Scale
              </span>
              <div className="text-2xl font-extrabold text-zinc-950 font-label mb-2">
                Dedicated QPS
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                High-throughput batch ingredient scanning for grocery apps and smart kitchen appliances.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200">
              <span className="font-label text-xs uppercase tracking-wider text-emerald-700 font-bold block mb-1">
                Academic & Labs
              </span>
              <div className="text-2xl font-extrabold text-zinc-950 font-label mb-2">
                Uncapped
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Free high-volume research quotas for universities and public health epidemiologists.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
