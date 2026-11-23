import type { BlogPost } from "@/content/blog";

export type BlogSkinMode = "grid" | "academic" | "compact";

export type BlogSortOption =
  | "relevance"
  | "newest"
  | "oldest"
  | "readTimeAsc"
  | "readTimeDesc"
  | "title";

export interface SemanticSearchResult {
  post: BlogPost;
  score: number; // 0 to 1
  relevancePercentage: number; // e.g. 98%
  matchedTerms: string[];
  snippet: string;
}

export interface BlogFilterOptions {
  query?: string;
  category?: string;
  sortBy?: BlogSortOption;
  page?: number;
  pageSize?: number;
}

export interface PaginatedBlogResult {
  items: SemanticSearchResult[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  categories: { name: string; count: number }[];
}

// Domain-specific semantic ontology for food toxicology & additive science
const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  gut: ["mucosa", "microbiome", "intestinal", "colon", "permeability", "leaky", "barrier", "epithelial", "colitis", "ulcer"],
  inflammation: ["inflammatory", "ulceration", "cytokines", "nf-kb", "reactive", "oxidative", "permeability", "erosion"],
  cancer: ["carcinogen", "carcinogenic", "tumor", "neoplasm", "genotoxicity", "dna damage", "malignant", "iarc", "leukemia"],
  sweetener: ["sweeteners", "sucralose", "aspartame", "saccharin", "e955", "zero-calorie", "nns", "glycemic", "insulin"],
  emulsifier: ["emulsifiers", "carrageenan", "polysorbate", "lecithin", "e407", "e433", "hydrocolloid", "stabilizer", "texturizer"],
  plastics: ["microplastics", "nanoplastics", "polymers", "pet", "polypropylene", "packaging", "endocytosis", "particles"],
  pfas: ["forever chemicals", "fluorinated", "ptfe", "teflon", "wrappers", "grease-resistant", "bioaccumulation"],
  preservatives: ["benzoate", "e211", "benzene", "sulfites", "nitrites", "sorbate", "antimicrobial"],
  dyes: ["colorings", "red 40", "allura red", "e129", "yellow 5", "tartrazine", "hyperactivity", "azo dye", "southampton"],
  bread: ["potassium bromate", "e924", "flour", "dough", "bakery", "gluten"],
  oils: ["seed oils", "linoleic", "pufa", "oxidation", "aldehydes", "4-hne", "lipid peroxidation", "frying"],
  upf: ["ultra-processed", "nova", "nova-4", "industrial", "hyper-palatable", "formulations", "extrusion"],
  dna: ["genotoxic", "genotoxicity", "mutagen", "strand breaks", "chromosomal", "nanoparticles", "titanium dioxide", "e171"],
  regulation: ["fda", "efsa", "banned", "gras", "precautionary", "permitted", "threshold", "toxicology"],
};

/**
 * Tokenize a string into cleaned lower-case terms (ignoring punctuation).
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Expand a user query with semantic synonyms from the food science domain.
 */
function expandSemanticQuery(query: string): { originalTokens: string[]; expandedTokens: string[] } {
  const originalTokens = tokenize(query);
  const expandedSet = new Set<string>();

  for (const token of originalTokens) {
    expandedSet.add(token);
    for (const [key, synonyms] of Object.entries(SEMANTIC_SYNONYMS)) {
      if (token === key || key.includes(token) || token.includes(key)) {
        synonyms.forEach((s) => expandedSet.add(s));
      } else if (synonyms.some((s) => s === token || s.includes(token))) {
        expandedSet.add(key);
        synonyms.forEach((s) => expandedSet.add(s));
      }
    }
  }

  return {
    originalTokens,
    expandedTokens: Array.from(expandedSet),
  };
}

/**
 * Clean markdown symbols for display snippets.
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/#+\s+/g, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[-*]\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract an informative contextual snippet matching the search query terms.
 */
function extractSnippet(post: BlogPost, tokens: string[]): string {
  if (tokens.length === 0) {
    return post.excerpt;
  }

  const rawParagraphs = post.content.split(/\n\s*\n/);
  let bestSentence = "";
  let maxMatches = 0;

  for (const para of rawParagraphs) {
    const cleaned = cleanMarkdown(para);
    if (cleaned.length < 30) continue;

    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if (sentence.length < 25) continue;
      const lower = sentence.toLowerCase();
      let matchCount = 0;
      for (const t of tokens) {
        if (lower.includes(t)) matchCount++;
      }
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestSentence = sentence;
      }
    }
  }

  if (bestSentence && maxMatches > 0) {
    return bestSentence.length > 200 ? `${bestSentence.slice(0, 197)}...` : bestSentence;
  }

  return post.excerpt;
}

/**
 * Computes semantic relevance score between a post and a query (0 to 1.0).
 */
