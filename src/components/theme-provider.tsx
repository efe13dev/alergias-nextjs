"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Inicializa según localStorage o clase actual en <html>
  useEffect(() => {
    try {
      // Lee cookie primero para mantener consistencia con SSR
      const cookieMatch = document.cookie.match(/(?:^|; )theme=([^;]+)/);
      const cookieTheme = (cookieMatch ? decodeURIComponent(cookieMatch[1]) : null) as
        | Theme
        | null;
      const stored = localStorage.getItem("theme") as Theme | null;
      const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
      const initial = cookieTheme || stored || current;

      setThemeState(initial);
      applyThemeClass(initial);
      // Retira el pre-estilo de primer paint para no bloquear cambios posteriores de tema
      try {
        const pre = document.getElementById("theme-prestyle");
        if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
      } catch {}
    } catch {}
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("theme", t);
      // Sincroniza cookie (1 año)
      document.cookie = `theme=${encodeURIComponent(t)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}
    applyThemeClass(t);
    // Asegura que el pre-estilo no permanezca tras un cambio de tema
    try {
      const pre = document.getElementById("theme-prestyle");
      if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";

    setTheme(next);
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");

  return ctx;
}
