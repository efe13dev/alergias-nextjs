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
        notes?: string;
      }
    | undefined;
  onClick: (date: Date) => void;
  appointment?: Appointment;
};

export const CalendarDayButton: React.FC<Props> = ({ date, dayData, onClick, appointment }) => {
  const dayColor = getDayColorBySymptomLevel(dayData?.symptomLevel);
  const accentClass = getDayAccentBySymptomLevel(dayData?.symptomLevel);
  const dayMeds = dayData?.medications || [];
  const noteText = dayData?.notes?.trim() ?? "";
  const hasNotes = Boolean(dayData?.notes?.trim());
  const hasAppointment = Boolean(appointment);
  const isPendingAppointment = appointment?.status === "pendiente";
  const appointmentDescription = appointment?.description?.trim() ?? "";

  return (
    <div className="group relative z-0 flex justify-center focus-within:z-40 hover:z-40">
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
        aria-label={`${date.getDate()}${
          hasAppointment
            ? ` con cita ${isPendingAppointment ? "pendiente" : "completada"}: ${appointment?.description ?? ""}`
            : " sin cita pendiente"
        }${hasNotes ? " y con nota del día" : ""}`}
        type="button"
      >
        {hasNotes && (
          <span className="group/note absolute top-0.5 left-0.5">
            <span
              aria-label="Tiene notas"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-amber-400/70 bg-amber-200 dark:border-amber-500/60 dark:bg-amber-900/45"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
            </span>
            <span className="bg-background/95 border-border/70 text-foreground pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-0 z-30 w-44 rounded-lg border p-2 text-left text-xs opacity-0 shadow-lg transition-all duration-150 group-focus-within/note:visible group-focus-within/note:opacity-100 group-hover/note:visible group-hover/note:opacity-100">
              <span className="block font-semibold text-amber-700 dark:text-amber-300">Nota:</span>
              <span className="line-clamp-4 block">{noteText}</span>
            </span>
          </span>
        )}

        {hasAppointment && (
          <span className="group/appointment absolute top-0.5 right-0.5">
            <span
              aria-label="Cita pendiente"
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
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
            <span className="bg-background/95 border-border/70 text-foreground pointer-events-none invisible absolute right-0 bottom-[calc(100%+6px)] z-30 w-44 rounded-lg border p-2 text-left text-xs opacity-0 shadow-lg transition-all duration-150 group-focus-within/appointment:visible group-focus-within/appointment:opacity-100 group-hover/appointment:visible group-hover/appointment:opacity-100">
              <span
                className={`block font-semibold ${
                  isPendingAppointment
                    ? "text-sky-700 dark:text-sky-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                Cita:
              </span>
              <span className="mt-1 line-clamp-3 block">{appointmentDescription}</span>
            </span>
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
    </div>
  );
};
