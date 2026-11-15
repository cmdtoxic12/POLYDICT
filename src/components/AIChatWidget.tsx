"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { LoaderCircle, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { LANGUAGES } from "@/lib/types";
import { useAppStore } from "@/lib/store";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content: "Hi! I can help with words that are hard to find. Share the word and any context you have, or ask how to say something.",
};

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index} className="font-semibold text-zinc-950 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em] dark:bg-zinc-800">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.replace(/\\([*_`#-])/g, "$1").split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }

    const heading = lines[index].match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      blocks.push(<h3 key={index} className="mb-1 mt-3 text-sm font-bold text-zinc-950 first:mt-0 dark:text-white">{renderInlineMarkdown(heading[1])}</h3>);
      index += 1;
      continue;
    }

    const listMatch = lines[index].match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\s*\d+[.)]\s+/.test(lines[index]);
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/);
        if (!item || /^\s*\d+[.)]\s+/.test(lines[index]) !== ordered) break;
        items.push(<li key={index}>{renderInlineMarkdown(item[1])}</li>);
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${index}`} className={ordered ? "my-1 list-decimal space-y-1 pl-5 marker:text-emerald-700 dark:marker:text-emerald-400" : "my-1 list-disc space-y-1 pl-5 marker:text-emerald-700 dark:marker:text-emerald-400"}>{items}</List>);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^#{1,3}\s+/.test(lines[index]) && !/^\s*(?:[-*]|\d+[.)])\s+/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="my-1 first:mt-0 last:mb-0">{renderInlineMarkdown(paragraph.join(" "))}</p>);
  }

  return <div className="space-y-2 text-sm leading-6">{blocks.map((block, blockIndex) => <Fragment key={blockIndex}>{block}</Fragment>)}</div>;
}

export default function AIChatWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sourceLang = useAppStore((state) => state.sourceLang);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const languageName = LANGUAGES.find((language) => language.code === sourceLang)?.name ?? "English";

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending, open]);

  const resetChat = () => {
    setMessages([welcomeMessage]);
    setInput("");
    setError("");
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    const boundedMessages = nextMessages.slice(-12);
    while (
      boundedMessages.length > 1 &&
      boundedMessages.reduce((total, message) => total + message.content.length, 0) > 8000
    ) {
      boundedMessages.shift();
    }

    setMessages(nextMessages.slice(-24));
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: boundedMessages, sourceLang }),
      });
      const data = await response.json().catch(() => null) as { text?: unknown; error?: string } | null;
      const reply = data?.text;
      if (!response.ok || typeof reply !== "string") {
        throw new Error(data?.error || "PolyDict AI couldn't reply right now. Please try again.");
      }
      const assistantMessage: ChatMessage = { role: "assistant", content: reply };
      setMessages((current) => [...current, assistantMessage].slice(-24));
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Connection failed. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <>
      {open && (
        <section
          id="ai-chat-panel"
          aria-label="PolyDict AI chat"
          className="fixed inset-x-3 bottom-24 z-50 flex h-[min(680px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/20 sm:inset-x-auto sm:right-6 sm:w-[390px] dark:border-zinc-700 dark:bg-zinc-900"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-white">PolyDict AI</h2>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">Word help · {languageName}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                disabled={messages.length <= 1 || isSending}
                className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Start a new chat"
                title="New chat"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Close AI chat"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-zinc-50/80 px-4 py-5 dark:bg-zinc-950/60" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={`${index}-${message.role}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 ${
                      isUser
                        ? "rounded-br-md bg-emerald-700 text-white dark:bg-emerald-600"
                        : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {isUser ? <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p> : <FormattedMessage content={message.content} />}
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex justify-start" role="status" aria-label="PolyDict AI is thinking">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-3.5 py-3 text-xs text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <LoaderCircle className="h-4 w-4 animate-spin text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  Thinking through that word…
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {error && (
            <p role="alert" className="mx-3 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          )}

          <form onSubmit={sendMessage} className="shrink-0 border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <label htmlFor="ai-chat-message" className="sr-only">Message PolyDict AI</label>
            <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950">
              <textarea
                ref={inputRef}
                id="ai-chat-message"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={1500}
                placeholder="Ask about a word…"
                className="max-h-28 min-h-10 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                aria-label="Send message"
              >
                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-400">AI can make mistakes. Add context for a better answer.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={open ? "ai-chat-panel" : undefined}
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {open ? <X className="h-4 w-4" aria-hidden="true" /> : <MessageCircle className="h-4 w-4" aria-hidden="true" />}
        <span>{open ? "Close chat" : "Ask PolyDict AI"}</span>
      </button>
    </>
  );
}
