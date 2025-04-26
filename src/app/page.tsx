'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DayEditor from '../components/day-editor';
import html2canvaspro from 'html2canvas-pro';

// Tipos para nuestros datos
type SymptomLevel = 'green' | 'yellow' | 'orange' | 'red' | null;
type Medication = 'Bilaxten' | 'Relvar' | 'Ventolin' | 'Dymista';
type DayData = {
	date: string; // formato ISO
	symptomLevel: SymptomLevel;
	medications: Medication[];
};

// Extensión de la interfaz Window para evitar el uso de 'any' en window
declare global {
	interface Window {
		html2canvas?: (
			element: HTMLElement,
			options?: Record<string, unknown>,
		) => Promise<HTMLCanvasElement>;
	}
}

export default function Home() {
	// Estado para almacenar los datos de los días
	const [dayData, setDayData] = useState<DayData[]>([]);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date(),
	);
	const [currentMonth, setCurrentMonth] = useState<Date>(
		new Date(new Date().getFullYear(), 3, 1),
	); // Abril (mes 3)
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [initialSetupDone, setInitialSetupDone] = useState(false);

	// Meses que queremos mostrar
	const months = [
		new Date(new Date().getFullYear(), 3, 1), // Abril (mes 3)
		new Date(new Date().getFullYear(), 4, 1), // Mayo (mes 4)
		new Date(new Date().getFullYear(), 5, 1), // Junio (mes 5)
		new Date(new Date().getFullYear(), 6, 1), // Julio (mes 6)
		new Date(new Date().getFullYear(), 7, 1), // Agosto (mes 7)
	];

	// Cargar datos del localStorage al iniciar
	useEffect(() => {
		const savedData = localStorage.getItem('allergyTrackerData');
		if (savedData) {
			setDayData(JSON.parse(savedData));
		}
		setInitialSetupDone(true);
	}, []);

	// Guardar datos en localStorage cuando cambian
	useEffect(() => {
		if (initialSetupDone) {
			localStorage.setItem('allergyTrackerData', JSON.stringify(dayData));
		}
	}, [dayData, initialSetupDone]);

	// Función para actualizar los datos de un día
	const updateDayData = (
		date: Date,
		symptomLevel: SymptomLevel,
		medications: Medication[],
	) => {
		const dateString = date.toISOString();

		setDayData((prevData) => {
			// Buscar si ya existe un registro para este día
			const existingIndex = prevData.findIndex(
				(item) => new Date(item.date).toDateString() === date.toDateString(),
			);

			if (existingIndex >= 0) {
				// Actualizar registro existente
				const newData = [...prevData];
				newData[existingIndex] = {
					date: dateString,
					symptomLevel,
					medications,
				};
				return newData;
			}
			// Crear nuevo registro
			return [
				...prevData,
				{
					date: dateString,
					symptomLevel,
					medications,
				},
			];
		});

		setIsDialogOpen(false);
	};

	// Función para obtener los datos de un día específico
	const getDayData = (date: Date): DayData | undefined => {
		return dayData.find(
			(item) => new Date(item.date).toDateString() === date.toDateString(),
		);
	};

	// Función para obtener el color de un día
	const getDayColor = (date: Date): string => {
		const data = getDayData(date);
		if (!data || !data.symptomLevel) return '';

		switch (data.symptomLevel) {
			case 'green':
				return 'bg-green-200 hover:bg-green-300';
			case 'yellow':
				return 'bg-yellow-200 hover:bg-yellow-300';
			case 'orange':
				return 'bg-orange-200 hover:bg-orange-300';
			case 'red':
				return 'bg-red-200 hover:bg-red-300';
			default:
				return '';
		}
	};

	// Función para obtener el nombre del mes actual
	const getCurrentMonthName = () => {
		return format(currentMonth, 'MMMM yyyy', { locale: es });
	};

	// Función para manejar el clic en un día
	const handleDayClick = (date: Date) => {
		setSelectedDate(date);
		setIsDialogOpen(true);
	};

	// Función para exportar la vista como imagen JPG
	const handleExportJPG = async () => {
		const coloredDays = document.querySelectorAll(
			'button.bg-yellow-200, button.bg-yellow-300, button.bg-orange-200, button.bg-orange-300, button.bg-green-200, button.bg-red-200'
		);
		const originalBackgrounds: string[] = [];
		const originalBorders: string[] = [];
		const originalRadii: string[] = [];

		coloredDays.forEach((el, idx) => {
			originalBackgrounds[idx] = (el as HTMLElement).style.backgroundColor;
			originalBorders[idx] = (el as HTMLElement).style.border;
			originalRadii[idx] = (el as HTMLElement).style.borderRadius;

			if (el.classList.contains('bg-yellow-200')) (el as HTMLElement).style.backgroundColor = '#fef08a';
			if (el.classList.contains('bg-yellow-300')) (el as HTMLElement).style.backgroundColor = '#fde047';
			if (el.classList.contains('bg-orange-200')) (el as HTMLElement).style.backgroundColor = '#fed7aa';
			if (el.classList.contains('bg-orange-300')) (el as HTMLElement).style.backgroundColor = '#fdba74';
			if (el.classList.contains('bg-green-200')) (el as HTMLElement).style.backgroundColor = '#bbf7d0';
			if (el.classList.contains('bg-red-200')) (el as HTMLElement).style.backgroundColor = '#fecaca';

			// Forzar borde y border-radius
			(el as HTMLElement).style.border = '2px solid #e5e7eb';
			(el as HTMLElement).style.borderRadius = '0.5rem';
		});

		const body = document.body;
		if (body) {
			const canvas = await html2canvaspro(body, {
				useCORS: true,
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
				scrollX: 0,
				scrollY: 0,
			});
			const imgData = canvas.toDataURL('image/jpeg');
			const link = document.createElement('a');
			link.href = imgData;
			link.download = 'captura.jpg';
			link.click();
		}

		// Restaurar estilos originales
		coloredDays.forEach((el, idx) => {
			(el as HTMLElement).style.backgroundColor = originalBackgrounds[idx];
			(el as HTMLElement).style.border = originalBorders[idx];
			(el as HTMLElement).style.borderRadius = originalRadii[idx];
		});
	};

	return (
		<main className="container mx-auto py-6 px-4">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-2xl">Seguimiento de Alergia</CardTitle>
					<CardDescription>
						Registra tus síntomas y medicamentos para abril, mayo, junio, julio
						y agosto
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert className="mb-4 flex items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4" />
							<div>
								<AlertTitle>Información</AlertTitle>
								<AlertDescription>
									Selecciona un día en el calendario para registrar tus síntomas
									y medicamentos.
								</AlertDescription>
							</div>
						</div>
						<button
							onClick={handleExportJPG}
							type="button"
							className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow whitespace-nowrap"
						>
							Exportar como JPG
						</button>
					</Alert>

					<div className="flex items-center gap-2 mb-4 flex-wrap">
						<Badge className="bg-green-500">Verde: Sin síntomas</Badge>
						<Badge className="bg-yellow-500">Amarillo: Síntomas leves</Badge>
						<Badge className="bg-orange-500">Naranja: Síntomas moderados</Badge>
						<Badge className="bg-red-500">Rojo: Síntomas graves</Badge>
					</div>

					<div className="flex items-center gap-2 mb-4 flex-wrap">
						<span className="text-xs px-1 bg-blue-100 rounded-sm border border-blue-200">
							B
						</span>
						<span className="text-sm">Bilaxten</span>
						<span className="text-xs px-1 bg-purple-100 rounded-sm border border-purple-200">
							R
						</span>
						<span className="text-sm">Relvar</span>
						<span className="text-xs px-1 bg-teal-100 rounded-sm border border-teal-200">
							V
						</span>
						<span className="text-sm">Ventolin</span>
						<span className="text-xs px-1 bg-pink-100 rounded-sm border border-pink-200">
							D
						</span>
						<span className="text-sm">Dymista</span>
					</div>

					<Tabs defaultValue={format(months[0], 'MMM')} className="w-full">
						<TabsList className="grid grid-cols-5 mb-4">
							{months.map((month, index) => (
								<TabsTrigger
									key={month.toISOString()}
									value={format(month, 'MMM')}
									onClick={() => setCurrentMonth(month)}
								>
									{format(month, 'MMMM', { locale: es })}
								</TabsTrigger>
							))}
						</TabsList>

						{months.map((month, index) => (
							<TabsContent
								key={month.toISOString()}
								value={format(month, 'MMM')}
								className="mt-0"
							>
								<Card className="calendar-export-card">
									<CardHeader>
										<CardTitle className="capitalize">
											{format(month, 'MMMM yyyy', { locale: es })}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Calendar
											mode="single"
											month={month}
											onDayClick={handleDayClick}
											className="rounded-md border w-full min-h-[484px]"
											weekStartsOn={1}
											classNames={{
												month: 'space-y-4',
												table: 'w-full border-collapse',
												head_row: 'flex',
												head_cell:
													'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] p-0 text-center',
												row: 'flex w-full',
												cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
												day: 'h-16 w-16 p-0 font-normal aria-selected:opacity-100',
												day_range_end: 'day-range-end',
												day_selected:
													'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
												day_today: 'bg-accent text-accent-foreground',
												day_outside:
													'day-outside text-muted-foreground opacity-50',
												day_disabled: 'text-muted-foreground opacity-50',
												day_range_middle:
													'aria-selected:bg-accent aria-selected:text-accent-foreground',
												day_hidden: 'invisible',
											}}
											modifiers={{
												booked: (date) =>
													dayData.some(
														(d) =>
															new Date(d.date).toDateString() ===
															date.toDateString(),
													),
											}}
											modifiersClassNames={{
												booked: 'font-bold',
											}}
											components={{
												Day: ({ date, ...props }) => {
													const dayColor = getDayColor(date);
													const dayMeds = getDayData(date)?.medications || [];

													return (
														<button
															onClick={() => handleDayClick(date)}
															onKeyDown={(e) => {
																if (e.key === 'Enter' || e.key === ' ') {
																	handleDayClick(date);
																}
															}}
															className={`relative cursor-pointer rounded-md flex flex-col items-center p-1 font-normal aria-selected:opacity-100 ${dayColor} min-h-[70px] min-w-[70px]`}
															type="button"
														>
															<span className="font-medium mb-1">
																{date.getDate()}
															</span>
															{dayMeds.length > 0 && (
																<div className="flex flex-col gap-1 justify-center items-center">
																	{/* Dividir los medicamentos en dos filas de máximo 2 elementos cada una */}
																	<div className="flex gap-1 justify-center">
																		{dayMeds.slice(0, 2).map((med) => (
																			<span
																				key={med}
																				className={
																					med === 'Bilaxten'
																						? 'text-[10px] px-1 bg-blue-100 rounded-sm'
																						: med === 'Relvar'
																							? 'text-[10px] px-1 bg-purple-100 rounded-sm'
																							: med === 'Ventolin'
																								? 'text-[10px] px-1 bg-teal-100 rounded-sm'
																								: 'text-[10px] px-1 bg-pink-100 rounded-sm'
																				}
																				title={med}
																			>
																				{med[0]}
																			</span>
																		))}
																	</div>
																	{dayMeds.length > 2 && (
																		<div className="flex gap-1 justify-center mt-1">
																			{dayMeds.slice(2, 4).map((med) => (
																				<span
																					key={med}
																					className={
																						med === 'Bilaxten'
																							? 'text-[10px] px-1 bg-blue-100 rounded-sm'
																							: med === 'Relvar'
																								? 'text-[10px] px-1 bg-purple-100 rounded-sm'
																								: med === 'Ventolin'
																									? 'text-[10px] px-1 bg-teal-100 rounded-sm'
																									: 'text-[10px] px-1 bg-pink-100 rounded-sm'
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
												},
											}}
										/>
									</CardContent>
								</Card>
							</TabsContent>
						))}
					</Tabs>
				</CardContent>
			</Card>

			{selectedDate && (
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>
								{selectedDate
									? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })
									: 'Selecciona un día'}
							</DialogTitle>
						</DialogHeader>
						<DayEditor
							date={selectedDate}
							initialData={getDayData(selectedDate)}
							onSave={updateDayData}
						/>
					</DialogContent>
				</Dialog>
			)}
		</main>
	);
}
