import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAllBlogPosts, getFeaturedPost } from "@/content/blog";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Food Science, Additives & Nutrition Research Blog",
  description:
    "Investigative research on ultra-processed foods, hazardous food additives, E-numbers, and evidence-based nutrition science from the ScanBeforeEat scientific team.",
  openGraph: {
    title: "Food Science, Additives & Nutrition Research Blog | ScanBeforeEat",
    description:
      "Investigative research on ultra-processed foods, hazardous additives, and food toxicology.",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const featured = getFeaturedPost();
  const remainingPosts = posts.filter((p) => p.slug !== featured.slug);

  const categories = [
    "All Articles",
    "Ultra-Processed Foods",
    "Food Additives",
    "Toxicology",
    "Scientific Research",
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-20">
        {/* Blog Header Hero */}
        <section className="bg-white border-b border-zinc-200 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-label text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Scientific Research & Investigations
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-4">
                ScanBeforeEat Blog
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
                Peer-reviewed toxicology breakdowns, food additive exposés, and rigorous nutritional science to help you cut through industrial marketing.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-8 pb-2 scrollbar-none">
              {categories.map((cat, idx) => (
                <span
                  key={cat}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    idx === 0
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
          {/* Featured Post Card */}
          {featured && (
            <div className="mb-14">
              <div className="text-xs font-label uppercase tracking-wider text-zinc-400 font-semibold mb-3">
                Featured Investigation
              </div>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold font-label">
                          {featured.category}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {featured.readTime}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {featured.publishedDate}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 group-hover:text-emerald-700 transition-colors font-headline mb-4 leading-tight">
                        {featured.title}
                      </h2>

                      <p className="text-zinc-600 text-sm sm:text-base leading-relaxed mb-6">
                        {featured.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-5 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs font-label">
                          AT
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">
                            {featured.author.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1">
                            {featured.author.role}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                        <span>Read Full Paper</span>
                        <Icon name="arrow_forward" className="text-sm" />
                      </span>
                    </div>
                  </div>

                  {/* Visual Graphic Right Column */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-8 sm:p-10 flex flex-col justify-between text-white border-t lg:border-t-0 lg:border-l border-zinc-200">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-label uppercase tracking-widest font-semibold border border-emerald-500/30">
                        Peer-Reviewed Study
                      </span>
                      <div className="mt-6 text-sm text-zinc-300 font-mono-code leading-relaxed">
                        &quot;Common synthetic emulsifiers disrupt the intestinal mucus barrier, predisposing toward systemic metabolic dysregulation.&quot;
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs font-label text-zinc-400">
                      <span>CITATIONS: 42 PAPERS</span>
                      <span className="text-emerald-400 font-semibold">NOVA-4 LABS</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Recent Articles Grid */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-zinc-950 font-headline mb-6">
              Recent Articles & Field Guides
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold text-[11px]">
                        {post.category}
                      </span>
                      <span className="text-zinc-400">{post.readTime}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-zinc-400">{post.publishedDate}</span>
                    </div>

                    <h4 className="text-lg font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors font-headline mb-3 leading-snug">
                      {post.title}
                    </h4>

                    <p className="text-zinc-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
                    <span className="text-xs font-semibold text-zinc-700">
                      {post.author.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      <span>Read</span>
                      <Icon name="arrow_forward" className="text-sm" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="bg-gradient-to-b from-white via-emerald-50/40 to-emerald-50/70 rounded-2xl p-8 sm:p-12 text-zinc-900 text-center border border-emerald-200/80 shadow-sm">
            <div className="max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-label text-xs uppercase tracking-wider font-semibold">
                Weekly Food Science Dossier
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-headline mt-4 mb-3 text-zinc-950">
                Stay ahead of the ingredient curve.
              </h3>
              <p className="text-sm text-zinc-600 mb-6">
                Direct toxicological reviews, new E-number bans, and grocery alert digests delivered to your inbox every Thursday.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="px-4 py-2.5 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
                />
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-[0.98] shadow-xs"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
