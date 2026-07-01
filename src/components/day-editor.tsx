"use client";

import type { Appointment, DayData, Medication, SymptomLevel } from "@/app/types";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DayEditorProps {
  date: Date;
  initialData?: DayData;
  appointment?: Appointment;
  onSave: (
    date: Date,
    symptomLevel: SymptomLevel,
    medications: Medication[],
    notes: string,
  ) => void;
  onUpsertAppointment: (date: Date, description: string) => void;
  onRemoveAppointment: (date: Date) => void;
  onCompleteAppointment: (date: Date) => void;
}

export default function DayEditor({
  date,
  initialData,
  appointment,
  onSave,
  onUpsertAppointment,
  onRemoveAppointment,
  onCompleteAppointment,
}: DayEditorProps) {
  const [symptomLevel, setSymptomLevel] = useState<SymptomLevel>(initialData?.symptomLevel || null);
  const [medications, setMedications] = useState<Medication[]>(initialData?.medications || []);
  const [isAppointmentExpanded, setIsAppointmentExpanded] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [appointmentDescription, setAppointmentDescription] = useState(
    appointment?.description ?? "",
  );

  useEffect(() => {
    setSymptomLevel(initialData?.symptomLevel ?? null);
    setMedications(initialData?.medications ?? []);
    setNotes(initialData?.notes ?? "");
    setAppointmentDescription(appointment?.description ?? "");
    setIsAppointmentExpanded(Boolean(appointment));
    setIsNotesExpanded(Boolean(initialData?.notes?.trim()));
  }, [initialData, appointment, date]);

  const handleMedicationToggle = (medication: Medication) => {
    setMedications((prev) =>
      prev.includes(medication) ? prev.filter((m) => m !== medication) : [...prev, medication],
    );
  };

  const handleSave = () => {
    const trimmedDescription = appointmentDescription.trim();

    onSave(date, symptomLevel, medications, notes);

    if (trimmedDescription) {
      onUpsertAppointment(date, trimmedDescription);
    }
  };

  const hasAppointment = Boolean(appointment);
  const isPendingAppointment = appointment?.status === "pendiente";
  const hasNotes = Boolean(notes.trim());

  const symptomOptions: {
    value: NonNullable<SymptomLevel>;
    label: string;
    dotClass: string;
    borderClass: string;
    activeBg: string;
  }[] = [
    {
      value: "green",
      label: "Bien",
      dotClass: "bg-emerald-400 dark:bg-emerald-500/60",
      borderClass: "border-emerald-300 dark:border-emerald-500/40",
      activeBg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      value: "yellow",
      label: "Regular",
      dotClass: "bg-amber-400 dark:bg-yellow-400/60",
      borderClass: "border-amber-300 dark:border-yellow-500/40",
      activeBg: "bg-amber-100 dark:bg-yellow-900/20",
    },
    {
      value: "orange",
      label: "Mal",
      dotClass: "bg-red-500 dark:bg-red-500/80",
      borderClass: "border-red-400 dark:border-red-500/50",
      activeBg: "bg-red-100 dark:bg-red-950/40",
    },
  ];

  const medicationOptions: { id: Medication; label: string; color: string }[] = [
    {
      id: "Bilaxten",
      label: "Bilaxten",
      color: "border-sky-200/80 bg-sky-50/60 dark:border-sky-500/30 dark:bg-sky-900/15",
    },
    {
      id: "Relvar",
      label: "Relvar",
      color: "border-violet-200/80 bg-violet-50/60 dark:border-violet-500/30 dark:bg-violet-900/15",
    },
    {
      id: "Ventolin",
      label: "Ventolin",
      color: "border-teal-200/80 bg-teal-50/60 dark:border-teal-500/30 dark:bg-teal-900/15",
    },
    {
      id: "Dymista",
      label: "Dymista",
      color: "border-rose-200/80 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-900/15",
    },
  ];

  return (
    <div className="space-y-5 py-1">
      {/* Nivel de síntomas */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          Nivel de síntomas
        </p>
        <RadioGroup
          value={symptomLevel || ""}
          onValueChange={(value) => setSymptomLevel(value as SymptomLevel)}
          className="grid grid-cols-3 gap-2"
        >
          {symptomOptions.map(({ value, label, dotClass, borderClass, activeBg }) => (
            <div key={value} className="flex items-center">
              <RadioGroupItem value={value} id={value} className="sr-only" />
              <Label
                htmlFor={value}
                className={`border-border/50 flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-sm transition-all ${
                  symptomLevel === value
                    ? `${borderClass} ${activeBg} font-medium ring-1 ring-inset ${borderClass}`
                    : "hover:bg-muted/40"
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-full ${dotClass}`} />
                <span className="text-xs">{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        {symptomLevel && (
          <button
            type="button"
            onClick={() => setSymptomLevel(null)}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
          >
            Quitar selección
          </button>
        )}
      </div>

      {/* Medicamentos */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          Medicamentos tomados
        </p>
        <div className="grid grid-cols-2 gap-2">
          {medicationOptions.map(({ id, label, color }) => (
            <label
              key={id}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                medications.includes(id)
                  ? `${color} font-medium ring-1 ring-inset ${color}`
                  : "border-border/50 hover:bg-muted/40"
              }`}
            >
              <Checkbox
                id={id}
                checked={medications.includes(id)}
                onCheckedChange={() => handleMedicationToggle(id)}
                className="pointer-events-none"
                aria-hidden
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notas del día */}
      <div className="border-border/40 rounded-lg border">
        <button
          type="button"
          className="hover:bg-muted/40 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
          onClick={() => setIsNotesExpanded((prev) => !prev)}
          aria-expanded={isNotesExpanded}
        >
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">Notas del día</span>
            {hasNotes && (
              <span className="rounded border border-amber-200/70 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-300">
                con notas
              </span>
            )}
          </span>
          <span className="text-muted-foreground text-xs">
            {isNotesExpanded ? "Ocultar" : hasNotes ? "Ver" : "Añadir"}
          </span>
        </button>
        <div
          className={`grid transition-all duration-200 ease-in-out ${
            isNotesExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3">
              <textarea
                name="dayNotes"
                className="border-border/60 bg-muted/20 focus:border-border focus:ring-ring/20 min-h-20 w-full rounded-md border px-2.5 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                placeholder="Ej: Ese día había mucho polvo en el ambiente…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cita del día */}
      <div className="border-border/40 rounded-lg border">
        <button
          type="button"
          className="hover:bg-muted/40 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors"
          onClick={() => setIsAppointmentExpanded((prev) => !prev)}
          aria-expanded={isAppointmentExpanded}
        >
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">Cita del día</span>
            {hasAppointment && (
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                  isPendingAppointment
                    ? "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-900/20 dark:text-sky-300"
                    : "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-300"
                }`}
              >
                {isPendingAppointment ? "pendiente" : "completada"}
              </span>
            )}
          </span>
          <span className="text-muted-foreground text-xs">
            {isAppointmentExpanded ? "Ocultar" : hasAppointment ? "Ver" : "Añadir"}
          </span>
        </button>
        <div
          className={`grid transition-all duration-200 ease-in-out ${
            isAppointmentExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-2.5 px-3 pb-3">
              <textarea
                name="appointmentDescription"
                className="border-border/60 bg-muted/20 focus:border-border focus:ring-ring/20 min-h-20 w-full rounded-md border px-2.5 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                placeholder="Ej: Revisión con alergólogo a las 10:00"
                value={appointmentDescription}
                onChange={(e) => setAppointmentDescription(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Una cita por día. Si escribes una descripción, se crea o actualiza al guardar.
              </p>
              {hasAppointment && (
                <div className="flex gap-2">
                  {isPendingAppointment && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => onCompleteAppointment(date)}
                    >
                      Marcar completada
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      onRemoveAppointment(date);
                      setAppointmentDescription("");
                    }}
                  >
                    Eliminar cita
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border/40 flex justify-end border-t pt-4">
        <Button onClick={handleSave} size="sm" className="px-5">
          Guardar
        </Button>
      </div>
    </div>
  );
}
