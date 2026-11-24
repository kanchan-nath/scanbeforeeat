import { describe, it, expect } from "vitest";
import { getAllBlogPosts, getBlogPostBySlug, getFeaturedPost } from "@/content/blog";
import { generateStaticParams } from "@/app/blog/[slug]/page";

describe("Blog Content & Dynamic Routes", () => {
  it("getAllBlogPosts() returns a non-empty array of valid blog posts", () => {
    const posts = getAllBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThanOrEqual(3);

    for (const post of posts) {
      expect(post.slug).toBeTruthy();
      expect(typeof post.slug).toBe("string");
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);

      expect(post.title).toBeTruthy();
      expect(post.subtitle).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.category).toBeTruthy();
      expect(post.readTime).toMatch(/\d+\s+min\s+read/);
      expect(post.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      expect(post.author).toBeDefined();
      expect(post.author.name).toBeTruthy();
      expect(post.author.role).toBeTruthy();

      expect(post.reviewBoard).toBeTruthy();
      expect(post.content).toBeTruthy();
      expect(post.content.length).toBeGreaterThan(100);

      expect(Array.isArray(post.tags)).toBe(true);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });

  it("getBlogPostBySlug(slug) returns valid post with rich content and metadata", () => {
    const allPosts = getAllBlogPosts();
    const samplePost = allPosts[0];

    const fetched = getBlogPostBySlug(samplePost.slug);
    expect(fetched).toBeDefined();
    expect(fetched?.slug).toBe(samplePost.slug);
    expect(fetched?.title).toBe(samplePost.title);
    expect(fetched?.content).toBe(samplePost.content);
    expect(fetched?.author.name).toBe(samplePost.author.name);
  });

  it("getBlogPostBySlug(slug) returns undefined for unknown slugs", () => {
    const nonExistent = getBlogPostBySlug("this-slug-does-not-exist-xyz-999");
    expect(nonExistent).toBeUndefined();
  });

  it("getFeaturedPost() returns a valid featured post or fallback", () => {
    const featured = getFeaturedPost();
    expect(featured).toBeDefined();
    expect(featured.slug).toBeTruthy();
    expect(featured.title).toBeTruthy();
  });

  it("generateStaticParams() includes all blog post slugs for static pre-rendering", async () => {
    const staticParams = await generateStaticParams();
    const allPosts = getAllBlogPosts();

    expect(Array.isArray(staticParams)).toBe(true);
    expect(staticParams.length).toBe(allPosts.length);

    const generatedSlugs = staticParams.map((p) => p.slug);
    const expectedSlugs = allPosts.map((p) => p.slug);

    expect(generatedSlugs).toEqual(expectedSlugs);

    // Verify key expected articles are present
    expect(generatedSlugs).toContain("ultra-processed-foods-hidden-truth");
    expect(generatedSlugs).toContain("e-numbers-explained");
    expect(generatedSlugs).toContain("nova-classification-food-science");
  });

  it("every blog post is free of broken ASCII box art, raw code fences, and em-dashes", () => {
    const posts = getAllBlogPosts();
    for (const post of posts) {
      // 1. Prohibit ASCII art boxes that break mobile and paragraph layouts
      expect(
        post.content,
        `Article '${post.slug}' contains raw ASCII box art '+---'`
      ).not.toContain("+---");

      expect(
        post.content,
        `Article '${post.slug}' contains raw ASCII box art '+==='`
      ).not.toContain("+===");

      // 2. Prohibit unrendered or raw code fences
      expect(
        post.content,
        `Article '${post.slug}' contains raw code fence '\`\`\`'`
      ).not.toContain("```");

      // 3. Prohibit em-dashes (per editorial quality rules)
      expect(
        post.content,
        `Article '${post.slug}' contains prohibited em-dash '—'`
      ).not.toContain("—");
    }
  });
});
