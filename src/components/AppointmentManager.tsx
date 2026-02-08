import type { Appointment } from "@/app/types";
import type React from "react";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  appointments: Appointment[];
  setAppointments: (apps: Appointment[]) => void;
}

const emptyAppointment: Appointment = {
  id: "",
  date: "",
  description: "",
  status: "pendiente",
};

export const AppointmentManager: React.FC<Props> = ({ appointments, setAppointments }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Appointment>(emptyAppointment);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Añadir nueva cita
  // Al guardar una nueva cita, asigna un id único con uuidv4
  const handleAdd = () => {
    if (!form.date || !form.description) return;
    const newAppointment: Appointment = {
      ...form,
      id: uuidv4(),
      status: "pendiente",
    };

    setAppointments([...appointments, newAppointment]);
    setForm(emptyAppointment);
  };

  // Editar cita existente
  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setForm(appointments[idx]);
  };

  // Guardar edición
  const handleSave = () => {
    if (editingIndex === null) return;
    const updated = [...appointments];

    updated[editingIndex] = form;
    setAppointments(updated);
    setEditingIndex(null);
    setForm(emptyAppointment);
  };

  // Eliminar cita
  const handleDelete = (idx: number) => {
    setAppointments(appointments.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setForm(emptyAppointment);
    }
  };

  // Marcar como completada
  const handleComplete = (idx: number) => {
    const updated = [...appointments];

    updated[idx].status = "completada";
    setAppointments(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="mb-3 font-serif text-xl tracking-tight">Citas pendientes</h3>
      <ul className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
        {appointments.length === 0 && (
          <li className="text-muted-foreground">No hay citas pendientes.</li>
        )}
        {appointments.map((app, idx) => (
          <li
            key={app.id}
            className={`text-foreground relative flex flex-col gap-1.5 rounded-xl border border-sky-300/40 bg-sky-50/80 p-3.5 transition-all dark:border-sky-500/20 dark:bg-sky-900/15 ${
              app.status === "completada" ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${app.status === "completada" ? "line-through" : ""}`}>
                {new Date(app.date).toLocaleDateString()} - {app.description}
              </span>
              <div className="flex gap-1">
                {app.status === "pendiente" && (
                  <>
                    <button
                      type="button"
                      className="text-foreground rounded-lg border border-emerald-300/50 bg-emerald-100/80 px-2.5 py-1 text-xs transition-colors hover:bg-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-900/25 dark:hover:bg-emerald-900/40"
                      onClick={() => handleComplete(idx)}
                      title="Marcar como completada"
                    >
                      ✔
                    </button>
                    <button
                      type="button"
                      className="text-foreground rounded-lg border border-amber-300/50 bg-amber-100/80 px-2.5 py-1 text-xs transition-colors hover:bg-amber-200 dark:border-amber-500/30 dark:bg-amber-900/25 dark:hover:bg-amber-900/40"
                      onClick={() => handleEdit(idx)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="text-foreground rounded-lg border border-rose-300/50 bg-rose-100/80 px-2.5 py-1 text-xs transition-colors hover:bg-rose-200 dark:border-rose-500/30 dark:bg-rose-900/25 dark:hover:bg-rose-900/40"
                  onClick={() => handleDelete(idx)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
            <span className="text-muted-foreground text-xs">Estado: {app.status}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border/50 pt-4">
        <h4 className="mb-3 font-serif text-base tracking-tight">
          {editingIndex !== null ? "Editar cita" : "Nueva cita"}
        </h4>
        <div className="flex flex-col gap-2.5">
          <input
            type="date"
            name="date"
            className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={form.date}
            onChange={handleChange}
          />
          <textarea
            name="description"
            className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Descripción de la cita"
            value={form.description}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            {editingIndex !== null ? (
              <>
                <button
                  type="button"
                  className="text-primary-foreground rounded-lg bg-primary px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-primary/90"
                  onClick={handleSave}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="text-foreground rounded-lg border border-border/80 bg-muted/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  onClick={() => {
                    setEditingIndex(null);
                    setForm(emptyAppointment);
                  }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="text-primary-foreground rounded-lg bg-primary px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-primary/90"
                onClick={handleAdd}
              >
                Añadir cita
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManager;
