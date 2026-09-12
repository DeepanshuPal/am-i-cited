import board from "@/data/board.json";

export type Engine = { id: string; label: string; model: string; status: string };
export type SampleRun = {
  mentioned?: boolean;
  cited?: boolean;
  position?: number | null;
  competitors_mentioned?: string[];
  competitors_cited?: string[];
  citation_domains?: string[];
  excerpt?: string;
  error?: string;
};
export type Prompt = {
  id: string;
  text: string;
  stats: { mention_rate: number; citation_rate: number; avg_position: number | null; sov: number };
  results: Record<string, { runs: SampleRun[] }>;
};
export type Board = {
  generated_at: string;
  run_date: string;
  samples_per_prompt: number;
  project: { name: string; url: string; category: string; aliases: string[]; domains: string[] };
  competitors: { name: string }[];
  engines: Engine[];
  prompts: Prompt[];
  aggregate: {
    overall: { samples: number; mention_rate: number; citation_rate: number; avg_position: number | null; sov: number };
    by_engine: Record<string, { samples: number; mention_rate: number; citation_rate: number; avg_position: number | null; sov: number }>;
    competitor_sov: { name: string; mentions: number; share: number }[];
    per_prompt: { id: string; mention_rate: number; citation_rate: number; avg_position: number | null; sov: number }[];
    trend: { date: string; sov: number; mention_rate: number; citation_rate: number; by_engine: Record<string, number> }[];
  };
};

export const data = board as unknown as Board;

export const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? "-" : `${Math.round(v * 100)}%`;

export const liveEngines = data.engines.filter((e) => e.status === "live");
export const hasData = data.aggregate.overall.samples > 0;
