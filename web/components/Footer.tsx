import { GitHubMark } from "./Nav";

export default function Footer() {
  return (
    <footer className="border-t border-ink-700/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] text-mist-300">Am I Cited?</p>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-mist-500">
            Open-source AEO tracker. Built on{" "}
            <a className="link-quiet underline decoration-ink-500 underline-offset-4" href="https://github.com/BerriAI/litellm" target="_blank" rel="noreferrer">LiteLLM</a>
            {" "}and{" "}
            <a className="link-quiet underline decoration-ink-500 underline-offset-4" href="https://github.com/firecrawl/firecrawl" target="_blank" rel="noreferrer">Firecrawl</a>
            . No backend, no database, your keys never leave your hands.
          </p>
        </div>
        <div className="flex items-center gap-5 font-mono text-[12px] text-mist-500">
          <a className="link-quiet flex items-center gap-1.5" href="https://github.com/DeepanshuPal/am-i-cited" target="_blank" rel="noreferrer">
            <GitHubMark className="h-3.5 w-3.5" /> source
          </a>
          <span>MIT</span>
        </div>
      </div>
    </footer>
  );
}
