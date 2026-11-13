"use client";

import { useState, useEffect } from "react";
import { getQuizWords, type LocalEntry } from "@/lib/local-dictionary";
import { LANGUAGES, type LanguageCode } from "@/lib/types";
import { speakWord } from "@/lib/dictionary";
import {
  Check,
  X,
  RotateCcw,
  Trophy,
  Volume2,
  ListChecks,
  Headphones,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuizModeType = "flashcard" | "multiple-choice" | "listening";
type QuizDirection = "en-to-local" | "local-to-en";

export default function QuizMode({ onClose }: { onClose: () => void }) {
  const [words, setWords] = useState<LocalEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [direction, setDirection] = useState<QuizDirection>("en-to-local");
  const [targetLang, setTargetLang] = useState<LanguageCode>("tw");
  const [mode, setMode] = useState<QuizModeType>("flashcard");
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [listeningRevealed, setListeningRevealed] = useState(false);

  useEffect(() => {
    resetQuiz();
  }, [mode, targetLang, direction]);

  const resetQuiz = () => {
    const newWords = getQuizWords(8);
    setWords(newWords);
    setCurrentIndex(0);
    setScore(0);
    setShowAnswer(false);
    setFinished(false);
    setSelected(null);
    setListeningRevealed(false);
    if (newWords.length > 0) {
      generateChoices(newWords[0], newWords);
    }
  };

  const current = words[currentIndex];

  const getQuestion = () => {
    if (!current) return "";
    if (direction === "en-to-local") return current.word;
    return current.translations[targetLang] || current.word;
  };

  const getCorrectAnswer = () => {
    if (!current) return "";
    if (direction === "en-to-local") {
      return current.translations[targetLang] || "—";
    }
    return current.word;
  };

  const generateChoices = (entry: LocalEntry, pool: LocalEntry[]) => {
    const correct =
      direction === "en-to-local"
        ? entry.translations[targetLang] || entry.word
        : entry.word;

    const distractors = pool
      .filter((w) => w.word !== entry.word)
      .map((w) =>
        direction === "en-to-local"
          ? w.translations[targetLang] || w.word
          : w.word
      )
      .filter((t) => t && t !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const all = [correct, ...distractors].sort(() => Math.random() - 0.5);
    setChoices(all);
  };

  const handleNext = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setShowAnswer(false);
    setSelected(null);
    setListeningRevealed(false);

    if (currentIndex + 1 >= words.length) {
      setFinished(true);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      generateChoices(words[nextIndex], words);
    }
  };

  const handleChoice = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const isCorrect = choice === getCorrectAnswer();
    setTimeout(() => handleNext(isCorrect), 900);
  };

  const playListening = () => {
    const text =
      direction === "en-to-local"
        ? current?.translations[targetLang] || current?.word || ""
        : current?.word || "";
    speakWord(text, direction === "en-to-local" ? targetLang : "en");
  };

  if (words.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500">Loading quiz...</div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / words.length) * 100);
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg text-center">
        <Trophy className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-4xl font-bold text-emerald-600 mb-1">
          {score} / {words.length}
        </p>
        <p className="text-zinc-500 mb-6">{percentage}% correct</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">Quiz</h2>
        <button
          onClick={onClose}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Close
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        {[
          { id: "flashcard" as const, icon: BookOpen, label: "Card" },
          { id: "multiple-choice" as const, icon: ListChecks, label: "Choice" },
          { id: "listening" as const, icon: Headphones, label: "Listen" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
              mode === m.id
                ? "bg-white dark:bg-zinc-700 shadow text-emerald-700 dark:text-emerald-300"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5 text-sm">
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-0"
        >
          <option value="tw">Twi</option>
          <option value="ee">Ewe</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as QuizDirection)}
          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-0"
        >
          <option value="en-to-local">English → Local</option>
          <option value="local-to-en">Local → English</option>
        </select>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>
            {currentIndex + 1} / {words.length}
          </span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{
              width: `${((currentIndex + 1) / words.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {mode === "flashcard" && (
        <>
          <div className="min-h-[160px] flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-6">
            <p className="text-sm text-zinc-500 mb-2">
              {direction === "en-to-local"
                ? `Translate to ${LANGUAGES.find((l) => l.code === targetLang)?.name}`
                : "What is this in English?"}
            </p>
            <p className="text-3xl font-bold text-center">{getQuestion()}</p>
            {showAnswer && (
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 w-full text-center">
                <p className="text-sm text-zinc-500">Answer</p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {getCorrectAnswer()}
                </p>
              </div>
            )}
          </div>
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
              Show Answer
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleNext(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-medium"
              >
                <X className="h-5 w-5" /> Wrong
              </button>
              <button
                onClick={() => handleNext(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
              >
                <Check className="h-5 w-5" /> Correct
              </button>
            </div>
          )}
        </>
      )}

      {mode === "multiple-choice" && (
        <>
          <div className="min-h-[100px] flex flex-col items-center justify-center p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-5">
            <p className="text-sm text-zinc-500 mb-2">
              {direction === "en-to-local"
                ? `Choose the ${LANGUAGES.find((l) => l.code === targetLang)?.name} translation`
                : "Choose the English meaning"}
            </p>
            <p className="text-2xl font-bold text-center">{getQuestion()}</p>
          </div>
          <div className="space-y-2">
            {choices.map((choice) => {
              const isSelected = selected === choice;
              const isCorrect = choice === getCorrectAnswer();
              let style =
                "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700";
              if (selected) {
                if (isCorrect)
                  style =
                    "bg-emerald-100 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-200";
                else if (isSelected)
                  style =
                    "bg-red-100 dark:bg-red-950/50 border-red-400 text-red-800 dark:text-red-200";
                else style = "opacity-50";
              }
              return (
                <button
                  key={choice}
                  onClick={() => handleChoice(choice)}
                  disabled={!!selected}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border border-transparent font-medium transition-all",
                    style
                  )}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "listening" && (
        <>
          <div className="min-h-[140px] flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-5">
            <p className="text-sm text-zinc-500 mb-4">
              Listen and identify the word
            </p>
            <button
              onClick={playListening}
              className="p-4 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
            >
              <Volume2 className="h-8 w-8" />
            </button>
            <p className="text-xs text-zinc-400 mt-3">Tap to hear again</p>
            {listeningRevealed && (
              <p className="mt-4 text-xl font-semibold text-emerald-600">
                {getCorrectAnswer()}
              </p>
            )}
          </div>

          {!listeningRevealed ? (
            <div className="space-y-2">
              {choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => {
                    setSelected(choice);
                    setListeningRevealed(true);
                    const isCorrect = choice === getCorrectAnswer();
                    setTimeout(() => handleNext(isCorrect), 1100);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-medium"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              {selected === getCorrectAnswer() ? "Correct!" : "Not quite..."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
