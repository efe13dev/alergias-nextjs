import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Devuelve la clase de color de fondo según el nivel de síntoma
// Niveles: green = Bien, yellow = Regular, orange = Mal
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

