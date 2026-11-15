"use client";

import { useEffect, useMemo, useState } from "react";
import { BookCheck, Flame, RotateCcw, Star } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { lookupWord } from "@/lib/dictionary";
import type { DictionaryResult } from "@/lib/types";

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ReviewDashboard() {
  const favorites = useAppStore((state) => state.favorites);
  const history = useAppStore((state) => state.history);
  const learningDates = useAppStore((state) => state.learningDates ?? []);
  const sourceLang = useAppStore((state) => state.sourceLang);
  const targetLangs = useAppStore((state) => state.targetLangs);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const recordLearningDay = useAppStore((state) => state.recordLearningDay);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentWord = favorites.length ? favorites[selectedIndex % favorites.length] : null;
  const streak = useMemo(() => {
    const dates = new Set(learningDates);
    const today = new Date();
    let count = 0;
    const startOffset = dates.has(localDateKey(today)) ? 0 : 1;
    for (let offset = startOffset; offset < 365; offset += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      if (!dates.has(localDateKey(date))) break;
      count += 1;
    }
    return count;
  }, [learningDates]);

  useEffect(() => {
    let active = true;
    if (!currentWord) {
      setResult(null);
      return;
    }
    setLoading(true);
    lookupWord(currentWord, sourceLang, targetLangs)
      .then((entry) => { if (active) setResult(entry); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentWord, sourceLang, targetLangs]);

  const nextCard = () => {
    setSelectedIndex((index) => index + 1);
    setRevealed(false);
  };

  return (
    <section className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-[1fr_15rem]" aria-label="Your learning progress and review cards">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">Save & review</p><h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">Your word cards</h2></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />{favorites.length} saved</span>
        </div>

        {currentWord ? <div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950/60">
          <div className="flex min-h-28 flex-col justify-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">{revealed ? "Meaning" : "Think of the meaning"}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{revealed && !loading ? currentWord : "••••••••"}</p>
            {revealed && <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{loading ? "Loading meaning…" : result?.meanings[0]?.definition ?? "Meaning unavailable. Try opening this word in search."}</p>}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {!revealed ? <button type="button" onClick={() => setRevealed(true)} className="min-h-10 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">Show meaning</button> : <><button type="button" onClick={() => { toggleFavorite(currentWord); recordLearningDay(); setRevealed(false); }} className="min-h-10 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">I know this</button><button type="button" onClick={nextCard} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Review again</button></>}
          </div>
          {favorites.length > 1 && <p className="mt-3 text-center text-[11px] text-zinc-400">Card {(selectedIndex % favorites.length) + 1} of {favorites.length}</p>}
        </div> : <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 px-4 py-5 text-center dark:border-zinc-700"><BookCheck className="mx-auto h-5 w-5 text-zinc-400" aria-hidden="true" /><p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Your saved list is ready for new words.</p><p className="mt-1 text-xs leading-5 text-zinc-500">Tap the star on any search result or save today’s word to make a review card.</p></div>}
      </div>

      <div className="flex flex-col justify-between rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 dark:border-orange-950 dark:from-orange-950/30 dark:to-amber-950/20 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-orange-900 dark:text-orange-200"><Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />Learning streak</div>
        <div className="my-4"><p className="text-4xl font-bold tracking-tight text-orange-950 dark:text-orange-100">{streak}<span className="ml-2 text-base font-semibold">{streak === 1 ? "day" : "days"}</span></p><p className="mt-1 text-xs text-orange-800/80 dark:text-orange-200/70">{streak ? "Keep your daily learning going." : "Look up a word today to start a streak."}</p></div>
        <div className="border-t border-orange-200/70 pt-3 dark:border-orange-900"><p className="text-xs text-orange-800/80 dark:text-orange-200/70">Recent words saved</p><p className="mt-0.5 text-lg font-bold text-orange-950 dark:text-orange-100">{history.length}</p></div>
      </div>
    </section>
  );
}
