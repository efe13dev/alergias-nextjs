"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import html2canvaspro from "html2canvas-pro";
import { CalendarDays, Download } from "lucide-react";
import { useState } from "react";
import { MonthSummary } from "@/components/MonthSummary";
import ThemeToggle from "@/components/ThemeToggle";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";
import { useDayData } from "@/hooks/useDayData";
import AppointmentManager from "../components/AppointmentManager";
import { CalendarDayButton } from "../components/CalendarDayButton";
import DayEditor from "../components/day-editor";

export default function Home() {
  const { dayData, getDayData, updateDayData } = useDayData();
  const {
    appointments: pendingAppointments,
    setAppointments: setPendingAppointments,
    getAppointmentByDate,
    upsertAppointment: upsertAppointmentForDate,
    removeAppointment: removeAppointmentForDate,
    completeAppointment: completeAppointmentForDate,
  } = useAppointments();

  // Estado para mostrar solo las citas pendientes
  const [showPendingAppointments, setShowPendingAppointments] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getMonthKey = (date: Date) => format(date, "yyyy-MM");

  // Meses a mostrar: desde abril 2025 hasta 3 meses después del mes actual
  const months = Array.from(
    { length: (new Date().getFullYear() - 2025) * 12 + new Date().getMonth() + 1 },
    (_, i) => new Date(2025, 3 + i, 1),
  );

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

    setSelectedTab(getMonthKey(sameMonthInSelectedYear ?? yearMonths[0]));
  };

  const handleSaveDayData: typeof updateDayData = (date, symptomLevel, medications, notes) => {
    updateDayData(date, symptomLevel, medications, notes);
    setIsDialogOpen(false);
  };

  // Función para manejar el clic en un día
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  // Función para exportar la vista como imagen JPG
  const handleExportJPG = async () => {
    const selectedMonthObj = months.find((month) => getMonthKey(month) === selectedTab);
    const mesActual = selectedMonthObj
      ? format(selectedMonthObj, "MMMM", { locale: es })
      : format(months[0], "MMMM", { locale: es });
    const nombreArchivo = `alergia-captura-${mesActual}.jpg`;

    // Capturamos solo el card del mes visible; backgroundColor explícito en hex
    // para evitar que html2canvas-pro falle con colores oklch() de las variables CSS.
    const target =
      (document.querySelector(".calendar-export-card") as HTMLElement) ?? document.body;

    const canvas = await html2canvaspro(target, {
      useCORS: true,
      backgroundColor: "#fffdf8",
      scale: 2,
    });
    const link = document.createElement("a");

    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.download = nombreArchivo;
    link.click();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="mb-6 overflow-hidden border border-border/40 shadow-sm">
        <CardHeader className="border-border/40 border-b px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl tracking-tight">
                Seguimiento de Alergia
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Registra tus síntomas y medicamentos diarios
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJPG}
                type="button"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border/60 bg-transparent px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Exportar
              </button>
              <ThemeToggle />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-4 pb-5">
          {/* Leyenda compacta en una sola fila */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
                Síntomas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { dot: "bg-emerald-400 dark:bg-emerald-500/60", label: "Bien" },
                  { dot: "bg-amber-400 dark:bg-yellow-300/70", label: "Regular" },
                  { dot: "bg-red-500 dark:bg-red-500/80", label: "Mal" },
                ].map(({ dot, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 text-muted-foreground text-xs"
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
                    {label}
                  </span>
                ))}
              </div>
              <span className="hidden h-3 w-px bg-current text-border sm:inline-block" />
              <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
                Medicamentos
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  {
                    letter: "B",
                    color: "border-sky-300/60 bg-sky-50 dark:border-sky-600/40 dark:bg-sky-900/20",
                    label: "Bilaxten",
                  },
                  {
                    letter: "R",
                    color:
                      "border-violet-300/60 bg-violet-50 dark:border-violet-600/40 dark:bg-violet-900/20",
                    label: "Relvar",
                  },
                  {
                    letter: "V",
                    color:
                      "border-teal-300/60 bg-teal-50 dark:border-teal-600/40 dark:bg-teal-900/20",
                    label: "Ventolin",
                  },
                  {
                    letter: "D",
                    color:
                      "border-rose-300/60 bg-rose-50 dark:border-rose-600/40 dark:bg-rose-900/20",
                    label: "Dymista",
                  },
                ].map(({ letter, color, label }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium text-[11px] text-muted-foreground ${color}`}
                  >
                    <span className="font-bold">{letter}</span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
              <span className="hidden h-3 w-px bg-current text-border sm:inline-block" />
              <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
                Citas y notas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { dot: "bg-sky-400/80 dark:bg-sky-500/70", label: "Cita" },
                  { dot: "bg-amber-300/90 dark:bg-amber-400/60", label: "Nota" },
                ].map(({ dot, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 text-muted-foreground text-xs"
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowPendingAppointments(true)}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-transparent px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Citas
            </button>
          </div>

          <Tabs value={selectedTab} onValueChange={handleMonthChange} className="w-full">
            {/* Selector de año */}
            <div className="mb-2.5 flex items-center gap-1.5">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearSelect(year)}
                  className={`rounded-md px-3 py-1 font-semibold text-sm transition-all duration-150 ${
                    selectedYear === year
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Tabs de meses */}
            <TabsList className="mb-5 flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border/40 bg-muted/30 p-1">
              {selectedYearMonths.map((month) => (
                <TabsTrigger
                  key={month.toISOString()}
                  value={getMonthKey(month)}
                  className="h-8 flex-none px-3 text-xs capitalize sm:text-xs"
                >
                  {format(month, "MMM", { locale: es })}
                </TabsTrigger>
              ))}
            </TabsList>

            {months.map((month) => (
              <TabsContent key={month.toISOString()} value={getMonthKey(month)} className="mt-0">
                <Card className="calendar-export-card border border-border/30 shadow-none">
                  <CardHeader className="px-5 pt-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-lg capitalize tracking-tight">
                        {format(month, "MMMM yyyy", { locale: es })}
                      </CardTitle>
                      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                        Seguimiento de Alergia
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                      <div className="lg:flex-none">
                        <Calendar
                          mode="single"
                          month={month}
                          onDayClick={handleDayClick}
                          className="min-h-[484px] w-full rounded-md border lg:w-auto"
                          weekStartsOn={1}
                          classNames={{
                            month: "space-y-3",
                            table: "w-full border-collapse",
                            head_row: "flex",
                            head_cell:
                              "text-muted-foreground/70 rounded-md w-full font-medium text-[0.7rem] p-0 text-center tracking-wide uppercase",
                            row: "flex w-full",
                            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                            day: "h-16 w-16 p-0 font-normal aria-selected:opacity-100",
                            day_range_end: "day-range-end",
                            day_selected:
                              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_outside: "day-outside text-muted-foreground opacity-30",
                            day_disabled: "text-muted-foreground opacity-30",
                            day_range_middle:
                              "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                          }}
                          modifiers={{
                            booked: (date) =>
                              dayData.some(
                                (d) => new Date(d.date).toDateString() === date.toDateString(),
                              ),
                            appointment: (date) => Boolean(getAppointmentByDate(date)),
                          }}
                          modifiersClassNames={{
                            booked: "font-bold",
                            appointment: "",
                          }}
                          components={{
                            Day: ({ date }) => {
                              const appointment = getAppointmentByDate(date);

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
                      </div>

                      <MonthSummary month={month} dayData={dayData} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {selectedDate && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md md:max-h-none md:overflow-visible">
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
              appointment={getAppointmentByDate(selectedDate)}
              onSave={handleSaveDayData}
              onUpsertAppointment={upsertAppointmentForDate}
              onRemoveAppointment={removeAppointmentForDate}
              onCompleteAppointment={completeAppointmentForDate}
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
            appointments={[...pendingAppointments].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )}
            setAppointments={setPendingAppointments}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
