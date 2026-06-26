"use client";

import type { DayData, Medication, SymptomLevel } from "@/app/types";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "allergyTrackerData";

export function useDayData() {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const initialized = useRef(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setDayData(JSON.parse(saved) as DayData[]);
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
