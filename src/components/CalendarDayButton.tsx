import type { Appointment } from "@/app/types";
import type React from "react";

import { getDayAccentBySymptomLevel, getDayColorBySymptomLevel } from "@/lib/utils";

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
  const accentClass = getDayAccentBySymptomLevel(dayData?.symptomLevel);
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
      className={`relative flex cursor-pointer flex-col items-center rounded-lg p-1 font-normal transition-all duration-150 hover:scale-[1.03] hover:shadow-md aria-selected:opacity-100 ${
        isAppointment
          ? "text-foreground border border-sky-300/80 bg-sky-100 hover:bg-sky-200 dark:border-sky-500/40 dark:bg-sky-900/20 dark:hover:bg-sky-900/35"
          : dayColor
      } min-h-[70px] min-w-[70px]`}
      type="button"
    >
      <span className="mb-1 font-medium">{date.getDate()}</span>
      {dayMeds.length > 0 && (
        <div className="z-10 flex flex-col items-center justify-center gap-0.5">
          {/* Dividir los medicamentos en dos filas de máximo 2 elementos cada una */}
          <div className="flex justify-center gap-1">
            {dayMeds.slice(0, 2).map((med) => (
              <span
                key={med}
                className={
                  med === "Bilaxten"
                    ? "text-foreground rounded-sm border border-sky-300 bg-sky-200 px-1 text-[10px] font-semibold dark:border-sky-500/80 dark:bg-sky-900/50"
                    : med === "Relvar"
                      ? "text-foreground rounded-sm border border-violet-300 bg-violet-200 px-1 text-[10px] font-semibold dark:border-violet-500/80 dark:bg-violet-900/50"
                      : med === "Ventolin"
                        ? "text-foreground rounded-sm border border-teal-300 bg-teal-200 px-1 text-[10px] font-semibold dark:border-teal-500/80 dark:bg-teal-900/50"
                        : "text-foreground rounded-sm border border-rose-300 bg-rose-200 px-1 text-[10px] font-semibold dark:border-rose-500/80 dark:bg-rose-900/50"
                }
                title={med}
              >
                {med[0]}
              </span>
            ))}
          </div>
          {dayMeds.length > 2 && (
            <div className="mt-0 flex justify-center gap-1">
              {dayMeds.slice(2, 4).map((med) => (
                <span
                  key={med}
                  className={
                    med === "Bilaxten"
                      ? "text-foreground rounded-sm border border-sky-300 bg-sky-200 px-1 text-[10px] font-semibold dark:border-sky-500/60 dark:bg-sky-900/30"
                      : med === "Relvar"
                        ? "text-foreground rounded-sm border border-violet-300 bg-violet-200 px-1 text-[10px] font-semibold dark:border-violet-500/60 dark:bg-violet-900/30"
                        : med === "Ventolin"
                          ? "text-foreground rounded-sm border border-teal-300 bg-teal-200 px-1 text-[10px] font-semibold dark:border-teal-500/60 dark:bg-teal-900/30"
                          : "text-foreground rounded-sm border border-rose-300 bg-rose-200 px-1 text-[10px] font-semibold dark:border-rose-500/60 dark:bg-rose-900/30"
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
      {accentClass && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-1.5 rounded-b ${accentClass}`}
        />
      )}
    </button>
  );
};
