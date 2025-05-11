export type SymptomLevel = 'green' | 'yellow' | 'orange' | 'red' | null;
export type Medication = 'Bilaxten' | 'Relvar' | 'Ventolin' | 'Dymista';
export type DayData = {
  date: string; // formato ISO
  symptomLevel: SymptomLevel;
  medications: Medication[];
};
export type Appointment = {
  id: string;
  date: string; // formato ISO
  description: string;
  status: 'pendiente' | 'completada';
};
