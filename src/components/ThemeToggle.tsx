"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-foreground border-border/80 bg-muted/50 hover:bg-muted dark:border-primary/20 dark:bg-card dark:hover:bg-primary/10 inline-flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition-all duration-200 hover:shadow"
      title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
