"use client";

import { useState, FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { lookupWord } from "@/lib/dictionary";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const {
    sourceLang,
    targetLangs,
    setIsLoading,
    setCurrentResult,
    addToHistory,
  } = useAppStore();

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    const word = query.trim();
    if (!word) return;

    setIsLoading(true);
    setCurrentResult(null);

    try {
      const result = await lookupWord(word, sourceLang, targetLangs);
      setCurrentResult(result);
      if (result) {
        addToHistory({
          word: result.word,
          language: sourceLang,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any word..."
          className={cn(
            "w-full pl-12 pr-12 py-4 rounded-2xl border border-zinc-200",
            "bg-white dark:bg-zinc-900 dark:border-zinc-700",
            "text-lg placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
            "shadow-sm"
          )}
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-14 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
