export type SymptomLevel = "green" | "yellow" | "orange" | null;

export type Medication = "Bilaxten" | "Relvar" | "Relvar 92" | "Ventolin" | "Dymista" | "Rhinomur";

export const MED_CODE: Record<Medication, string> = {
  Bilaxten: "B",
  Relvar: "R",
  "Relvar 92": "R92",
  Ventolin: "V",
  Dymista: "D",
  Rhinomur: "Rh",
};

export const TREATMENT_CHANGE_DATE = new Date(2026, 8, 29);

export type DayData = {
  date: string; // formato ISO
  symptomLevel: SymptomLevel;
  medications: Medication[];
  notes?: string;
};

export type Appointment = {
  id: string;
  date: string; // formato ISO
  description: string;
  status: "pendiente" | "completada";
};
