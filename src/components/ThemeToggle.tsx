"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-foreground inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-zinc-100 shadow hover:bg-zinc-200 dark:border-zinc-400/30 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/55"
      title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
