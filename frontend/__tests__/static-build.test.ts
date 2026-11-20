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
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: "https://scanbeforeeat.onrender.com" },
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
});
