"use client";

import { LANGUAGES, type LanguageCode } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LanguageSelector() {
  const { sourceLang, targetLangs, setSourceLang, setTargetLangs } =
    useAppStore();

  const toggleTarget = (code: LanguageCode) => {
    if (code === sourceLang) return;
    if (targetLangs.includes(code)) {
      setTargetLangs(targetLangs.filter((l) => l !== code));
    } else {
      setTargetLangs([...targetLangs, code]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-center">
      {/* Source language */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">From:</span>
        <div className="flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSourceLang(lang.code)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                sourceLang === lang.code
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Target languages */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">To:</span>
        <div className="flex flex-wrap gap-1">
          {LANGUAGES.filter((l) => l.code !== sourceLang).map((lang) => (
            <button
              key={lang.code}
              onClick={() => toggleTarget(lang.code)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                targetLangs.includes(lang.code)
                  ? "bg-sky-600 text-white shadow"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
