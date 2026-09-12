"""Sample LLM engines with buyer questions and record who gets cited.

Reads tracker.yaml, asks every prompt x engine pair N times via LiteLLM,
parses each answer for brand mentions and citation domains, and writes one
JSON file per run to data/runs/<date>.json.

Engines without their key env var are skipped and reported as awaiting_key.
No keys anywhere in the repo; they come from the environment (repo secrets
in GitHub Actions, .env locally).
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
RUNS_DIR = ROOT / "data" / "runs"

URL_RE = re.compile(r"https?://[^\s\)\]\"'>]+", re.IGNORECASE)
MD_LINK_RE = re.compile(r"\[[^\]]*\]\((https?://[^\)]+)\)")


def load_tracker():
    with open(ROOT / "tracker.yaml") as f:
        return yaml.safe_load(f)


def domain_of(url: str) -> str:
    host = re.sub(r"^https?://", "", url).split("/")[0].lower()
    return host[4:] if host.startswith("www.") else host


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower())


def analyze(answer: str, project: dict, competitors: list) -> dict:
    """Parse one sampled answer into mention/citation facts."""
    text = norm(answer)
    urls = MD_LINK_RE.findall(answer) + URL_RE.findall(answer)
    domains = sorted({domain_of(u) for u in urls})

    def mentions(aliases):
        return any(norm(a) in text for a in aliases)

    def cited(domains_list):
        return any(
            any(d == cd or d.endswith("." + cd) or cd.endswith(d) for d in domains)
            for cd in domains_list
        )

    mentioned = mentions(project["aliases"])
    proj_cited = cited(project.get("domains", []))

    # Position: order of first appearance among all tracked brands.
    positions = {}
    for a in project["aliases"]:
        i = text.find(norm(a))
        if i >= 0:
            positions["you"] = min(i, positions.get("you", i))
    comp_hits = []
    for c in competitors:
        first = None
        for a in c["aliases"]:
            i = text.find(norm(a))
            if i >= 0:
                first = i if first is None else min(first, i)
        if first is not None:
            comp_hits.append({"name": c["name"], "first_at": first,
                              "cited": cited(c.get("domains", []))})
    if "you" in positions:
        ahead = sum(1 for c in comp_hits if c["first_at"] < positions["you"])
        position = ahead + 1
    else:
        position = None

    return {
        "mentioned": mentioned,
        "cited": proj_cited,
        "position": position,
        "competitors_mentioned": [c["name"] for c in comp_hits],
        "competitors_cited": [c["name"] for c in comp_hits if c["cited"]],
        "citation_domains": domains,
        "excerpt": answer.strip()[:1200],
    }


def main():
    tracker = load_tracker()
    project = tracker["project"]
    competitors = tracker.get("competitors", [])
    n = int(tracker.get("samples_per_prompt", 5))
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        import litellm
        litellm.drop_params = True
    except ImportError:
        print("litellm is required: pip install -r requirements.txt", file=sys.stderr)
        sys.exit(1)

    engines_out = []
    for eng in tracker["engines"]:
        if not os.environ.get(eng["key_env"]):
            engines_out.append({**{k: eng[k] for k in ("id", "label", "model")},
                                "status": "awaiting_key"})
            print(f"[skip] {eng['label']}: {eng['key_env']} not set")
            continue
        engines_out.append({**{k: eng[k] for k in ("id", "label", "model")},
                            "status": "live"})

    results = {}
    for prompt in tracker["prompts"]:
        results[prompt["id"]] = {}
        for eng in engines_out:
            if eng["status"] != "live":
                continue
            full = next(e for e in tracker["engines"] if e["id"] == eng["id"])
            runs = []
            # github/<model> means GitHub Models: call its OpenAI-compatible
            # endpoint directly so any GITHUB_TOKEN (Actions built-in or PAT)
            # just works.
            model = full["model"]
            extra = {}
            if model.startswith("github/"):
                model = "openai/" + model.split("/", 1)[1]
                extra["api_base"] = "https://models.github.ai/inference"
                extra["api_key"] = os.environ["GITHUB_TOKEN"]
            for i in range(n):
                try:
                    resp = litellm.completion(
                        model=model,
                        messages=[{"role": "user", "content": prompt["text"]}],
                        temperature=1.0,
                        max_tokens=700,
                        timeout=90,
                        **extra,
                    )
                    answer = resp.choices[0].message.content or ""
                    runs.append(analyze(answer, project, competitors))
                    print(f"[ok] {prompt['id']} {eng['id']} sample {i + 1}/{n}")
                except Exception as e:  # engine errors are data too
                    runs.append({"error": str(e)[:300]})
                    print(f"[err] {prompt['id']} {eng['id']} sample {i + 1}/{n}: {e}")
            results[prompt["id"]][eng["id"]] = {"runs": runs}

    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    out = {
        "run_date": today,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "samples_per_prompt": n,
        "engines": engines_out,
        "results": results,
    }
    path = RUNS_DIR / f"{today}.json"
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
