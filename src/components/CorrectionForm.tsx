"use client";

import { useState } from "react";
import { ExternalLink, MessageSquareWarning } from "lucide-react";
import type { LanguageCode } from "@/lib/types";
import { LANGUAGES } from "@/lib/types";

export default function CorrectionForm({ word, language }: { word: string; language: LanguageCode }) {
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [context, setContext] = useState("");
  const languageName = LANGUAGES.find((item) => item.code === language)?.name ?? language;
  const title = `Dictionary correction: ${word}`;
  const body = [
    `Language: ${languageName}`,
    `Word: ${word}`,
    `Suggested correction: ${suggestion || "(add your suggestion)"}`,
    `Context or source: ${context || "(optional)"}`,
    "",
    "Please include regional or dialect context when relevant.",
  ].join("\n");
  const issueUrl = `https://github.com/cmdtoxic12/POLYDICT/issues/new?${new URLSearchParams({ title, body })}`;

  return (
    <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-emerald-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-emerald-300">
        <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />Suggest a {languageName} correction
      </button>
      {open && <div className="mt-3 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
        <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">Help improve this entry. Your draft opens as a GitHub issue so you can review it before submitting; community suggestions can be checked before they change the dictionary.</p>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Suggested meaning or spelling<textarea value={suggestion} onChange={(event) => setSuggestion(event.target.value)} rows={2} maxLength={1000} className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm font-normal text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" placeholder="What should be changed?" /></label>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Context or source (optional)<textarea value={context} onChange={(event) => setContext(event.target.value)} rows={2} maxLength={1000} className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm font-normal text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" placeholder="Region, sentence, or source" /></label>
        <a href={issueUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-3.5 text-xs font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Review suggestion on GitHub <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
      </div>}
    </div>
  );
}
