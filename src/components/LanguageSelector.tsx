"use client";

import { ArrowRight, Languages } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LanguageSelector() {
  const { sourceLang, targetLangs, setSourceLang, setTargetLangs } = useAppStore();

  const changeSource = (nextSource: LanguageCode) => {
    if (nextSource === sourceLang) return;
    const nextTargets = targetLangs.filter((code) => code !== nextSource);
    if (!nextTargets.includes(sourceLang)) nextTargets.push(sourceLang);
    setSourceLang(nextSource);
    setTargetLangs(nextTargets);
  };

  const toggleTarget = (code: LanguageCode) => {
    if (code === sourceLang) return;
    setTargetLangs(
      targetLangs.includes(code)
        ? targetLangs.filter((language) => language !== code)
        : [...targetLangs, code]
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="source-language" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          <Languages className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          From
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <select
            id="source-language"
            value={sourceLang}
            onChange={(event) => changeSource(event.target.value as LanguageCode)}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:max-w-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag}  {language.name}
              </option>
            ))}
          </select>
          <ArrowRight className="hidden h-4 w-4 shrink-0 text-zinc-400 sm:block" aria-hidden="true" />
          <span className="hidden text-sm font-semibold text-zinc-700 sm:block dark:text-zinc-300">Translate to</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-zinc-700 sm:hidden dark:text-zinc-300">Translate to</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Languages to translate into">
          {LANGUAGES.filter((language) => language.code !== sourceLang).map((language) => {
            const selected = targetLangs.includes(language.code);
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => toggleTarget(language.code)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
                  selected
                    ? "border-sky-700 bg-sky-700 text-white shadow-sm shadow-sky-900/10 hover:bg-sky-800 dark:border-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-sky-300 hover:bg-sky-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40"
                )}
              >
                <span aria-hidden="true">{language.flag}</span>
                {language.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Choose one or more translation languages.</p>
      </div>
    </div>
  );
}
