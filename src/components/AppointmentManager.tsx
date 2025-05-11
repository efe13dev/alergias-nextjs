import type React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import type { Appointment } from '@/app/types';

interface Props {
	appointments: Appointment[];
	setAppointments: (apps: Appointment[]) => void;
}

const emptyAppointment: Appointment = {
	id: '',
	date: '',
	description: '',
	status: 'pendiente',
};

export const AppointmentManager: React.FC<Props> = ({
	appointments,
	setAppointments,
}) => {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [form, setForm] = useState<Appointment>(emptyAppointment);

	// Manejar cambios en el formulario
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	// Añadir nueva cita
	// Al guardar una nueva cita, asigna un id único con uuidv4
	const handleAdd = () => {
		if (!form.date || !form.description) return;
		const newAppointment: Appointment = {
			...form,
			id: uuidv4(),
			status: 'pendiente',
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
		updated[idx].status = 'completada';
		setAppointments(updated);
	};

	return (
		<div className="space-y-4">
			<h3 className="font-bold text-lg mb-2">Citas pendientes</h3>
			<ul className="space-y-2 max-h-64 overflow-y-auto">
				{appointments.length === 0 && (
					<li className="text-gray-500">No hay citas pendientes.</li>
				)}
				{appointments.map((app, idx) => (
					<li
						key={app.id}
						className="border rounded p-3 flex flex-col gap-1 bg-blue-50 relative"
					>
						<div className="flex justify-between items-center">
							<span className="font-semibold text-blue-900">
								{new Date(app.date).toLocaleDateString()} - {app.description}
							</span>
							<div className="flex gap-1">
								{app.status === 'pendiente' && (
									<>
										<button
											type="button"
											className="text-xs px-2 py-1 bg-green-100 rounded hover:bg-green-200"
											onClick={() => handleComplete(idx)}
											title="Marcar como completada"
										>
											✔
										</button>
										<button
											type="button"
											className="text-xs px-2 py-1 bg-yellow-100 rounded hover:bg-yellow-200"
											onClick={() => handleEdit(idx)}
											title="Editar"
										>
											✏️
										</button>
									</>
								)}
								<button
									type="button"
									className="text-xs px-2 py-1 bg-red-100 rounded hover:bg-red-200"
									onClick={() => handleDelete(idx)}
									title="Eliminar"
								>
									🗑️
								</button>
							</div>
						</div>
						<span className="text-xs text-gray-600">Estado: {app.status}</span>
					</li>
				))}
			</ul>

			<div className="border-t pt-4 mt-4">
				<h4 className="font-semibold mb-2">
					{editingIndex !== null ? 'Editar cita' : 'Nueva cita'}
				</h4>
				<div className="flex flex-col gap-2">
					<input
						type="date"
						name="date"
						className="border rounded px-2 py-1"
						value={form.date}
						onChange={handleChange}
					/>
					<textarea
						name="description"
						className="border rounded px-2 py-1"
						placeholder="Descripción de la cita"
						value={form.description}
						onChange={handleChange}
					/>
					<div className="flex gap-2">
						{editingIndex !== null ? (
							<>
								<button
									type="button"
									className="bg-blue-600 text-white px-4 py-1 rounded"
									onClick={handleSave}
								>
									Guardar
								</button>
								<button
									type="button"
									className="bg-gray-300 px-4 py-1 rounded"
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
								className="bg-blue-600 text-white px-4 py-1 rounded"
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
