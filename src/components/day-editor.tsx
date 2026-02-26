"use client";

import type { Appointment } from "@/app/types";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SymptomLevel = "green" | "yellow" | "orange" | "red" | null;
type Medication = "Bilaxten" | "Relvar" | "Ventolin" | "Dymista";
type DayData = {
  date: string; // formato ISO
  symptomLevel: SymptomLevel;
  medications: Medication[];
};

interface DayEditorProps {
  date: Date;
  initialData?: DayData;
  appointment?: Appointment;
  onSave: (date: Date, symptomLevel: SymptomLevel, medications: Medication[]) => void;
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
  const [appointmentDescription, setAppointmentDescription] = useState(
    appointment?.description ?? "",
  );

  useEffect(() => {
    setSymptomLevel(initialData?.symptomLevel ?? null);
    setMedications(initialData?.medications ?? []);
    setAppointmentDescription(appointment?.description ?? "");
  }, [initialData, appointment, date]);

  const handleMedicationToggle = (medication: Medication) => {
    setMedications((prev) =>
      prev.includes(medication) ? prev.filter((m) => m !== medication) : [...prev, medication],
    );
  };

  const handleSave = () => {
    const trimmedDescription = appointmentDescription.trim();

    onSave(date, symptomLevel, medications);

    if (trimmedDescription) {
      onUpsertAppointment(date, trimmedDescription);
    }
  };

  const hasAppointment = Boolean(appointment);
  const isPendingAppointment = appointment?.status === "pendiente";

  return (
    <div className="space-y-5 py-2">
      <div className="space-y-3">
        <h3 className="font-serif text-lg tracking-tight">Nivel de síntomas</h3>
        <RadioGroup
          value={symptomLevel || ""}
          onValueChange={(value) => setSymptomLevel(value as SymptomLevel)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="green"
              id="green"
              className="border-green-300 dark:border-emerald-500/60"
            />
            <Label htmlFor="green" className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full border border-green-300 bg-green-200 dark:border-emerald-500/60 dark:bg-emerald-900/30" />
              Verde (Sin síntomas)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="yellow"
              id="yellow"
              className="border-yellow-300 dark:border-yellow-500/70"
            />
            <Label htmlFor="yellow" className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full border border-yellow-300 bg-yellow-200 dark:border-yellow-500/70 dark:bg-yellow-900/35" />
              Amarillo (Síntomas leves)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="orange"
              id="orange"
              className="border-orange-300 dark:border-orange-500/80"
            />
            <Label htmlFor="orange" className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full border border-orange-300 bg-orange-200 dark:border-orange-500/80 dark:bg-orange-950/45" />
              Naranja (Síntomas moderados)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="red"
              id="red"
              className="border-red-300 dark:border-rose-500/60"
            />
            <Label htmlFor="red" className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full border border-red-300 bg-red-200 dark:border-rose-500/60 dark:bg-rose-900/25" />
              Rojo (Síntomas graves)
            </Label>
          </div>
          {/* Botón para eliminar el color (dejar por defecto) */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setSymptomLevel(null)} type="button" size="sm">
              Quitar color
            </Button>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-lg tracking-tight">Medicamentos tomados</h3>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bilaxten"
              checked={medications.includes("Bilaxten")}
              onCheckedChange={() => handleMedicationToggle("Bilaxten")}
            />
            <Label htmlFor="bilaxten">Bilaxten</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="relvar"
              checked={medications.includes("Relvar")}
              onCheckedChange={() => handleMedicationToggle("Relvar")}
            />
            <Label htmlFor="relvar">Relvar</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ventolin"
              checked={medications.includes("Ventolin")}
              onCheckedChange={() => handleMedicationToggle("Ventolin")}
            />
            <Label htmlFor="ventolin">Ventolin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dymista"
              checked={medications.includes("Dymista")}
              onCheckedChange={() => handleMedicationToggle("Dymista")}
            />
            <Label htmlFor="dymista">Dymista</Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg tracking-tight">Cita del día</h3>
          {hasAppointment && (
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                isPendingAppointment
                  ? "border-sky-300/70 bg-sky-100 dark:border-sky-500/40 dark:bg-sky-900/25"
                  : "border-emerald-300/70 bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-900/25"
              }`}
            >
              {isPendingAppointment ? "Pendiente" : "Completada"}
            </span>
          )}
        </div>
        <textarea
          name="appointmentDescription"
          className="border-border/80 bg-muted/30 focus:border-primary/40 focus:ring-primary/20 min-h-24 rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
          placeholder="Ej: Revisión con alergólogo a las 10:00"
          value={appointmentDescription}
          onChange={(e) => setAppointmentDescription(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          Mantén una única cita por día. Si guardas una descripción, se crea o actualiza.
        </p>
        {hasAppointment && (
          <div className="flex flex-wrap gap-2">
            {isPendingAppointment && (
              <Button type="button" variant="outline" onClick={() => onCompleteAppointment(date)}>
                Marcar como completada
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onRemoveAppointment(date);
                setAppointmentDescription("");
              }}
            >
              Eliminar cita del día
            </Button>
          </div>
        )}
      </div>

      <div className="border-border/50 flex justify-end border-t pt-4">
        <Button onClick={handleSave} className="px-6 shadow-sm">
          Guardar
        </Button>
      </div>
    </div>
  );
}
