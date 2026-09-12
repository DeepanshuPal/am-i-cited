"use client";

import { useState } from "react";
import type { Prompt, Engine } from "@/lib/data";
import { pct } from "@/lib/data";

// Highlight the tracked brand and competitor names inside sampled answers.
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="rounded-[3px] bg-accent/25 px-0.5 text-mist-100">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function PromptTable({
  prompts,
  engines,
  aliases,
}: {
  prompts: Prompt[];
  engines: Engine[];
  aliases: string[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const live = engines.filter((e) => e.status === "live");
  const highlightTerms = aliases;

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr_repeat(3,88px)] items-center gap-2 border-b border-ink-700 px-5 py-3 sm:grid-cols-[1fr_repeat(4,96px)]">
        <span className="type-label">buyer question</span>
        <span className="type-label text-right">mentioned</span>
        <span className="type-label text-right">cited</span>
        <span className="type-label hidden text-right sm:block">avg pos</span>
        <span className="type-label text-right">voice</span>
      </div>
      {prompts.map((p) => {
        const isOpen = open === p.id;
        return (
          <div key={p.id} className="border-b border-ink-700/60 last:border-0">
            <button
              onClick={() => setOpen(isOpen ? null : p.id)}
              className="grid w-full grid-cols-[1fr_repeat(3,88px)] items-center gap-2 px-5 py-3.5 text-left transition-colors hover:bg-ink-850 sm:grid-cols-[1fr_repeat(4,96px)]"
            >
              <span className="pr-4 text-[13.5px] leading-snug text-mist-300">{p.text}</span>
              <Cell v={pct(p.stats.mention_rate)} good={p.stats.mention_rate > 0.5} />
              <Cell v={pct(p.stats.citation_rate)} good={p.stats.citation_rate > 0.25} />
              <span className="num hidden text-right text-[12.5px] text-mist-300 sm:block">
                {p.stats.avg_position ? `#${p.stats.avg_position}` : "-"}
              </span>
              <Cell v={pct(p.stats.sov)} good={p.stats.sov > 0.15} />
            </button>
            {isOpen && (
              <div className="border-t border-ink-700/60 bg-ink-900/60 px-5 py-4">
                {live.length === 0 && (
                  <p className="font-mono text-[12px] text-mist-500">no sampled answers yet - first run pending</p>
                )}
                {live.map((e) => {
                  const runs = p.results[e.id]?.runs ?? [];
                  const ok = runs.filter((r) => !r.error);
                  const shown = ok.find((r) => r.mentioned) ?? ok[0];
                  if (!shown) return null;
                  return (
                    <div key={e.id} className="mb-4 last:mb-0">
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-[11px] uppercase tracking-micro text-mist-500">{e.label}</span>
                        <span className="font-mono text-[11px] text-mist-600">
                          {ok.filter((r) => r.mentioned).length}/{ok.length} samples mention you
                        </span>
                        {shown.cited && <span className="rounded border border-good/30 bg-good/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-micro text-good">cited</span>}
                      </div>
                      <p className="max-w-3xl whitespace-pre-wrap text-[12.5px] leading-relaxed text-mist-500">
                        <Highlight text={shown.excerpt ?? ""} terms={highlightTerms} />
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Cell({ v, good }: { v: string; good: boolean }) {
  return (
    <span className={`num text-right text-[12.5px] ${good ? "text-mist-100" : "text-mist-500"}`}>{v}</span>
  );
}
