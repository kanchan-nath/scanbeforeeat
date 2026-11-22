#!/usr/bin/env python3
"""
ScanBeforeEat - Stitch Visual Asset Bridge
Maps topics and categories to Stitch design system assets and generates cover images.
"""

import sys
import json
import shutil
import argparse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
STITCH_PUBLIC_DIR = REPO_ROOT / "frontend" / "public" / "stitch"
BLOG_PUBLIC_DIR = REPO_ROOT / "frontend" / "public" / "blog"

CATEGORY_IMAGE_MAP = {
    "Ultra-Processed Foods": "/stitch/upf-guide.png",
    "Food Additives": "/stitch/additives.png",
    "Toxicology": "/stitch/blog.png",
    "Scientific Research": "/stitch/about.png",
    "Consumer Advocacy": "/stitch/landing.png",
}


def get_cover_image(category: str, slug: str) -> str:
    """Returns the optimal cover image URL for a given category and slug."""
    BLOG_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if a category image exists in public/stitch
    default_img = CATEGORY_IMAGE_MAP.get(category, "/stitch/blog.png")
    source_file = REPO_ROOT / "frontend" / "public" / default_img.lstrip("/")
    
    target_filename = f"{slug}.png"
    target_file = BLOG_PUBLIC_DIR / target_filename
    
    if source_file.exists():
        try:
            shutil.copyfile(source_file, target_file)
            return f"/blog/{target_filename}"
        except Exception:
            return default_img
            
    return default_img


def main():
    parser = argparse.ArgumentParser(description="ScanBeforeEat Stitch Image Bridge")
    parser.add_argument("--category", type=str, required=True, help="Blog category")
    parser.add_argument("--slug", type=str, required=True, help="Post slug")
    args = parser.parse_args()

    image_path = get_cover_image(args.category, args.slug)
    print(json.dumps({"coverImage": image_path}))


if __name__ == "__main__":
    main()
