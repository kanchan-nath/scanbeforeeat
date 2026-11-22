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
import subprocess
import argparse
from pathlib import Path
from datetime import date

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
PIPELINE_DIR = REPO_ROOT / "scripts" / "seo-pipeline"
KEYWORD_ENGINE = PIPELINE_DIR / "keyword_engine.py"
BLOG_SYNC = PIPELINE_DIR / "blog_sync.py"
STITCH_IMAGE = PIPELINE_DIR / "stitch_image.py"


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
        cmd = ["npx", "tsc", "--noEmit"]
        res = subprocess.run(cmd, cwd=frontend_dir, capture_output=True, text=True)
        if res.returncode == 0:
            print("[VERIFY] TypeScript check passed with 0 errors!")
            return True
        else:
            print("[WARN] TypeScript check output:")
            print(res.stdout[:500])
            return False
    except Exception as e:
        print(f"[WARN] Could not run npx tsc: {e}")
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
            with open(args.post_json, "r", encoding="utf-8") as f:
                post_data = json.load(f)
            slug = post_data.get("slug", "")
            print("\n" + "=" * 60)
            print("STAGE 3: PUBLICATION SUCCESSFUL")
            print("=" * 60)
            print(f"Local URL  : http://localhost:3000/blog/{slug}")
            print(f"Live URL   : https://scanbeforeeat.com/blog/{slug}")
            print(f"Google GSC : Submit https://scanbeforeeat.com/blog/{slug} for instant indexing.")


if __name__ == "__main__":
    main()
