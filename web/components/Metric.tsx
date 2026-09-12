export default function Metric({
  label,
  value,
  sub,
  hint,
}: {
  label: string;
  value: string;
  sub?: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="type-label">{label}</p>
      <p className="num mt-3 text-[34px] leading-none tracking-tight text-mist-100">{value}</p>
      {sub && <p className="mt-2 text-[12.5px] text-mist-500">{sub}</p>}
      {hint && <p className="mt-1 font-mono text-[11px] text-mist-600">{hint}</p>}
    </div>
  );
}
