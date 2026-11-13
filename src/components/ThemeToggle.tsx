"use client";

import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
      title={darkMode ? "Light mode" : "Dark mode"}
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
