import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Devuelve la clase de color de fondo según el nivel de síntoma
// Niveles: green = Bien, yellow = Regular, orange = Mal
// Colores inline para bg y border — usados también en la exportación JPG.
// Se usan style inline en CalendarDayButton para evitar que html2canvas-pro
// falle al resolver variables oklch() de Tailwind.
// Cada nivel tiene variantes light y dark con contraste adecuado en ambos modos.
export const DAY_COLORS: Record<
  string,
  { bg: string; border: string; bgHover: string; accent: string; dark: { bg: string; border: string; accent: string } }
> = {
  green: {
    bg: "#d1fae5",
    border: "#6ee7b7",
    bgHover: "#a7f3d0",
    accent: "#34d399",
    dark: { bg: "#064e3b", border: "#059669", accent: "#34d399" },
  },
  yellow: {
    bg: "#fef3c7",
    border: "#fcd34d",
    bgHover: "#fde68a",
    accent: "#f59e0b",
    dark: { bg: "#4a4400", border: "#fde047", accent: "#facc15" },
  },
  orange: {
    bg: "#fee2e2",
    border: "#f87171",
    bgHover: "#fecaca",
    accent: "#ef4444",
    dark: { bg: "#450a0a", border: "#dc2626", accent: "#ef4444" },
  },
};

export function getDayColorBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case "green":
      return "text-foreground border border-emerald-300 bg-emerald-100 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/32";
    case "yellow":
      return "text-foreground border border-amber-300 bg-amber-100 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-yellow-300/40 dark:bg-yellow-400/10 dark:hover:bg-yellow-400/18";
    case "orange":
      // Orange (Mal) — rojo para distinguirse claramente de Regular (amarillo)
      return "text-foreground border border-red-400 bg-red-100 hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-red-500/50 dark:bg-red-950/40 dark:hover:bg-red-950/55";
    default:
      return "";
  }
}

// Devuelve la clase de color de acento (barra) según el nivel de síntoma
export function getDayAccentBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case "green":
      return "bg-emerald-400 dark:bg-emerald-500/60";
    case "yellow":
      return "bg-amber-400 dark:bg-yellow-300/70";
    case "orange":
      return "bg-red-500 dark:bg-red-500/80";
    default:
      return "";
  }
}

