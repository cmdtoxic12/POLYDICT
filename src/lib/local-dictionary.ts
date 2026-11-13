import type { LanguageCode, Definition } from "./types";

export interface LocalEntry {
  word: string;
  phonetic?: string;
  meanings: Definition[];
  translations: Partial<Record<LanguageCode, string>>;
}

// Curated common words for Twi and Ewe + cross translations
export const LOCAL_DICT: LocalEntry[] = [
  // Greetings & Basics
  {
    word: "hello",
    meanings: [{ partOfSpeech: "interjection", definition: "A greeting used when meeting someone." }],
    translations: { tw: "maakye / agoo", ee: "wòe zɔ / agoo", fr: "bonjour", es: "hola" },
  },
  {
    word: "thank you",
    meanings: [{ partOfSpeech: "phrase", definition: "Expression of gratitude." }],
    translations: { tw: "medaase", ee: "akpe", fr: "merci", es: "gracias" },
  },
  {
    word: "yes",
    meanings: [{ partOfSpeech: "adverb", definition: "Affirmative response." }],
    translations: { tw: "aane", ee: "ɛ̃", fr: "oui", es: "sí" },
  },
  {
    word: "no",
    meanings: [{ partOfSpeech: "adverb", definition: "Negative response." }],
    translations: { tw: "daabi", ee: "ao", fr: "non", es: "no" },
  },
  {
    word: "please",
    meanings: [{ partOfSpeech: "adverb", definition: "Used to make a polite request." }],
    translations: { tw: "mesrɛ wo", ee: "taflatse", fr: "s'il vous plaît", es: "por favor" },
  },
  {
    word: "water",
    meanings: [{ partOfSpeech: "noun", definition: "A clear liquid essential for life." }],
    translations: { tw: "nsuo", ee: "tsi", fr: "eau", es: "agua" },
  },
  {
    word: "food",
    meanings: [{ partOfSpeech: "noun", definition: "Any nutritious substance that people eat." }],
    translations: { tw: "aduane", ee: "nuɖuɖu", fr: "nourriture", es: "comida" },
  },
  {
    word: "house",
    meanings: [{ partOfSpeech: "noun", definition: "A building for human habitation." }],
    translations: { tw: "fie", ee: "aƒe", fr: "maison", es: "casa" },
  },
  {
    word: "school",
    meanings: [{ partOfSpeech: "noun", definition: "An institution for educating children." }],
    translations: { tw: "sukuu", ee: "sukulu", fr: "école", es: "escuela" },
  },
  {
    word: "friend",
    meanings: [{ partOfSpeech: "noun", definition: "A person with whom one has a bond of mutual affection." }],
    translations: { tw: "adamfo", ee: "xɔlɔ̃", fr: "ami", es: "amigo" },
  },
  {
    word: "love",
    meanings: [{ partOfSpeech: "noun", definition: "An intense feeling of deep affection." }],
    translations: { tw: "ɔdɔ", ee: "lɔlɔ̃", fr: "amour", es: "amor" },
  },
  {
    word: "good",
    meanings: [{ partOfSpeech: "adjective", definition: "To be desired or approved of." }],
    translations: { tw: "pa / yie", ee: "nyo", fr: "bon", es: "bueno" },
  },
  {
    word: "bad",
    meanings: [{ partOfSpeech: "adjective", definition: "Of poor quality or low standard." }],
    translations: { tw: "bɔne", ee: "vɔ̃", fr: "mauvais", es: "malo" },
  },
  {
    word: "come",
    meanings: [{ partOfSpeech: "verb", definition: "Move or travel towards the speaker." }],
    translations: { tw: "bra", ee: "va", fr: "venir", es: "venir" },
  },
  {
    word: "go",
    meanings: [{ partOfSpeech: "verb", definition: "Move from one place to another." }],
    translations: { tw: "kɔ", ee: "yi", fr: "aller", es: "ir" },
  },
  {
    word: "eat",
    meanings: [{ partOfSpeech: "verb", definition: "Put food into the mouth and chew and swallow it." }],
    translations: { tw: "di", ee: "ɖu", fr: "manger", es: "comer" },
  },
  {
    word: "drink",
    meanings: [{ partOfSpeech: "verb", definition: "Take liquid into the mouth and swallow." }],
    translations: { tw: "nom", ee: "no", fr: "boire", es: "beber" },
  },
  {
    word: "sleep",
    meanings: [{ partOfSpeech: "verb", definition: "Rest with eyes closed and mind inactive." }],
    translations: { tw: "da", ee: "dɔ", fr: "dormir", es: "dormir" },
  },
  {
    word: "mother",
    meanings: [{ partOfSpeech: "noun", definition: "A female parent." }],
    translations: { tw: "ɛna / maame", ee: "nɔ", fr: "mère", es: "madre" },
  },
  {
    word: "father",
    meanings: [{ partOfSpeech: "noun", definition: "A male parent." }],
    translations: { tw: "agya / papa", ee: "tɔ", fr: "père", es: "padre" },
  },
  {
    word: "child",
    meanings: [{ partOfSpeech: "noun", definition: "A young human being." }],
    translations: { tw: "abofra / ba", ee: "ɖevi", fr: "enfant", es: "niño" },
  },
  {
    word: "money",
    meanings: [{ partOfSpeech: "noun", definition: "A medium of exchange." }],
    translations: { tw: "sika", ee: "ga", fr: "argent", es: "dinero" },
  },
  {
    word: "work",
    meanings: [{ partOfSpeech: "noun", definition: "Activity involving mental or physical effort." }],
    translations: { tw: "adwuma", ee: "dɔ", fr: "travail", es: "trabajo" },
  },
  {
    word: "peace",
    meanings: [{ partOfSpeech: "noun", definition: "Freedom from disturbance; tranquility." }],
    translations: { tw: "asomdwoe", ee: "ŋutifafa", fr: "paix", es: "paz" },
  },
  {
    word: "god",
    meanings: [{ partOfSpeech: "noun", definition: "The creator and ruler of the universe." }],
    translations: { tw: "nyame", ee: "mawu", fr: "dieu", es: "dios" },
  },
  // Twi headwords
  {
    word: "medaase",
    meanings: [{ partOfSpeech: "interjection", definition: "Thank you (Twi)." }],
    translations: { en: "thank you", fr: "merci", es: "gracias", ee: "akpe" },
  },
  {
    word: "maakye",
    meanings: [{ partOfSpeech: "interjection", definition: "Good morning (Twi)." }],
    translations: { en: "good morning", fr: "bonjour", es: "buenos días", ee: "ŋdi" },
  },
  {
    word: "nsuo",
    meanings: [{ partOfSpeech: "noun", definition: "Water (Twi)." }],
    translations: { en: "water", fr: "eau", es: "agua", ee: "tsi" },
  },
  {
    word: "aduane",
    meanings: [{ partOfSpeech: "noun", definition: "Food (Twi)." }],
    translations: { en: "food", fr: "nourriture", es: "comida", ee: "nuɖuɖu" },
  },
  {
    word: "ɔdɔ",
    meanings: [{ partOfSpeech: "noun", definition: "Love (Twi)." }],
    translations: { en: "love", fr: "amour", es: "amor", ee: "lɔlɔ̃" },
  },
  // Ewe headwords
  {
    word: "akpe",
    meanings: [{ partOfSpeech: "interjection", definition: "Thank you (Ewe)." }],
    translations: { en: "thank you", fr: "merci", es: "gracias", tw: "medaase" },
  },
  {
    word: "tsi",
    meanings: [{ partOfSpeech: "noun", definition: "Water (Ewe)." }],
    translations: { en: "water", fr: "eau", es: "agua", tw: "nsuo" },
  },
  {
    word: "nuɖuɖu",
    meanings: [{ partOfSpeech: "noun", definition: "Food (Ewe)." }],
    translations: { en: "food", fr: "nourriture", es: "comida", tw: "aduane" },
  },
  {
    word: "lɔlɔ̃",
    meanings: [{ partOfSpeech: "noun", definition: "Love (Ewe)." }],
    translations: { en: "love", fr: "amour", es: "amor", tw: "ɔdɔ" },
  },
  {
    word: "aƒe",
    meanings: [{ partOfSpeech: "noun", definition: "House / home (Ewe)." }],
    translations: { en: "house", fr: "maison", es: "casa", tw: "fie" },
  },
];

export function lookupLocal(word: string): LocalEntry | null {
  const clean = word.trim().toLowerCase();
  return (
    LOCAL_DICT.find(
      (e) =>
        e.word.toLowerCase() === clean ||
        Object.values(e.translations).some((t) => t?.toLowerCase() === clean)
    ) || null
  );
}

export function getQuizWords(count = 10): LocalEntry[] {
  // Shuffle and return
  const shuffled = [...LOCAL_DICT].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
