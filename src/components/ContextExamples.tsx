"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, LoaderCircle } from "lucide-react";
import type { LanguageCode } from "@/lib/types";

const contexts = ["Everyday conversation", "School", "Travel", "Work"] as const;

function inlineFormatting(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index} className="font-semibold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-zinc-100 px-1 font-mono dark:bg-zinc-800">{part.slice(1, -1)}</code>;
    return part;
  });
}

function FormattedExamples({ text }: { text: string }) {
  const normalized = text
    .replace(/&nbsp;|&#x20;|&#32;/gi, " ")
    .replace(/\\([*_`#])/g, "$1")
    .trim();
  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const intro: string[] = [];
  const examples: Array<{ sentence: string; context: string }> = [];
  let current: { sentence: string; context: string } | null = null;

  for (const line of lines) {
    const item = line.match(/^\d+[.)]\s+(.+)$/);
    const situation = line.match(/^(?:[-*]\s*)?(?:\*{0,2})?(?:Situation|Context|Use)\s*:\s*(.+)$/i);
    if (item) {
      if (current) examples.push(current);
      current = { sentence: item[1], context: "" };
    } else if (situation && current) {
      current.context = situation[1];
    } else if (current) {
      current.context = [current.context, line].filter(Boolean).join(" ");
    } else if (!/^hello!\s+i am polydict ai/i.test(line) && !/fully confident/i.test(line) && !/^here are (three|some)/i.test(line)) {
      intro.push(line);
    }
  }
  if (current) examples.push(current);

  return <div className="space-y-3">
    {intro.length > 0 && <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{inlineFormatting(intro.join(" "))}</p>}
    {examples.length > 0 && <ol className="space-y-2.5">{examples.map((example, index) => <li key={index} className="rounded-xl border border-sky-100 bg-white p-3 dark:border-sky-950 dark:bg-zinc-900"><div className="flex gap-2.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-200">{index + 1}</span><div className="min-w-0"><p className="text-sm leading-6 text-zinc-800 dark:text-zinc-100">{inlineFormatting(example.sentence)}</p>{example.context && <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400"><span className="font-semibold text-sky-800 dark:text-sky-300">Situation</span> · {inlineFormatting(example.context)}</p>}</div></div></li>)}</ol>}
    {examples.length === 0 && intro.length === 0 && <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{inlineFormatting(normalized)}</p>}
  </div>;
}

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
      {examples && <div className="mt-3 rounded-xl border border-sky-100 bg-white/70 p-3 dark:border-sky-950 dark:bg-zinc-900/60"><FormattedExamples text={examples} /></div>}
    </div>
  );
}
