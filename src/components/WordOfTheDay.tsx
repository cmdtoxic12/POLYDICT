"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, LoaderCircle, Sparkles, Star } from "lucide-react";
import { enhanceWithAI } from "@/lib/ai";
import { LANGUAGES, type AIEnhancedResult, type LanguageCode } from "@/lib/types";
import { useAppStore } from "@/lib/store";

type DailyWord = {
  word: string;
  language: LanguageCode;
  phonetic?: string;
  partOfSpeech: string;
  meaning: string;
  context: string;
  example: string;
};

const dailyWords: DailyWord[] = [
  { word: "resilience", language: "en", phonetic: "/rɪˈzɪl.jəns/", partOfSpeech: "noun", meaning: "The ability to recover, adapt, and keep going after difficulty.", context: "Use it when describing a person, community, or system that responds to challenges and carries on.", example: "The team showed resilience after a difficult start to the season." },
  { word: "medaase", language: "tw", partOfSpeech: "expression", meaning: "Thank you; an expression of gratitude in Twi.", context: "A common way to thank someone in everyday conversation. The exact phrasing can vary with context and dialect.", example: "Medaase!" },
  { word: "curious", language: "en", phonetic: "/ˈkjʊr.i.əs/", partOfSpeech: "adjective", meaning: "Eager to learn, know, or understand something.", context: "Often describes someone who asks questions or takes interest in unfamiliar ideas.", example: "Her curious questions made the lesson more interesting." },
  { word: "nuance", language: "en", phonetic: "/ˈnuː.ɑːns/", partOfSpeech: "noun", meaning: "A small but meaningful difference in meaning, feeling, or expression.", context: "Useful when a simple translation misses a subtle shade of meaning or tone.", example: "The two words are similar, but each has a different nuance." },
  { word: "akpe", language: "ee", partOfSpeech: "expression", meaning: "Thank you; an expression of gratitude in Ewe.", context: "Used to thank someone. Keep the spelling as written; wording and pronunciation may vary by community.", example: "Akpe!" },
  { word: "serendipity", language: "en", phonetic: "/ˌser.ənˈdɪp.ə.ti/", partOfSpeech: "noun", meaning: "The pleasant discovery of something valuable or enjoyable by chance.", context: "Use it for a lucky and unexpected find, especially one you were not actively seeking.", example: "Finding that little bookshop was pure serendipity." },
  { word: "eloquent", language: "en", phonetic: "/ˈel.ə.kwənt/", partOfSpeech: "adjective", meaning: "Fluent and persuasive in speaking or writing.", context: "Can also describe a gesture, image, or silence that communicates a lot without many words.", example: "Her short, eloquent speech moved the audience." },
  { word: "gratitude", language: "en", phonetic: "/ˈɡræt̬.ə.tuːd/", partOfSpeech: "noun", meaning: "The feeling of being thankful and appreciating kindness or help.", context: "Often used with “for” to name what someone appreciates.", example: "He expressed gratitude for the support of his friends." },
  { word: "fleeting", language: "en", phonetic: "/ˈfliː.tɪŋ/", partOfSpeech: "adjective", meaning: "Lasting for only a short time; quickly passing.", context: "Describes brief moments, feelings, or opportunities.", example: "We caught a fleeting glimpse of the bird in the trees." },
  { word: "thrive", language: "en", phonetic: "/θraɪv/", partOfSpeech: "verb", meaning: "To grow, develop, or do well.", context: "Often used for people, plants, or communities that are doing well in supportive conditions.", example: "These plants thrive in bright, indirect sunlight." },
  { word: "belonging", language: "en", phonetic: "/bɪˈlɔːŋ.ɪŋ/", partOfSpeech: "noun", meaning: "The feeling of being accepted and at home in a place or group.", context: "Common in conversations about community, identity, and inclusion.", example: "Sharing stories helped everyone feel a sense of belonging." },
  { word: "luminous", language: "en", phonetic: "/ˈluː.mə.nəs/", partOfSpeech: "adjective", meaning: "Giving off light or seeming to glow; also exceptionally clear or inspiring.", context: "Can describe a light, an object, or figuratively a clear idea or expression.", example: "The moon looked luminous above the quiet sea." },
  { word: "wander", language: "en", phonetic: "/ˈwɑːn.dɚ/", partOfSpeech: "verb", meaning: "To move around without a fixed route or immediate destination.", context: "Can also describe attention or thoughts that drift away from the subject.", example: "We had an afternoon to wander through the old market." },
  { word: "mellifluous", language: "en", phonetic: "/məˈlɪf.lu.əs/", partOfSpeech: "adjective", meaning: "Pleasantly smooth and musical to hear.", context: "Most often used for a voice, sound, or style of speaking.", example: "The storyteller had a warm, mellifluous voice." },
];

function getDayNumber(date: Date) {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000);
}

