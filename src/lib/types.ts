export type LanguageCode = "en" | "fr" | "es" | "tw" | "ee";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "tw", name: "Twi", nativeName: "Twi", flag: "🇬🇭" },
  { code: "ee", name: "Ewe", nativeName: "Eʋegbe", flag: "🇬🇭" },
];

export interface Definition {
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms?: string[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings: Definition[];
  translations?: Record<LanguageCode, string>;
  source: string;
}

export interface AIEnhancedResult {
  simpleExplanation: string;
  usageNotes: string;
  exampleSentences: string[];
  relatedWords: string[];
}

export interface SearchHistoryItem {
  word: string;
  language: LanguageCode;
  timestamp: number;
}
