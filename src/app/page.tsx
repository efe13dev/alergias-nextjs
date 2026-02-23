"use client";

import type { Appointment, DayData, Medication, SymptomLevel } from "./types";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import html2canvaspro from "html2canvas-pro";
import { useEffect, useState } from "react";

import AppointmentManager from "../components/AppointmentManager";
import { CalendarDayButton } from "../components/CalendarDayButton";
import DayEditor from "../components/day-editor";

import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos para nuestros datos

export default function Home() {
  // Estado para almacenar los datos de los días
  const [dayData, setDayData] = useState<DayData[]>([]);
  // Estado para almacenar las citas pendientes
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  // Estado para mostrar solo las citas pendientes
  const [showPendingAppointments, setShowPendingAppointments] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialSetupDone, setInitialSetupDone] = useState(false);

  const getMonthKey = (date: Date) => format(date, "yyyy-MM");

  // Meses que queremos mostrar
  const trackingStartYear = 2025;
  const months = [
    new Date(trackingStartYear, 3, 1), // Abril (mes 3)
    new Date(trackingStartYear, 4, 1), // Mayo (mes 4)
    new Date(trackingStartYear, 5, 1), // Junio (mes 5)
    new Date(trackingStartYear, 6, 1), // Julio (mes 6)
    new Date(trackingStartYear, 7, 1), // Agosto (mes 7)
    new Date(trackingStartYear, 8, 1), // Septiembre (mes 8)
    new Date(trackingStartYear, 9, 1), // Octubre (mes 9)
    new Date(trackingStartYear, 10, 1), // Noviembre (mes 10)
    new Date(trackingStartYear, 11, 1), // Diciembre (mes 11)
    new Date(trackingStartYear + 1, 0, 1), // Enero (mes 0 del siguiente año)
    new Date(trackingStartYear + 1, 1, 1), // Febrero (mes 1 del siguiente año)
    new Date(trackingStartYear + 1, 2, 1), // Marzo (mes 2 del siguiente año)
    new Date(trackingStartYear + 1, 3, 1), // Abril (mes 3 del siguiente año)
    new Date(trackingStartYear + 1, 4, 1), // Mayo (mes 4 del siguiente año)
    new Date(trackingStartYear + 1, 5, 1), // Junio (mes 5 del siguiente año)
    new Date(trackingStartYear + 1, 6, 1), // Julio (mes 6 del siguiente año)
    new Date(trackingStartYear + 1, 7, 1), // Agosto (mes 7 del siguiente año)
    new Date(trackingStartYear + 1, 8, 1), // Septiembre (mes 8 del siguiente año)
  ];

  const monthsByYear = months.reduce<Record<number, Date[]>>((acc, month) => {
    const year = month.getFullYear();

    if (!acc[year]) {
      acc[year] = [];
    }

    acc[year].push(month);

    return acc;
  }, {});
  const years = Object.keys(monthsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  // Calcular el valor por defecto del mes actual
  const currentMonthKey = getMonthKey(new Date());
  const defaultMonth = months.find((month) => getMonthKey(month) === currentMonthKey);
  const defaultTabValue = defaultMonth ? getMonthKey(defaultMonth) : getMonthKey(months[0]);
  const defaultYear = defaultMonth ? defaultMonth.getFullYear() : months[0].getFullYear();

  // Estado para la pestaña seleccionada
  const [selectedTab, setSelectedTab] = useState<string>(defaultTabValue);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const selectedYearMonths = monthsByYear[selectedYear] ?? [];

  const handleMonthChange = (value: string) => {
    setSelectedTab(value);
    const month = months.find((item) => getMonthKey(item) === value);

    if (month) {
      setSelectedYear(month.getFullYear());
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);

    const yearMonths = monthsByYear[year] ?? [];

    if (yearMonths.length === 0) return;

    const selectedMonth = months.find((month) => getMonthKey(month) === selectedTab);
    const sameMonthInSelectedYear = selectedMonth
      ? yearMonths.find((month) => month.getMonth() === selectedMonth.getMonth())
      : undefined;

    if (sameMonthInSelectedYear) {
      setSelectedTab(getMonthKey(sameMonthInSelectedYear));

      return;
    }

    const hasSelectedMonthInYear = yearMonths.some((month) => getMonthKey(month) === selectedTab);

    if (!hasSelectedMonthInYear) {
      setSelectedTab(getMonthKey(yearMonths[0]));
    }
  };

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem("allergyTrackerData");

    if (savedData) {
      setDayData(JSON.parse(savedData) as DayData[]);
    }
    const savedAppointments = localStorage.getItem("pendingAppointments");

    if (savedAppointments) {
      setPendingAppointments(JSON.parse(savedAppointments) as Appointment[]);
    }
    setInitialSetupDone(true);
  }, []);

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    if (initialSetupDone) {
      localStorage.setItem("allergyTrackerData", JSON.stringify(dayData));
    }
  }, [dayData, initialSetupDone]);

  // Guardar citas pendientes en localStorage cuando cambian
  useEffect(() => {
    if (initialSetupDone) {
      localStorage.setItem("pendingAppointments", JSON.stringify(pendingAppointments));
    }
  }, [pendingAppointments, initialSetupDone]);

  // Función para actualizar los datos de un día
  const updateDayData = (date: Date, symptomLevel: SymptomLevel, medications: Medication[]) => {
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
    return dayData.find((item) => new Date(item.date).toDateString() === date.toDateString());
  };

  // Función para manejar el clic en un día
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  // Función para exportar la vista como imagen JPG
  const handleExportJPG = async () => {
    const coloredDays = document.querySelectorAll(
      "button.bg-yellow-200, button.bg-yellow-300, button.bg-orange-200, button.bg-orange-300, button.bg-green-200, button.bg-red-200",
    );
    const originalBackgrounds: string[] = [];
    const originalBorders: string[] = [];
    const originalRadii: string[] = [];

    coloredDays.forEach((el, idx) => {
      originalBackgrounds[idx] = (el as HTMLElement).style.backgroundColor;
      originalBorders[idx] = (el as HTMLElement).style.border;
      originalRadii[idx] = (el as HTMLElement).style.borderRadius;

      if (el.classList.contains("bg-yellow-200"))
        (el as HTMLElement).style.backgroundColor = "#fef08a";
      if (el.classList.contains("bg-orange-200"))
        (el as HTMLElement).style.backgroundColor = "#fed7aa";
      if (el.classList.contains("bg-green-200"))
        (el as HTMLElement).style.backgroundColor = "#bbf7d0";
      if (el.classList.contains("bg-red-200"))
        (el as HTMLElement).style.backgroundColor = "#fecaca";

      // Forzar borde y border-radius
      (el as HTMLElement).style.border = "1px solid #e5e7eb";
      (el as HTMLElement).style.borderRadius = "0.5rem";
    });

    const body = document.body;

    if (body) {
      // Obtener el mes seleccionado desde selectedTab
      const selectedMonthObj = months.find((month) => getMonthKey(month) === selectedTab);
      const mesActual = selectedMonthObj
        ? format(selectedMonthObj, "MMMM", { locale: es })
        : format(months[0], "MMMM", { locale: es });
      const nombreArchivo = `alergia-captura-${mesActual}.jpg`;

      const canvas = await html2canvaspro(body, {
        useCORS: true,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        scrollX: 0,
        scrollY: 0,
      });
      const imgData = canvas.toDataURL("image/jpeg");
      const link = document.createElement("a");

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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="mb-8 overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
        <CardHeader className="border-border/50 from-primary/5 to-accent/5 border-b bg-gradient-to-r via-transparent pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-3xl tracking-tight">
                Seguimiento de Alergia
              </CardTitle>
              <CardDescription className="mt-1.5 text-sm">
                Registra tus síntomas y medicamentos diarios
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJPG}
                type="button"
                className="text-foreground border-primary/20 bg-primary/10 hover:bg-primary/20 dark:border-primary/30 dark:bg-primary/15 dark:hover:bg-primary/25 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                  />
                </svg>
                Exportar JPG
              </button>
              <ThemeToggle />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border-border/60 bg-muted/30 rounded-xl border p-3">
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Nivel de síntomas
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className="text-foreground border border-emerald-300/80 bg-emerald-100 text-xs font-medium dark:border-emerald-500/40 dark:bg-emerald-900/25">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-400"></span>
                  Sin síntomas
                </Badge>
                <Badge className="text-foreground border border-yellow-300/80 bg-yellow-100 text-xs font-medium dark:border-yellow-500/60 dark:bg-yellow-900/35">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-400 dark:bg-yellow-300"></span>
                  Leves
                </Badge>
                <Badge className="text-foreground border border-orange-300/80 bg-orange-100 text-xs font-medium dark:border-orange-500/70 dark:bg-orange-950/45">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-orange-400"></span>
                  Moderados
                </Badge>
                <Badge className="text-foreground border border-red-300/80 bg-red-100 text-xs font-medium dark:border-rose-500/40 dark:bg-rose-900/20">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-400 dark:bg-rose-400"></span>
                  Graves
                </Badge>
                <Badge className="text-foreground border border-sky-300/80 bg-sky-100 text-xs font-medium dark:border-sky-500/40 dark:bg-sky-900/20">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400"></span>
                  Cita
                </Badge>
              </div>
            </div>
            <div className="border-border/60 bg-muted/30 rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  Medicamentos
                </p>
                <button
                  onClick={() => setShowPendingAppointments(true)}
                  type="button"
                  className="text-foreground -mt-1 inline-flex items-center gap-1.5 rounded-lg border border-sky-300/60 bg-sky-100/80 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-sky-200/80 dark:border-sky-500/30 dark:bg-sky-900/20 dark:hover:bg-sky-900/35"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Citas
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground inline-flex items-center gap-1 rounded-md border border-sky-300/70 bg-sky-100 px-1.5 py-0.5 text-xs font-medium dark:border-sky-500/40 dark:bg-sky-900/25">
                  <span className="font-bold">B</span> Bilaxten
                </span>
                <span className="text-foreground inline-flex items-center gap-1 rounded-md border border-violet-300/70 bg-violet-100 px-1.5 py-0.5 text-xs font-medium dark:border-violet-500/40 dark:bg-violet-900/25">
                  <span className="font-bold">R</span> Relvar
                </span>
                <span className="text-foreground inline-flex items-center gap-1 rounded-md border border-teal-300/70 bg-teal-100 px-1.5 py-0.5 text-xs font-medium dark:border-teal-500/40 dark:bg-teal-900/25">
                  <span className="font-bold">V</span> Ventolin
                </span>
                <span className="text-foreground inline-flex items-center gap-1 rounded-md border border-rose-300/70 bg-rose-100 px-1.5 py-0.5 text-xs font-medium dark:border-rose-500/40 dark:bg-rose-900/25">
                  <span className="font-bold">D</span> Dymista
                </span>
              </div>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={handleMonthChange} className="w-full">
            <div className="border-border/60 bg-muted/40 mb-3 inline-flex flex-wrap gap-1 rounded-xl border p-1">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    selectedYear === year
                      ? "border-primary/40 bg-primary text-primary-foreground shadow-primary/20 shadow-md"
                      : "bg-background/80 text-muted-foreground hover:border-border/70 hover:bg-background hover:text-foreground border-transparent"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <TabsList className="border-border/60 bg-background/70 mb-5 flex h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-xl border p-2">
              {selectedYearMonths.map((month) => (
                <TabsTrigger
                  key={month.toISOString()}
                  value={getMonthKey(month)}
                  className="h-9 flex-none px-3 text-xs sm:text-sm"
                >
                  {format(month, "MMMM", { locale: es })}
                </TabsTrigger>
              ))}
            </TabsList>

            {months.map((month) => (
              <TabsContent key={month.toISOString()} value={getMonthKey(month)} className="mt-0">
                <Card className="calendar-export-card border-0 shadow-md shadow-black/5 dark:shadow-black/15">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-xl tracking-tight capitalize">
                      {format(month, "MMMM yyyy", { locale: es })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      month={month}
                      onDayClick={handleDayClick}
                      className="min-h-[484px] w-full rounded-md border"
                      weekStartsOn={1}
                      classNames={{
                        month: "space-y-4",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell:
                          "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] p-0 text-center",
                        row: "flex w-full",
                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                        day: "h-16 w-16 p-0 font-normal aria-selected:opacity-100",
                        day_range_end: "day-range-end",
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "day-outside text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle:
                          "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                      modifiers={{
                        booked: (date) =>
                          dayData.some(
                            (d) => new Date(d.date).toDateString() === date.toDateString(),
                          ),
                        appointment: (date) =>
                          pendingAppointments.some(
                            (app) =>
                              app.status === "pendiente" &&
                              new Date(app.date).toDateString() === date.toDateString(),
                          ),
                      }}
                      modifiersClassNames={{
                        booked: "font-bold",
                        appointment:
                          "text-foreground border border-sky-300 bg-sky-200 dark:border-sky-500/60 dark:bg-sky-900/25",
                      }}
                      components={{
                        Day: ({ date }) => {
                          const appointment = pendingAppointments.find(
                            (app) =>
                              app.status === "pendiente" &&
                              new Date(app.date).toDateString() === date.toDateString(),
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
              <DialogTitle className="font-serif text-xl tracking-tight">
                {selectedDate
                  ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })
                  : "Selecciona un día"}
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
      <Dialog open={showPendingAppointments} onOpenChange={setShowPendingAppointments}>
        <DialogContent className="w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-tight">
              Gestión de citas pendientes
            </DialogTitle>
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
