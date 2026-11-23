import { describe, it, expect } from "vitest";
import { getAllBlogPosts } from "@/content/blog";
import {
  scorePostSemantic,
  filterAndPaginateBlogPosts,
} from "@/lib/blog-search";

describe("Semantic Blog Search & Pagination Engine", () => {
  const posts = getAllBlogPosts();

  it("calculates positive relevance score for exact keyword matches", () => {
    const post = posts.find((p) => p.slug === "what-does-carrageenan-taste-like");
    expect(post).toBeDefined();
    if (!post) return;

    const res = scorePostSemantic(post, "carrageenan");
    expect(res.score).toBeGreaterThan(0.3);
    expect(res.relevancePercentage).toBeGreaterThanOrEqual(75);
    expect(res.matchedTerms.length).toBeGreaterThan(0);
  });

  it("handles semantic query expansion (e.g. 'gut inflammation' matches mucosal barrier / carrageenan)", () => {
    const carrageenanPost = posts.find((p) => p.slug === "what-does-carrageenan-taste-like");
    expect(carrageenanPost).toBeDefined();
    if (!carrageenanPost) return;

    const res = scorePostSemantic(carrageenanPost, "gut inflammation");
    expect(res.score).toBeGreaterThan(0);
    expect(res.relevancePercentage).toBeGreaterThan(65);
    expect(res.matchedTerms.some((t) => t.includes("gut") || t.includes("inflammation") || t.includes("mucosa"))).toBe(true);
  });

  it("filters posts by category correctly", () => {
    const res = filterAndPaginateBlogPosts(posts, {
      category: "Toxicology",
      pageSize: 10,
    });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(item.post.category).toBe("Toxicology");
    }
  });

  it("paginates posts correctly (page 1 vs page 2)", () => {
    const pageSize = 4;
    const page1 = filterAndPaginateBlogPosts(posts, {
      page: 1,
      pageSize,
    });
    expect(page1.items.length).toBe(pageSize);
    expect(page1.currentPage).toBe(1);
    expect(page1.totalPages).toBeGreaterThanOrEqual(3);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.hasPrevPage).toBe(false);

    const page2 = filterAndPaginateBlogPosts(posts, {
      page: 2,
      pageSize,
    });
    expect(page2.items.length).toBe(pageSize);
    expect(page2.currentPage).toBe(2);
    expect(page2.hasPrevPage).toBe(true);

    // Items on page 1 and page 2 must be distinct
    const slugsPage1 = page1.items.map((i) => i.post.slug);
    const slugsPage2 = page2.items.map((i) => i.post.slug);
    for (const s of slugsPage1) {
      expect(slugsPage2).not.toContain(s);
    }
  });

  it("sorts by readTime ascending and descending", () => {
    const asc = filterAndPaginateBlogPosts(posts, {
      sortBy: "readTimeAsc",
      pageSize: 20,
    });
    const getMin = (r: string) => parseInt(r.replace(/\D/g, ""), 10);
    for (let i = 0; i < asc.items.length - 1; i++) {
      expect(getMin(asc.items[i].post.readTime)).toBeLessThanOrEqual(
        getMin(asc.items[i + 1].post.readTime)
      );
    }

    const desc = filterAndPaginateBlogPosts(posts, {
      sortBy: "readTimeDesc",
      pageSize: 20,
    });
    for (let i = 0; i < desc.items.length - 1; i++) {
      expect(getMin(desc.items[i].post.readTime)).toBeGreaterThanOrEqual(
        getMin(desc.items[i + 1].post.readTime)
      );
    }
  });
});
