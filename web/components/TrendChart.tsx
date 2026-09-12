// Precise hand-rolled SVG trend chart. No chart lib - full control of the line.
export default function TrendChart({
  series,
  height = 190,
}: {
  series: { label: string; color: string; points: { date: string; value: number }[] }[];
  height?: number;
}) {
  const W = 640;
  const H = height;
  const P = { t: 16, r: 12, b: 26, l: 40 };
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;

  const dates = series[0]?.points.map((p) => p.date) ?? [];
  const n = Math.max(dates.length, 1);
  const x = (i: number) => P.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => P.t + ih - Math.min(Math.max(v, 0), 1) * ih;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[520px] w-full" role="img">
        <defs>
          {series.map((s, k) => (
            <linearGradient key={k} id={`tg${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={P.l} x2={W - P.r} y1={y(g)} y2={y(g)} stroke="#1f1f1f" strokeDasharray={g === 0 ? "" : "3 5"} strokeWidth="1" />
            <text x={P.l - 8} y={y(g) + 3.5} textAnchor="end" fontSize="10" fill="#666" fontFamily="var(--font-geist-mono)">
              {Math.round(g * 100)}
            </text>
          </g>
        ))}
        {dates.map((d, i) => (
          <text key={d} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#666" fontFamily="var(--font-geist-mono)">
            {d.slice(5)}
          </text>
        ))}
        {series.map((s, k) => {
          const pts = s.points.map((p, i) => [x(i), y(p.value)] as const);
          const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
          const area = `${line} L${pts[pts.length - 1]?.[0] ?? P.l},${y(0)} L${pts[0]?.[0] ?? P.l},${y(0)} Z`;
          return (
            <g key={k}>
              {pts.length > 1 && <path d={area} fill={`url(#tg${k})`} />}
              <path d={line} fill="none" stroke={s.color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#000" stroke={s.color} strokeWidth="1.75" />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4">
        {series.map((s, k) => (
          <span key={k} className="flex items-center gap-1.5 font-mono text-[11px] text-mist-500">
            <span className="h-[3px] w-4 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
