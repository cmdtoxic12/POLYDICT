"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import LanguageSelector from "@/components/LanguageSelector";
import ResultCard from "@/components/ResultCard";
import RecentSearches from "@/components/RecentSearches";
import ThemeToggle from "@/components/ThemeToggle";
import QuizMode from "@/components/QuizMode";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

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
    <main className="min-h-screen px-4 pb-12 sm:px-6 sm:pb-16">
      <header className="mx-auto flex max-w-6xl items-center justify-between py-5 sm:py-7">
        <a href="#home" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="PolyDict home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/10">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">PolyDict</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">Words connect us</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuiz(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 text-sm font-semibold text-violet-800 transition hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-950"
            title="Flashcard Quiz"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Practice</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <section id="home" className="mx-auto max-w-6xl pt-8 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-zinc-900/80 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            ENGLISH · FRENCH · SPANISH · TWI · EWE
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl dark:text-white">
            Find the right word.
            <span className="mt-1 block text-emerald-700 dark:text-emerald-400">Learn what connects us.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
            Look up a word, hear how it sounds, and keep new language close at hand.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-3xl rounded-3xl border border-white bg-white/90 p-4 shadow-xl shadow-emerald-950/[0.04] ring-1 ring-zinc-200/70 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/90 dark:ring-zinc-800">
          <LanguageSelector />
          <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <SearchBar suggestions={["hello", "water", "love", "medaase"]} />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <ResultCard />
          <RecentSearches />
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-6xl border-t border-zinc-200/80 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <p>Made for curious minds and everyday conversations.</p>
        <p className="mt-1">PolyDict · Your multilingual learning companion</p>
      </footer>
    </main>
  );
}
