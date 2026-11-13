"use client";

import { useEffect, useState } from "react";
import { Download, Share2, WifiOff, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWARegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
      console.error("PolyDict offline support could not start", error);
    });
  }, []);

  return null;
}

export function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setIsInstalled(standalone);
    setIsOffline(!navigator.onLine);

    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  const showInstallHelp = !isInstalled && !dismissed && (Boolean(installEvent) || isIOS);

  return (
    <>
      {isOffline && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          You’re offline. Saved words and the app shell are still available.
        </div>
      )}

      {showInstallHelp && (
        <aside className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 text-emerald-950 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
            {isIOS ? <Share2 className="h-4 w-4" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Keep PolyDict close</p>
            <p className="mt-0.5 text-xs leading-5 text-emerald-800 dark:text-emerald-200">
              {isIOS
                ? "Tap Share, then Add to Home Screen to install PolyDict."
                : "Install PolyDict for a full-screen app and quick access from your home screen."}
            </p>
            {!isIOS && installEvent && (
              <button
                type="button"
                onClick={install}
                className="mt-2 inline-flex min-h-9 items-center justify-center rounded-xl bg-emerald-700 px-3.5 text-xs font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
              >
                Install app
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss install suggestion"
            onClick={() => setDismissed(true)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-emerald-800/70 transition hover:bg-emerald-100 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-200 dark:hover:bg-emerald-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </aside>
      )}
    </>
  );
}
