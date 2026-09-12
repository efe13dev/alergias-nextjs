import type { DayData, Medication, SymptomLevel } from "@/app/types";
import { useTheme } from "@/components/theme-provider";

type LevelValue = NonNullable<SymptomLevel>;

const LEVEL_ORDER: LevelValue[] = ["green", "yellow", "orange"];

const LEVEL_META: Record<LevelValue, { label: string; light: string; dark: string }> = {
  green: { label: "Bien", light: "#34d399", dark: "#34d399" },
  yellow: { label: "Regular", light: "#f59e0b", dark: "#facc15" },
  orange: { label: "Mal", light: "#ef4444", dark: "#ef4444" },
};

// Colores de la insignia con la inicial, a juego con los badges de los días
// del calendario (B/R/V/D), para que el panel sirva de clave en la exportación.
const MED_BADGE: Record<
  Medication,
  { light: { bg: string; border: string }; dark: { bg: string; border: string } }
> = {
  Bilaxten: {
    light: { bg: "#bae6fd", border: "#7dd3fc" },
    dark: { bg: "rgba(12, 74, 110, 0.55)", border: "#0ea5e9" },
  },
  Relvar: {
    light: { bg: "#ddd6fe", border: "#c4b5fd" },
    dark: { bg: "rgba(76, 29, 149, 0.55)", border: "#8b5cf6" },
  },
  Ventolin: {
    light: { bg: "#99f6e4", border: "#5eead4" },
    dark: { bg: "rgba(19, 78, 74, 0.55)", border: "#14b8a6" },
  },
  Dymista: {
    light: { bg: "#fecdd3", border: "#fda4af" },
    dark: { bg: "rgba(136, 19, 55, 0.5)", border: "#f43f5e" },
  },
};

const MEDICINES = Object.keys(MED_BADGE) as Medication[];

// Paleta del panel en hex/rgba a propósito: el card se exporta a JPG con
// html2canvas-pro, que falla resolviendo las variables oklch() de Tailwind.
const LIGHT = {
  panel: "#faf8f2",
  border: "#e9e3d6",
  track: "#eae4d7",
  neutral: "#d6cfc1",
  text: "#3b362e",
  muted: "#8b8477",
  chip: "#fffdf9",
};

const DARK = {
  panel: "#211e1a",
  border: "rgba(255, 255, 255, 0.10)",
  track: "rgba(255, 255, 255, 0.10)",
  neutral: "rgba(255, 255, 255, 0.22)",
  text: "#ece7dd",
  muted: "#9d968a",
  chip: "rgba(255, 255, 255, 0.04)",
};

const RING_SIZE = 118;
const RING_R = 45;
const RING_STROKE = 11;
const CIRC = 2 * Math.PI * RING_R;

// Altura de cada barra de la tira diaria, proporcional a la severidad.
const DAY_BAR_HEIGHT: Record<LevelValue, string> = {
  green: "42%",
  yellow: "72%",
  orange: "100%",
};

type Props = {
  month: Date;
  dayData: DayData[];
};

