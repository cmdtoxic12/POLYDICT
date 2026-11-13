import type { AIEnhancedResult, LanguageCode } from "./types";

export async function enhanceWithAI(
  word: string,
  definition: string,
  sourceLang: LanguageCode
): Promise<AIEnhancedResult> {
  try {
    const response = await fetch("/api/ai-explanation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, definition, sourceLang }),
    });

    if (!response.ok) throw new Error("Gemini request failed");

    const result = await response.json() as { text?: unknown };
    if (typeof result.text !== "string" || !result.text.trim()) {
      throw new Error("Gemini returned an empty explanation");
    }

    return parseAIResponse(result.text, word, definition, sourceLang);
  } catch {
    return localEnhance(word, definition, sourceLang);
  }
}

function parseAIResponse(
  content: string,
  word: string,
  definition: string,
  sourceLang: LanguageCode
): AIEnhancedResult {
  const fallback = localEnhance(word, definition, sourceLang);
  const sections: Record<string, string> = {
    simple: "",
    detailed: "",
    usage: "",
    related: "",
  };
  const exampleSentences: string[] = [];
  let activeSection = "";

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^(simple meaning|detailed meaning|usage notes|examples|related words)\s*:\s*(.*)$/i);
    if (heading) {
      const name = heading[1].toLowerCase();
      activeSection = name === "simple meaning"
        ? "simple"
        : name === "detailed meaning"
          ? "detailed"
          : name === "usage notes"
            ? "usage"
            : name === "related words"
              ? "related"
              : "examples";
      if (activeSection === "examples") {
        if (heading[2].trim()) exampleSentences.push(heading[2].trim());
      } else {
        sections[activeSection] = heading[2].trim();
      }
      continue;
    }

    if (activeSection === "examples") {
      const example = line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
      if (example && example.toLowerCase() !== "none") exampleSentences.push(example);
    } else if (activeSection && sections[activeSection]) {
      sections[activeSection] += ` ${line}`;
    } else if (activeSection && activeSection !== "examples") {
      sections[activeSection] = line;
    }
  }

  const examples = exampleSentences.filter(Boolean).slice(0, 3);
  while (examples.length < 3) {
    examples.push(`I learned the word "${word}" today.`);
  }

  return {
    simpleExplanation: sections.simple || fallback.simpleExplanation,
    detailedExplanation: sections.detailed || fallback.detailedExplanation,
    usageNotes: sections.usage || fallback.usageNotes,
    exampleSentences: examples,
    relatedWords: sections.related && !/^none\.?$/i.test(sections.related)
      ? sections.related.split(/[,;]\s*/).filter(Boolean).slice(0, 3)
      : [],
    source: "gemini",
  };
}

function localEnhance(
  word: string,
  definition: string,
  sourceLang: LanguageCode
): AIEnhancedResult {
  const lower = word.toLowerCase();
  const summary = definition.split(".").slice(0, 1).join(".").trim();
  const simpleExplanation = `A clear way to understand "${word}": ${summary}.`;

  let usageNotes =
    "Check the surrounding sentence to choose the most natural meaning and level of formality.";

  if (sourceLang === "tw" || ["medaase", "maakye", "nsuo", "aduane", "ɔdɔ", "fie"].includes(lower)) {
    usageNotes = "This is a common Twi word used in Ghana. Its exact use can depend on the sentence and local context.";
  } else if (
    sourceLang === "ee" ||
    ["akpe", "tsi", "nuɖuɖu", "lɔlɔ̃", "aƒe"].includes(lower)
  ) {
    usageNotes = "This is an Ewe word. Keep its written characters and accents, since they can distinguish sounds and meanings.";
  }

  const exampleSentences = [
    `I learned the word "${word}" today.`,
    `Can you explain what "${word}" means?`,
    `I heard someone use "${word}" in a conversation.`,
  ];

  return {
    simpleExplanation,
    detailedExplanation: `${definition} This quick explanation uses the dictionary definition shown above; a Gemini key is needed for a fuller, context-aware explanation.`,
    usageNotes,
    exampleSentences,
    relatedWords: [],
    source: "local",
  };
}
