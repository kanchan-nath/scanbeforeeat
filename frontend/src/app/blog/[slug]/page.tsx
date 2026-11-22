import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAllBlogPosts, getBlogPostBySlug } from "@/content/blog";
import { siteConfig } from "@/lib/config";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;

  return {
    title: `${post.title} | ScanBeforeEat`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedDate,
      authors: [post.author.name],
      tags: post.tags,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

function renderInlineMarkdown(text: string) {
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const elements: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }
    const [, , linkText, linkUrl, boldText, italicText, codeText] = match;
    if (linkText && linkUrl) {
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");
      if (isInternal) {
        elements.push(
          <Link
            key={match.index}
            href={linkUrl}
            className="text-emerald-700 font-semibold underline underline-offset-2 hover:text-emerald-800 transition-colors"
          >
            {linkText}
          </Link>
        );
      } else {
        elements.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold underline underline-offset-2 hover:text-emerald-800 transition-colors inline-flex items-center gap-0.5"
          >
            <span>{linkText}</span>
            <span className="text-[10px] text-zinc-400">↗</span>
          </a>
        );
      }
    } else if (boldText) {
      elements.push(
        <strong key={match.index} className="font-bold text-zinc-950">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      elements.push(<em key={match.index}>{italicText}</em>);
    } else if (codeText) {
      elements.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">
          {codeText}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        publishedDate={post.publishedDate}
        modifiedDate={post.updatedDate ?? post.publishedDate}
        authorName={post.author.name}
        url={`/blog/${post.slug}`}
      />

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Breadcrumb Nav */}
        <div className="border-b border-zinc-100 bg-zinc-50/60 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs text-zinc-500 font-label">
              <Link href="/" className="hover:text-zinc-900 transition-colors">
                HOME
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-zinc-900 transition-colors">
                BLOG
              </Link>
              <span>/</span>
              <span className="text-zinc-900 font-semibold truncate max-w-xs sm:max-w-md">
                {post.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Article Header Hero */}
        <header className="border-b border-zinc-200 py-10 sm:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold font-label">
                {post.category}
              </span>
              <span className="text-xs text-zinc-400 font-medium">{post.readTime}</span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs text-zinc-400 font-medium">
                Published {post.publishedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight font-headline mb-6 leading-[1.15]">
              {post.title}
            </h1>

            <p className="text-base sm:text-xl text-zinc-600 leading-relaxed font-body mb-8">
              {post.subtitle || post.excerpt}
            </p>

            {/* Author & Advisory Board Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm font-label shrink-0">
                  {post.author.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-950 font-headline">
                    {post.author.name}
                  </div>
                  <div className="text-xs text-zinc-500 leading-tight">
                    {post.author.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-600">
                <Icon name="verified" className="text-emerald-600 text-base" />
                <span className="text-[11px] font-medium">
                  {post.reviewBoard}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Article Layout Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Sidebar Table of Contents (Sticky on Desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 bg-zinc-50 p-5 rounded-xl border border-zinc-200">
                <div className="text-xs font-label uppercase tracking-wider text-zinc-500 font-bold mb-4 flex items-center gap-2">
                  <Icon name="format_list_bulleted" className="text-sm" />
                  <span>Table of Contents</span>
                </div>
                {post.tableOfContents && post.tableOfContents.length > 0 ? (
                  <nav className="space-y-2">
                    {post.tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-xs text-zinc-600 hover:text-emerald-700 hover:font-medium transition-colors leading-relaxed"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <div className="text-xs text-zinc-400">Full analysis below</div>
                )}

                <div className="mt-8 pt-6 border-t border-zinc-200">
                  <div className="text-[11px] font-label uppercase tracking-wider text-zinc-500 mb-2">
                    Verify Your Food
                  </div>
                  <p className="text-xs text-zinc-600 mb-3">
                    Scan packaging or ingredients directly in your browser.
                  </p>
                  <a
                    href={siteConfig.scanUrl}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Icon name="photo_camera" className="text-sm" />
                    <span>Start Free Scan</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Article Content */}
            <article className="lg:col-span-9 max-w-3xl">
              {/* Formatted Content */}
              <div className="prose prose-zinc max-w-none text-zinc-800 leading-relaxed font-body">
                {post.content
                  .replace(/\n(##+\s)/g, "\n\n$1")
                  .replace(/\n(---)/g, "\n\n$1")
                  .split("\n\n")
                  .map((block, idx) => {
                    const trimmed = block.trim();
                    if (!trimmed) return null;

                    if (trimmed.startsWith("## ")) {
                      const titleText = trimmed.replace("## ", "");
                      const id = titleText
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      return (
                        <h2
                          key={idx}
                          id={id}
                          className="text-2xl sm:text-3xl font-bold text-zinc-950 font-headline mt-10 mb-4 pt-4 border-t border-zinc-100 first:border-t-0 first:pt-0"
                        >
                          {titleText}
                        </h2>
                      );
                    }

                    if (trimmed.startsWith("### ")) {
                      const [headingLine, ...restLines] = trimmed.split("\n");
                      const headingText = headingLine.replace("### ", "");
                      const remainingText = restLines.join("\n").trim();
                      return (
                        <div key={idx} className="mt-8 mb-4">
                          <h3 className="text-xl font-bold text-zinc-950 font-headline mb-3">
                            {renderInlineMarkdown(headingText)}
                          </h3>
                          {remainingText && (
                            <p className="text-sm sm:text-base leading-relaxed my-3 text-zinc-700">
                              {renderInlineMarkdown(remainingText)}
                            </p>
                          )}
                        </div>
                      );
                    }

                    if (trimmed.startsWith("- ")) {
                      const items = trimmed.split("\n- ").map((item) => item.replace(/^- /, ""));
                      return (
                        <ul key={idx} className="list-disc pl-6 space-y-2 my-4 text-sm sm:text-base">
                          {items.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {renderInlineMarkdown(item)}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (trimmed.startsWith("---")) {
                      return <hr key={idx} className="my-8 border-zinc-200" />;
                    }

                    return (
                      <p key={idx} className="text-sm sm:text-base leading-relaxed my-4 text-zinc-700">
                        {renderInlineMarkdown(trimmed)}
                      </p>
                    );
                  })}
              </div>

              {/* Tags Section */}
              <div className="mt-12 pt-6 border-t border-zinc-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-label text-zinc-400 uppercase tracking-wider font-semibold">
                    Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scan Callout Banner */}
              <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 text-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-200 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold font-headline mb-1 text-emerald-950">
                    Scan any food for additives now.
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600">
                    15 free scans per month. Real scientific analysis with zero marketing bias.
                  </p>
                </div>
                <a
                  href={siteConfig.scanUrl}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-md active:scale-[0.98]"
                >
                  <Icon name="photo_camera" className="text-base" />
                  <span>Start Free Scan</span>
                </a>
              </div>

              {/* Related Articles */}
              {relatedPosts.length > 0 && (
                <div className="mt-16 pt-10 border-t border-zinc-200">
                  <h3 className="text-xl font-bold text-zinc-950 font-headline mb-6">
                    Related Scientific Analyses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedPosts.map((rPost) => (
                      <Link
                        key={rPost.slug}
                        href={`/blog/${rPost.slug}`}
                        className="group bg-zinc-50 hover:bg-white rounded-xl border border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:shadow-sm"
                      >
                        <span className="text-[11px] font-label text-emerald-700 font-semibold uppercase">
                          {rPost.category}
                        </span>
                        <h4 className="text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors font-headline mt-1 mb-2 line-clamp-2">
                          {rPost.title}
                        </h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {rPost.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
