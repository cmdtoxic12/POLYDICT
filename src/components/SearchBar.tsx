"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { lookupWord } from "@/lib/dictionary";
import { cn } from "@/lib/utils";
import { findWordSuggestions } from "@/lib/local-dictionary";

export default function SearchBar({
  suggestions = [],
}: {
  suggestions?: string[];
}) {
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const {
    sourceLang,
    targetLangs,
    isLoading,
    setIsLoading,
    setCurrentResult,
    addToHistory,
  } = useAppStore();

  const searchFor = async (value: string) => {
    const word = value.trim();
    if (!word || isLoading) return;

    setQuery(word);
    setErrorMessage("");
    setWordSuggestions([]);
    setIsLoading(true);
    setCurrentResult(null);

    try {
      const result = await lookupWord(word, sourceLang, targetLangs);
      if (!result || result.source === "Fallback") {
        setCurrentResult(null);
        setErrorMessage(`No dictionary entry found for “${word}”. Check the spelling or try another word.`);
        setWordSuggestions(findWordSuggestions(word));
        return;
      }
      setCurrentResult(result);
      addToHistory({
        word: result.word,
        language: sourceLang,
        timestamp: Date.now(),
      });
    } catch {
      setErrorMessage("Search is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    void searchFor(query);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch}>
        <label htmlFor="word-search" className="sr-only">Search for a word</label>
        <div className="group relative flex items-center rounded-2xl border border-zinc-200 bg-zinc-50 shadow-inner shadow-zinc-950/[0.02] transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:bg-zinc-950">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-emerald-600" aria-hidden="true" />
          <input
            id="word-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try a word like ‘hello’ or ‘medaase’"
            autoComplete="off"
            disabled={isLoading}
            className="min-w-0 flex-1 rounded-2xl bg-transparent py-4 pl-12 pr-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60 sm:text-lg dark:text-white"
          />
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => { setQuery(""); setErrorMessage(""); }}
              className="mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="mr-2 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />}
            <span>{isLoading ? "Looking up" : "Search"}</span>
          </button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-zinc-500">Try:</span>
          {suggestions.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => void searchFor(word)}
              disabled={isLoading}
              className={cn(
                "rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition",
                "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                "disabled:cursor-wait disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
              )}
            >
              {word}
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{isLoading ? "Searching dictionary" : errorMessage}</p>
      {errorMessage && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 dark:border-rose-900 dark:bg-rose-950/40">
          <p role="alert" className="text-sm text-rose-800 dark:text-rose-200">{errorMessage}</p>
          {wordSuggestions.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-rose-700 dark:text-rose-300">Did you mean?</span>{wordSuggestions.map((word) => <button key={word} type="button" onClick={() => void searchFor(word)} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-50 dark:bg-zinc-900 dark:text-emerald-300 dark:ring-emerald-900">{word}</button>)}</div>}
        </div>
      )}
    </div>
  );
}
