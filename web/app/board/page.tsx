import Metric from "@/components/Metric";
import EngineCard from "@/components/EngineCard";
import PromptTable from "@/components/PromptTable";
import SovStack from "@/components/SovStack";
import TrendChart from "@/components/TrendChart";
import { data, pct, hasData } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Board - Am I Cited?" };

export default function Board() {
  const o = data.aggregate.overall;
  const p = data.project;
  const highlightTerms = [p.name, ...p.aliases, ...data.competitors.map((c) => c.name)];

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="type-label">tracking</p>
          <h1 className="mt-3 flex items-center gap-3 text-[30px] font-medium tracking-[-0.02em]">
            {p.name}
            <span className="rounded-md border border-ink-600 bg-ink-900 px-2 py-1 font-mono text-[11px] font-normal text-mist-500">
              {p.category}
            </span>
          </h1>
          <a href={p.url} target="_blank" rel="noreferrer" className="link-quiet mt-2 inline-block font-mono text-[12px]">
            {p.url.replace("https://", "")}
          </a>
        </div>
        <div className="text-right font-mono text-[11.5px] leading-relaxed text-mist-500">
          <p>last run {data.run_date}</p>
          <p>
            {data.samples_per_prompt} samples per prompt per engine · next run Monday 04:17 UTC
          </p>
        </div>
      </div>

      {!hasData && (
        <div className="mt-8 rounded-xl border border-dashed border-ink-600 p-6">
          <p className="font-mono text-[12.5px] text-mist-500">
            first weekly sample pending - dispatch the sample workflow or wait for Monday 04:17 UTC.
          </p>
        </div>
      )}

      {/* Headline metrics */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="share of voice" value={hasData ? pct(o.sov) : "-"} sub="of all tracked-brand recommendations" />
        <Metric label="mention rate" value={hasData ? pct(o.mention_rate) : "-"} sub={`${o.samples} sampled answers`} />
        <Metric label="cited as source" value={hasData ? pct(o.citation_rate) : "-"} sub="your domain linked" />
        <Metric label="avg position" value={hasData && o.avg_position ? `#${o.avg_position}` : "-"} sub="when listed at all" />
      </div>

      {/* Engines */}
      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="type-label">engines</p>
            <h2 className="mt-2 text-[20px] font-medium tracking-tight">Per-engine share of voice</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.engines.map((e) => (
            <EngineCard key={e.id} label={e.label} model={e.model} status={e.status} stats={data.aggregate.by_engine[e.id]} />
          ))}
        </div>
      </section>

      {/* SOV + trend */}
      {hasData && (
        <section className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="type-label mb-4">who gets recommended instead</p>
            <SovStack rows={data.aggregate.competitor_sov} />
          </div>
          <div>
            <p className="type-label mb-4">weekly trend</p>
            <TrendChart
              series={[
                { label: "share of voice", color: "#7c86e8", points: data.aggregate.trend.map((t) => ({ date: t.date, value: t.sov })) },
                { label: "mention rate", color: "#3d3d3d", points: data.aggregate.trend.map((t) => ({ date: t.date, value: t.mention_rate })) },
              ]}
            />
          </div>
        </section>
      )}

      {/* Prompts */}
      <section className="mt-14">
        <div className="mb-5">
          <p className="type-label">the questions</p>
          <h2 className="mt-2 text-[20px] font-medium tracking-tight">What buyers ask, and what they hear back</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-mist-500">
            Every row is a real question sampled {data.samples_per_prompt} times per engine. Expand a row to
            read an actual sampled answer, brand names highlighted.
          </p>
        </div>
        <PromptTable prompts={data.prompts} engines={data.engines} aliases={highlightTerms} />
      </section>

      {/* Honesty footer */}
      <section className="mt-14 rounded-xl border border-ink-700 bg-ink-900/50 p-6">
        <p className="type-label">read these numbers like this</p>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-mist-500">
          LLM answers are nondeterministic: ask twice, get two answers. Every figure here is a
          percentage across {data.samples_per_prompt} independent samples per question per engine, re-run
          weekly. A single answer means nothing; the distribution is the truth. Full rules on the{" "}
          <a href="/methodology/" className="link-quiet underline decoration-ink-500 underline-offset-4">methodology page</a>.
        </p>
      </section>
    </div>
  );
}
