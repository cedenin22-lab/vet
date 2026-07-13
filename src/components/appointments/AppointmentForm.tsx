import { useState } from 'react';
import { X } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { localDateString } from '../../context/AppContext';

interface Props {
  initial?: Appointment;
  defaultOwnerId?: string;
  defaultPetId?: string;
  onSave: (a: Appointment) => void;
  onClose: () => void;
}

export default function AppointmentForm({ initial, defaultOwnerId, defaultPetId, onSave, onClose }: Props) {
  const { owners, pets } = useApp();
  const [form, setForm] = useState<Appointment>(
    initial ?? {
      id: crypto.randomUUID(),
      ownerId: defaultOwnerId ?? '',
      petId: defaultPetId ?? '',
      date: localDateString(),
      time: '09:00',
      reason: '',
      status: 'Pendiente',
      notes: '',
      createdAt: new Date().toISOString(),
    }
  );

  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const selectedOwnerPets = pets.filter(p => p.ownerId === form.ownerId);

  function handleOwnerChange(ownerId: string) {
    set('ownerId', ownerId);
    const ownerPets = pets.filter(p => p.ownerId === ownerId);
    set('petId', ownerPets[0]?.id ?? '');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ownerId || !form.petId || !form.date || !form.time) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-slate-800 font-semibold">
            {initial ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Owner */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Cliente *</label>
            <select
              value={form.ownerId}
              onChange={e => handleOwnerChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar cliente</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* Pet */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Mascota *</label>
            <select
              value={form.petId}
              onChange={e => set('petId', e.target.value)}
              required
              disabled={!form.ownerId}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">Seleccionar mascota</option>
              {selectedOwnerPets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Hora *</label>
              <input
                type="time"
                value={form.time}
                onChange={e => set('time', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Motivo de la visita *</label>
            <input
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              required
              placeholder="Ej. Vacunación, Consulta general, Control..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Estado</label>
            <div className="flex gap-2">
              {(['Pendiente', 'Completada', 'Cancelada'] as AppointmentStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.status === s
                      ? s === 'Pendiente'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : s === 'Completada'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-red-500 border-red-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Notas adicionales</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Observaciones, recordatorios..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              {initial ? 'Guardar cambios' : 'Programar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
