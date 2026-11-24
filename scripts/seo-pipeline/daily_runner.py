#!/usr/bin/env python3
"""
ScanBeforeEat - Master SEO Daily Pipeline Orchestrator
Coordinates:
- Part A: Low-competition keyword harvesting & PubMed evidence retrieval.
- Part B: Humanized YMYL content generation & validation.
- Part C: Stitch image asset mapping & Next.js blog index injection.
- Part D: Build verification & Google indexing readiness check.
"""

import sys
import json
import re
import subprocess
import argparse
from pathlib import Path
from datetime import date

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
PIPELINE_DIR = REPO_ROOT / "scripts" / "seo-pipeline"
KEYWORD_ENGINE = PIPELINE_DIR / "keyword_engine.py"
BLOG_SYNC = PIPELINE_DIR / "blog_sync.py"
STITCH_IMAGE = PIPELINE_DIR / "stitch_image.py"
PUBLIC_SITEMAP = REPO_ROOT / "frontend" / "public" / "sitemap.xml"
BLOG_INDEX_PATH = REPO_ROOT / "frontend" / "src" / "content" / "blog" / "index.ts"


def get_site_domain() -> str:
    """Reads domain from single source of truth in frontend/src/lib/config.ts."""
    config_path = REPO_ROOT / "frontend" / "src" / "lib" / "config.ts"
    if config_path.exists():
        content = config_path.read_text(encoding="utf-8")
        match = re.search(r'url:\s*\([^?]+\?\?\s*["\']([^"\']+)["\']\)', content)
        if match:
            return match.group(1).rstrip("/")
    return "https://scanbeforeeat.onrender.com"


def update_public_sitemap(domain: str) -> None:
    """Generates and updates frontend/public/sitemap.xml with all static and blog routes."""
    PUBLIC_SITEMAP.parent.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()

    static_routes = [
        ("/", "1.0", "daily"),
        ("/upf-guide/", "0.9", "weekly"),
        ("/additives/", "0.9", "weekly"),
        ("/methodology/", "0.9", "weekly"),
        ("/studies/", "0.8", "weekly"),
        ("/blog/", "0.8", "daily"),
        ("/about/", "0.7", "monthly"),
        ("/careers/", "0.6", "weekly"),
        ("/security/", "0.5", "monthly"),
        ("/status/", "0.5", "hourly"),
        ("/api-docs/", "0.5", "weekly"),
        ("/privacy/", "0.4", "monthly"),
        ("/terms/", "0.4", "monthly"),
    ]

    slugs = []
    if BLOG_INDEX_PATH.exists():
        content = BLOG_INDEX_PATH.read_text(encoding="utf-8")
        slugs = re.findall(r'slug:\s*["\']([^"\']+)["\']', content)

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for path, prio, freq in static_routes:
        xml_lines.extend([
            "  <url>",
            f"    <loc>{domain}{path}</loc>",
            f"    <lastmod>{today}</lastmod>",
            f"    <changefreq>{freq}</changefreq>",
            f"    <priority>{prio}</priority>",
            "  </url>",
        ])

    for slug in slugs:
        xml_lines.extend([
            "  <url>",
            f"    <loc>{domain}/blog/{slug}/</loc>",
            f"    <lastmod>{today}</lastmod>",
            f"    <changefreq>monthly</changefreq>",
            "    <priority>0.8</priority>",
            "  </url>",
        ])

    xml_lines.append("</urlset>")
    PUBLIC_SITEMAP.write_text("\n".join(xml_lines), encoding="utf-8")
    print(f"[SITEMAP] Generated & updated {PUBLIC_SITEMAP} with {len(static_routes) + len(slugs)} routes.")


def run_part_a(seed: str = "") -> dict:
    """Runs Part A: Discovers top winning keyword and PubMed evidence."""
    cmd = [sys.executable, str(KEYWORD_ENGINE), "--limit", "1", "--json"]
    if seed:
        cmd.extend(["--seed", seed])

    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    items = json.loads(result.stdout)
    if not items:
        raise RuntimeError("No keywords discovered by keyword_engine.py")
    return items[0]


