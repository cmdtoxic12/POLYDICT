import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LanguageCode, SearchHistoryItem, DictionaryResult } from "./types";

interface AppState {
  // Language settings
  sourceLang: LanguageCode;
  targetLangs: LanguageCode[];
  setSourceLang: (lang: LanguageCode) => void;
  setTargetLangs: (langs: LanguageCode[]) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Search history & favorites
  history: SearchHistoryItem[];
  favorites: string[];
  learningDates: string[];
  addToHistory: (item: SearchHistoryItem) => void;
  recordLearningDay: () => void;
  toggleFavorite: (word: string) => void;
  clearHistory: () => void;

  // Current result
  currentResult: DictionaryResult | null;
  setCurrentResult: (result: DictionaryResult | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sourceLang: "en",
      targetLangs: ["fr", "es", "tw", "ee"],
      setSourceLang: (lang) => set({ sourceLang: lang }),
      setTargetLangs: (langs) => set({ targetLangs: langs }),

      darkMode: false,
      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        set({ darkMode: newMode });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", newMode);
        }
      },

      history: [],
      favorites: [],
      learningDates: [],
      addToHistory: (item) =>
        set((state) => {
          const filtered = state.history.filter(
            (h) => !(h.word === item.word && h.language === item.language)
          );
          const today = new Date();
          const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          return {
            history: [item, ...filtered].slice(0, 20),
            learningDates: [dateKey, ...state.learningDates.filter((date) => date !== dateKey)].slice(0, 365),
          };
        }),
      recordLearningDay: () => set((state) => {
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        return { learningDates: [dateKey, ...(state.learningDates ?? []).filter((date) => date !== dateKey)].slice(0, 365) };
      }),
      toggleFavorite: (word) =>
        set((state) => {
          const exists = state.favorites.includes(word);
          return {
            favorites: exists
              ? state.favorites.filter((f) => f !== word)
              : [...state.favorites, word],
          };
        }),
      clearHistory: () => set({ history: [] }),

      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "polydict-storage",
      partialize: (state) => ({
        sourceLang: state.sourceLang,
        targetLangs: state.targetLangs,
        darkMode: state.darkMode,
        history: state.history,
        favorites: state.favorites,
        learningDates: state.learningDates,
      }),
    }
  )
);
