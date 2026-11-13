import type { LanguageCode } from "@/lib/types";

export const maxDuration = 30;

const languageNames: Record<LanguageCode, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  tw: "Twi",
  ee: "Ewe",
};

interface InteractionResponse {
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Gemini is not configured on the server." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request must contain valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { word, definition, sourceLang } = body as Record<string, unknown>;
  const supportedLanguages = Object.keys(languageNames) as LanguageCode[];
  if (
    typeof word !== "string" || word.trim().length === 0 || word.length > 100 ||
    typeof definition !== "string" || definition.length > 2000 ||
    typeof sourceLang !== "string" || !supportedLanguages.includes(sourceLang as LanguageCode)
  ) {
    return Response.json({ error: "Invalid word, definition, or language." }, { status: 400 });
  }

  const prompt = `You are a careful language teacher helping learners understand vocabulary. Give accurate, useful detail without inventing unsupported facts. If the word is Twi or Ewe, preserve its spelling and explain cultural or regional context only when you are confident.

Word: ${JSON.stringify(word.trim())}
Source language: ${languageNames[sourceLang as LanguageCode]}
Dictionary definition: ${JSON.stringify(definition.trim().slice(0, 2000))}

Return these sections using exactly these labels:
Simple meaning: explain it in plain language in 1-2 sentences.
Detailed meaning: explain the main sense, nuance, and context in 3-5 sentences. Mention alternate or figurative usage only when relevant.
Usage notes: give one practical grammar, register, or usage tip.
Examples:
- Give three natural example sentences. Include the word in the source language.
Related words: list up to three useful synonyms or related words, or write None.`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model: "gemini-3.8-flash",
        input: prompt,
        store: false,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      const providerError = (await response.text()).slice(0, 1500);
      console.error("Gemini request failed", response.status, providerError);
      return Response.json(
        { error: "Gemini could not generate an explanation.", providerStatus: response.status },
        { status: 502 }
      );
    }

    const interaction = await response.json() as InteractionResponse;
    const text = interaction.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content ?? [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!text) {
      return Response.json({ error: "Gemini returned an empty explanation." }, { status: 502 });
    }

    return Response.json({ text });
  } catch (error) {
    console.error("Gemini request failed", error);
    return Response.json({ error: "Gemini is temporarily unavailable." }, { status: 502 });
  }
}
