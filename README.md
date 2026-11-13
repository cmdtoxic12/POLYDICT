# PolyDict – Multilingual Dictionary

A clean, modern multilingual dictionary + learning app for:

- **English** • **French** • **Spanish** • **Twi** • **Ewe**

### Features

- Instant word lookup + translations
- Curated local dictionary for common Twi & Ewe words
- Pronunciation (Web Speech API)
- Favorites + Recent searches (saved in browser)
- Dark / Light mode
- **AI explanations** with simple and detailed meanings, usage notes, examples, and related words
- **3 Quiz modes**:
  - Flashcard
  - Multiple Choice
  - Listening (hear the word → choose the meaning)
- Fully responsive + PWA ready

### Getting Started

```bash
cd polydict
npm install
npm run dev
```

Open http://localhost:3000

### Quiz Modes

Click the **Quiz** button (graduation cap) in the header.

- **Card** – classic show-answer flashcards
- **Choice** – multiple choice questions
- **Listen** – hear the word and pick the correct translation

You can switch direction (English → Local or Local → English) and target language (Twi / Ewe / French / Spanish).

### Connect Gemini

The Gemini explanation runs through a Next.js server route, so the API key stays on the server and is never sent to the browser.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. For local development, create `.env.local` in the project root:

   ```env
   GEMINI_API_KEY=your_key_here
   ```

3. Restart the development server. On your hosting provider, add `GEMINI_API_KEY` as a server-side environment variable for the deployed environment, then redeploy the site.
4. Search for a word and choose **Explain in detail**.

If the key is missing or Gemini is unavailable, PolyDict shows a basic offline explanation and tells you how to enable Gemini. Never add the key to `NEXT_PUBLIC_*`, browser local storage, or committed source files.

### Project Structure

```
src/
  app/               # Next.js pages
  components/        # UI components (Search, Result, Quiz, etc.)
  lib/
    dictionary.ts    # Lookup + pronunciation
    local-dictionary.ts  # Twi/Ewe word list
    ai.ts            # Gemini explanation client + offline fallback
    store.ts         # Zustand state
    types.ts

  app/api/ai-explanation/route.ts  # Server-side Gemini API route
```

### Notes

- Twi & Ewe coverage is best for the curated common words. You can expand `src/lib/local-dictionary.ts`.
- The deployment host must support Next.js server routes for Gemini explanations to work.

Built with ❤️ for language learners.
