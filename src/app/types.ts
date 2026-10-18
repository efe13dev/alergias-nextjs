export type SymptomLevel = "green" | "yellow" | "orange" | null;

export type Medication =
  | "Bilaxten"
  | "Relvar 184"
  | "Relvar 92"
  | "Ventolin"
  | "Dymista"
  | "Rinoduo";

export const MED_CODE: Record<Medication, string> = {
  Bilaxten: "B",
  "Relvar 184": "R184",
  "Relvar 92": "R92",
  Ventolin: "V",
  Dymista: "D",
  Rinoduo: "Ri",
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
