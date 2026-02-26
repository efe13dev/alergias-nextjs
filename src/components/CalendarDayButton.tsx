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
  const hasAppointment = Boolean(appointment);
  const isPendingAppointment = appointment?.status === "pendiente";
  const appointmentDateLabel = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return (
    <div className="group relative flex justify-center">
      <button
        onClick={() => onClick(date)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(date);
          }
        }}
        className={`relative min-h-[70px] min-w-[70px] cursor-pointer flex-col items-center rounded-lg p-1 font-normal transition-all duration-150 hover:scale-[1.03] hover:shadow-md focus-visible:scale-[1.03] focus-visible:shadow-md aria-selected:opacity-100 ${dayColor} ${
          hasAppointment ? "ring-1 ring-sky-400/50" : ""
        } flex`}
        aria-label={
          hasAppointment
            ? `${date.getDate()} con cita ${isPendingAppointment ? "pendiente" : "completada"}: ${appointment?.description ?? ""}`
            : `${date.getDate()} sin cita pendiente`
        }
        type="button"
      >
        {hasAppointment && (
          <span
            aria-label="Cita pendiente"
            className={`absolute top-0.5 right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
              isPendingAppointment
                ? "border-sky-400/70 bg-sky-200 dark:border-sky-500/60 dark:bg-sky-900/45"
                : "border-emerald-400/70 bg-emerald-200 dark:border-emerald-500/60 dark:bg-emerald-900/45"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-2.5 w-2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10" />
              <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
            </svg>
          </span>
        )}

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

      {hasAppointment && appointment && (
        <div className="bg-background/95 border-border/70 text-foreground pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-1/2 z-30 w-44 -translate-x-1/2 rounded-lg border p-2 text-left text-xs opacity-0 shadow-lg transition-all duration-150 group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 focus-within:visible">
          <p
            className={`font-semibold ${
              isPendingAppointment
                ? "text-sky-700 dark:text-sky-300"
                : "text-emerald-700 dark:text-emerald-300"
            }`}
          >
            Cita {isPendingAppointment ? "pendiente" : "completada"}
          </p>
          <p className="text-muted-foreground mt-0.5">{appointmentDateLabel}</p>
          <p className="mt-1 line-clamp-3">{appointment.description}</p>
        </div>
      )}
    </div>
  );
};
