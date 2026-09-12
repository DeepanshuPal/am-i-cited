// One stacked horizontal bar: your share of voice vs every tracked brand.
const GRAYS = ["#3d3d3d", "#343434", "#2c2c2c", "#262626", "#202020", "#1b1b1b", "#171717", "#141414"];

export default function SovStack({
  rows,
}: {
  rows: { name: string; share: number }[];
}) {
  const shown = rows.filter((r) => r.share > 0);
  const rest = 1 - shown.reduce((a, r) => a + r.share, 0);
  const segs = [...shown];
  if (rest > 0.005) segs.push({ name: "everyone else", share: rest });

  return (
    <div>
      <div className="flex h-9 w-full overflow-hidden rounded-lg border border-ink-700">
        {segs.map((s, i) => (
          <div
            key={s.name}
            className="group relative h-full"
            style={{
              width: `${Math.max(s.share * 100, 0.4)}%`,
              background: s.name === "you" ? "#5e6ad2" : GRAYS[i % GRAYS.length],
            }}
            title={`${s.name === "you" ? "you" : s.name}: ${Math.round(s.share * 100)}%`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {segs.map((s, i) => (
          <span key={s.name} className="flex items-center gap-2 font-mono text-[11.5px] text-mist-500">
            <span
              className="h-2 w-2 rounded-[3px]"
              style={{ background: s.name === "you" ? "#5e6ad2" : GRAYS[i % GRAYS.length] }}
            />
            <span className={s.name === "you" ? "text-mist-100" : ""}>{s.name === "you" ? "you" : s.name}</span>
            <span className="text-mist-600">{Math.round(s.share * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
