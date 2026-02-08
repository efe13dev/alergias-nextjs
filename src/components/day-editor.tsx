"use client";

import { useState } from "react";

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
  onSave: (date: Date, symptomLevel: SymptomLevel, medications: Medication[]) => void;
}

export default function DayEditor({ date, initialData, onSave }: DayEditorProps) {
  const [symptomLevel, setSymptomLevel] = useState<SymptomLevel>(initialData?.symptomLevel || null);
  const [medications, setMedications] = useState<Medication[]>(initialData?.medications || []);

  const handleMedicationToggle = (medication: Medication) => {
    setMedications((prev) =>
      prev.includes(medication) ? prev.filter((m) => m !== medication) : [...prev, medication],
    );
  };

  const handleSave = () => {
    onSave(date, symptomLevel, medications);
  };

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
              className="border-yellow-300 dark:border-amber-500/60"
            />
            <Label htmlFor="yellow" className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full border border-yellow-300 bg-yellow-200 dark:border-amber-500/60 dark:bg-amber-900/25" />
              Amarillo (Síntomas leves)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="orange"
              id="orange"
              className="border-orange-300 dark:border-orange-500/70"
            />
            <Label htmlFor="orange" className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full border border-orange-300 bg-orange-200 dark:border-orange-500/60 dark:bg-orange-900/25" />
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

      <div className="flex justify-end border-t border-border/50 pt-4">
        <Button onClick={handleSave} className="px-6 shadow-sm">Guardar</Button>
      </div>
    </div>
  );
}
