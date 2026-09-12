import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology - Am I Cited?" };

const rules = [
  {
    t: "Sample, never spot-check",
    b: "Each buyer question is asked to each engine 5 times per weekly run at temperature 1.0. One answer is anecdote; five is a distribution. The board reports only rates across samples.",
  },
  {
    t: "Ask like a buyer",
    b: "Prompts are the unbranded questions a real buyer types: \"best tool for X\", \"how do I avoid Y\". No brand names in the question - that would tell you nothing about discovery.",
  },
  {
    t: "Mention vs citation",
    b: "A mention is your brand name in the answer text. A citation is your domain appearing as a linked source. Citations are rarer, stronger, and tracked separately.",
  },
  {
    t: "Share of voice, not vibes",
    b: "SOV = your mentions divided by all tracked-brand mentions across the same answers. If the machine recommends someone, it is either you or a competitor. The pie always sums to 100%.",
  },
  {
    t: "Position when listed",
    b: "When an answer lists options, order matters. We record how many competitors are named before you and average it. #1 means named first.",
  },
  {
    t: "Receipts, always",
    b: "Every sampled answer is committed to the repo as JSON. Any number on the board can be traced back to the exact answers that produced it.",
  },
];

export default function Methodology() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="type-label">methodology</p>
      <h1 className="mt-4 text-[34px] font-medium tracking-[-0.02em]">How the numbers are made</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist-500">
        LLM visibility tooling has a credibility problem: most tools ask once and sell you the
        answer. These are the rules this board runs on instead.
      </p>
      <div className="mt-12 space-y-0 divide-y divide-ink-700/70 border-y border-ink-700/70">
        {rules.map((r, i) => (
          <div key={r.t} className="grid gap-2 py-6 sm:grid-cols-[64px_1fr]">
            <span className="font-mono text-[12px] text-accent-bright">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-[16px] font-medium tracking-tight">{r.t}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist-500">{r.b}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-xl border border-ink-700 bg-ink-900/50 p-6">
        <p className="type-label">known limits</p>
        <ul className="mt-3 list-none space-y-2.5 text-[13.5px] leading-relaxed text-mist-500">
          <li>- API answers can differ from consumer-app answers, which sometimes include browsing and personalization. We measure the API, consistently, so trends are comparable week over week.</li>
          <li>- Five samples per week catches real movement, not day-to-day jitter. Raise samples_per_prompt in tracker.yaml if you need tighter intervals and accept the cost.</li>
          <li>- Engines without a repo secret show as awaiting_key and contribute nothing. Percentages are computed over live engines only.</li>
        </ul>
      </div>
    </div>
  );
}
