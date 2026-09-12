"""Aggregate data/runs/*.json into web/data/board.json for the site.

Every number on the board is a percentage across sampled runs, never a
single verdict. Share of voice = your mentions / all tracked-brand mentions.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
RUNS_DIR = ROOT / "data" / "runs"
OUT = ROOT / "web" / "data" / "board.json"


def pct(part, whole):
    return round(part / whole, 4) if whole else 0.0


def aggregate_run(run: dict, tracker: dict) -> dict:
    prompts = {p["id"]: p for p in tracker["prompts"]}
    live = [e["id"] for e in run["engines"] if e["status"] == "live"]
    comp_names = [c["name"] for c in tracker.get("competitors", [])]

    per_prompt = []
    engine_tot = {e: {"n": 0, "mentioned": 0, "cited": 0, "pos": [], "comp": {c: 0 for c in comp_names}} for e in live}

    for pid, engines in run["results"].items():
        p_stats = {"n": 0, "mentioned": 0, "cited": 0, "pos": [], "comp_mentions": 0}
        for eid, payload in engines.items():
            for r in payload["runs"]:
                if r.get("error"):
                    continue
                t = engine_tot[eid]
                t["n"] += 1
                p_stats["n"] += 1
                total_brand_mentions = 1 if r["mentioned"] else 0
                total_brand_mentions += len(r["competitors_mentioned"])
                if r["mentioned"]:
                    t["mentioned"] += 1
                    p_stats["mentioned"] += 1
                    t["pos"].append(r["position"])
                    p_stats["pos"].append(r["position"])
                if r["cited"]:
                    t["cited"] += 1
                    p_stats["cited"] += 1
                for cn in r["competitors_mentioned"]:
                    t["comp"][cn] += 1
                p_stats["comp_mentions"] += len(r["competitors_mentioned"])
        per_prompt.append({
            "id": pid,
            "mention_rate": pct(p_stats["mentioned"], p_stats["n"]),
            "citation_rate": pct(p_stats["cited"], p_stats["n"]),
            "avg_position": round(sum(p_stats["pos"]) / len(p_stats["pos"]), 1) if p_stats["pos"] else None,
            "sov": pct(p_stats["mentioned"], p_stats["mentioned"] + p_stats["comp_mentions"]),
        })

    def eng_summary(t):
        comp_total = sum(t["comp"].values())
        return {
            "samples": t["n"],
            "mention_rate": pct(t["mentioned"], t["n"]),
            "citation_rate": pct(t["cited"], t["n"]),
            "avg_position": round(sum(t["pos"]) / len(t["pos"]), 1) if t["pos"] else None,
            "sov": pct(t["mentioned"], t["mentioned"] + comp_total),
        }

    by_engine = {e: eng_summary(t) for e, t in engine_tot.items()}

    # Share of voice across the whole run: every tracked brand's mention count.
    brand_counts = {"you": sum(t["mentioned"] for t in engine_tot.values())}
    for c in comp_names:
        brand_counts[c] = sum(t["comp"][c] for t in engine_tot.values())
    total = sum(brand_counts.values())
    competitor_sov = sorted(
        ({"name": k, "mentions": v, "share": pct(v, total)} for k, v in brand_counts.items()),
        key=lambda x: -x["share"],
    )

    tot_n = sum(t["n"] for t in engine_tot.values())
    tot_m = sum(t["mentioned"] for t in engine_tot.values())
    tot_c = sum(t["cited"] for t in engine_tot.values())
    all_pos = [p for t in engine_tot.values() for p in t["pos"]]
    overall = {
        "samples": tot_n,
        "mention_rate": pct(tot_m, tot_n),
        "citation_rate": pct(tot_c, tot_n),
        "avg_position": round(sum(all_pos) / len(all_pos), 1) if all_pos else None,
        "sov": pct(brand_counts["you"], total),
    }

    return {"per_prompt": per_prompt, "by_engine": by_engine,
            "competitor_sov": competitor_sov, "overall": overall}


def main():
    with open(ROOT / "tracker.yaml") as f:
        tracker = yaml.safe_load(f)

    runs = []
    for path in sorted(RUNS_DIR.glob("*.json")):
        with open(path) as f:
            runs.append(json.load(f))
    if not runs:
        runs = [{
            "run_date": "pending",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "samples_per_prompt": int(tracker.get("samples_per_prompt", 5)),
            "engines": [{k: e[k] for k in ("id", "label", "model")} | {"status": "awaiting_key"}
                        for e in tracker["engines"]],
            "results": {},
        }]

    latest = runs[-1]
    agg = aggregate_run(latest, tracker)

    trend = []
    for run in runs:
        a = aggregate_run(run, tracker)
        trend.append({
            "date": run["run_date"],
            "sov": a["overall"]["sov"],
            "mention_rate": a["overall"]["mention_rate"],
            "citation_rate": a["overall"]["citation_rate"],
            "by_engine": {e: v["sov"] for e, v in a["by_engine"].items()},
        })

    # Keep full sampled answers for the latest run so the board can show receipts.
    prompts_full = []
    for p in tracker["prompts"]:
        entry = {"id": p["id"], "text": p["text"], "results": latest["results"].get(p["id"], {})}
        stats = next((s for s in agg["per_prompt"] if s["id"] == p["id"]), {})
        entry["stats"] = stats
        prompts_full.append(entry)

    board = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "run_date": latest["run_date"],
        "samples_per_prompt": latest["samples_per_prompt"],
        "project": tracker["project"],
        "competitors": [{"name": c["name"]} for c in tracker.get("competitors", [])],
        "engines": latest["engines"],
        "prompts": prompts_full,
        "aggregate": {**agg, "trend": trend},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(board, f)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
