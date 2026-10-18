"use client";

import { useEffect, useRef, useState } from "react";
import {
  type DayData,
  type Medication,
  type SymptomLevel,
  TREATMENT_CHANGE_DATE,
} from "@/app/types";

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
  const [dayData, setDayData] = useState<DayData[]>([]);
  const initialized = useRef(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setDayData(migrateDayData(JSON.parse(saved) as DayData[]));
    }
    initialized.current = true;
  }, []);

  // Persistir en localStorage cuando cambian los datos
  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dayData));
    }
  }, [dayData]);

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

  return { dayData, getDayData, updateDayData };
}
