# ScanBeforeEat - Autonomous SEO Blog Pipeline

A 100% free, local-first SEO engine tailored for health, toxicology, and food additive search authority.

## Architecture

```
[Part A: Discovery]
keyword_engine.py
├── Google Autocomplete (Alphabet soup long-tail queries)
├── PubMed E-Utilities API (Live PMC medical studies & PMIDs)
├── Anti-Cannibalization Filter (Checks frontend/src/content/blog/index.ts)
└── Opportunity Scorer (Prioritizes low-competition questions)
        ↓
[Part B: Content & Validation]
blog_sync.py
├── Humanizer Linter (Replaces em-dashes '—', strips AI fluff words)
├── YMYL Validator (Verifies PubMed citations, author schema, word count)
└── TypeScript AST Injector (Updates blogPosts array in index.ts)
        ↓
[Part C: Visual Bridge]
stitch_image.py
└── Maps Stitch food science laboratory visuals into Next.js cover assets
        ↓
[Part D: Verification]
daily_runner.py
└── Automated typecheck and Google Search Console indexing readiness
```

## Quick Start

### 1. Discover Winning Keyword (Part A)
```bash
python3 scripts/seo-pipeline/daily_runner.py --step discover
```

### 2. Publish & Validate Draft (Part B)
```bash
python3 scripts/seo-pipeline/daily_runner.py --step publish --post-json path/to/draft.json
```

### 3. Dry-Run Validation
```bash
python3 scripts/seo-pipeline/blog_sync.py --file path/to/draft.json --dry-run
```

## One-Click Execution via Antigravity
Trigger the custom skill in Antigravity with **Gemini 3.8 Flash (High)**:
```
/publish-daily-blog
```
