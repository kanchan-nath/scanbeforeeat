# ScanBeforeEat Static Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-cold-start, high-ranking Next.js static marketing and content frontend in `frontend/` for ScanBeforeEat, deployable to Render Static Sites with responsive mobile/desktop design, animated product scan demo, clean tabular data presentation, and seamless handoff to the web server app.

**Architecture:** Monorepo coexistence where `frontend/` is an independent Next.js project with `output: 'export'` (pure static HTML/CSS/JS deployed to Render Static Site, zero spin-down), communicating to the authenticated app via environment variable `NEXT_PUBLIC_APP_URL`. Uses clean, high-density tabular presentation (inspired by Google Stitch UI) with named exports for testability.

**Tech Stack:** Next.js 15 (App Router, Static Export), React 19, TypeScript, Tailwind CSS, Lucide Icons, ESLint.

**Spec:** `/Users/kanchannath/Downloads/ScanBeforeEat — MVP Feature Checkpoint & Launch Readiness.md`

## Global Constraints

- **Directory Boundary:** All static frontend code must live strictly inside `/frontend`.
- **Hosting Target:** Render Static Site (zero server runtime, static export only via `npm run build`).
- **No AI Slop:** High-density, professional typography, tabular layout, subtle borders, high contrast. No generic purple gradients or AI-hallmarked buzzword blobs.
- **Responsive:** Strict mobile (<640px), tablet (640-1024px), and desktop (>1024px) support. No desktop blocking on marketing pages.
- **Configurable Subdomain:** App subdomain target strictly referenced via `process.env.NEXT_PUBLIC_APP_URL` (default fallback: `https://app-scanbeforeeat.com`).
- **Test-Ready Architecture:** Every business logic function, parser, and UI component must use explicit named exports and pure functions to facilitate test generation by Gemini.

---

### Task 1: Scaffolding Next.js Static Export in `frontend/`
**Assigned Model:** Claude Opus  
**Files to Touch/Create:**
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/next.config.mjs`
- `frontend/.eslintrc.json`
- `frontend/.env.example`
- `frontend/.env.local`
- `frontend/postcss.config.mjs`
- `frontend/tailwind.config.ts`

- [x] **Step 1.1:** Initialize `frontend` directory with Next.js, React, Tailwind CSS, TypeScript, and ESLint.
- [x] **Step 1.2:** Configure `next.config.mjs` with `output: 'export'`, `images: { unoptimized: true }`, and strict trailing slashes.
- [x] **Step 1.3:** Setup environment variables in `frontend/.env.example` and `frontend/.env.local` containing `NEXT_PUBLIC_APP_URL=https://app-scanbeforeeat.com` and `NEXT_PUBLIC_SITE_URL=https://scanbeforeeat.com`.
- [x] **Step 1.4:** Verify build succeeds with `npm run build` producing the static `frontend/out` directory.

---

### Task 2: Core Design System & Clean Data Components (Google Stitch UI Inspired)
**Assigned Model:** Claude Opus  
**Files to Touch/Create:**
- `frontend/src/app/globals.css`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Table.tsx`
- `frontend/src/components/ui/ScoreIndicator.tsx`
- `frontend/src/lib/types.ts`

- [x] **Step 2.1:** Define typography scale, neutral slate/stone color palette, health indicator tokens (Safe, Caution, Avoid, Unknown) in `tailwind.config.ts` and `globals.css`.
- [x] **Step 2.2:** Build reusable `Table.tsx` and `Badge.tsx` components focused on structured, high-density nutrition and additive data.
- [x] **Step 2.3:** Build `ScoreIndicator.tsx` displaying the transparent 0–100 health score with clear breakdown pills (Processing Level, Additive Risk, Allergen Alert).
- [x] **Step 2.4:** Export all component interfaces and pure display helpers from `src/lib/types.ts`.

---

### Task 3: Interactive Animated Scan Demo Component
**Assigned Model:** Claude Opus  
**Files to Touch/Create:**
- `frontend/src/components/demo/ScanDemo.tsx`
- `frontend/src/components/demo/mockScanData.ts`

- [x] **Step 3.1:** Create realistic mock product scan datasets in `mockScanData.ts` (e.g., Ultra-Processed Cereal vs. Clean Organic Granola) with ingredients, E-numbers, NOVA score, and transparent deduction breakdown.
- [x] **Step 3.2:** Build `ScanDemo.tsx` with animated SVG/CSS scan laser simulating camera viewfinder scanning a product barcode.
- [x] **Step 3.3:** Animate transition from barcode recognition into real-time ingredient analysis cards and tabular nutrition summary.
- [x] **Step 3.4:** Add interactive tabs allowing visitors to toggle between sample products without requiring an account or live camera feed.

---

### Task 4: Responsive Landing Page & Navigation
**Assigned Model:** Claude Opus  
**Files to Touch/Create:**
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/home/Hero.tsx`
- `frontend/src/components/home/FeatureGrid.tsx`
- `frontend/src/components/home/ComparisonSection.tsx`

