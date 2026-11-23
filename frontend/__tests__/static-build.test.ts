import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { describe, it, expect, beforeAll } from "vitest";

const outDir = path.resolve(__dirname, "../out");

describe("Static Export Build Validation", () => {
  beforeAll(() => {
    // Always rebuild to validate current environment configuration
    execSync("npm run build", {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
      env: {
        ...process.env,
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://scanbeforeeat.onrender.com",
      },
    });
  }, 120000); // 120s timeout in case build runs

  it("ensures the static export out/ directory exists", () => {
    expect(fs.existsSync(outDir)).toBe(true);
    const stats = fs.statSync(outDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("ensures out/index.html exists and contains valid homepage HTML", () => {
    const indexPath = path.join(outDir, "index.html");
    expect(fs.existsSync(indexPath)).toBe(true);

    const content = fs.readFileSync(indexPath, "utf-8");
    expect(content).toContain("<!DOCTYPE html>");
    expect(content).toContain("ScanBeforeEat");
    expect(content).toContain("googletagmanager.com/gtm.js?id=GTM-M5NZ4CXL");
    expect(content).toContain("window.dataLayer");
    expect(content.length).toBeGreaterThan(1000);
  });

  it("ensures out/sitemap.xml exists and references valid URLs", () => {
    const sitemapPath = path.join(outDir, "sitemap.xml");
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const content = fs.readFileSync(sitemapPath, "utf-8");
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain("<urlset");
    expect(content).toContain("https://scanbeforeeat.onrender.com/");
    expect(content).toContain("https://scanbeforeeat.onrender.com/additives/");
    expect(content).toContain("https://scanbeforeeat.onrender.com/upf-guide/");
    expect(content).toContain("https://scanbeforeeat.onrender.com/methodology/");
    expect(content).toContain("https://scanbeforeeat.onrender.com/blog/");
  });

  it("ensures out/robots.txt exists and contains standard crawler rules", () => {
    const robotsPath = path.join(outDir, "robots.txt");
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, "utf-8");
    expect(content).toContain("User-Agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain("User-Agent: Googlebot-Image");
    expect(content).toContain("Sitemap: https://scanbeforeeat.onrender.com/sitemap.xml");
  });

  it("ensures all core unauthenticated subpages exist as static HTML files", () => {
    const requiredSubpages = [
      "about",
      "additives",
      "api-docs",
      "blog",
      "careers",
      "methodology",
      "privacy",
      "security",
      "status",
      "studies",
      "terms",
      "upf-guide",
    ];

    for (const subpage of requiredSubpages) {
      // With trailingSlash: true, subpages output as out/<subpage>/index.html
      const subpageHtml = path.join(outDir, subpage, "index.html");
      expect(
        fs.existsSync(subpageHtml),
        `Expected static file to exist: ${subpageHtml}`
      ).toBe(true);

      const content = fs.readFileSync(subpageHtml, "utf-8");
      expect(content).toContain("<!DOCTYPE html>");
      expect(content.length).toBeGreaterThan(500);
    }
  });

  it("ensures pre-rendered dynamic blog article pages exist", () => {
    const blogSlugs = [
      "ultra-processed-foods-hidden-truth",
      "e-numbers-explained",
      "nova-classification-food-science",
    ];

    for (const slug of blogSlugs) {
      const blogArticleHtml = path.join(outDir, "blog", slug, "index.html");
      expect(
        fs.existsSync(blogArticleHtml),
        `Expected static blog article to exist: ${blogArticleHtml}`
      ).toBe(true);

      const content = fs.readFileSync(blogArticleHtml, "utf-8");
      expect(content).toContain("<!DOCTYPE html>");
      expect(content.length).toBeGreaterThan(1000);
    }
  });

  it("verifies out/blog/index.html is distinct from out/index.html so reloads do not return homepage", () => {
    const blogIndexHtml = path.join(outDir, "blog", "index.html");
    const homeIndexHtml = path.join(outDir, "index.html");

    expect(fs.existsSync(blogIndexHtml)).toBe(true);
    expect(fs.existsSync(homeIndexHtml)).toBe(true);

    const blogContent = fs.readFileSync(blogIndexHtml, "utf-8");
    const homeContent = fs.readFileSync(homeIndexHtml, "utf-8");

    // Blog index must contain blog-specific content and not be identical to homepage
    expect(blogContent).toContain("ScanBeforeEat Blog");
    expect(blogContent).toContain("Scientific Research &amp; Investigations");
    expect(blogContent).not.toEqual(homeContent);
  });

  it("ensures render.yaml does not contain SPA catch-all rewrite rules that hijack static routes", () => {
    const renderYamlPath = path.resolve(__dirname, "../../render.yaml");
    if (fs.existsSync(renderYamlPath)) {
      const renderContent = fs.readFileSync(renderYamlPath, "utf-8");
      // Must not rewrite /* to /index.html as it breaks reloading on static subpages like /blog
      expect(renderContent).not.toMatch(/destination:\s*\/index\.html/);
    }
  });
});
