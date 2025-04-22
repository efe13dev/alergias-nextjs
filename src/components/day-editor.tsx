"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
	onSave: (
		date: Date,
		symptomLevel: SymptomLevel,
		medications: Medication[],
	) => void;
}

export default function DayEditor({
	date,
	initialData,
	onSave,
}: DayEditorProps) {
	const [symptomLevel, setSymptomLevel] = useState<SymptomLevel>(
		initialData?.symptomLevel || null,
	);
	const [medications, setMedications] = useState<Medication[]>(
		initialData?.medications || [],
	);

	const handleMedicationToggle = (medication: Medication) => {
		setMedications((prev) =>
			prev.includes(medication)
				? prev.filter((m) => m !== medication)
				: [...prev, medication],
		);
	};

	const handleSave = () => {
		onSave(date, symptomLevel, medications);
	};

	return (
		<div className="space-y-4 py-2">
			<div className="space-y-2">
				<h3 className="font-medium">Nivel de síntomas</h3>
				<RadioGroup
					value={symptomLevel || ""}
					onValueChange={(value) => setSymptomLevel(value as SymptomLevel)}
					className="flex flex-col space-y-2"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="green"
							id="green"
							className="border-green-500"
						/>
						<Label htmlFor="green" className="flex items-center">
							<span className="h-4 w-4 mr-2 bg-green-500 rounded-full" />
							Verde (Sin síntomas)
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="yellow"
							id="yellow"
							className="border-yellow-500"
						/>
						<Label htmlFor="yellow" className="flex items-center">
							<span className="h-4 w-4 mr-2 bg-yellow-500 rounded-full" />
							Amarillo (Síntomas leves)
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="orange"
							id="orange"
							className="border-orange-500"
						/>
						<Label htmlFor="orange" className="flex items-center">
							<span className="h-4 w-4 mr-2 bg-orange-500 rounded-full" />
							Naranja (Síntomas moderados)
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="red" id="red" className="border-red-500" />
						<Label htmlFor="red" className="flex items-center">
							<span className="h-4 w-4 mr-2 bg-red-500 rounded-full" />
							Rojo (Síntomas graves)
						</Label>
					</div>
				</RadioGroup>
			</div>

			<div className="space-y-2">
				<h3 className="font-medium">Medicamentos tomados</h3>
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

			<div className="flex justify-end pt-4">
				<Button onClick={handleSave}>Guardar</Button>
			</div>
		</div>
	);
}
