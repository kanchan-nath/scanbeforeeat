"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { BlogPost } from "@/content/blog";
import {
  filterAndPaginateBlogPosts,
  type BlogSkinMode,
  type BlogSortOption,
  type SemanticSearchResult,
} from "@/lib/blog-search";

interface BlogExplorerProps {
  initialPosts: BlogPost[];
}

export function BlogExplorer({ initialPosts }: BlogExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [sortBy, setSortBy] = useState<BlogSortOption>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [skinMode, setSkinMode] = useState<BlogSkinMode>("grid");
  const [isManualSkin, setIsManualSkin] = useState(false);

  // Auto-switch to academic list skin when searching unless user manually selected a skin
  useEffect(() => {
    if (!isManualSkin) {
      if (searchQuery.trim().length > 0) {
        setSkinMode("academic");
      } else {
        setSkinMode("grid");
      }
    }
  }, [searchQuery, isManualSkin]);

  // Reset to page 1 whenever search, category, or page size changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: BlogSortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSkinChange = (mode: BlogSkinMode) => {
    setSkinMode(mode);
    setIsManualSkin(true);
  };

  // Perform search, filter, sort, and pagination
  const paginatedResult = useMemo(() => {
    return filterAndPaginateBlogPosts(initialPosts, {
      query: searchQuery,
      category: selectedCategory,
      sortBy,
      page: currentPage,
      pageSize,
    });
  }, [initialPosts, searchQuery, selectedCategory, sortBy, currentPage, pageSize]);

  const { items, totalItems, totalPages, categories, hasPrevPage, hasNextPage } =
    paginatedResult;

  const scrollToTop = () => {
    const el = document.getElementById("blog-explorer-top");
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    scrollToTop();
  };

  return (
    <div id="blog-explorer-top" className="scroll-mt-24">
      {/* Search & Navigation Control Deck */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-4 sm:p-6 mb-10">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search Input + Skin Mode Switcher */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Icon name="search" className="text-lg" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Semantic search: chemicals, additives, gut health, e-numbers..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label="Clear search"
                >
                  <Icon name="close" className="text-base" />
                </button>
              )}
            </div>

            {/* Skin / Template Mode Switcher */}
            <div className="flex items-center gap-1.5 self-end md:self-auto bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80">
              <button
                type="button"
                onClick={() => handleSkinChange("grid")}
                title="Dossier Grid Skin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  skinMode === "grid"
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span>Grid Skin</span>
              </button>
              <button
                type="button"
                onClick={() => handleSkinChange("academic")}
                title="Academic List Skin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  skinMode === "academic"
                    ? "bg-white text-emerald-800 shadow-xs border border-zinc-200/60"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span>Academic List</span>
              </button>
              <button
                type="button"
                onClick={() => handleSkinChange("compact")}
                title="Compact Table Skin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  skinMode === "compact"
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span>Compact Table</span>
              </button>
            </div>
          </div>

          {/* Middle Row: Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-emerald-700 text-emerald-100"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Control Strip: Sort By + Active Filter Telemetry */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as BlogSortOption)}
                className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="relevance">Semantic Relevance</option>
                <option value="newest">Newest Published</option>
                <option value="oldest">Oldest Published</option>
                <option value="readTimeAsc">Read Time: Shortest</option>
                <option value="readTimeDesc">Read Time: Longest</option>
                <option value="title">Title (A–Z)</option>
              </select>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-[11px]">
                  <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="hover:text-emerald-950 ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span>
                Showing{" "}
                <strong className="text-zinc-800 font-semibold">
                  {totalItems === 0
                    ? 0
                    : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                        currentPage * pageSize,
                        totalItems
                      )}`}
                </strong>{" "}
                of <strong className="text-zinc-800 font-semibold">{totalItems}</strong>{" "}
                investigations
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area Rendered According to Skin Mode */}
      {items.length === 0 ? (
        <EmptyState
          query={searchQuery}
          onReset={() => {
            setSearchQuery("");
            setSelectedCategory("All Articles");
            setCurrentPage(1);
          }}
          onQuickSearch={(term) => {
            setSearchQuery(term);
            setCurrentPage(1);
          }}
        />
      ) : skinMode === "grid" ? (
        <DossierGridSkin items={items} searchQuery={searchQuery} />
      ) : skinMode === "academic" ? (
        <AcademicListSkin items={items} searchQuery={searchQuery} />
      ) : (
        <CompactTableSkin items={items} searchQuery={searchQuery} />
      )}

      {/* Pagination Toggle Bar */}
      {totalPages > 1 && (
        <div className="mt-12 bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Telemetry & Per-Page Selector */}
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span>
              Page <strong className="text-zinc-900">{currentPage}</strong> of{" "}
              <strong className="text-zinc-900">{totalPages}</strong>
            </span>
            <span className="text-zinc-300">•</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              {[6, 9, 12].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handlePageSizeChange(sz)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                    pageSize === sz
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!hasPrevPage}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "border border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={!hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Skin A: Research Dossier Grid (Visual 3-column cards)
// -------------------------------------------------------------
function DossierGridSkin({
  items,
  searchQuery,
}: {
  items: SemanticSearchResult[];
  searchQuery: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(({ post, relevancePercentage }) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all duration-200"
        >
          <div>
            {/* Badges Bar */}
            <div className="flex items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-100">
                  {post.category}
                </span>
                <span className="text-zinc-400 text-[11px]">{post.readTime}</span>
              </div>

              {searchQuery && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 text-[10px] font-bold">
                  {relevancePercentage}% Match
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors font-headline mb-3 leading-snug">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-zinc-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          </div>

          <div>
            {/* Tags preview */}
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              {post.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-auto">
              <div>
                <span className="text-xs font-semibold text-zinc-800 block line-clamp-1">
                  {post.author.name}
                </span>
                <span className="text-[10px] text-zinc-400 block line-clamp-1">
                  {post.publishedDate}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                <span>Read Dossier</span>
                <Icon name="arrow_forward" className="text-sm" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// Skin B: Academic List / Journal Skin (Horizontal with context snippet)
// -------------------------------------------------------------
function AcademicListSkin({
  items,
  searchQuery,
}: {
  items: SemanticSearchResult[];
  searchQuery: string;
}) {
  return (
    <div className="space-y-4">
      {items.map(({ post, relevancePercentage, snippet }) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 hover:border-emerald-400 hover:shadow-md transition-all duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              {/* Category, Date & Semantic Match Badge */}
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-100">
                  {post.category}
                </span>
                <span className="text-xs text-zinc-400">{post.publishedDate}</span>
                <span className="text-zinc-300">•</span>
                <span className="text-xs text-zinc-400">{post.readTime}</span>

                {searchQuery && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    {relevancePercentage}% Semantic Match
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors font-headline mb-2 leading-snug">
                {post.title}
              </h3>

              {/* Highlighted context snippet */}
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                <HighlightedText text={snippet} query={searchQuery} />
              </p>

              {/* Author & Review Board */}
              <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                <span className="font-medium text-zinc-800">{post.author.name}</span>
                <span className="text-zinc-300">•</span>
                <span className="text-[11px] text-zinc-500 italic line-clamp-1">
                  {post.reviewBoard}
                </span>
              </div>
            </div>

            {/* Right Action Pill */}
            <div className="md:self-center shrink-0">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-50 group-hover:bg-emerald-50 text-zinc-700 group-hover:text-emerald-800 text-xs font-bold border border-zinc-200/80 group-hover:border-emerald-200 transition-all">
                <span>Read Full Paper</span>
                <Icon name="arrow_forward" className="text-xs" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// Skin C: Compact Scientific Journal Table Skin
// -------------------------------------------------------------
function CompactTableSkin({
  items,
  searchQuery,
}: {
  items: SemanticSearchResult[];
  searchQuery: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider font-label">
            <tr>
              <th className="py-3 px-4">Title & Investigation</th>
              <th className="py-3 px-4">Domain</th>
              <th className="py-3 px-4">Author / Board</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Read Time</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map(({ post, relevancePercentage }) => (
              <tr
                key={post.slug}
                className="hover:bg-emerald-50/40 transition-colors group"
              >
                <td className="py-3.5 px-4 max-w-md">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors block text-sm leading-snug line-clamp-1"
                  >
                    {post.title}
                  </Link>
                  {searchQuery && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      {relevancePercentage}% Match
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium text-[11px]">
                    {post.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 max-w-xs truncate text-zinc-500 text-[11px]">
                  {post.author.name}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                  {post.publishedDate}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 text-[11px]">
                  {post.readTime}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 text-xs"
                  >
                    <span>View</span>
                    <Icon name="arrow_forward" className="text-xs" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Contextual Match Highlighter Helper
// -------------------------------------------------------------
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (tokens.length === 0) {
    return <>{text}</>;
  }

  // Regex pattern matching any of the tokens safely
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <mark
            key={i}
            className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// -------------------------------------------------------------
// Clean Empty State
// -------------------------------------------------------------
function EmptyState({
  query,
  onReset,
  onQuickSearch,
}: {
  query: string;
  onReset: () => void;
  onQuickSearch: (term: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        <Icon name="search" className="text-2xl" />
      </div>
      <h4 className="text-lg font-bold text-zinc-900 mb-2">
        No scientific investigations found
      </h4>
      <p className="text-xs sm:text-sm text-zinc-500 mb-6">
        No articles matched &ldquo;{query}&rdquo; with current filters. Try searching for related biological mechanisms, chemical names, or E-numbers.
      </p>

      <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
        {["carrageenan", "gut inflammation", "microplastics", "titanium dioxide", "e-numbers"].map(
          (suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onQuickSearch(suggestion)}
              className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 text-zinc-600 text-xs font-medium transition-colors"
            >
              {suggestion}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
      >
        Reset Filters & Show All
      </button>
    </div>
  );
}
