"use client";

import { useEffect, useState } from "react";

// BYOK live check: the key is stored in localStorage only and every call goes
// straight from the visitor's browser to the provider. Nothing touches a server.
const PROVIDERS = [
  {
    id: "gemini",
    label: "Gemini",
    hint: "free key at aistudio.google.com",
    models: ["gemini-3.6-flash", "gemini-3.6-pro"],
  },
  { id: "openai", label: "OpenAI", hint: "sk-...", models: ["gpt-4o-mini", "gpt-4o"] },
  { id: "openrouter", label: "OpenRouter", hint: "one key, every model", models: ["openai/gpt-4o-mini", "google/gemini-3.6-flash"] },
] as const;

type Verdict = { mentioned: boolean; cited: boolean; excerpt: string } | { error: string };

export default function CheckWidget() {
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>(PROVIDERS[0]);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<string>(PROVIDERS[0].models[0]);
  const [brand, setBrand] = useState("");
  const [domain, setDomain] = useState("");
  const [question, setQuestion] = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const K = 3;

  useEffect(() => {
    const saved = localStorage.getItem(`aic-key-${provider.id}`);
    if (saved) setApiKey(saved);
    else setApiKey("");
    setModel(provider.models[0]);
  }, [provider]);

  async function askOnce(): Promise<Verdict> {
    const sys = "Answer helpfully and concretely, naming specific products where relevant.";
    try {
      let text = "";
      if (provider.id === "gemini") {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: `${sys}\n\n${question}` }] }] }),
          }
        );
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message ?? `HTTP ${r.status}`);
        text = j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
      } else {
        const url = provider.id === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
        const r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: sys },
              { role: "user", content: question },
            ],
            max_tokens: 600,
            temperature: 1,
          }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message ?? `HTTP ${r.status}`);
        text = j.choices?.[0]?.message?.content ?? "";
      }
      const low = text.toLowerCase();
      const mentioned = brand.trim().length > 0 && low.includes(brand.trim().toLowerCase());
      const dom = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const cited = dom.length > 0 && low.includes(dom);
      return { mentioned, cited, excerpt: text.slice(0, 900) };
    } catch (e: any) {
      return { error: e.message ?? "request failed" };
    }
  }

  async function run() {
    if (!apiKey || !brand || !question) return;
    localStorage.setItem(`aic-key-${provider.id}`, apiKey);
    setRunning(true);
    setVerdicts([]);
    setDone(0);
    const acc: Verdict[] = [];
    for (let i = 0; i < K; i++) {
      const v = await askOnce();
      acc.push(v);
      setVerdicts([...acc]);
      setDone(i + 1);
    }
    setRunning(false);
  }

  const okRuns = verdicts.filter((v) => !("error" in v)) as { mentioned: boolean; cited: boolean; excerpt: string }[];
  const mentionRate = okRuns.length ? okRuns.filter((v) => v.mentioned).length / okRuns.length : 0;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p)}
            className={`rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
              provider.id === p.id
                ? "border-accent/60 bg-accent/15 text-mist-100"
                : "border-ink-600 bg-ink-900 text-mist-500 hover:text-mist-300"
            }`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto self-center font-mono text-[11px] text-mist-600">{provider.hint}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label={`${provider.label} API key`}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="stored in your browser only"
            className="inp"
          />
        </Field>
        <Field label="model">
          <select value={model} onChange={(e) => setModel(e.target.value)} className="inp">
            {provider.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="your brand">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. voice-router" className="inp" />
        </Field>
        <Field label="your domain (for citation checks)">
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. github.com/you/repo" className="inp" />
        </Field>
      </div>
      <Field label="a question your buyers ask" className="mt-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          placeholder="e.g. What's the best open-source tool for X?"
          className="inp resize-none"
        />
      </Field>

      <button
        onClick={run}
        disabled={running || !apiKey || !brand || !question}
        className="mt-4 rounded-md bg-mist-100 px-4 py-2 text-[13.5px] font-medium text-ink-950 transition-opacity disabled:opacity-30"
      >
        {running ? `sampling ${done}/${K}...` : `Ask ${K} times`}
      </button>
      <p className="mt-2 font-mono text-[11px] text-mist-600">
        calls go browser → {provider.label} directly. no server, no logging, key stays in localStorage.
      </p>

      {verdicts.length > 0 && (
        <div className="mt-6 border-t border-ink-700 pt-5">
          <div className="flex items-baseline gap-3">
            <span className="num text-[30px] leading-none tracking-tight">
              {okRuns.length ? Math.round(mentionRate * 100) : 0}%
            </span>
            <span className="text-[12.5px] text-mist-500">
              of {okRuns.length} sampled answer{okRuns.length === 1 ? "" : "s"} mention {brand || "you"}
              {okRuns.some((v) => v.cited) ? " - with your domain cited" : ""}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {verdicts.map((v, i) => (
              <div key={i} className="rounded-lg border border-ink-700 bg-ink-950 p-3.5">
                {"error" in v ? (
                  <p className="font-mono text-[12px] text-bad">sample {i + 1}: {v.error}</p>
                ) : (
                  <>
                    <p className="mb-1.5 font-mono text-[11px]">
                      <span className="text-mist-600">sample {i + 1} - </span>
                      <span className={v.mentioned ? "text-good" : "text-bad"}>
                        {v.mentioned ? "mentioned" : "not mentioned"}
                      </span>
                      {v.cited && <span className="text-good"> · cited</span>}
                    </p>
                    <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-mist-500">{v.excerpt}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="type-label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
