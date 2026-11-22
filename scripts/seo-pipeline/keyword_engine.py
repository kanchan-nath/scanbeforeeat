#!/usr/bin/env python3
"""
ScanBeforeEat - SEO Keyword & Research Discovery Engine (Part A)
100% Free - Zero Paid API Dependencies

Features:
1. Google Autocomplete Alphabet Soup harvester.
2. Scientific Evidence Retrieval (Live PubMed E-Utilities API).
3. Anti-Cannibalization Checker (cross-references existing blog slugs).
4. Opportunity Scoring Algorithm tailored for Health & YMYL search rankings.
"""

import sys
import json
import re
import time
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    import urllib.request
    import urllib.parse
    requests = None

try:
    import certifi
    import ssl
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except Exception:
    import ssl
    SSL_CONTEXT = ssl._create_unverified_context()

# Paths
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BLOG_INDEX_PATH = REPO_ROOT / "frontend" / "src" / "content" / "blog" / "index.ts"

# Default seed clusters for ScanBeforeEat
DEFAULT_SEEDS = [
    "food emulsifiers",
    "food additives gut health",
    "ultra processed foods list",
    "titanium dioxide in food",
    "carrageenan inflammation",
    "artificial sweeteners insulin",
    "potassium bromate bread",
    "maltodextrin blood sugar",
    "polysorbate 80 side effects",
    "carboxymethylcellulose gut",
    "preservatives in packaged food",
    "banned food additives europe vs usa",
]

# Negative patterns (junk queries that don't match our authority content)
JUNK_PATTERNS = [
    r"meaning in [a-z]+",
    r"pdf",
    r"download",
    r"ppt",
    r"quiz",
    r"exam",
    r"wallpaper",
    r"job",
    r"salary",
    r"definition dictionary",
]


def get_existing_slugs() -> set:
    """Reads frontend/src/content/blog/index.ts and extracts existing slugs."""
    if not BLOG_INDEX_PATH.exists():
        return set()
    content = BLOG_INDEX_PATH.read_text(encoding="utf-8")
    matches = re.findall(r'slug:\s*["\']([^"\']+)["\']', content)
    return set(matches)


def query_google_autocomplete(query: str) -> list:
    """Queries Google Suggest API (free, fast, no auth)."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    url = "https://suggestqueries.google.com/complete/search"
    params = {"client": "chrome", "q": query}

    try:
        if requests:
            r = requests.get(url, params=params, headers=headers, timeout=4)
            if r.status_code == 200:
                raw = r.json()
                if len(raw) > 1 and isinstance(raw[1], list):
                    return [item.lower().strip() for item in raw[1]]
        else:
            import urllib.request
            import urllib.parse
            encoded = urllib.parse.quote(query)
            full_url = f"{url}?client=chrome&q={encoded}"
            req = urllib.request.Request(full_url, headers=headers)
            with urllib.request.urlopen(req, timeout=4, context=SSL_CONTEXT) as response:
                if response.status == 200:
                    raw = json.loads(response.read().decode("utf-8"))
                    if len(raw) > 1 and isinstance(raw[1], list):
                        return [item.lower().strip() for item in raw[1]]
    except Exception as e:
        sys.stderr.write(f"[WARN] Autocomplete error for '{query}': {e}\n")
    return []


def harvest_alphabet_soup(seed: str, sample_limit: int = 10) -> list:
    """Expands seed using 'seed a', 'seed b', etc."""
    suggestions = set()
    # Baseline query
    for s in query_google_autocomplete(seed):
        suggestions.add(s)

    # Alphabet letters (sampled to stay lightweight and fast)
    letters = [chr(i) for i in range(ord('a'), ord('z') + 1)]
    # Prioritize high-intent question modifiers first
    high_intent_prefixes = [f"{seed} is", f"{seed} why", f"{seed} side effects", f"{seed} vs", f"{seed} safe"]
    
    for prefix in high_intent_prefixes:
        for s in query_google_autocomplete(prefix):
            suggestions.add(s)
        time.sleep(0.15)  # respectful pacing

    for letter in letters[:sample_limit]:
        for s in query_google_autocomplete(f"{seed} {letter}"):
            suggestions.add(s)
        time.sleep(0.1)

    return list(suggestions)


def is_valid_keyword(keyword: str, existing_slugs: set) -> bool:
    """Filters out low-intent junk and duplicates."""
    kw = keyword.lower().strip()
    if len(kw.split()) < 3:
        return False  # Skip short 1-2 word head terms (too competitive for new site)
    if len(kw) > 80:
        return False

    for pattern in JUNK_PATTERNS:
        if re.search(pattern, kw):
            return False

    # Check cannibalization against existing slugs
    kw_slug = re.sub(r"[^a-z0-9]+", "-", kw).strip("-")
    for es in existing_slugs:
        if kw_slug in es or es in kw_slug:
            return False

    return True


def fetch_pubmed_evidence(query: str, max_studies: int = 3) -> list:
    """Queries PubMed E-Utilities API for peer-reviewed studies."""
    studies = []
    base_search = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    search_params = {
        "db": "pmc",
        "term": f"{query} gut OR toxicity OR metabolic",
        "retmode": "json",
        "retmax": str(max_studies),
        "sort": "pub_date",
    }

    try:
        if requests:
            r = requests.get(base_search, params=search_params, headers={"User-Agent": "ScanBeforeEat-Research/1.0"}, timeout=5)
            data = r.json()
        else:
            import urllib.request
            import urllib.parse
            search_url = f"{base_search}?{urllib.parse.urlencode(search_params)}"
            req = urllib.request.Request(search_url, headers={"User-Agent": "ScanBeforeEat-Research/1.0"})
            with urllib.request.urlopen(req, timeout=5, context=SSL_CONTEXT) as response:
                data = json.loads(response.read().decode("utf-8"))

        id_list = data.get("esearchresult", {}).get("idlist", [])
        if not id_list:
            return []

        # Fetch summaries
        summary_base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        summary_params = {
            "db": "pmc",
            "id": ",".join(id_list),
            "retmode": "json",
        }
        if requests:
            r_sum = requests.get(summary_base, params=summary_params, headers={"User-Agent": "ScanBeforeEat-Research/1.0"}, timeout=5)
            sum_data = r_sum.json()
        else:
            summary_url = f"{summary_base}?{urllib.parse.urlencode(summary_params)}"
            req_sum = urllib.request.Request(summary_url, headers={"User-Agent": "ScanBeforeEat-Research/1.0"})
            with urllib.request.urlopen(req_sum, timeout=5, context=SSL_CONTEXT) as resp_sum:
                sum_data = json.loads(resp_sum.read().decode("utf-8"))

        result_dict = sum_data.get("result", {})
        for uid in id_list:
            item = result_dict.get(uid)
            if item and "title" in item:
                studies.append({
                    "pmcid": f"PMC{uid}",
                    "title": item.get("title", "").rstrip("."),
                    "source": item.get("source", "Peer-Reviewed Medical Journal"),
                    "pubdate": item.get("pubdate", "Recent"),
                    "url": f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{uid}/",
                })
    except Exception as e:
        sys.stderr.write(f"[WARN] PubMed fetch error: {e}\n")

    return studies


def score_keyword(keyword: str, pubmed_count: int) -> int:
    """
    Computes Opportunity Score (0-100) for new health/YMYL site:
    - High-intent question modifiers (+25)
    - Specific chemical or additive name (+20)
    - Optimal long-tail length (4-7 words) (+25)
    - Peer-reviewed research backing available (+20)
    """
    score = 40
    words = keyword.lower().split()
    word_count = len(words)

    # Word count curve: 4-7 words is the sweet spot for rapid page-1 ranking
    if 4 <= word_count <= 7:
        score += 25
    elif word_count == 3:
        score += 15
    elif word_count > 7:
        score += 10

    # High-intent question signals (Google favors helpful answers)
    question_triggers = ["is", "why", "what", "how", "side effects", "safe", "danger", "risks", "harmful", "without"]
    if any(q in words or q in keyword for q in question_triggers):
        score += 20

    # Specific additive keywords
    additive_keywords = ["emulsifier", "carrageenan", "polysorbate", "maltodextrin", "sucralose", "aspartame", "bpa", "bromide", "preservative", "upf", "nova"]
    if any(ak in keyword for ak in additive_keywords):
        score += 15

    # Medical research backing (crucial for E-E-A-T)
    if pubmed_count >= 2:
        score += 20
    elif pubmed_count == 1:
        score += 10

    return min(100, score)


def generate_slug(text: str) -> str:
    """Generates a clean URL-friendly slug."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text


