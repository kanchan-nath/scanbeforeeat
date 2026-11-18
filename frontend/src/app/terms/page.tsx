import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Terms of Service & Medical Disclaimer",
  description:
    "Review the Terms of Service for ScanBeforeEat. Learn about our informational non-medical scope, fair usage, and algorithmic guarantees.",
  openGraph: {
    title: "Terms of Service | ScanBeforeEat",
    description: "Terms of Service and non-medical informational disclaimer for ScanBeforeEat.",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Terms of Service", url: "/terms" },
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-20">
        <section className="bg-white border-b border-zinc-200 py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="font-label text-xs uppercase tracking-wider text-emerald-700 font-bold">
              Legal Transparency
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-headline mt-2 mb-3">
              Terms of Service
            </h1>
            <p className="text-xs text-zinc-500 font-label">
              LAST REVISED: MARCH 2025 • EFFECTIVE IMMEDIATELY
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-zinc-200 shadow-xs text-zinc-700 text-xs sm:text-sm leading-relaxed space-y-6">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
              <strong>Medical Disclaimer:</strong> ScanBeforeEat provides informational analysis derived from published food science literature, EFSA/FDA databases, and packaging labels. It does not provide medical diagnosis, clinical treatment advice, or allergen guarantees. Always consult a qualified physician or registered dietitian for medical dietary decisions.
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the ScanBeforeEat application, website, or APIs, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                2. Non-Commercial Personal Use & Quota Limits
              </h2>
              <p>
                Free tier accounts are entitled to 15 free scans per month for personal grocery checking. Paid plans (Monthly Pro ₹199/mo, 6-Month Saver ₹499, and Annual Pro ₹999) provide 99 scans per period. Automated scraping, mass querying, or commercial reverse-engineering of our scoring index without explicit written consent is strictly prohibited.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                3. Label Accuracy & Data Limitations
              </h2>
              <p>
                Product formulations, factory cross-contamination risks, and packaging labels change frequently without notice. While our parsing algorithms achieve high empirical precision, ScanBeforeEat cannot guarantee that manufacturer ingredient disclosures are complete or free from manufacturing alterations.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                4. Governing Law & Inquiries
              </h2>
              <p>
                These terms are governed by applicable international consumer protection laws. For legal questions, email{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-emerald-700 underline font-semibold">
                  {siteConfig.contactEmail}
                </a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