export function scorePostSemantic(
  post: BlogPost,
  query: string
): { score: number; relevancePercentage: number; matchedTerms: string[]; snippet: string } {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      score: 1.0,
      relevancePercentage: 100,
      matchedTerms: [],
      snippet: post.excerpt,
    };
  }

  const { originalTokens, expandedTokens } = expandSemanticQuery(trimmed);
  const titleLower = post.title.toLowerCase();
  const subtitleLower = post.subtitle.toLowerCase();
  const excerptLower = post.excerpt.toLowerCase();
  const categoryLower = post.category.toLowerCase();
  const tagsLower = post.tags.map((t) => t.toLowerCase());
  const contentLower = post.content.toLowerCase();

  let score = 0;
  const matchedTermsSet = new Set<string>();

  // Full exact phrase bonus
  const fullQuery = trimmed.toLowerCase();
  if (titleLower.includes(fullQuery)) {
    score += 40;
    matchedTermsSet.add(fullQuery);
  } else if (excerptLower.includes(fullQuery)) {
    score += 25;
    matchedTermsSet.add(fullQuery);
  }

  // Exact original token matching
  for (const token of originalTokens) {
    let matched = false;
    if (titleLower.includes(token)) {
      score += 20;
      matched = true;
    }
    if (subtitleLower.includes(token)) {
      score += 12;
      matched = true;
    }
    if (tagsLower.some((tag) => tag.includes(token))) {
      score += 15;
      matched = true;
    }
    if (categoryLower.includes(token)) {
      score += 10;
      matched = true;
    }
    if (excerptLower.includes(token)) {
      score += 8;
      matched = true;
    }
    if (contentLower.includes(token)) {
      score += 4;
      matched = true;
    }
    if (matched) {
      matchedTermsSet.add(token);
    }
  }

  // Semantic expanded synonym matching
  for (const expanded of expandedTokens) {
    if (originalTokens.includes(expanded)) continue;
    let semanticMatch = false;
    if (titleLower.includes(expanded)) {
      score += 7;
      semanticMatch = true;
    }
    if (tagsLower.some((t) => t.includes(expanded))) {
      score += 6;
      semanticMatch = true;
    }
    if (excerptLower.includes(expanded)) {
      score += 4;
      semanticMatch = true;
    }
    if (contentLower.includes(expanded)) {
      score += 2;
      semanticMatch = true;
    }
    if (semanticMatch) {
      matchedTermsSet.add(expanded);
    }
  }

  // Normalize score between 0 and 1
  const normalized = Math.min(1.0, score / 60);
  const relevancePercentage = Math.round(
    score > 0 ? Math.min(99, Math.max(65, 65 + normalized * 34)) : 0
  );

  const matchedTerms = Array.from(matchedTermsSet);
  const snippet = extractSnippet(post, originalTokens.concat(matchedTerms));

  return {
    score: normalized,
    relevancePercentage,
    matchedTerms,
    snippet,
  };
}

/**
 * Filter, search, sort, and paginate the blog posts corpus.
 */
export function filterAndPaginateBlogPosts(
  allPosts: BlogPost[],
  options: BlogFilterOptions = {}
): PaginatedBlogResult {
  const {
    query = "",
    category = "All Articles",
    sortBy = "relevance",
    page = 1,
    pageSize = 6,
  } = options;

  // Build category count index before category filtering
  const categoryCounts: Record<string, number> = {
    "All Articles": allPosts.length,
  };
  for (const post of allPosts) {
    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
  }
  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // Filter by category
  let candidatePosts = allPosts;
  if (category && category !== "All Articles") {
    candidatePosts = candidatePosts.filter((p) => p.category === category);
  }

  // Score candidate posts
  const hasQuery = query.trim().length > 0;
  let scoredResults: SemanticSearchResult[] = candidatePosts.map((post) => {
    const scored = scorePostSemantic(post, query);
    return {
      post,
      score: scored.score,
      relevancePercentage: scored.relevancePercentage,
      matchedTerms: scored.matchedTerms,
      snippet: scored.snippet,
    };
  });

  // If search query is provided, exclude items with 0 score
  if (hasQuery) {
    scoredResults = scoredResults.filter((item) => item.score > 0);
  }

  // Sorting
  scoredResults.sort((a, b) => {
    if (hasQuery && sortBy === "relevance") {
      if (b.score !== a.score) return b.score - a.score;
    }

    if (sortBy === "newest" || (!hasQuery && sortBy === "relevance")) {
      return new Date(b.post.publishedDate).getTime() - new Date(a.post.publishedDate).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.post.publishedDate).getTime() - new Date(b.post.publishedDate).getTime();
    }
    if (sortBy === "readTimeAsc") {
      const getMin = (r: string) => parseInt(r.replace(/\D/g, ""), 10) || 0;
      return getMin(a.post.readTime) - getMin(b.post.readTime);
    }
    if (sortBy === "readTimeDesc") {
      const getMin = (r: string) => parseInt(r.replace(/\D/g, ""), 10) || 0;
      return getMin(b.post.readTime) - getMin(a.post.readTime);
    }
    if (sortBy === "title") {
      return a.post.title.localeCompare(b.post.title);
    }
    return 0;
  });

  // Pagination calculation
  const totalItems = scoredResults.length;
  const validPageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / validPageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * validPageSize;
  const items = scoredResults.slice(startIndex, startIndex + validPageSize);

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
    pageSize: validPageSize,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    categories,
  };
}