def main():
    parser = argparse.ArgumentParser(description="ScanBeforeEat Keyword Discovery Engine (Part A)")
    parser.add_argument("--seed", type=str, default="", help="Custom seed query (e.g., 'polysorbate 80')")
    parser.add_argument("--limit", type=int, default=1, help="Number of winning topics to output (default: 1)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON format")
    args = parser.parse_args()

    existing_slugs = get_existing_slugs()

    seeds_to_harvest = [args.seed] if args.seed else DEFAULT_SEEDS

    candidates = set()
    for seed in seeds_to_harvest:
        found = harvest_alphabet_soup(seed, sample_limit=8)
        for kw in found:
            if is_valid_keyword(kw, existing_slugs):
                candidates.add(kw)

    if not candidates:
        sys.stderr.write("[ERROR] No new keywords found after filtering.\n")
        sys.exit(1)

    scored_list = []
    # Fast heuristic pre-scoring
    for kw in candidates:
        pre_score = score_keyword(kw, pubmed_count=0)
        scored_list.append((kw, pre_score))

    # Sort descending and take top 5
    scored_list.sort(key=lambda x: x[1], reverse=True)
    top_candidates = scored_list[:5]

    final_results = []
    for kw, base_score in top_candidates:
        # Check PubMed scientific backing only for top candidates
        evidence = fetch_pubmed_evidence(kw, max_studies=2)
        final_score = base_score + (20 if len(evidence) >= 2 else (10 if len(evidence) == 1 else 0))
        slug = generate_slug(kw)

        # Categorize
        if any(term in kw for term in ["emulsifier", "polysorbate", "carboxymethylcellulose", "lecithin"]):
            cat = "Food Additives"
        elif any(term in kw for term in ["upf", "ultra-processed", "nova", "packaged"]):
            cat = "Ultra-Processed Foods"
        elif any(term in kw for term in ["toxic", "hazard", "banned", "poison", "carcinogen"]):
            cat = "Toxicology"
        else:
            cat = "Scientific Research"

        final_results.append({
            "keyword": kw,
            "slug": slug,
            "opportunity_score": min(100, final_score),
            "category": cat,
            "read_time": "8 min read",
            "pubmed_evidence": evidence,
        })

    final_results.sort(key=lambda x: x["opportunity_score"], reverse=True)
    winners = final_results[:args.limit]

    if args.json or True:
        print(json.dumps(winners, indent=2))


if __name__ == "__main__":
    main()
