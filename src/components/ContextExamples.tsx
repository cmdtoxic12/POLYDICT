"use client";

import { useState } from "react";
import { BookOpen, LoaderCircle } from "lucide-react";
import type { LanguageCode } from "@/lib/types";

const contexts = ["Everyday conversation", "School", "Travel", "Work"] as const;

export default function ContextExamples({ word, language }: { word: string; language: LanguageCode }) {
  const [context, setContext] = useState<(typeof contexts)[number]>(contexts[0]);
  const [examples, setExamples] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setBusy(true);
    setError("");
    setExamples("");
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang: language,
          messages: [{ role: "user", content: `Give three short, natural example sentences using the word “${word}” in ${context.toLowerCase()}. Keep the word in its original language. Add a brief note about how it fits the situation. If you are uncertain about this word, say so instead of inventing examples.` }],
        }),
      });
      const data = await response.json().catch(() => null) as { text?: unknown; error?: string } | null;
      if (!response.ok || typeof data?.text !== "string") throw new Error(data?.error || "Examples are unavailable right now.");
      setExamples(data.text);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Examples are unavailable right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-950 dark:bg-sky-950/20">
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-900 dark:text-sky-200"><BookOpen className="h-4 w-4" aria-hidden="true" />Examples by context</div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose an example context">
        {contexts.map((item) => <button key={item} type="button" aria-pressed={context === item} onClick={() => setContext(item)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${context === item ? "border-sky-700 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-600" : "border-sky-200 bg-white text-sky-800 hover:bg-sky-100 dark:border-sky-900 dark:bg-zinc-900 dark:text-sky-200"}`}>{item}</button>)}
      </div>
      <button type="button" onClick={generate} disabled={busy} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-sky-800 px-3 text-xs font-semibold text-white hover:bg-sky-900 disabled:cursor-wait disabled:opacity-60 dark:bg-sky-700 dark:hover:bg-sky-600">
        {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}{busy ? "Creating examples…" : `Show ${context.toLowerCase()} examples`}
      </button>
      {error && <p role="alert" className="mt-3 text-xs text-rose-700 dark:text-rose-300">{error}</p>}
      {examples && <div className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-sm leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{examples}</div>}
    </div>
  );
}
