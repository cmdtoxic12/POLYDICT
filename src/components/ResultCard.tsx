"use client";

import { useEffect, useState } from "react";
import { Volume2, Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { speakWord } from "@/lib/dictionary";
import { enhanceWithAI } from "@/lib/ai";
import { LANGUAGES, type AIEnhancedResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ResultCard() {
  const {
    currentResult,
    isLoading,
    sourceLang,
    favorites,
    toggleFavorite,
  } = useAppStore();

  const [aiResult, setAiResult] = useState<AIEnhancedResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAllMeanings, setShowAllMeanings] = useState(false);

  useEffect(() => {
    setAiResult(null);
  }, [currentResult?.word]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
      </div>
    );
  }

  if (!currentResult) return null;

  const isFavorite = favorites.includes(currentResult.word);
  const visibleMeanings = showAllMeanings
    ? currentResult.meanings
    : currentResult.meanings.slice(0, 3);

  const handleAIEnhance = async () => {
    if (aiResult) {
      setAiResult(null);
      return;
    }
    setAiLoading(true);
    const firstDef = currentResult.meanings[0]?.definition || "";
    try {
      const enhanced = await enhanceWithAI(
        currentResult.word,
        firstDef,
        sourceLang
      );
      setAiResult(enhanced);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
      {/* Main card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {currentResult.word}
            </h2>
            {currentResult.phonetic && (
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                {currentResult.phonetic}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => speakWord(currentResult.word, sourceLang)}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              title="Pronounce"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleFavorite(currentResult.word)}
              className={cn(
                "p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800",
                isFavorite
                  ? "text-amber-500"
                  : "text-zinc-600 dark:text-zinc-300"
              )}
              title="Favorite"
            >
              <Star
                className={cn("h-5 w-5", isFavorite && "fill-current")}
              />
            </button>
          </div>
        </div>

        {/* Translations */}
        {currentResult.translations &&
          Object.keys(currentResult.translations).length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {Object.entries(currentResult.translations).map(
                ([code, text]) => {
                  const lang = LANGUAGES.find((l) => l.code === code);
                  return (
                    <div
                      key={code}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-sm"
                    >
                      <span className="font-medium text-sky-700 dark:text-sky-300">
                        {lang?.flag} {lang?.name}:
                      </span>{" "}
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {text}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}

        {/* Meanings */}
        <div className="space-y-4">
          {visibleMeanings.map((meaning, idx) => (
            <div key={idx} className="border-l-2 border-emerald-500 pl-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {meaning.partOfSpeech}
              </span>
              <p className="mt-1 text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {meaning.definition}
              </p>
              {meaning.example && (
                <p className="mt-1 text-sm italic text-zinc-500 dark:text-zinc-400">
                  “{meaning.example}”
                </p>
              )}
              {meaning.synonyms && meaning.synonyms.length > 0 && (
                <p className="mt-1 text-sm text-zinc-500">
                  Synonyms: {meaning.synonyms.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>

        {currentResult.meanings.length > 3 && (
          <button
            onClick={() => setShowAllMeanings(!showAllMeanings)}
            className="mt-4 flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {showAllMeanings ? (
              <>
                <ChevronUp className="h-4 w-4" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" /> Show all{" "}
                {currentResult.meanings.length} meanings
              </>
            )}
          </button>
        )}
      </div>

      {/* AI Enhance button + panel */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/20 border border-violet-100 dark:border-violet-900/50">
        <button
          onClick={handleAIEnhance}
          disabled={aiLoading}
          className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-medium hover:opacity-80 disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5" />
          {aiLoading
            ? "Thinking..."
            : aiResult
            ? "Hide AI explanation"
            : "Explain in detail"}
        </button>

        {aiResult && (
          <div className="mt-4 space-y-3 text-sm">
            {aiResult.source === "local" && (
              <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {aiResult.fallbackReason === "not_configured"
                  ? "GEMINI_API_KEY is missing from the production server settings."
                  : aiResult.fallbackReason === "provider_error"
                    ? `Gemini returned an error${aiResult.providerStatus ? ` (HTTP ${aiResult.providerStatus})` : ""}. Check the Vercel runtime logs for the provider response.`
                    : "The server could not reach Gemini. Check the Vercel runtime logs and try again."}{" "}
                Showing a basic offline explanation for now.
              </p>
            )}
            <div>
              <p className="font-semibold text-violet-800 dark:text-violet-200">
                Simple explanation
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 mt-1">
                {aiResult.simpleExplanation}
              </p>
            </div>
            <div>
              <p className="font-semibold text-violet-800 dark:text-violet-200">
                Detailed meaning
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 mt-1">
                {aiResult.detailedExplanation}
              </p>
            </div>
            <div>
              <p className="font-semibold text-violet-800 dark:text-violet-200">
                Usage notes
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 mt-1">
                {aiResult.usageNotes}
              </p>
            </div>
            <div>
              <p className="font-semibold text-violet-800 dark:text-violet-200">
                Example sentences
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-zinc-700 dark:text-zinc-300">
                {aiResult.exampleSentences.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            {aiResult.relatedWords.length > 0 && (
              <div>
                <p className="font-semibold text-violet-800 dark:text-violet-200">Related words</p>
                <p className="text-zinc-700 dark:text-zinc-300 mt-1">{aiResult.relatedWords.join(", ")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-center text-zinc-400">
        Source: {currentResult.source}
      </p>
    </div>
  );
}
