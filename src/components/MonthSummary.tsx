import type { DayData, Medication, SymptomLevel } from "@/app/types";

const LEVELS: { value: NonNullable<SymptomLevel>; label: string; color: string }[] = [
  { value: "green", label: "bien", color: "#34d399" },
  { value: "yellow", label: "regular", color: "#f59e0b" },
  { value: "orange", label: "mal", color: "#ef4444" },
];

const MED_COLORS: Record<Medication, string> = {
  Bilaxten: "#60a5fa",
  Relvar: "#a78bfa",
  Ventolin: "#2dd4bf",
  Dymista: "#fb7185",
};

type Props = {
  month: Date;
  dayData: DayData[];
};

// Colores inline (hex/rgba) a propósito: el card se exporta a JPG con
// html2canvas-pro, que falla resolviendo las variables oklch() de Tailwind.
export function MonthSummary({ month, dayData }: Props) {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const entries = dayData.filter((item) => {
    const date = new Date(item.date);

    return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
  });

  const levelCounts = { green: 0, yellow: 0, orange: 0 };
  const medCounts: Partial<Record<Medication, number>> = {};

  for (const entry of entries) {
    if (entry.symptomLevel) levelCounts[entry.symptomLevel] += 1;
    for (const med of entry.medications) {
      medCounts[med] = (medCounts[med] ?? 0) + 1;
    }
  }

  const registered = entries.length;
  const medsUsed = (Object.keys(MED_COLORS) as Medication[]).filter((med) => medCounts[med]);

  return (
    <div className="border-border/30 mt-4 border-t pt-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-muted-foreground/70 text-[10px] font-semibold tracking-widest uppercase">
          Resumen
        </span>
        {registered === 0 ? (
          <span className="text-muted-foreground text-[11px]">Sin datos este mes</span>
        ) : (
          <>
            <span
              style={{ backgroundColor: "rgba(0, 0, 0, 0.08)" }}
              className="flex h-2.5 w-36 overflow-hidden rounded-full"
            >
              {LEVELS.map(({ value, color }) =>
                levelCounts[value] > 0 ? (
                  <span
                    key={value}
                    style={{
                      backgroundColor: color,
                      width: `${(levelCounts[value] / daysInMonth) * 100}%`,
                    }}
                  />
                ) : null,
              )}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {LEVELS.filter(({ value }) => levelCounts[value] > 0)
                .map(({ value, label }) => `${levelCounts[value]} ${label}`)
                .join(" · ")}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {registered} de {daysInMonth} días
            </span>
            {medsUsed.length > 0 && (
              <span className="flex gap-1.5">
                {medsUsed.map((med) => (
                  <span
                    key={med}
                    style={{ borderColor: MED_COLORS[med] }}
                    className="text-muted-foreground inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium"
                  >
                    <span className="font-bold">{med[0]}</span>×{medCounts[med]}
                  </span>
                ))}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
