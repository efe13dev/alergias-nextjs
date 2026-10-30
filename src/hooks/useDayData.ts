"use client";

import {
  type DayData,
  type Medication,
  type SymptomLevel,
  TREATMENT_CHANGE_DATE,
} from "@/app/types";
import { useStoredData } from "@/hooks/useStoredData";

const STORAGE_KEY = "allergyTrackerData";

const migrateDayData = (entries: DayData[]): DayData[] =>
  entries.map((entry) => {
    const isNewTreatment = new Date(entry.date) >= TREATMENT_CHANGE_DATE;
    const medications = entry.medications.map((med: string) => {
      if (med === "Relvar" || med === "Relvar 184") {
        return isNewTreatment ? "Relvar 92" : "Relvar 184";
      }
      if ((med === "Dymista" && isNewTreatment) || med === "Rhinomur") return "Rinoduo";
      return med as Medication;
    });

    return { ...entry, medications: [...new Set(medications)] };
  });

export function useDayData() {
  const {
    value: dayData,
    setValue: setDayData,
    status,
    retry,
    loaded,
  } = useStoredData(STORAGE_KEY, migrateDayData);

  const getDayData = (date: Date): DayData | undefined =>
    dayData.find((item) => new Date(item.date).toDateString() === date.toDateString());

  const updateDayData = (
    date: Date,
    symptomLevel: SymptomLevel,
    medications: Medication[],
    notes: string,
  ) => {
    const dateString = date.toISOString();
    const trimmedNotes = notes.trim();

    setDayData((prev) => {
      const existingIndex = prev.findIndex(
        (item) => new Date(item.date).toDateString() === date.toDateString(),
      );

      if (existingIndex >= 0) {
        const updated = [...prev];

        updated[existingIndex] = {
          date: dateString,
          symptomLevel,
          medications,
          notes: trimmedNotes,
        };

        return updated;
      }

      return [...prev, { date: dateString, symptomLevel, medications, notes: trimmedNotes }];
    });
  };

  return { dayData, getDayData, updateDayData, status, retry, loaded };
}