export default function WordOfTheDay() {
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [todayLabel, setTodayLabel] = useState("Today");
  const [aiResult, setAiResult] = useState<AIEnhancedResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const recordLearningDay = useAppStore((state) => state.recordLearningDay);

  useEffect(() => {
    const updateDay = () => {
      const now = new Date();
      setDayNumber(getDayNumber(now));
      setTodayLabel(new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(now));
    };
    updateDay();
    const now = new Date();
    const nextLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = window.setTimeout(updateDay, nextLocalMidnight.getTime() - now.getTime());
    return () => window.clearTimeout(timer);
  }, [dayNumber]);

  useEffect(() => {
    setAiResult(null);
    setAiOpen(false);
  }, [dayNumber]);

  const word = dayNumber === null ? null : dailyWords[((dayNumber % dailyWords.length) + dailyWords.length) % dailyWords.length];
  const language = word ? LANGUAGES.find((item) => item.code === word.language) : null;

  const explainWithAI = async () => {
    if (!word || aiLoading) return;
    if (aiResult) {
      setAiOpen((open) => !open);
      return;
    }
    setAiLoading(true);
    setAiOpen(true);
    const result = await enhanceWithAI(word.word, word.meaning, word.language);
    setAiResult(result);
    setAiLoading(false);
  };

  return (
    <section aria-labelledby="word-of-the-day-title" className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/[0.04] dark:border-emerald-950 dark:bg-zinc-900">
      <div className="grid sm:grid-cols-[1fr_14rem]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Word of the day
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{todayLabel}</span>
          </div>

          {word ? (
            <>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 id="word-of-the-day-title" className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">{word.word}</h2>
                {word.phonetic && <span className="text-sm text-zinc-500 dark:text-zinc-400">{word.phonetic}</span>}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">{word.partOfSpeech}</span>
                <span>{language?.flag} {language?.name}</span>
                <button type="button" onClick={() => { toggleFavorite(word.word); recordLearningDay(); }} aria-pressed={favorites.includes(word.word)} className="ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"><Star className={`h-3.5 w-3.5 ${favorites.includes(word.word) ? "fill-current" : ""}`} aria-hidden="true" />{favorites.includes(word.word) ? "Saved" : "Save word"}</button>
              </div>
              <p className="mt-4 text-base font-medium leading-7 text-zinc-800 dark:text-zinc-100">{word.meaning}</p>
              <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3.5 dark:bg-zinc-950/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">In context</p>
                <p className="mt-1.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{word.context}</p>
                <p className="mt-2 border-l-2 border-emerald-400 pl-3 text-sm italic leading-6 text-zinc-600 dark:text-zinc-400">“{word.example}”</p>
              </div>
              <button type="button" onClick={explainWithAI} disabled={aiLoading} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-50 px-3.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-wait disabled:opacity-70 dark:bg-violet-950/40 dark:text-violet-200 dark:hover:bg-violet-950">
                {aiLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                {aiLoading ? "Preparing an explanation…" : aiOpen ? "Hide AI explanation" : "Explore with AI"}
                {!aiLoading && !aiOpen && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
              {aiOpen && aiResult && (
                <div className="mt-4 space-y-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-sm leading-6 dark:border-violet-900/60 dark:bg-violet-950/20">
                  {aiResult.source === "local" && <p role="status" className="text-xs text-amber-800 dark:text-amber-300">AI is unavailable right now. Here’s a quick explanation from the word entry.</p>}
                  <div><p className="font-semibold text-violet-900 dark:text-violet-200">Simple meaning</p><p className="mt-1 text-zinc-700 dark:text-zinc-300">{aiResult.simpleExplanation}</p></div>
                  <div><p className="font-semibold text-violet-900 dark:text-violet-200">More detail</p><p className="mt-1 text-zinc-700 dark:text-zinc-300">{aiResult.detailedExplanation}</p></div>
                  <div><p className="font-semibold text-violet-900 dark:text-violet-200">Usage tip</p><p className="mt-1 text-zinc-700 dark:text-zinc-300">{aiResult.usageNotes}</p></div>
                  <ul className="list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{aiResult.exampleSentences.map((example, index) => <li key={index}>{example}</li>)}</ul>
                </div>
              )}
            </>
          ) : (
            <div className="mt-5 animate-pulse" aria-label="Loading today's word">
              <div className="h-9 w-48 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-4 h-5 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-2 h-5 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          )}
        </div>
        <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-6 text-white sm:flex dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-900">
          <Sparkles className="h-7 w-7 text-emerald-200" aria-hidden="true" />
          <div>
            <p className="font-serif text-2xl italic leading-tight">A new word.<br />A wider world.</p>
            <p className="mt-3 text-xs leading-5 text-emerald-100">Take a moment to notice how language carries meaning from one person to another.</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">PolyDict daily</span>
        </div>
      </div>
    </section>
  );
}
