# PolyDict – Multilingual Dictionary

A clean, modern multilingual dictionary + learning app for:

- **English** • **French** • **Spanish** • **Twi** • **Ewe**

### Features

- Instant word lookup + translations
- Curated local dictionary for common Twi & Ewe words
- Pronunciation (Web Speech API)
- Favorites + Recent searches (saved in browser)
- Dark / Light mode
- **AI “Explain simply”** (smart local + optional real model)
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

### Enabling a Real AI Model (optional)

The AI explanation works offline with a smart local fallback.  
To use a real model (DeepSeek, GLM, etc.):

1. Get a free API key from one of these (examples):
   - NVIDIA NIM → https://build.nvidia.com
   - Other free OpenAI-compatible providers

2. In the browser console on the PolyDict page run:

```js
localStorage.setItem("polydict_ai_base", "https://integrate.api.nvidia.com/v1")
localStorage.setItem("polydict_ai_key", "nvapi-your-key-here")
localStorage.setItem("polydict_ai_model", "deepseek-ai/deepseek-v4.1-flash")
```

3. Refresh the page. The “Explain simply with AI” button will now call the real model.

(You can later turn this into a settings UI.)

### Project Structure

```
src/
  app/               # Next.js pages
  components/        # UI components (Search, Result, Quiz, etc.)
  lib/
    dictionary.ts    # Lookup + pronunciation
    local-dictionary.ts  # Twi/Ewe word list
    ai.ts            # AI explanations (local + real model)
    store.ts         # Zustand state
    types.ts
```

### Notes

- Twi & Ewe coverage is best for the curated common words. You can expand `src/lib/local-dictionary.ts`.
- OpenCode free models are mainly client-only; using NVIDIA / other free endpoints is the practical way for a web app.

Built with ❤️ for language learners.