export function MonthSummary({ month, dayData }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = isDark ? DARK : LIGHT;
  const levelColor = (value: LevelValue) =>
    isDark ? LEVEL_META[value].dark : LEVEL_META[value].light;

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const entries = dayData.filter((item) => {
    const date = new Date(item.date);

    return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
  });

  const levelCounts: Record<LevelValue, number> = { green: 0, yellow: 0, orange: 0 };
  const medCounts: Partial<Record<Medication, number>> = {};
  const levelByDay = new Map<number, LevelValue>();

  for (const entry of entries) {
    if (entry.symptomLevel) {
      levelCounts[entry.symptomLevel] += 1;
      levelByDay.set(new Date(entry.date).getDate(), entry.symptomLevel);
    }
    for (const med of entry.medications) {
      medCounts[med] = (medCounts[med] ?? 0) + 1;
    }
  }

  const registered = entries.length;
  const hasData = registered > 0;
  const medsUsed = MEDICINES.filter((med) => medCounts[med]);

  // Segmentos del anillo: cada nivel registrado y, si queda hueco, los días
  // sin nivel de síntoma.
  let cursor = 0;
  const arcs = LEVEL_ORDER.flatMap((value) => {
    const count = levelCounts[value];

    if (!count) return [];

    const length = (count / registered) * CIRC;
    const arc = { value, length, offset: cursor };
    cursor += length;

    return [arc];
  });
  const neutralLength = CIRC - cursor;

  return (
    <section
      aria-label="Resumen del mes"
      className="mt-4 flex flex-col gap-4 rounded-xl border p-4 lg:mt-0 lg:flex-1"
      style={{ backgroundColor: t.panel, borderColor: t.border }}
    >
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="font-serif text-base tracking-tight" style={{ color: t.text }}>
          Resumen del mes
        </h3>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: t.muted }}>
          {registered}/{daysInMonth} días
        </span>
      </header>

      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            role="img"
            aria-label={`${registered} de ${daysInMonth} días registrados`}
          >
            <g transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                fill="none"
                stroke={t.track}
                strokeWidth={RING_STROKE}
              />
              {arcs.map((arc) => (
                <circle
                  key={arc.value}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  fill="none"
                  stroke={levelColor(arc.value)}
                  strokeWidth={RING_STROKE}
                  strokeDasharray={`${arc.length} ${CIRC - arc.length}`}
                  strokeDashoffset={-arc.offset}
                />
              ))}
              {hasData && neutralLength > 0.5 && (
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  fill="none"
                  stroke={t.neutral}
                  strokeWidth={RING_STROKE}
                  strokeDasharray={`${neutralLength} ${CIRC - neutralLength}`}
                  strokeDashoffset={-cursor}
                />
              )}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-3xl leading-none" style={{ color: t.text }}>
              {registered}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: t.muted }}>
              días
            </span>
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
          {LEVEL_ORDER.map((value) => {
            const count = levelCounts[value];

            return (
              <li key={value} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: levelColor(value) }}
                />
                <span className="font-medium text-xs" style={{ color: t.text }}>
                  {LEVEL_META[value].label}
                </span>
                <span className="ml-auto text-xs tabular-nums" style={{ color: t.muted }}>
                  {count}
                </span>
                <span
                  className="h-1.5 w-12 overflow-hidden rounded-full"
                  style={{ backgroundColor: t.track }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${hasData ? (count / registered) * 100 : 0}%`,
                      backgroundColor: levelColor(value),
                    }}
                  />
                </span>
              </li>
            );
          })}
          {!hasData && (
            <li className="text-xs" style={{ color: t.muted }}>
              Sin datos este mes
            </li>
          )}
        </ul>
      </div>

      <div className="border-t pt-3" style={{ borderColor: t.border }}>
        <span
          className="font-semibold text-[10px] uppercase tracking-widest"
          style={{ color: t.muted }}
        >
          Medicamentos
        </span>
        {medsUsed.length > 0 ? (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {medsUsed.map((med) => {
              const badge = isDark ? MED_BADGE[med].dark : MED_BADGE[med].light;

              return (
                <div
                  key={med}
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                  style={{ borderColor: t.border, backgroundColor: t.chip }}
                >
                  <span
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border font-bold text-[10px]"
                    style={{ backgroundColor: badge.bg, borderColor: badge.border, color: t.text }}
                  >
                    {med[0]}
                  </span>
                  <span className="truncate font-medium text-xs" style={{ color: t.text }}>
                    {med}
                  </span>
                  <span className="ml-auto text-[11px] tabular-nums" style={{ color: t.muted }}>
                    ×{medCounts[med]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-xs" style={{ color: t.muted }}>
            Sin medicación registrada
          </p>
        )}
      </div>

      <div className="mt-auto border-t pt-3" style={{ borderColor: t.border }}>
        <span
          className="font-semibold text-[10px] uppercase tracking-widest"
          style={{ color: t.muted }}
        >
          Día a día
        </span>
        <div className="mt-2 flex h-8 items-end gap-[3px]">
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const level = levelByDay.get(day);

            return (
              <span
                key={day}
                title={level ? `Día ${day}: ${LEVEL_META[level].label}` : `Día ${day}: sin datos`}
                className="flex-1 rounded-[3px]"
                style={{
                  height: level ? DAY_BAR_HEIGHT[level] : "12%",
                  backgroundColor: level ? levelColor(level) : t.track,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
