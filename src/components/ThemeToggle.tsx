"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-muted/50 shadow-sm transition-all duration-200 hover:bg-muted hover:shadow dark:border-primary/20 dark:bg-card dark:hover:bg-primary/10"
      title={theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro"}
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
