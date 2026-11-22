#!/usr/bin/env python3
"""
ScanBeforeEat - Blog Ingestion, Humanizer & Quality Assurance Engine (Part B)
Safely formats, humanizes, validates, and injects blog posts into frontend/src/content/blog/index.ts
"""

import sys
import json
import re
import argparse
from pathlib import Path

# Paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BLOG_INDEX_PATH = REPO_ROOT / "frontend" / "src" / "content" / "blog" / "index.ts"

# Anti-AI Slop banned words
BANNED_AI_WORDS = [
    "delve",
    "delving",
    "tapestry",
    "game-changer",
    "game changer",
    "beacon of",
    "in today's fast-paced world",
    "in today's digital age",
    "testament to",
    "it is crucial to remember",
    "it goes without saying",
    "furthermore",
    "moreover",
]


def humanize_text(text: str) -> tuple[str, list]:
    """
    Strips out machine fingerprints:
    - Replaces em-dashes (—) with standard punctuation (parentheses, commas, or periods).
    - Checks for banned AI words.
    """
    warnings = []
    # 1. Replace em-dashes
    if "—" in text:
        text = text.replace(" — ", ", ").replace("—", " - ")
        warnings.append("Replaced em-dashes (—) with natural human punctuation.")

    # 2. Check banned words
    for word in BANNED_AI_WORDS:
        pattern = rf"\b{re.escape(word)}\b"
        if re.search(pattern, text, re.IGNORECASE):
            warnings.append(f"Found banned AI fluff word: '{word}'")

    return text, warnings


def validate_post(post: dict) -> list:
    """Validates post against ScanBeforeEat E-E-A-T and schema standards."""
    errors = []
    required_fields = [
        "slug", "title", "subtitle", "excerpt", "category",
        "readTime", "publishedDate", "author", "reviewBoard",
        "tableOfContents", "content", "tags"
    ]
    for f in required_fields:
        if f not in post or not post[f]:
            errors.append(f"Missing required field: '{f}'")

    # Author validation
    author = post.get("author", {})
    if not author.get("name") or not author.get("role"):
        errors.append("Author must have 'name' and 'role'.")

    # Content length check (YMYL articles need substance, min 600 words for short, 1500+ for in-depth)
    content = post.get("content", "")
    words = content.split()
    if len(words) < 500:
        errors.append(f"Article is too short ({len(words)} words). Minimum 500 words required.")

    # Internal link check
    internal_links = ["/scanner", "/upf-guide", "/additives", "/duel", "/about", "/methodology"]
    has_internal_link = any(link in content for link in internal_links)
    if not has_internal_link:
        errors.append("Article must contain at least one internal link to ScanBeforeEat tools (/scanner, /upf-guide, /additives).")

    # Table of contents check
    toc = post.get("tableOfContents", [])
    if not toc:
        errors.append("Article must have at least 3 Table of Contents sections.")
    else:
        for item in toc:
            heading = f"## {item.get('title')}"
            # Check if matching heading exists in content
            heading_norm = re.sub(r"[^a-z0-9]", "", item.get("title", "").lower())
            content_norm = re.sub(r"[^a-z0-9]", "", content.lower())
            if heading_norm not in content_norm:
                errors.append(f"TOC item '{item.get('title')}' has no matching heading in content.")

    return errors


def format_ts_post(post: dict) -> str:
    """Formats a Python dict into a valid TypeScript BlogPost object."""
    # Escape backticks in content
    content_escaped = post["content"].replace("`", "\\`").replace("${", "\\${")

    # Format table of contents
    toc_lines = []
    for t in post.get("tableOfContents", []):
        toc_lines.append(f'      {{ id: "{t["id"]}", title: "{t["title"]}" }},')
    toc_str = "\n".join(toc_lines)

    # Format tags
    tags_str = ", ".join(f'"{t}"' for t in post.get("tags", []))

    cover_img_line = f'    coverImage: "{post["coverImage"]}",\n' if post.get("coverImage") else ""
    featured_line = f'    featured: {str(post.get("featured", False)).lower()},\n'

    ts_obj = f"""  {{
    slug: "{post["slug"]}",
    title: "{post["title"].replace('"', '\\"')}",
    subtitle: "{post["subtitle"].replace('"', '\\"')}",
    excerpt: "{post["excerpt"].replace('"', '\\"')}",
    category: "{post["category"]}",
    readTime: "{post["readTime"]}",
    publishedDate: "{post["publishedDate"]}",
    author: {{
      name: "{post["author"]["name"]}",
      role: "{post["author"]["role"].replace('"', '\\"')}",
    }},
    reviewBoard: "{post["reviewBoard"].replace('"', '\\"')}",
{cover_img_line}{featured_line}    tags: [{tags_str}],
    tableOfContents: [
{toc_str}
    ],
    content: `
{content_escaped.strip()}
    `,
  }},"""
    return ts_obj


def inject_into_blog_index(ts_post: str, dry_run: bool = False) -> bool:
    """Inserts the new post at the top of the blogPosts array in index.ts."""
    if not BLOG_INDEX_PATH.exists():
        sys.stderr.write(f"[ERROR] Blog index file not found at: {BLOG_INDEX_PATH}\n")
        return False

    content = BLOG_INDEX_PATH.read_text(encoding="utf-8")

    # Find export const blogPosts: BlogPost[] = [
    marker = "export const blogPosts: BlogPost[] = ["
    if marker not in content:
        sys.stderr.write(f"[ERROR] Could not find '{marker}' in {BLOG_INDEX_PATH}\n")
        return False

    # Insert right after the marker
    new_content = content.replace(marker, f"{marker}\n{ts_post}")

    if dry_run:
        print("[DRY-RUN] Validated successfully. Target insertion preview:")
        print(ts_post[:300] + "\n...")
        return True

    BLOG_INDEX_PATH.write_text(new_content, encoding="utf-8")
    print(f"[SUCCESS] Injected post into: {BLOG_INDEX_PATH}")
    return True


def main():
    parser = argparse.ArgumentParser(description="ScanBeforeEat Blog Ingestion Engine")
    parser.add_argument("--file", type=str, required=True, help="Path to JSON file containing blog post object")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing to disk")
    args = parser.parse_args()

    post_path = Path(args.file)
    if not post_path.exists():
        sys.stderr.write(f"[ERROR] File not found: {post_path}\n")
        sys.exit(1)

    try:
        post = json.loads(post_path.read_text(encoding="utf-8"))
    except Exception as e:
        sys.stderr.write(f"[ERROR] Invalid JSON: {e}\n")
        sys.exit(1)

    # 1. Humanize content
    post["content"], warnings = humanize_text(post.get("content", ""))
    for w in warnings:
        print(f"[HUMANIZER] {w}")

    # 2. Validate
    errors = validate_post(post)
    if errors:
        sys.stderr.write("[ERROR] Post validation failed:\n")
        for err in errors:
            sys.stderr.write(f"  - {err}\n")
        sys.exit(1)

    # 3. Format TypeScript object
    ts_obj = format_ts_post(post)

    # 4. Inject
    success = inject_into_blog_index(ts_obj, dry_run=args.dry_run)
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
