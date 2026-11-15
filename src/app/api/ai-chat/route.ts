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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Gemini is not configured on the server.", code: "not_configured" },
      { status: 503 }
    );
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

  const { messages, sourceLang } = body as Record<string, unknown>;
  const supportedLanguages = Object.keys(languageNames) as LanguageCode[];
  if (
    !Array.isArray(messages) || messages.length < 1 || messages.length > 12 ||
    typeof sourceLang !== "string" || !supportedLanguages.includes(sourceLang as LanguageCode)
  ) {
    return Response.json({ error: "Invalid chat messages or language." }, { status: 400 });
  }

  const validMessages = messages.every((message): message is ChatMessage =>
    Boolean(message) && typeof message === "object" &&
    ((message as ChatMessage).role === "user" || (message as ChatMessage).role === "assistant") &&
    typeof (message as ChatMessage).content === "string" &&
    (message as ChatMessage).content.trim().length > 0 &&
    (message as ChatMessage).content.length <= 1500
  );
  const totalLength = (messages as ChatMessage[]).reduce(
    (total, message) => total + (typeof message?.content === "string" ? message.content.length : 0),
    0
  );

  if (!validMessages || totalLength > 8000 || (messages[messages.length - 1] as ChatMessage).role !== "user") {
    return Response.json({ error: "Chat is too long or contains an invalid message." }, { status: 400 });
  }

  const transcript = (messages as ChatMessage[])
    .map((message) => `${message.role === "user" ? "Learner" : "PolyDict AI"}: ${message.content.trim()}`)
    .join("\n\n");
  const prompt = `You are PolyDict AI, a friendly and careful multilingual vocabulary tutor. Help learners with words they could not find in the dictionary. The learner's selected source language is ${languageNames[sourceLang as LanguageCode]}.

Explain likely meanings, spelling or pronunciation when useful, context, and natural examples. If a word is ambiguous, ask a short clarifying question. Be especially careful with Twi and Ewe: preserve the original spelling and tones, say when you are uncertain, and never invent cultural context or a translation. Distinguish a likely interpretation from a verified fact. Keep replies clear and useful, and use the learner's language unless they ask for another language.

Conversation:
${transcript}

PolyDict AI:`;

  const attempts = [
    { model: "gemini-3.8-flash", delayMs: 0 },
    { model: "gemini-3.8-flash", delayMs: 750 },
    { model: "gemini-3.5-flash-lite", delayMs: 0 },
  ];

  for (const [index, attempt] of attempts.entries()) {
    if (attempt.delayMs) await new Promise((resolve) => setTimeout(resolve, attempt.delayMs));
    let response: Response;
    try {
      response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          "Api-Revision": "2026-05-20",
        },
        body: JSON.stringify({ model: attempt.model, input: prompt, store: false }),
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      console.error(`Gemini chat request failed for ${attempt.model} on attempt ${index + 1}`, error);
      if (index < attempts.length - 1) continue;
      return Response.json(
        { error: "Gemini is temporarily unavailable. Please try again.", code: "network_error" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const providerError = (await response.text()).slice(0, 1500);
      console.error(`Gemini chat request failed for ${attempt.model} on attempt ${index + 1}`, response.status, providerError);
      if (response.status === 503 && index < attempts.length - 1) continue;
      return Response.json(
        { error: "PolyDict AI could not reply right now. Please try again.", code: "provider_error", providerStatus: response.status },
        { status: 502 }
      );
    }

    let interaction: InteractionResponse;
    try {
      interaction = await response.json() as InteractionResponse;
    } catch {
      return Response.json({ error: "PolyDict AI returned an unreadable reply.", code: "provider_error" }, { status: 502 });
    }
    const text = interaction.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content ?? [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!text) {
      return Response.json({ error: "PolyDict AI returned an empty reply.", code: "provider_error" }, { status: 502 });
    }

    return Response.json({ text, model: attempt.model });
  }

  return Response.json(
    { error: "Gemini is temporarily unavailable. Please try again.", code: "provider_error", providerStatus: 503 },
    { status: 502 }
  );
}
