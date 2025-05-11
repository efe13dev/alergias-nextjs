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
import html2canvaspro from 'html2canvas-pro';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DayEditor from '../components/day-editor';
import { getDayColorBySymptomLevel } from '@/lib/utils';
import { CalendarDayButton } from '../components/CalendarDayButton';
import AppointmentManager from '../components/AppointmentManager';

// Tipos para nuestros datos
import type { SymptomLevel, Medication, DayData, Appointment } from './types';

export default function Home() {
	// Estado para almacenar los datos de los días
	const [dayData, setDayData] = useState<DayData[]>([]);
	// Estado para almacenar las citas pendientes
	const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
		[],
	);
	// Estado para mostrar solo las citas pendientes
	const [showPendingAppointments, setShowPendingAppointments] =
		useState<boolean>(false);
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

	// Calcular el valor por defecto del mes actual
	const currentMonthFormatted = format(new Date(), 'MMM');
	const defaultMonth = months.find(
		(month) => format(month, 'MMM') === currentMonthFormatted,
	);
	const defaultTabValue = defaultMonth
		? format(defaultMonth, 'MMM')
		: format(months[0], 'MMM');

	// Estado para la pestaña seleccionada
	const [selectedTab, setSelectedTab] = useState<string>(defaultTabValue);

	// Cargar datos del localStorage al iniciar
	useEffect(() => {
		const savedData = localStorage.getItem('allergyTrackerData');
		if (savedData) {
			setDayData(JSON.parse(savedData));
		}
		const savedAppointments = localStorage.getItem('pendingAppointments');
		if (savedAppointments) {
			setPendingAppointments(JSON.parse(savedAppointments));
		}
		setInitialSetupDone(true);
	}, []);

	// Guardar datos en localStorage cuando cambian
	useEffect(() => {
		if (initialSetupDone) {
			localStorage.setItem('allergyTrackerData', JSON.stringify(dayData));
		}
	}, [dayData, initialSetupDone]);

	// Guardar citas pendientes en localStorage cuando cambian
	useEffect(() => {
		if (initialSetupDone) {
			localStorage.setItem(
				'pendingAppointments',
				JSON.stringify(pendingAppointments),
			);
		}
	}, [pendingAppointments, initialSetupDone]);

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
		return getDayColorBySymptomLevel(data?.symptomLevel);
	};

	// Función para manejar el clic en un día
	const handleDayClick = (date: Date) => {
		setSelectedDate(date);
		setIsDialogOpen(true);
	};

	// Función para exportar la vista como imagen JPG
	const handleExportJPG = async () => {
		const coloredDays = document.querySelectorAll(
			'button.bg-yellow-200, button.bg-yellow-300, button.bg-orange-200, button.bg-orange-300, button.bg-green-200, button.bg-red-200',
		);
		const originalBackgrounds: string[] = [];
		const originalBorders: string[] = [];
		const originalRadii: string[] = [];

		coloredDays.forEach((el, idx) => {
			originalBackgrounds[idx] = (el as HTMLElement).style.backgroundColor;
			originalBorders[idx] = (el as HTMLElement).style.border;
			originalRadii[idx] = (el as HTMLElement).style.borderRadius;

			if (el.classList.contains('bg-yellow-200'))
				(el as HTMLElement).style.backgroundColor = '#fef08a';
			if (el.classList.contains('bg-orange-200'))
				(el as HTMLElement).style.backgroundColor = '#fed7aa';
			if (el.classList.contains('bg-green-200'))
				(el as HTMLElement).style.backgroundColor = '#bbf7d0';
			if (el.classList.contains('bg-red-200'))
				(el as HTMLElement).style.backgroundColor = '#fecaca';

			// Forzar borde y border-radius
			(el as HTMLElement).style.border = '1px solid #e5e7eb';
			(el as HTMLElement).style.borderRadius = '0.5rem';
		});

		const body = document.body;
		if (body) {
			// Obtener el mes seleccionado desde selectedTab
			const selectedMonthObj = months.find(
				(month) => format(month, 'MMM') === selectedTab,
			);
			const mesActual = selectedMonthObj
				? format(selectedMonthObj, 'MMMM', { locale: es })
				: format(months[0], 'MMMM', { locale: es });
			const nombreArchivo = `alergia-captura-${mesActual}.jpg`;

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
			link.download = nombreArchivo;
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
						<Badge className="bg-blue-500">Azul: Cita pendiente</Badge>
					</div>

					<div className="flex items-center gap-2 mb-4 flex-wrap w-full">
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
						<button
							onClick={() => setShowPendingAppointments(true)}
							type="button"
							className="ml-auto mr-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4  rounded shadow whitespace-nowrap flex items-center gap-2 text-sm"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Añadir cita pendiente"
							>
								<title>Añadir cita pendiente</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Citas pendientes
						</button>
					</div>

					<Tabs
						defaultValue={defaultTabValue}
						value={selectedTab}
						onValueChange={setSelectedTab}
						className="w-full"
					>
						<TabsList className="grid grid-cols-5 mb-4">
							{months.map((month) => (
								<TabsTrigger
									key={month.toISOString()}
									value={format(month, 'MMM')}
									onClick={() => setCurrentMonth(month)}
								>
									{format(month, 'MMMM', { locale: es })}
								</TabsTrigger>
							))}
						</TabsList>

						{months.map((month) => (
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
												appointment: (date) =>
													pendingAppointments.some(
														(app) =>
															app.status === 'pendiente' &&
															new Date(app.date).toDateString() ===
																date.toDateString(),
													),
											}}
											modifiersClassNames={{
												booked: 'font-bold',
												appointment: 'bg-blue-400 text-white',
											}}
											components={{
												Day: ({ date, ...props }) => {
													const appointment = pendingAppointments.find(
														(app) =>
															app.status === 'pendiente' &&
															new Date(app.date).toDateString() ===
																date.toDateString(),
													);
													return (
														<CalendarDayButton
															date={date}
															dayData={getDayData(date)}
															onClick={handleDayClick}
															appointment={appointment}
														/>
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

			{/* Modal de gestión de citas */}
			<Dialog
				open={showPendingAppointments}
				onOpenChange={setShowPendingAppointments}
			>
				<DialogContent className="sm:max-w-lg w-full">
					<DialogHeader>
						<DialogTitle>Gestión de citas pendientes</DialogTitle>
					</DialogHeader>
					<AppointmentManager
						appointments={pendingAppointments}
						setAppointments={setPendingAppointments}
					/>
				</DialogContent>
			</Dialog>
		</main>
	);
}
