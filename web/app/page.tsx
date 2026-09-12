import Link from "next/link";
import { ArrowUpRight } from "@/components/Nav";
import SovStack from "@/components/SovStack";
import TrendChart from "@/components/TrendChart";
import { data, pct, hasData } from "@/lib/data";

export default function Home() {
  const o = data.aggregate.overall;
  const live = data.engines.filter((e) => e.status === "live");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-700/60">
        <div className="bg-grid fade-edges absolute inset-0" />
        <div className="glow-accent absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-32">
          <p className="type-label">open-source AEO tracking</p>
          <h1 className="mt-5 max-w-3xl text-[42px] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[64px]">
            Your buyers stopped googling.
            <br />
            <span className="text-mist-500">Do the LLMs send them to you?</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-mist-500">
            Every week, Am I Cited? asks ChatGPT, Perplexity, Gemini and Copilot the questions
            your buyers ask - records whether you are mentioned, who is cited instead, and
            trends your share of voice. Bring your own keys. No backend. No $189/mo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/board/"
              className="rounded-md bg-mist-100 px-4 py-2 text-[13.5px] font-medium text-ink-950 transition-opacity hover:opacity-85"
            >
              View the live board
            </Link>
            <a
              href="https://github.com/DeepanshuPal/am-i-cited"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-ink-600 bg-ink-900/60 px-4 py-2 text-[13.5px] text-mist-300 transition-colors hover:border-ink-500 hover:text-mist-100"
            >
              Fork it, track yourself <ArrowUpRight />
            </a>
          </div>

          {/* Live numbers strip */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 sm:grid-cols-4">
            <Stat label="share of voice" value={hasData ? pct(o.sov) : "-"} sub={`${data.project.name}, ${data.project.category}`} />
            <Stat label="mention rate" value={hasData ? pct(o.mention_rate) : "-"} sub={`across ${o.samples || 0} sampled answers`} />
            <Stat label="cited as source" value={hasData ? pct(o.citation_rate) : "-"} sub="your domain, linked" />
            <Stat label="engines live" value={`${live.length}/${data.engines.length}`} sub={live.map((e) => e.label).join(" · ") || "first run pending"} />
          </div>
          <p className="mt-3 font-mono text-[11px] text-mist-600">
            live data - last run {data.run_date} · {data.samples_per_prompt} samples per prompt per engine · never a single verdict
          </p>
        </div>
      </section>

      {/* Share of voice preview */}
      <section className="border-b border-ink-700/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="type-label">this week, {data.project.category}</p>
              <h2 className="mt-3 text-[26px] font-medium tracking-[-0.02em]">Who the machines recommend</h2>
            </div>
            <Link href="/board/" className="link-quiet flex items-center gap-1 text-[13px]">
              full board <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-8">
            {hasData ? (
              <SovStack rows={data.aggregate.competitor_sov} />
            ) : (
              <p className="font-mono text-[12px] text-mist-500">first weekly sample pending - the board fills itself in.</p>
            )}
          </div>
          {data.aggregate.trend.length > 0 && (
            <div className="mt-12">
              <p className="type-label mb-4">share of voice, weekly</p>
              <TrendChart
                series={[
                  { label: "share of voice", color: "#7c86e8", points: data.aggregate.trend.map((t) => ({ date: t.date, value: t.sov })) },
                  { label: "mention rate", color: "#3d3d3d", points: data.aggregate.trend.map((t) => ({ date: t.date, value: t.mention_rate })) },
                ]}
              />
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink-700/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="type-label">how it works</p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 md:grid-cols-3">
            <Step
              n="01"
              title="Write down the questions"
              body="The exact things your buyers type into ChatGPT at 11pm. Ten of them in tracker.yaml is a great start. Firecrawl can discover more from your site and community threads."
            />
            <Step
              n="02"
              title="Sample every engine, weekly"
              body="A GitHub Action asks each engine every question five times through LiteLLM. LLM answers are nondeterministic, so the board only ever reports percentages across samples - never one lucky or unlucky answer."
            />
            <Step
              n="03"
              title="Watch share of voice move"
              body="Mentioned or not. Cited as a source or not. Position when listed. Who gets recommended instead. Trended weekly, committed as plain JSON, diffable forever."
            />
          </div>
        </div>
      </section>

      {/* BYOK */}
      <section className="border-b border-ink-700/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="type-label">bring your own keys</p>
            <h2 className="mt-3 text-[26px] font-medium tracking-[-0.02em]">Your keys. Your repo. Your data.</h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-mist-500">
              There is no server to trust because there is no server. Keys live as GitHub repo
              secrets for the weekly runs, or in your browser's localStorage for a live check.
              Every sampled answer is committed to your repo as JSON you can audit.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/check/" className="rounded-md border border-accent/50 bg-accent/10 px-4 py-2 text-[13.5px] text-mist-100 transition-colors hover:bg-accent/20">
                Run a live check
              </Link>
              <a href="https://github.com/DeepanshuPal/am-i-cited#quickstart" target="_blank" rel="noreferrer" className="link-quiet flex items-center gap-1 px-2 py-2 text-[13.5px]">
                self-host in 5 minutes <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="border-b border-ink-700 px-5 py-3">
              <span className="font-mono text-[11.5px] text-mist-500">terminal</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-mist-300">{`git clone https://github.com/DeepanshuPal/am-i-cited
cd am-i-cited

# the questions your buyers ask
$EDITOR tracker.yaml

# keys as repo secrets - engines without
# a key simply show as awaiting_key
gh secret set GEMINI_API_KEY

# enable Pages, dispatch the sample
# workflow - the board builds itself`}</pre>
          </div>
        </div>
      </section>

      {/* Stack credit */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-md text-[13.5px] leading-relaxed text-mist-500">
              Standing on{" "}
              <a className="link-quiet underline decoration-ink-500 underline-offset-4" href="https://github.com/BerriAI/litellm" target="_blank" rel="noreferrer">LiteLLM</a>
              {" "}for one API across every engine,{" "}
              <a className="link-quiet underline decoration-ink-500 underline-offset-4" href="https://github.com/firecrawl/firecrawl" target="_blank" rel="noreferrer">Firecrawl</a>
              {" "}for question discovery, GitHub Actions for the weekly clock, GitHub Pages for the board.
            </p>
            <p className="font-mono text-[11.5px] text-mist-600">total monthly cost at founder scale: about a coffee</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-ink-950 p-5">
      <p className="type-label">{label}</p>
      <p className="num mt-3 text-[28px] leading-none tracking-tight">{value}</p>
      <p className="mt-2 truncate text-[11.5px] text-mist-600">{sub}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-ink-950 p-6">
      <p className="font-mono text-[12px] text-accent-bright">{n}</p>
      <h3 className="mt-4 text-[16px] font-medium tracking-tight">{title}</h3>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-500">{body}</p>
    </div>
  );
}
