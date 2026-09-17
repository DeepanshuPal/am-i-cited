# Am I Cited?

Your buyers stopped googling. They ask ChatGPT, Perplexity, Gemini and Copilot
"what's the best X" - and you have no idea whether the answer names you or your
competitor. This repo fixes that for about the cost of a coffee.

Every week a GitHub Action asks each engine the questions your buyers ask
(via [LiteLLM](https://github.com/BerriAI/litellm)), records whether you were
mentioned, whether your domain was cited as a source, who was recommended
instead, and trends your share of voice on a public board.

**LLM answers are nondeterministic, so this board never reports a single
answer.** Every question is sampled 5x per engine per week and every number is
a percentage across samples.

Live demo board: tracks [`voice-router`](https://github.com/DeepanshuPal/voice-router)
across the voice-AI routing category.

## Quickstart

```bash
git clone https://github.com/DeepanshuPal/am-i-cited
cd am-i-cited
$EDITOR tracker.yaml    # your project, your buyer questions, your competitors
```

Then:

1. Add engine keys as repo secrets. An engine with no key is skipped and shown
   as `awaiting_key` - zero cost, zero failure.

   | secret              | engine      | model                |
   |---------------------|-------------|----------------------|
   | `GEMINI_API_KEY`    | Gemini      | gemini-2.5-flash     |
   | `OPENAI_API_KEY`    | ChatGPT     | gpt-4o-mini          |
   | `PERPLEXITY_API_KEY`| Perplexity  | sonar                |
   | `AZURE_API_KEY`     | Copilot     | gpt-4o               |

2. Repo Settings -> Pages -> Source: **GitHub Actions**.
3. Actions -> **sample** -> Run workflow, then **deploy** -> Run workflow.

Your board is live at `https://deepanshupal.github.io/am-i-cited/`. The sample
workflow re-runs every Monday 04:17 UTC and commits the new data.

### Run it locally

```bash
pip install -r requirements.txt
export GEMINI_API_KEY=...        # any subset of engines works
python scripts/sample.py         # writes data/runs/<date>.json
python scripts/aggregate.py      # writes web/data/board.json

cd web && npm install && npm run dev
```

## How it works

```text
tracker.yaml ──▶ scripts/sample.py ──▶ data/runs/<date>.json ──▶ scripts/aggregate.py
 (questions,      (LiteLLM, 5 samples      (every answer,           (percentages,
  competitors)     per question)            committed)               trends) ──▶ web/data/board.json
                                                                            │
                                              GitHub Pages ◀── Next.js static export ◀┘
```

- **No backend, no database.** Data is JSON in the repo. The site is a static
  export. Fork it and you own everything.
- **BYOK.** Weekly runs read repo secrets; the `/check` page calls providers
  straight from the visitor's browser with a localStorage key. Keys never
  touch a server you don't own.
- **Receipts.** Every number traces back to committed sampled answers in
  `data/runs/`.

## Methodology in one paragraph

Buyer-shaped questions (unbranded - "best tool for X", never "is Y good"),
5 samples per question per engine at temperature 1.0, weekly. Mention = brand
named in the answer. Citation = your domain linked as a source. Share of
voice = your mentions / all tracked-brand mentions. Position = how many
competitors get named before you. Full rules and known limits on the
[/methodology](web/app/methodology/page.tsx) page of the site.

## Stack

[LiteLLM](https://github.com/BerriAI/litellm) - one API across every engine ·
[Firecrawl](https://github.com/firecrawl/firecrawl) - question discovery and
citation-link verification · Next.js + Tailwind - the board · GitHub Actions -
the weekly clock · GitHub Pages - hosting.

MIT licensed. If the LLMs don't cite you yet, now you know.
