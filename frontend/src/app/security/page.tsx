import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Security, Privacy & Data Architecture",
  description:
    "Explore the security and encryption architecture of ScanBeforeEat. Zero health profiling, ephemeral image OCR, and cryptographic data guarantees.",
  openGraph: {
    title: "Security, Privacy & Data Architecture | ScanBeforeEat",
    description:
      "Explore the security architecture of ScanBeforeEat: zero health profiling, encrypted pipeline, and ephemeral OCR.",
  },
  alternates: {
    canonical: "/security",
  },
};

export default function SecurityPage() {
  const principles = [
    {
      icon: "person_off",
      title: "Zero Personal Health Profiling",
      desc: "We do not construct behavioral health profiles, commercial shopping habits dossiers, or sell grocery telemetry to third-party data brokers or life insurers.",
    },
    {
      icon: "memory",
      title: "Local-First & Ephemeral OCR",
      desc: "Barcode decoding occurs on-device in WebAssembly whenever feasible. Raw camera label photographs are processed ephemerally in RAM and wiped within milliseconds.",
    },
    {
      icon: "verified_user",
      title: "Deterministic Engine Integrity",
      desc: "Our scoring calculations are deterministic and mathematical. Each algorithm release is cryptographically signed and SHA-256 version-pinned.",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Security Architecture", url: "/security" },
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
                  Security Specification • Zero Commercial Profiling
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-5 leading-[1.12]">
                Security, Privacy & Data Architecture
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                Trust is the bedrock of consumer health applications. ScanBeforeEat treats food scans as sensitive health context: fully encrypted, non-monetized, and strictly isolated.
              </p>
            </div>
          </div>
        </section>

        {/* Principles */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {principles.map((p, i) => (
              <div
                key={i}
                className="bg-white p-7 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                    <Icon name={p.icon} className="text-xl" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-950 font-headline mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Specs */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-zinc-200 shadow-xs mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 font-headline mb-6">
              Technical Architecture & Data Pipeline
            </h2>

            <div className="space-y-6 text-xs sm:text-sm text-zinc-700">
              <div className="border-b border-zinc-100 pb-5">
                <h4 className="font-bold text-zinc-900 text-sm mb-1">
                  1. Encryption in Transit & At Rest
                </h4>
                <p className="text-zinc-600 leading-relaxed">
                  All HTTP traffic terminates with TLS 1.3 encryption with strict forward secrecy (HSTS enabled). User databases utilize AES-256-GCM encryption at rest with isolated tenant partitions.
                </p>
              </div>

              <div className="border-b border-zinc-100 pb-5">
                <h4 className="font-bold text-zinc-900 text-sm mb-1">
                  2. Ephemeral In-Memory OCR Processing
                </h4>
                <p className="text-zinc-600 leading-relaxed">
                  Packaging photos uploaded for text recognition are parsed in secure memory containers. Images are never archived or fed to public third-party vision models without anonymization.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">
                  3. Zero Advertising Identifiers (IDFA / GAID)
                </h4>
                <p className="text-zinc-600 leading-relaxed">
                  ScanBeforeEat contains zero Facebook Pixel, Google AdSense, or third-party behavioral telemetry SDKs. The app functions completely without tracking your browsing outside our service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
