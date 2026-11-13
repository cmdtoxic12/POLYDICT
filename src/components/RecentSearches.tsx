"use client";

import { useAppStore } from "@/lib/store";
import { lookupWord } from "@/lib/dictionary";
import { Clock, Star } from "lucide-react";

export default function RecentSearches() {
  const {
    history,
    favorites,
    sourceLang,
    targetLangs,
    setIsLoading,
    setCurrentResult,
    addToHistory,
  } = useAppStore();

  if (history.length === 0 && favorites.length === 0) return null;

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
      {favorites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
            <Star className="h-4 w-4" /> Favorites
          </h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((word) => (
              <button
                key={word}
                onClick={() => handleClick(word)}
                className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

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
