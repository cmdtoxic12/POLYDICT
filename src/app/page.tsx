"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import LanguageSelector from "@/components/LanguageSelector";
import ResultCard from "@/components/ResultCard";
import RecentSearches from "@/components/RecentSearches";
import ThemeToggle from "@/components/ThemeToggle";
import QuizMode from "@/components/QuizMode";
import { BookOpen, GraduationCap } from "lucide-react";

export default function HomePage() {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return (
      <main className="min-h-screen px-4 py-8 sm:py-12 flex items-center justify-center">
        <QuizMode onClose={() => setShowQuiz(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PolyDict</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Multilingual Dictionary
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuiz(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50"
            title="Flashcard Quiz"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Language selectors */}
      <div className="mb-6">
        <LanguageSelector />
      </div>

      {/* Search */}
      <SearchBar />

      {/* Results */}
      <ResultCard />

      {/* History & Favorites */}
      <RecentSearches />

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-zinc-400">
        <p>English • French • Spanish • Twi • Ewe</p>
        <p className="mt-1">Built for learners • PWA ready</p>
      </footer>
    </main>
  );
}
