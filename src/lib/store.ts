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
  addToHistory: (item: SearchHistoryItem) => void;
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
      addToHistory: (item) =>
        set((state) => {
          const filtered = state.history.filter(
            (h) => !(h.word === item.word && h.language === item.language)
          );
          return { history: [item, ...filtered].slice(0, 20) };
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
      }),
    }
  )
);
