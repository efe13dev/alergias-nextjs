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
      return "text-foreground border border-emerald-200/90 bg-emerald-50/80 hover:bg-emerald-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/32";
    case "yellow":
      return "text-foreground border border-amber-200/90 bg-amber-50/80 hover:bg-amber-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-yellow-500/30 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30";
    case "orange":
      // Orange es ahora el nivel máximo (Mal) — fondo y borde algo más intensos
      return "text-foreground border border-orange-300/90 bg-orange-100/70 hover:bg-orange-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-orange-500/40 dark:bg-orange-900/25 dark:hover:bg-orange-900/35";
    default:
      return "";
  }
}

// Devuelve la clase de color de acento (barra) según el nivel de síntoma
export function getDayAccentBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case "green":
      return "bg-emerald-300/90 dark:bg-emerald-500/60";
    case "yellow":
      return "bg-amber-300/90 dark:bg-yellow-400/60";
    case "orange":
      return "bg-orange-400/90 dark:bg-orange-500/70";
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
      return "bottom-0";
    default:
      return "";
  }
}
