import CheckWidget from "@/components/CheckWidget";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check now - Am I Cited?" };

export default function Check() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="type-label">live check</p>
      <h1 className="mt-4 text-[34px] font-medium tracking-[-0.02em]">Ask right now, with your own key</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist-500">
        The weekly board tracks one project over time. This page answers a one-off question
        immediately: paste a provider key, name your brand, ask what a buyer would ask. We
        sample it three times and show you the verdict with receipts.
      </p>
      <div className="mt-10">
        <CheckWidget />
      </div>
      <p className="mt-6 font-mono text-[11.5px] leading-relaxed text-mist-600">
        your key is stored in this browser's localStorage and sent only to the provider you
        picked. this site has no backend and sees nothing.
      </p>
    </div>
  );
}
