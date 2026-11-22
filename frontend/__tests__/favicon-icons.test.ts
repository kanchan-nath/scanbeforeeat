import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Favicon & SEO Brand Icon Assets", () => {
  const publicDir = path.resolve(__dirname, "../public");
  const appDir = path.resolve(__dirname, "../src/app");

  it("provides multi-resolution favicon.ico in both public and app router", () => {
    const publicFavicon = path.join(publicDir, "favicon.ico");
    const appFavicon = path.join(appDir, "favicon.ico");

    expect(fs.existsSync(publicFavicon)).toBe(true);
    expect(fs.statSync(publicFavicon).size).toBeGreaterThan(1000);

    expect(fs.existsSync(appFavicon)).toBe(true);
    expect(fs.statSync(appFavicon).size).toBeGreaterThan(1000);
  });

  it("provides vector SVG favicon for modern high-DPI desktop tabs", () => {
    const publicSvg = path.join(publicDir, "icon.svg");
    const appSvg = path.join(appDir, "icon.svg");

    expect(fs.existsSync(publicSvg)).toBe(true);
    expect(fs.existsSync(appSvg)).toBe(true);

    const svgContent = fs.readFileSync(publicSvg, "utf-8");
    expect(svgContent).toContain("<svg");
    expect(svgContent).toContain("#047857");
  });

  it("provides Google Search multiple-of-48 and PWA PNG icons", () => {
    const icon48 = path.join(publicDir, "icon-48.png");
    const icon96 = path.join(publicDir, "icon-96.png");
    const icon192 = path.join(publicDir, "icon-192.png");
    const icon512 = path.join(publicDir, "icon-512.png");

    expect(fs.existsSync(icon48)).toBe(true);
    expect(fs.statSync(icon48).size).toBeGreaterThan(500);

    expect(fs.existsSync(icon96)).toBe(true);
    expect(fs.statSync(icon96).size).toBeGreaterThan(1000);

    expect(fs.existsSync(icon192)).toBe(true);
    expect(fs.statSync(icon192).size).toBeGreaterThan(2000);

    expect(fs.existsSync(icon512)).toBe(true);
    expect(fs.statSync(icon512).size).toBeGreaterThan(5000);
  });

  it("provides Apple Touch Icon for iOS Safari and bookmarks", () => {
    const applePublic = path.join(publicDir, "apple-touch-icon.png");
    const appleApp = path.join(appDir, "apple-icon.png");

    expect(fs.existsSync(applePublic)).toBe(true);
    expect(fs.statSync(applePublic).size).toBeGreaterThan(2000);

    expect(fs.existsSync(appleApp)).toBe(true);
    expect(fs.statSync(appleApp).size).toBeGreaterThan(2000);
  });

  it("provides valid web app manifest with icon declarations", () => {
    const manifestPath = path.join(publicDir, "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.name).toContain("ScanBeforeEat");
    expect(manifest.short_name).toBe("ScanBeforeEat");
    expect(manifest.theme_color).toBe("#047857");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("48x48");
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("configures Google Site Names WebSite schema with brand and alternate names", () => {
    const jsonLdPath = path.resolve(__dirname, "../src/components/seo/JsonLd.tsx");
    expect(fs.existsSync(jsonLdPath)).toBe(true);

    const content = fs.readFileSync(jsonLdPath, "utf-8");
    expect(content).toContain('"@type": "WebSite"');
    expect(content).toContain("alternateName");
    expect(content).toContain("Scan Before Eat");
    expect(content).toContain('"@type": "Organization"');
    expect(content).toContain("icon-512.png");
  });

  it("allows Googlebot-Image to index favicons in robots configuration", () => {
    const robotsPath = path.resolve(__dirname, "../src/app/robots.ts");
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, "utf-8");
    expect(content).toContain("Googlebot-Image");
    expect(content).toContain('allow: "/"');
  });
});
