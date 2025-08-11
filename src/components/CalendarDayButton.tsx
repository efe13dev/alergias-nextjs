import type { Appointment } from "@/app/types";
import type React from "react";

import { getDayColorBySymptomLevel } from "@/lib/utils";

type Medication = "Bilaxten" | "Relvar" | "Ventolin" | "Dymista";

type Props = {
  date: Date;
  dayData:
    | {
        date: string;
        symptomLevel: string | null;
        medications: Medication[];
      }
    | undefined;
  onClick: (date: Date) => void;
  appointment?: Appointment;
};

export const CalendarDayButton: React.FC<Props> = ({ date, dayData, onClick, appointment }) => {
  const dayColor = getDayColorBySymptomLevel(dayData?.symptomLevel);
  const dayMeds = dayData?.medications || [];
  const isAppointment = appointment && appointment.status === "pendiente";

  return (
    <button
      onClick={() => onClick(date)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(date);
        }
      }}
      className={`relative flex cursor-pointer flex-col items-center rounded-md p-1 font-normal aria-selected:opacity-100 ${isAppointment ? "bg-blue-400 text-white" : dayColor} min-h-[70px] min-w-[70px]`}
      type="button"
    >
      <span className="mb-1 font-medium">{date.getDate()}</span>
      {dayMeds.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-1">
          {/* Dividir los medicamentos en dos filas de máximo 2 elementos cada una */}
          <div className="flex justify-center gap-1">
            {dayMeds.slice(0, 2).map((med) => (
              <span
                key={med}
                className={
                  med === "Bilaxten"
                    ? "rounded-sm bg-blue-100 px-1 text-[10px] font-semibold"
                    : med === "Relvar"
                      ? "rounded-sm bg-purple-100 px-1 text-[10px] font-semibold"
                      : med === "Ventolin"
                        ? "rounded-sm bg-teal-100 px-1 text-[10px] font-semibold"
                        : "rounded-sm bg-pink-100 px-1 text-[10px] font-semibold"
                }
                title={med}
              >
                {med[0]}
              </span>
            ))}
          </div>
          {dayMeds.length > 2 && (
            <div className="mt-1 flex justify-center gap-1">
              {dayMeds.slice(2, 4).map((med) => (
                <span
                  key={med}
                  className={
                    med === "Bilaxten"
                      ? "rounded-sm bg-blue-100 px-1 text-[10px] font-semibold"
                      : med === "Relvar"
                        ? "rounded-sm bg-purple-100 px-1 text-[10px] font-semibold"
                        : med === "Ventolin"
                          ? "rounded-sm bg-teal-100 px-1 text-[10px] font-semibold"
                          : "rounded-sm bg-pink-100 px-1 text-[10px] font-semibold"
                  }
                  title={med}
                >
                  {med[0]}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  );
};