- [x] **Step 4.1:** Build responsive `Navbar.tsx` with mobile slide-out menu, desktop link bar, and primary CTA linking to `NEXT_PUBLIC_APP_URL`.
- [x] **Step 4.2:** Build `Hero.tsx` featuring high-converting value proposition: instant ingredient decoding, UPF detection, and chemical additive warnings.
- [x] **Step 4.3:** Embed `ScanDemo.tsx` cleanly in the Hero/Feature section for instant visual demonstration.
- [x] **Step 4.4:** Build `ComparisonSection.tsx` comparing ScanBeforeEat vs manual label reading, highlighting transparency over arbitrary scores.
- [x] **Step 4.5:** Build `Footer.tsx` with complete directory links, medical disclaimer, and privacy compliance disclosures.

---

### Task 5: High-Intent SEO Content Pages & Knowledge Hub
**Assigned Model:** Claude Opus  
**Files to Touch/Create:**
- `frontend/src/app/about/page.tsx`
- `frontend/src/app/careers/page.tsx`
- `frontend/src/app/upf-guide/page.tsx`
- `frontend/src/app/additives/page.tsx`
- `frontend/src/app/terms/page.tsx`
- `frontend/src/app/privacy/page.tsx`

- [x] **Step 5.1:** Build `/about` detailing the mission for transparent, scientific food analysis without corporate bias.
- [x] **Step 5.2:** Build `/careers` with open culture and mission-driven roles.
- [x] **Step 5.3:** Build `/upf-guide` (Ultra-Processed Food Guide) targeting high-volume UK/US search queries on NOVA classification.
- [x] **Step 5.4:** Build `/additives` (E-Number & Food Chemical Database) with searchable tabular overview of common preservatives, dyes, and emulsifiers.
- [x] **Step 5.5:** Build `/terms` and `/privacy` ensuring GDPR/CCPA compliance and explicit medical disclaimer ("Not medical advice").

---

### Task 6: Google Crawler Readiness, Schema.org & Indexing Setup
**Assigned Model:** Claude Opus  
**Files to Touch/Create:**
- `frontend/src/app/sitemap.ts`
- `frontend/src/app/robots.ts`
- `frontend/src/app/layout.tsx`
- `frontend/src/components/seo/JsonLd.tsx`
- `frontend/scripts/google-index.mjs`

- [x] **Step 6.1:** Add OpenGraph, Twitter Card metadata, and canonical URL helpers to `layout.tsx`.
- [x] **Step 6.2:** Create dynamic static `sitemap.ts` listing all static routes with update frequencies.
- [x] **Step 6.3:** Create `robots.ts` permitting all valid crawlers and referencing sitemap URL.
- [x] **Step 6.4:** Implement `JsonLd.tsx` structured data components (`SoftwareApplication`, `WebApplication`, `FAQPage`, `BreadcrumbList`).
- [x] **Step 6.5:** Create `scripts/google-index.mjs` supporting Google Indexing API batch submission using standard service account credentials.

---

### Task 7: Verification & Test Suite Scaffolding
**Assigned Model:** Gemini 3.8 Flash (Switched in follow-up turn)  
**Files to Touch/Create:**
- `frontend/vitest.config.ts`
- `frontend/tests/components/ScoreIndicator.test.tsx`
- `frontend/tests/components/Table.test.tsx`
- `frontend/tests/seo/metadata.test.ts`

- [ ] **Step 7.1:** Configure Vitest and React Testing Library in `frontend/`.
- [ ] **Step 7.2:** Write unit tests for pure scoring functions and tabular display logic.
- [ ] **Step 7.3:** Write integration tests verifying responsive navigation links and `NEXT_PUBLIC_APP_URL` redirection paths.
- [ ] **Step 7.4:** Run `npm run lint` and `npm run test` ensuring 100% pass with zero warnings.
