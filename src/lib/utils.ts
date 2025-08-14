import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Devuelve la clase de color de fondo según el nivel de síntoma
export function getDayColorBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case "green":
      return "text-foreground border border-green-300 bg-green-200 hover:bg-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-selected:bg-green-300 aria-selected:border-green-400 aria-selected:ring-2 aria-selected:ring-green-400 aria-selected:ring-offset-2 aria-selected:ring-offset-background dark:border-emerald-500/50 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/45 dark:focus-visible:ring-emerald-400/50 dark:aria-selected:bg-emerald-900/50 dark:aria-selected:border-emerald-500/60 dark:aria-selected:ring-emerald-400/60";
    case "yellow":
      return "text-foreground border border-yellow-300 bg-yellow-200 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-selected:bg-yellow-300 aria-selected:border-yellow-400 aria-selected:ring-2 aria-selected:ring-yellow-400 aria-selected:ring-offset-2 aria-selected:ring-offset-background dark:border-amber-500/50 dark:bg-amber-900/25 dark:hover:bg-amber-900/40 dark:focus-visible:ring-amber-400/50 dark:aria-selected:bg-amber-900/45 dark:aria-selected:border-amber-500/60 dark:aria-selected:ring-amber-400/60";
    case "orange":
      return "text-foreground border border-orange-300 bg-orange-200 hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-selected:bg-orange-300 aria-selected:border-orange-400 aria-selected:ring-2 aria-selected:ring-orange-400 aria-selected:ring-offset-2 aria-selected:ring-offset-background dark:border-orange-500/55 dark:bg-orange-900/25 dark:hover:bg-orange-900/40 dark:focus-visible:ring-orange-400/55 dark:aria-selected:bg-orange-900/45 dark:aria-selected:border-orange-500/70 dark:aria-selected:ring-orange-400/70";
    case "red":
      return "text-foreground border border-red-300 bg-red-200 hover:bg-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-selected:bg-red-300 aria-selected:border-red-400 aria-selected:ring-2 aria-selected:ring-red-400 aria-selected:ring-offset-2 aria-selected:ring-offset-background dark:border-rose-500/50 dark:bg-rose-900/25 dark:hover:bg-rose-900/40 dark:focus-visible:ring-rose-400/50 dark:aria-selected:bg-rose-900/45 dark:aria-selected:border-rose-500/60 dark:aria-selected:ring-rose-400/60";
    default:
      return "";
  }
}

// Devuelve la clase de color de acento (barra) según el nivel de síntoma
export function getDayAccentBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case "green":
      return "bg-green-400 dark:bg-emerald-400";
    case "yellow":
      return "bg-yellow-400 dark:bg-amber-400";
    case "orange":
      return "bg-orange-400";
    case "red":
      return "bg-red-400 dark:bg-red-400";
    default:
      return "";
  }
}

// Posición de la barra de acento por nivel (arriba para amarillo)
export function getDayAccentPositionBySymptomLevel(
  symptomLevel: string | null | undefined,
): "top-0" | "bottom-0" | "" {
  switch (symptomLevel) {
    case "yellow":
      return "top-0";
    case "green":
    case "orange":
    case "red":
      return "bottom-0";
    default:
      return "";
  }
}
