import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Devuelve la clase de color de fondo según el nivel de síntoma
export function getDayColorBySymptomLevel(symptomLevel: string | null | undefined): string {
  switch (symptomLevel) {
    case 'green':
      return 'bg-green-200 hover:bg-green-300';
    case 'yellow':
      return 'bg-yellow-200 hover:bg-yellow-300';
    case 'orange':
      return 'bg-orange-200 hover:bg-orange-300';
    case 'red':
      return 'bg-red-200 hover:bg-red-300';
    default:
      return '';
  }
}
