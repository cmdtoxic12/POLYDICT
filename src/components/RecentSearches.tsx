"use client";

import { useAppStore } from "@/lib/store";
import { lookupWord } from "@/lib/dictionary";
import { Clock } from "lucide-react";

export default function RecentSearches() {
  const {
    history,
    sourceLang,
    targetLangs,
    setIsLoading,
    setCurrentResult,
    addToHistory,
  } = useAppStore();

  if (history.length === 0) return null;

  const handleClick = async (word: string) => {
    setIsLoading(true);
    const result = await lookupWord(word, sourceLang, targetLangs);
    setCurrentResult(result);
    if (result) {
      addToHistory({
        word: result.word,
        language: sourceLang,
        timestamp: Date.now(),
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 space-y-4">
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" /> Recent
          </h3>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 10).map((item) => (
              <button
                key={`${item.word}-${item.timestamp}`}
                onClick={() => handleClick(item.word)}
                className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
