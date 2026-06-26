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
export const DAY_COLORS: Record<
  string,
  { bg: string; border: string; bgHover: string; accent: string }
> = {
  green: {
    bg: "#d1fae5",
    border: "#6ee7b7",
    bgHover: "#a7f3d0",
    accent: "#34d399",
  },
  yellow: {
    bg: "#fef3c7",
    border: "#fcd34d",
    bgHover: "#fde68a",
    accent: "#f59e0b",
  },
  orange: {
    bg: "#fed7aa",
    border: "#fb923c",
    bgHover: "#fdba74",
    accent: "#f97316",
  },
};

export function getDayColorBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case "green":
      return "text-foreground border border-emerald-300 bg-emerald-100 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/32";
    case "yellow":
      return "text-foreground border border-amber-300 bg-amber-100 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-yellow-500/30 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30";
    case "orange":
      // Orange es ahora el nivel máximo (Mal) — fondo y borde algo más intensos
      return "text-foreground border border-orange-400 bg-orange-200 hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-orange-500/40 dark:bg-orange-900/25 dark:hover:bg-orange-900/35";
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
      return "bg-amber-400 dark:bg-yellow-400/60";
    case "orange":
      return "bg-orange-500 dark:bg-orange-500/70";
    default:
      return "";
  }
}

