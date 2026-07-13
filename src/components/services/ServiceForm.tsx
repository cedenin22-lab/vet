import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { ServiceRecord, ServiceType, PaymentMethod } from '../../types';
import { VACCINES } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  petId: string;
  ownerId: string;
  initial?: ServiceRecord;
  onSave: (s: ServiceRecord) => void;
  onClose: () => void;
}

const SERVICE_TYPES: ServiceType[] = [
  'Consulta',
  'Vacunación',
  'Desparasitación',
  'Cirugía',
  'Grooming',
  'Tratamiento',
  'Otro',
];

export default function ServiceForm({ petId, ownerId, initial, onSave, onClose }: Props) {
  const { pets, owners } = useApp();
  const [form, setForm] = useState<ServiceRecord>(
    initial ?? {
      id: crypto.randomUUID(),
      petId,
      ownerId,
      date: new Date().toISOString().split('T')[0],
      type: 'Consulta',
      vaccines: [],
      description: '',
      observations: '',
      diagnosis: '',
      treatment: '',
      price: 0,
      paymentMethod: 'Efectivo',
      vet: 'Dr. Cedeño',
      createdAt: new Date().toISOString(),
    }
  );

  const set = <K extends keyof ServiceRecord>(k: K, v: ServiceRecord[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const isVaccination = form.type === 'Vacunación';
  const isTreatment = form.type === 'Tratamiento';

  function toggleVaccine(vaccine: string) {
    setForm(prev => {
      const vaccines = prev.vaccines.includes(vaccine)
        ? prev.vaccines.filter(v => v !== vaccine)
        : [...prev.vaccines, vaccine];
      return { ...prev, vaccines };
    });
  }

  function handleServiceTypeChange(type: ServiceType) {
    setForm(prev => ({
      ...prev,
      type,
      vaccines: type === 'Vacunación' ? prev.vaccines : [],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.price < 0) return;
    if (isVaccination && form.vaccines.length === 0) return;
    onSave(form);
  }

  const pet = pets.find(p => p.id === petId);
  const owner = owners.find(o => o.id === ownerId);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-slate-800 font-semibold">
              {initial ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            {pet && (
              <p className="text-slate-400 text-xs mt-0.5">
                {pet.name} · {owner?.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
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
            {/* Type */}
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Tipo de Servicio *</label>
              <select
                value={form.type}
                onChange={e => handleServiceTypeChange(e.target.value as ServiceType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Vet */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Veterinario</label>
            <input
              value={form.vet}
              onChange={e => set('vet', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Vaccination section - only shown when type is Vacunación */}
          {isVaccination && (
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-teal-700 text-sm font-semibold">Vacunas Aplicadas *</label>
                <span className="text-xs text-teal-500">
                  {form.vaccines.length} seleccionada{form.vaccines.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {VACCINES.map(vaccine => {
                  const isSelected = form.vaccines.includes(vaccine);
                  return (
                    <label
                      key={vaccine}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-white border-white'
                          : 'border-slate-300'
                      }`}>
                        {isSelected && <Check size={12} className="text-teal-600" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleVaccine(vaccine)}
                        className="sr-only"
                      />
                      <span className="truncate">{vaccine}</span>
                    </label>
                  );
                })}
              </div>
              {form.vaccines.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">Selecciona al menos una vacuna.</p>
              )}
            </div>
          )}

          {/* Observations — always shown */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">
              {isVaccination
                ? 'Observaciones adicionales'
                : isTreatment
                  ? 'Detalles del Tratamiento *'
                  : 'Observaciones / Motivo de consulta'}
            </label>
            <textarea
              value={form.observations}
              onChange={e => set('observations', e.target.value)}
              rows={3}
              placeholder={isVaccination ? 'Reacciones, lote de vacuna, información adicional...' : ''}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Extended fields — hidden for Tratamiento and Vacunación */}
          {!isTreatment && !isVaccination && (
            <>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Descripción / Procedimiento</label>
                <input
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Diagnóstico</label>
                <input
                  value={form.diagnosis}
                  onChange={e => set('diagnosis', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Tratamiento indicado</label>
                <textarea
                  value={form.treatment}
                  onChange={e => set('treatment', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Price + Payment */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <p className="text-slate-600 text-sm font-semibold">Información de Pago</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Precio (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => set('price', parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Método de Pago *</label>
                <div className="flex gap-2">
                  {(['Efectivo', 'Yappy'] as PaymentMethod[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('paymentMethod', m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        form.paymentMethod === m
                          ? m === 'Efectivo'
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isVaccination && form.vaccines.length === 0}
              className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initial ? 'Guardar cambios' : 'Registrar servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