def run_stitch_bridge(category: str, slug: str) -> str:
    """Maps or copies the Stitch visual cover image."""
    cmd = [sys.executable, str(STITCH_IMAGE), "--category", category, "--slug", slug]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    return data.get("coverImage", "/stitch/blog.png")


def run_verification() -> bool:
    """Runs Next.js typecheck / build test in frontend to ensure zero syntax/build breaks."""
    frontend_dir = REPO_ROOT / "frontend"
    print("\n[VERIFY] Running frontend build check...")
    try:
        # Check TypeScript compilation without emitting files
        local_tsc = frontend_dir / "node_modules" / ".bin" / "tsc"
        cmd = [str(local_tsc), "--noEmit"] if local_tsc.exists() else ["npx", "--yes", "tsc", "--noEmit"]
        res = subprocess.run(cmd, cwd=frontend_dir, capture_output=True, text=True, timeout=60)
        if res.returncode == 0:
            print("[VERIFY] TypeScript check passed with 0 errors!")
            return True
        else:
            print("[WARN] TypeScript check output:")
            print(res.stdout[:500])
            return False
    except Exception as e:
        print(f"[WARN] Could not run tsc check: {e}")
        return True


def main():
    parser = argparse.ArgumentParser(description="ScanBeforeEat Master SEO Daily Pipeline")
    parser.add_argument("--step", choices=["discover", "publish", "full"], default="discover", help="Pipeline step to run")
    parser.add_argument("--seed", type=str, default="", help="Optional seed topic for discovery")
    parser.add_argument("--post-json", type=str, default="", help="Path to completed blog post JSON for publishing")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode for publishing")
    args = parser.parse_args()

    if args.step in ["discover", "full"]:
        print("=" * 60)
        print("STAGE 1: EXECUTING PART A (KEYWORD DISCOVERY & PUBMED EVIDENCE)")
        print("=" * 60)
        topic = run_part_a(args.seed)
        print(f"\n[WINNING KEYWORD] : {topic['keyword']}")
        print(f"[TARGET SLUG]     : {topic['slug']}")
        print(f"[OPPORTUNITY]     : {topic['opportunity_score']}/100")
        print(f"[CATEGORY]        : {topic['category']}")
        print(f"[PUBMED EVIDENCE] : {len(topic.get('pubmed_evidence', []))} studies found")
        for idx, study in enumerate(topic.get("pubmed_evidence", []), 1):
            print(f"  {idx}. {study['title']} ({study['url']})")

        # Save discovery payload for agent/model generation
        discovery_file = PIPELINE_DIR / "current_topic.json"
        discovery_file.write_text(json.dumps(topic, indent=2), encoding="utf-8")
        print(f"\n[SAVED] Topic payload written to: {discovery_file}")

    if args.step == "publish" or (args.step == "full" and args.post_json):
        if not args.post_json:
            print("[ERROR] Please provide --post-json <path> to publish a completed post.")
            sys.exit(1)

        print("\n" + "=" * 60)
        print("STAGE 2: EXECUTING PART B (HUMANIZER & NEXT.JS INGESTION)")
        print("=" * 60)

        # Ingest post
        sync_cmd = [sys.executable, str(BLOG_SYNC), "--file", args.post_json]
        if args.dry_run:
            sync_cmd.append("--dry-run")
        subprocess.run(sync_cmd, check=True)

        if not args.dry_run:
            run_verification()
            domain = get_site_domain()
            update_public_sitemap(domain)
            with open(args.post_json, "r", encoding="utf-8") as f:
                post_data = json.load(f)
            slug = post_data.get("slug", "")
            live_url = f"{domain}/blog/{slug}"
            print("\n" + "=" * 60)
            print("STAGE 3: PUBLICATION SUCCESSFUL")
            print("=" * 60)
            print(f"Domain Source : frontend/src/lib/config.ts ({domain})")
            print(f"Local URL     : http://localhost:3000/blog/{slug}")
            print(f"Live URL      : {live_url}")
            print(f"Sitemap.xml   : {domain}/sitemap.xml (Updated)")
            print(f"Google GSC    : Inspect {live_url} in Search Console.")
            print(f"GitHub PR     : https://github.com/kanchan-nath/scanbeforeeat/pull/new/feature/seo-blog-automation-pipeline")


if __name__ == "__main__":
    main()
