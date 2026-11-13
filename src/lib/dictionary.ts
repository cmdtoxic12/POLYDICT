import type { DictionaryResult, LanguageCode, Definition } from "./types";
import { lookupLocal } from "./local-dictionary";

interface DictionaryApiDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

interface DictionaryApiMeaning {
  partOfSpeech?: string;
  definitions?: DictionaryApiDefinition[];
  synonyms?: string[];
}

interface DictionaryApiPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryApiEntry {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  meanings?: DictionaryApiMeaning[];
}

// Free Dictionary API (English primarily)
async function fetchEnglishDefinition(word: string): Promise<DictionaryResult | null> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0] as DictionaryApiEntry;
    const meanings: Definition[] = [];

    for (const meaning of entry.meanings || []) {
      for (const def of meaning.definitions || []) {
        meanings.push({
          partOfSpeech: meaning.partOfSpeech || "unknown",
          definition: def.definition,
          example: def.example,
          synonyms: def.synonyms?.slice(0, 5) || meaning.synonyms?.slice(0, 5),
        });
      }
    }

    const phonetic =
      entry.phonetic ||
      entry.phonetics?.find((phoneticEntry) => phoneticEntry.text)?.text ||
      undefined;

    const audio =
      entry.phonetics?.find((phoneticEntry) => phoneticEntry.audio)?.audio || undefined;

    return {
      word: entry.word,
      phonetic,
      audio,
      meanings: meanings.slice(0, 6),
      source: "Free Dictionary API",
    };
  } catch (err) {
    console.error("Dictionary fetch error:", err);
    return null;
  }
}

// Simple translation via MyMemory (free, light use)
async function translateText(
  text: string,
  from: LanguageCode,
  to: LanguageCode
): Promise<string | null> {
  if (from === to) return text;

  const langMap: Record<LanguageCode, string> = {
    en: "en",
    fr: "fr",
    es: "es",
    tw: "en",
    ee: "en",
  };

  const source = langMap[from] || "en";
  const target = langMap[to] || "en";

  if (source === target) return text;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
    );
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return null;
  } catch {
    return null;
  }
}

export async function lookupWord(
  word: string,
  sourceLang: LanguageCode,
  targetLangs: LanguageCode[]
): Promise<DictionaryResult | null> {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) return null;

  // 1. Check local curated dictionary first (great for Twi/Ewe)
  const local = lookupLocal(cleanWord);
  if (local) {
    const translations: Partial<Record<LanguageCode, string>> = { ...local.translations };

    // Fill missing target languages if possible
    for (const lang of targetLangs) {
      if (!translations[lang] && lang !== sourceLang) {
        const t = await translateText(local.word, "en", lang);
        if (t) translations[lang] = t;
      }
    }

    return {
      word: local.word,
      phonetic: local.phonetic,
      meanings: local.meanings,
      translations: translations as Record<LanguageCode, string>,
      source: "PolyDict Local (Twi/Ewe enhanced)",
    };
  }

  // 2. Fall back to English Free Dictionary API
  let result = await fetchEnglishDefinition(cleanWord);

  if (!result) {
    result = {
      word: cleanWord,
      meanings: [
        {
          partOfSpeech: "unknown",
          definition: `No detailed definition found for "${cleanWord}". Try the AI explanation or check spelling.`,
        },
      ],
      source: "Fallback",
    };
  }

  // Add translations
  const translations: Partial<Record<LanguageCode, string>> = {};
  for (const lang of targetLangs) {
    if (lang === sourceLang) continue;
    const translated = await translateText(cleanWord, sourceLang, lang);
    if (translated) {
      translations[lang] = translated;
    }
  }

  result.translations = translations as Record<LanguageCode, string>;
  return result;
}

// Improved AI Enhancement with richer local logic
export function speakWord(text: string, lang: LanguageCode = "en") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<LanguageCode, string> = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    tw: "en-GH",
    ee: "en-GH",
  };
  utterance.lang = langMap[lang] || "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
