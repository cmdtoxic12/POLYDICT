import type { AIEnhancedResult, LanguageCode } from "./types";

/**
 * AI explanation helper.
 * 
 * By default uses a smart local fallback.
 * You can enable a real model by setting these in the browser console
 * or later in settings:
 * 
 *   localStorage.setItem("polydict_ai_base", "https://integrate.api.nvidia.com/v1")
 *   localStorage.setItem("polydict_ai_key", "nvapi-...")
 *   localStorage.setItem("polydict_ai_model", "deepseek-ai/deepseek-v4.1-flash")
 * 
 * Popular free options (as of late 2026):
 * - NVIDIA NIM: https://integrate.api.nvidia.com/v1  (DeepSeek V4.1 Flash, GLM-5.3-Flash)
 * - Groq, OpenRouter free models, etc.
 */

const DEFAULT_SYSTEM = `You are a helpful language teacher for learners in Ghana. 
Explain words simply, give 2-3 short example sentences, and add one practical usage tip.
Keep the response short and clear. Prefer everyday language.
If the word is in Twi or Ewe, mention that it is commonly used in Ghana.`;

export async function enhanceWithAI(
  word: string,
  definition: string,
  sourceLang: LanguageCode
): Promise<AIEnhancedResult> {
  // Try real model first if configured
  const base = typeof window !== "undefined" ? localStorage.getItem("polydict_ai_base") : null;
  const key = typeof window !== "undefined" ? localStorage.getItem("polydict_ai_key") : null;
  const model =
    (typeof window !== "undefined" && localStorage.getItem("polydict_ai_model")) ||
    "deepseek-ai/deepseek-v4.1-flash";

  if (base && key) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: DEFAULT_SYSTEM },
            {
              role: "user",
              content: `Word: "${word}"\nDefinition: ${definition}\nSource language: ${sourceLang}\n\nGive:\n1. A very simple explanation (1-2 sentences)\n2. One short usage note\n3. Three short example sentences`,
            },
          ],
          temperature: 0.5,
          max_tokens: 400,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        return parseAIResponse(content, word, definition);
      }
    } catch (err) {
      console.warn("Real AI call failed, falling back to local:", err);
    }
  }

  // Strong local fallback
  return localEnhance(word, definition, sourceLang);
}

function parseAIResponse(
  content: string,
  word: string,
  definition: string
): AIEnhancedResult {
  // Very light parsing – works with most model outputs
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  let simpleExplanation = `Simple meaning of "${word}": ${definition.split(".")[0]}.`;
  let usageNotes = `Use "${word}" carefully depending on context and formality.`;
  const exampleSentences: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("explanation") || lower.startsWith("1.")) {
      simpleExplanation = line.replace(/^[\d\.\-\*]+\s*/, "").replace(/simple explanation[:\s]*/i, "");
    } else if (lower.includes("usage") || lower.includes("note") || lower.startsWith("2.")) {
      usageNotes = line.replace(/^[\d\.\-\*]+\s*/, "").replace(/usage note[s]?[:\s]*/i, "");
    } else if (
      line.startsWith("-") ||
      line.startsWith("•") ||
      /^\d+\./.test(line) ||
      lower.includes("example")
    ) {
      const cleaned = line.replace(/^[\d\.\-\*•]+\s*/, "").replace(/example[s]?[:\s]*/i, "");
      if (cleaned.length > 5) exampleSentences.push(cleaned);
    }
  }

  while (exampleSentences.length < 3) {
    exampleSentences.push(`I learned the word "${word}" today.`);
  }

  return {
    simpleExplanation: simpleExplanation || `A clear way to understand "${word}": ${definition.split(".")[0]}.`,
    usageNotes,
    exampleSentences: exampleSentences.slice(0, 3),
    relatedWords: [],
  };
}

function localEnhance(
  word: string,
  definition: string,
  sourceLang: LanguageCode
): AIEnhancedResult {
  const lower = word.toLowerCase();

  let simpleExplanation = `A clear way to understand "${word}": ${definition
    .split(".")
    .slice(0, 1)
    .join(".")
    .trim()}.`;

  let usageNotes =
    "Use this word carefully depending on context and formality. In everyday Ghanaian conversation the tone can change the meaning.";

  if (sourceLang === "tw" || ["medaase", "maakye", "nsuo", "aduane", "ɔdɔ", "fie"].includes(lower)) {
    usageNotes =
      "This is a common Twi word used daily in Ghana. Tone and context matter a lot.";
  } else if (
    sourceLang === "ee" ||
    ["akpe", "tsi", "nuɖuɖu", "lɔlɔ̃", "aƒe"].includes(lower)
  ) {
    usageNotes =
      "This is a frequently used Ewe word. Pronunciation and tone can slightly change the meaning.";
  }

  const exampleSentences = [
    `I learned the word "${word}" today.`,
    `Can you explain what "${word}" means simply?`,
    `People often use "${word}" when speaking with family or friends.`,
  ];

  if (lower === "medaase" || lower === "thank you") {
    exampleSentences[0] = "Medaase for helping me.";
    exampleSentences[1] = "I said medaase to the teacher.";
  }
  if (lower === "akpe") {
    exampleSentences[0] = "Akpe na wò.";
    exampleSentences[1] = "I told him akpe for the gift.";
  }

  return {
    simpleExplanation,
    usageNotes,
    exampleSentences,
    relatedWords: [],
  };
}
