import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Clinical Studies, Food Toxicology & Research Library",
  description:
    "Peer-reviewed scientific studies, clinical trials, and epidemiological research on ultra-processed foods, emulsifiers, artificial sweeteners, and metabolic health.",
  openGraph: {
    title: "Clinical Studies & Food Toxicology Library | ScanBeforeEat",
    description:
      "Explore peer-reviewed publications from BMJ, Lancet, Nature, and Cell on food additives and metabolic disease.",
  },
  alternates: {
    canonical: "/studies",
  },
};

export default function StudiesPage() {
  const landmarkStudies = [
    {
      journal: "The British Medical Journal (BMJ)",
      year: "2024",
      doi: "10.1136/bmj-2023-077310",
      title: "Ultra-Processed Food Exposure and Adverse Health Outcomes: Umbrella Review of Epidemiological Meta-Analyses",
      authors: "Lane et al. • Deakin University & Johns Hopkins Bloomberg School",
      cohort: "n = 9,888,373 participants across 45 pooled meta-analyses",
      findings: "Direct evidence linking high ultra-processed food exposure to 32 health parameters, including type 2 diabetes, cardiovascular disease-related mortality, and anxiety disorders.",
      evidenceGrade: "Class I / High-Fidelity",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      journal: "Nature",
      year: "2015 / 2022 Re-Analysis",
      doi: "10.1038/nature14232",
      title: "Dietary Emulsifiers Impact the Mouse Gut Microbiota Promoting Colitis and Metabolic Syndrome",
      authors: "Chassaing, Gewirtz et al. • Georgia State University & INSERM",
      cohort: "Controlled in vivo model + human intestinal mucosal biopsies",
      findings: "Synthetic emulsifiers Polysorbate 80 and Carboxymethylcellulose strip the protective intestinal mucus layer, driving mucosal bacterial encroachment and low-grade inflammation.",
      evidenceGrade: "Causal Mechanistic",
      badge: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      journal: "Cell",
      year: "2022",
      doi: "10.1016/j.cell.2022.07.016",
      title: "Personalized Microbiome-Dependent Effects of Non-Nutritive Sweeteners on Human Glucose Tolerance",
      authors: "Suez, Elinav et al. • Weizmann Institute of Science",
      cohort: "n = 120 healthy adults (double-blind randomized controlled trial)",
      findings: "Saccharin and sucralose causally impair glycemic responses in healthy human subjects via individualized alterations in microbial taxonomy and stool metabolomic pathways.",
      evidenceGrade: "Human RCT",
      badge: "bg-purple-100 text-purple-800 border-purple-300",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Studies & Papers", url: "/studies" },
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-20">
        {/* Header Hero */}
        <section className="bg-white border-b border-zinc-200 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-label text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Open Science Repository • PubMed & DOIs
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-5 leading-[1.12]">
                Food Toxicology Studies & Clinical Research Library
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                ScanBeforeEat scores are grounded in clinical literature. Review the landmark prospective cohort studies, randomized human trials, and toxicological monographs that dictate our algorithm weights.
              </p>
            </div>
          </div>
        </section>

        {/* Landmark Studies */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
              Primary Evidence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
              Landmark Peer-Reviewed Publications
            </h2>
          </div>

          <div className="space-y-6 mb-16">
            {landmarkStudies.map((study, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-xs font-headline">
                      {study.journal}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500 font-label">{study.year}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border font-label ${study.badge}`}>
                    {study.evidenceGrade}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 font-headline mb-3 leading-snug">
                  {study.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                  <strong className="text-zinc-900">Findings: </strong>
                  {study.findings}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-[10px] font-label uppercase tracking-wider text-zinc-400 block">
                      Lead Authors & Institution
                    </span>
                    <span className="text-zinc-700">{study.authors}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-label uppercase tracking-wider text-zinc-400 block">
                      Cohort Size / Scope
                    </span>
                    <span className="text-zinc-700 font-mono-code">{study.cohort}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                  <span className="font-label text-zinc-400">
                    DOI: <code className="text-zinc-600">{study.doi}</code>
                  </span>
                  <a
                    href={`https://doi.org/${study.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>View PubMed Publication</span>
                    <Icon name="open_in_new" className="text-sm" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Inquiries Box */}
          <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 rounded-2xl p-8 sm:p-12 text-zinc-900 border border-emerald-200 shadow-sm">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-label text-xs uppercase tracking-wider font-semibold">
                Open Science & Collaboration
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-headline mt-4 mb-3 text-zinc-950">
                Are you a Food Scientist or Academic Researcher?
              </h3>
              <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                ScanBeforeEat provides open API access and anonymized food additive telemetry to university laboratories, public health institutions, and clinical researchers examining ultra-processed food consumption.
              </p>
              <a
                href={`mailto:${siteConfig.contactEmail}?subject=Academic%20Research%20Collaboration`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-[0.98] shadow-xs"
              >
                <Icon name="mail" className="text-base" />
                <span>Contact Research Team</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
