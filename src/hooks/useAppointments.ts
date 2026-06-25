"use client";

import type { Appointment } from "@/app/types";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pendingAppointments";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setAppointments(JSON.parse(saved) as Appointment[]);
    }
    setInitialized(true);
  }, []);

  // Persistir en localStorage cuando cambian los datos
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments, initialized]);

  const getAppointmentByDate = (date: Date): Appointment | undefined => {
    const forDate = appointments.filter(
      (item) => new Date(item.date).toDateString() === date.toDateString(),
    );

    return forDate.find((item) => item.status === "pendiente") ?? forDate[0];
  };

  const upsertAppointment = (date: Date, description: string) => {
    const normalized = description.trim();

    if (!normalized) return;

    setAppointments((prev) => {
      const existingIndex = prev.findIndex(
        (item) => new Date(item.date).toDateString() === date.toDateString(),
      );

      if (existingIndex >= 0) {
        const updated = [...prev];

        updated[existingIndex] = {
          ...updated[existingIndex],
          date: date.toISOString(),
          description: normalized,
          status: "pendiente",
        };

        return updated;
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          date: date.toISOString(),
          description: normalized,
          status: "pendiente",
        },
      ];
    });
  };

  const removeAppointment = (date: Date) => {
    setAppointments((prev) =>
      prev.filter((item) => new Date(item.date).toDateString() !== date.toDateString()),
    );
  };

  const completeAppointment = (date: Date) => {
    setAppointments((prev) =>
      prev.map((item) =>
        new Date(item.date).toDateString() === date.toDateString()
          ? { ...item, status: "completada" }
          : item,
      ),
    );
  };

  return {
    appointments,
    setAppointments,
    getAppointmentByDate,
    upsertAppointment,
    removeAppointment,
    completeAppointment,
  };
}
