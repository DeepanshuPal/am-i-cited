import { pct } from "@/lib/data";

export default function EngineCard({
  label,
  model,
  status,
  stats,
}: {
  label: string;
  model: string;
  status: string;
  stats?: { samples: number; mention_rate: number; citation_rate: number; avg_position: number | null; sov: number };
}) {
  if (status !== "live" || !stats) {
    return (
      <div className="rounded-xl border border-dashed border-ink-600 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-mist-300">{label}</p>
          <span className="font-mono text-[10.5px] uppercase tracking-micro text-mist-600">awaiting key</span>
        </div>
        <p className="mt-4 text-[12.5px] leading-relaxed text-mist-600">
          Add the repo secret and this engine starts sampling on the next weekly run.
        </p>
        <p className="mt-3 font-mono text-[11px] text-mist-600">{model}</p>
      </div>
    );
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-medium">{label}</p>
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-micro text-good">
          <span className="h-1.5 w-1.5 rounded-full bg-good" /> live
        </span>
      </div>
      <p className="num mt-4 text-[30px] leading-none tracking-tight">{pct(stats.sov)}</p>
      <p className="mt-1 text-[11.5px] text-mist-500">share of voice</p>
      <div className="mt-4 space-y-2 border-t border-ink-700/70 pt-3 font-mono text-[11.5px]">
        <Row k="mentioned" v={pct(stats.mention_rate)} />
        <Row k="cited as source" v={pct(stats.citation_rate)} />
        <Row k="avg position" v={stats.avg_position ? `#${stats.avg_position}` : "-"} />
        <Row k="samples" v={String(stats.samples)} dim />
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-mist-600">{model}</p>
    </div>
  );
}

function Row({ k, v, dim }: { k: string; v: string; dim?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mist-500">{k}</span>
      <span className={dim ? "text-mist-600" : "text-mist-100"}>{v}</span>
    </div>
  );
}
