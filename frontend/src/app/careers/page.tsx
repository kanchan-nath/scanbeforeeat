import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Careers & Open Roles — Join Our Scientific Team",
  description:
    "Join the ScanBeforeEat engineering, toxicology, and food research team. Build open food defense software that empowers millions of shoppers worldwide.",
  openGraph: {
    title: "Careers & Open Roles | ScanBeforeEat",
    description:
      "Help build the world's most transparent food intelligence platform. Remote-first, mission-driven.",
  },
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersPage() {
  const roles = [
    {
      title: "Senior Full-Stack Engineer",
      dept: "Engineering // Core Systems",
      location: "Remote (Global)",
      type: "Full-Time",
      desc: "Architect deterministic ingredient parsing pipelines, computer vision barcode decoders, and high-performance offline PWA experiences.",
    },
    {
      title: "Nutrition Science Researcher",
      dept: "Science // Toxicology",
      location: "Remote (EU/US/APAC)",
      type: "Full-Time / Fellow",
      desc: "Curate peer-reviewed literature, expand our 300+ E-number toxicological monograph database, and collaborate with university clinical laboratories.",
    },
    {
      title: "Product Designer (Mobile UX)",
      dept: "Design // Experience",
      location: "Remote (Global)",
      type: "Full-Time",
      desc: "Craft lightning-fast, high-contrast mobile scanning interfaces that make deep biochemistry comprehensible to busy grocery shoppers in under 2 seconds.",
    },
    {
      title: "Content Writer (Food Science)",
      dept: "Editorial // Advocacy",
      location: "Remote (Global)",
      type: "Part-Time / Contract",
      desc: "Transform complex clinical trials, EFSA regulatory rulings, and public health data into accessible, high-impact investigative dossiers for consumers.",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Careers", url: "/careers" },
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
                  We Are Hiring • Remote-First
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-5 leading-[1.12]">
                Join the Mission
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                We are building the technical infrastructure to dismantle food industry deception. Work alongside toxicologists, systems architects, and consumer advocates.
              </p>
            </div>
          </div>
        </section>

        {/* Culture Values */}
        <section className="py-12 bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
                <Icon name="flag" className="text-emerald-600 text-2xl mb-3" />
                <h3 className="font-bold text-zinc-950 text-base mb-2 font-headline">
                  Mission-Driven
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Every line of code and research paper we write directly protects families from deceptive food formulations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
                <Icon name="public" className="text-emerald-600 text-2xl mb-3" />
                <h3 className="font-bold text-zinc-950 text-base mb-2 font-headline">
                  Remote-First & Async
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We value deep work over endless meetings. Autonomy, trust, and clear written communication define our rhythm.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
                <Icon name="terminal" className="text-emerald-600 text-2xl mb-3" />
                <h3 className="font-bold text-zinc-950 text-base mb-2 font-headline">
                  Open Source Spirit
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We contribute back to nutritional research datasets, open ingredient schemas, and public toxicology repositories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-label uppercase tracking-wider text-emerald-700 font-bold">
              Current Openings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-headline mt-1 tracking-tight">
              Open Positions
            </h2>
          </div>

          <div className="space-y-4 mb-16">
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-zinc-300 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold font-label">
                      {role.dept}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {role.location}
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {role.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-950 font-headline mb-2">
                    {role.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                    {role.desc}
                  </p>
                </div>

                <div className="shrink-0">
                  <a
                    href={`mailto:careers@scanbeforeeat.com?subject=Application:%20${encodeURIComponent(role.title)}`}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Apply Now</span>
                    <Icon name="arrow_forward" className="text-sm" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* General Inquiries */}
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center max-w-xl mx-auto shadow-xs">
            <h3 className="text-lg font-bold text-zinc-950 font-headline mb-2">
              Don&apos;t see your role? Send us your story.
            </h3>
            <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
              We are always excited to connect with exceptional engineers, biochemists, and consumer advocates who care about food integrity.
            </p>
            <a
              href="mailto:careers@scanbeforeeat.com?subject=General%20Application%20/%20Inquiry"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Email careers@scanbeforeeat.com</span>
              <Icon name="mail" className="text-sm" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
