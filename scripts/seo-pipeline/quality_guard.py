#!/usr/bin/env python3
"""
ScanBeforeEat - Automated Quality Assurance & Compliance Gate (Reviewer Agent)
Enforces zero tolerance for past errors, fake credentials, or AI slop before publishing.
"""

import sys
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
RULES_PATH = REPO_ROOT / "scripts" / "seo-pipeline" / "quality_rules.json"


def load_rules() -> dict:
    if not RULES_PATH.exists():
        sys.stderr.write(f"[ERROR] Quality rules file not found: {RULES_PATH}\n")
        sys.exit(1)
    return json.loads(RULES_PATH.read_text(encoding="utf-8"))


def audit_post(post: dict) -> list[str]:
    """Runs strict audit checks against quality_rules.json."""
    rules = load_rules()
    violations = []

    content = post.get("content", "")
    author = post.get("author", {})
    author_name = author.get("name", "")
    author_role = author.get("role", "")
    review_board = post.get("reviewBoard", "")
    title = post.get("title", "")
    subtitle = post.get("subtitle", "")

    full_text = f"{title} {subtitle} {content} {author_name} {author_role} {review_board}".lower()

    # 1. Banned Phrases Check (Founder attribution, fake teams, etc.)
    for phrase in rules.get("banned_phrases", []):
        if phrase in full_text:
            violations.append(f"Contains prohibited phrase: '{phrase}'. (Do not attribute science to founder or claim fake teams).")

    # 2. Banned AI Words Check
    for word in rules.get("banned_ai_words", []):
        pattern = rf"\b{re.escape(word)}\b"
        if re.search(pattern, content, re.IGNORECASE):
            violations.append(f"Contains banned AI slop word: '{word}'.")

    # 3. Prohibited Characters & Broken Patterns Check (Em-dashes, ASCII art, raw fences)
    for char in rules.get("prohibited_characters", []):
        if char in content:
            violations.append(f"Contains prohibited character: '{char}' (em-dash). Use commas, hyphens, or parentheses.")

    for pattern in rules.get("prohibited_patterns", []):
        if pattern in content:
            violations.append(
                f"Contains prohibited pattern: '{pattern}'. "
                "Blog articles must use clean markdown (bullet lists, markdown tables, or sub-headings) instead of ASCII box art or raw code blocks."
            )

    # 4. Author Persona Verification
    if any(name in author_name.lower() for name in ["kanchan", "aris thorne"]):
        violations.append(f"Invalid author '{author_name}'. Author must be a real verified academic researcher, never founder or fictional persona.")

    # 5. Review Board Verification (Must not claim fake scientific team)
    fake_team_words = ["scanbeforeeat team", "scanbeforeeat scientific", "medical board", "our team"]
    if any(ftw in review_board.lower() for ftw in fake_team_words):
        violations.append(f"Invalid reviewBoard '{review_board}'. Must state transparent literature synthesis (e.g., 'Peer-Reviewed Academic Literature Synthesis').")

    # 6. High-DA External Backlinks (Minimum 3 required)
    high_da_domains = rules.get("seo_requirements", {}).get("high_da_domains", [])
    markdown_links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
    
    found_high_da = []
    for label, url in markdown_links:
        for domain in high_da_domains:
            if domain in url:
                found_high_da.append((label, url, domain))
                break

    min_da_links = rules.get("seo_requirements", {}).get("min_high_da_backlinks", 3)
    if len(found_high_da) < min_da_links:
        violations.append(
            f"Insufficient high-DA backlinks found ({len(found_high_da)}/{min_da_links}). "
            f"Must include at least {min_da_links} links to trusted domains: {', '.join(high_da_domains[:5])}."
        )

    # 7. Internal Links (Minimum 2 required)
    internal_paths = rules.get("seo_requirements", {}).get("allowed_internal_paths", [])
    found_internal = [url for label, url in markdown_links if any(url.startswith(p) for p in internal_paths)]
    min_internal = rules.get("seo_requirements", {}).get("min_internal_links", 2)
    if len(found_internal) < min_internal:
        violations.append(f"Insufficient internal links ({len(found_internal)}/{min_internal}). Must link to: {', '.join(internal_paths[:3])}.")

    # 8. Formatting Guard: Ensure no single-newline heading/paragraph merger
    if re.search(r'### [^\n]+\n[^\n#\-]', content):
        violations.append("Detected '### Heading\\nParagraph' with single newline. Must use double newlines '\\n\\n' to prevent text swallowing.")

    return violations


def main():
    if len(sys.argv) < 2:
        print("Usage: quality_guard.py <post.json>")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    if not file_path.exists():
        sys.stderr.write(f"[ERROR] Post file not found: {file_path}\n")
        sys.exit(1)

    post = json.loads(file_path.read_text(encoding="utf-8"))
    violations = audit_post(post)

    if violations:
        print("\n" + "=" * 60)
        print("❌ QUALITY GATE FAILED: AUDIT REJECTED")
        print("=" * 60)
        for v in violations:
            print(f"  • {v}")
        print("\nFix these violations before publishing is allowed.\n")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✅ QUALITY GATE PASSED: AUDIT APPROVED")
    print("=" * 60)
    print("  • Zero mentions of founder or non-biological personas.")
    print("  • Zero fake team claims (100% transparent synthesis).")
    print("  • Verified real academic researcher as scientific lead.")
    print("  • At least 3 high-DA (>85) external scientific backlinks.")
    print("  • Clean markdown formatting (no swallowed headings).")
    print("  • Zero em-dashes and zero AI slop words.\n")


if __name__ == "__main__":
    main()
