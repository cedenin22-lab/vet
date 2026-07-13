import { useState } from 'react';
import { X } from 'lucide-react';
import type { Owner } from '../../types';

interface Props {
  initial?: Owner;
  onSave: (o: Owner) => void;
  onClose: () => void;
}

function newId() {
  return crypto.randomUUID();
}

export default function OwnerForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<Owner>(
    initial ?? {
      id: newId(),
      name: '',
      phone: '',
      email: '',
      address: '',
      createdAt: new Date().toISOString(),
    }
  );

  const set = (k: keyof Owner, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-slate-800 font-semibold">{initial ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nombre completo *" value={form.name} onChange={v => set('name', v)} required />
          <Field label="Teléfono" value={form.phone} onChange={v => set('phone', v)} type="tel" />
          <Field label="Correo electrónico" value={form.email} onChange={v => set('email', v)} type="email" />
          <Field label="Dirección" value={form.address} onChange={v => set('address', v)} />
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
              {initial ? 'Guardar cambios' : 'Registrar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-slate-600 text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
  );
}
