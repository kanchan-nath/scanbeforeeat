import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Privacy Policy — Zero Behavioral Tracking Guarantee",
  description:
    "Review the ScanBeforeEat Privacy Policy. We do not sell your personal data, track your location, or profile your grocery purchases for advertisers.",
  openGraph: {
    title: "Privacy Policy | ScanBeforeEat",
    description: "Our privacy commitment: zero behavioral tracking and full GDPR compliance.",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
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
              Privacy Policy
            </h1>
            <p className="text-xs text-zinc-500 font-label">
              LAST REVISED: MARCH 2025 • EFFECTIVE IMMEDIATELY
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-zinc-200 shadow-xs prose prose-zinc max-w-none text-zinc-700 text-xs sm:text-sm leading-relaxed space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
              <strong>Core Privacy Pledge:</strong> ScanBeforeEat does not sell, rent, or monetize your food scan logs, allergen preferences, or health queries to advertisers, insurance providers, or data brokers.
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                1. Information We Collect
              </h2>
              <p>
                We only collect data necessary to provide barcode lookups and ingredient toxicological scoring:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Barcode Lookups & OCR Text:</strong> Scanned barcodes (e.g., UPC/EAN) or uploaded packaging text. Packaging images are processed ephemerally in RAM and immediately wiped.
                </li>
                <li>
                  <strong>Account Credentials:</strong> If you choose to create an account, we store your email address and authentication hashes. No password is ever stored in plaintext.
                </li>
                <li>
                  <strong>Anonymized Telemetry:</strong> Technical diagnostics (error rates, response times) to ensure uptime and scoring reliability.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                2. How We Use Your Data
              </h2>
              <p>
                Data is strictly used to return food safety scores, evaluate chemical hazards, alert you to configured allergens, and improve parsing accuracy. We do not engage in cross-site tracking or behavioral advertising profiling.
              </p>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                3. Your Rights Under GDPR & CCPA
              </h2>
              <p>
                Regardless of your geographic location, you retain complete sovereignty over your data:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Right to access and export your scan logs in JSON format at any time.</li>
                <li>Right to immediate account and scan deletion upon request.</li>
                <li>Right to revoke consent for any non-essential processing.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-headline mb-2">
                4. Contact Our Data Protection Officer
              </h2>
              <p>
                For questions regarding data architecture or privacy inquiries, contact our Data Protection Officer directly at{" "}
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
