import { useState } from 'react';
import { Calendar, DollarSign, Plus, X, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Service } from '../../types';

// Commission calculation: Exportacion = 0%, Bano y Corte = $5 fixed, others = 20%
export function calculateCommission(service: Service): number {
  const name = service.name.toLowerCase();
  if (name.includes('export')) return 0;
  if (service.commission_type === 'fixed') return service.commission_value;
  return (service.price * service.commission_value) / 100;
}

const BASE_SALARY = 80;

export default function CommissionsView() {
  const { services, appointments, patients, addService, addAppointment } = useApp();
  const [weekStart, setWeekStart] = useState(getMonday(new Date()).toISOString().slice(0, 10));
  const [showAddService, setShowAddService] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);

  const weekStartDate = new Date(weekStart + 'T00:00:00');
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59);

  const weekAppointments = appointments.filter(a => {
    const aDate = new Date(a.date + 'T00:00:00');
    return aDate >= weekStartDate && aDate <= weekEndDate;
  });

  const totalCommissions = weekAppointments.reduce((sum, a) => {
    const svc = a.service;
    if (!svc) return sum;
    return sum + calculateCommission(svc);
  }, 0);

  const totalPay = BASE_SALARY + totalCommissions;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Servicios y Comisiones del Ayudante</h2>
      </div>

      {/* Weekly report */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-teal-600" />
          <h3 className="font-semibold text-slate-700">Reporte de Pago Semanal</h3>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-slate-500">Semana del:</label>
          <input
            type="date"
            value={weekStart}
            onChange={e => setWeekStart(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Salario Base</div>
            <div className="text-xl font-bold text-slate-700">${BASE_SALARY.toFixed(2)}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <div className="text-xs text-amber-600 uppercase tracking-wide mb-1">Comisiones</div>
            <div className="text-xl font-bold text-amber-600">${totalCommissions.toFixed(2)}</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
            <div className="text-xs text-teal-600 uppercase tracking-wide mb-1">Pago Total</div>
            <div className="text-xl font-bold text-teal-700">${totalPay.toFixed(2)}</div>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-2">
          Formula: ${BASE_SALARY} (base) + ${totalCommissions.toFixed(2)} (comisiones) = ${totalPay.toFixed(2)}
        </div>

        {/* Appointments list */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="text-sm font-semibold text-slate-600 mb-2">Servicios de la Semana ({weekAppointments.length})</h4>
          {weekAppointments.length === 0 ? (
            <p className="text-sm text-slate-400 py-3">No hay servicios registrados esta semana.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left py-2 font-medium">Fecha</th>
                  <th className="text-left py-2 font-medium">Mascota</th>
                  <th className="text-left py-2 font-medium">Servicio</th>
                  <th className="text-right py-2 font-medium">Precio</th>
                  <th className="text-right py-2 font-medium">Comision</th>
                </tr>
              </thead>
              <tbody>
                {weekAppointments.map(a => {
                  const comm = a.service ? calculateCommission(a.service) : 0;
                  const pat = patients.find(p => p.id === a.patient_id);
                  return (
                    <tr key={a.id} className="border-b border-slate-50">
                      <td className="py-2 text-slate-600">{a.date}</td>
                      <td className="py-2 text-slate-600">{pat?.name || '---'}</td>
                      <td className="py-2 text-slate-700 font-medium">{a.service?.name || '---'}</td>
                      <td className="py-2 text-right text-slate-600">${(a.service?.price || 0).toFixed(2)}</td>
                      <td className="py-2 text-right font-medium text-amber-600">${comm.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowAddAppointment(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} /> Registrar Servicio
          </button>
        </div>
      </div>

      {/* Services catalog */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-teal-600" />
            <h3 className="font-semibold text-slate-700">Catalogo de Servicios</h3>
          </div>
          <button
            onClick={() => setShowAddService(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
          >
            <Plus size={15} /> Nuevo
          </button>
        </div>

        <div className="grid gap-2">
          {services.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div>
                <div className="font-medium text-slate-700 text-sm">{s.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  ${s.price.toFixed(2)} {' '} - {' '}
                  {s.commission_type === 'fixed'
                    ? `$${s.commission_value.toFixed(0)} fijo`
                    : `${s.commission_value}%`}
                  {s.name.toLowerCase().includes('export') && ' (0% - no aplica)'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Comision</div>
                <div className="font-bold text-amber-600">${calculateCommission(s).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddService && (
        <AddServiceModal
          onClose={() => setShowAddService(false)}
          onAdd={async (name, price, type, value) => {
            await addService({ name, price, commission_type: type, commission_value: value });
            setShowAddService(false);
          }}
        />
      )}

      {showAddAppointment && (
        <AddAppointmentModal
          onClose={() => setShowAddAppointment(false)}
          onAdd={async (patientId, serviceId, date, helperName) => {
            await addAppointment({ patient_id: patientId, service_id: serviceId, date, helper_name: helperName, notes: null });
            setShowAddAppointment(false);
          }}
        />
      )}
    </div>
  );
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function AddServiceModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string, price: number, type: 'percentage' | 'fixed', value: number) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('20');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Nuevo Servicio</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Precio ($)</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Tipo Comision</label>
              <select value={type} onChange={e => setType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Valor</label>
              <input type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
            Nota: Exportacion = 0% comision. Bano y Corte = $5 fijo. Demas = 20%.
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button
            onClick={() => onAdd(name, Number(price), type, Number(value))}
            disabled={!name || !price}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >Agregar</button>
        </div>
      </div>
    </div>
  );
}

function AddAppointmentModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (patientId: string, serviceId: string, date: string, helperName: string) => Promise<void>;
}) {
  const { patients, services } = useApp();
  const [patientId, setPatientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [helperName, setHelperName] = useState('Ayudante');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Registrar Servicio</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Mascota</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value="">Seleccionar...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Servicio</label>
            <select value={serviceId} onChange={e => setServiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value="">Seleccionar...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price.toFixed(2)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Ayudante</label>
            <input value={helperName} onChange={e => setHelperName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button
            onClick={() => onAdd(patientId, serviceId, date, helperName)}
            disabled={!patientId || !serviceId}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >Registrar</button>
        </div>
      </div>
    </div>
  );
}
