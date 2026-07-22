import { useMemo } from 'react';
import { CalendarDays, User, PawPrint, Wallet, TrendingUp, Scissors } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function WeeklyRecordModule() {
  const { getCurrentWeekServices, getHelperWeeklyPay, owners, pets } = useApp();
  const weekServices = getCurrentWeekServices();
  const helperPay = getHelperWeeklyPay();

  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toLocaleDateString('es-PA', { day: 'numeric', month: 'short' }),
      end: sunday.toLocaleDateString('es-PA', { day: 'numeric', month: 'short' }),
    };
  }, []);

  const sortedServices = [...weekServices].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
          <CalendarDays size={20} className="text-teal-600" />
        </div>
        <div>
          <h2 className="text-slate-800 font-semibold text-lg">Registro Semanal</h2>
          <p className="text-slate-400 text-xs">Semana del {weekRange.start} al {weekRange.end}</p>
        </div>
      </div>

      {/* Helper Pay Summary */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={18} className="text-teal-600" />
          <h3 className="text-slate-800 font-semibold text-sm">Pago del Ayudante</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/70 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-0.5">Salario Base</p>
            <p className="text-lg font-bold text-slate-700">${helperPay.base.toFixed(2)}</p>
          </div>
          <div className="bg-white/70 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-0.5">Comisiones</p>
            <p className="text-lg font-bold text-teal-600">${helperPay.commissions.toFixed(2)}</p>
          </div>
          <div className="bg-teal-600 rounded-lg p-3">
            <p className="text-teal-100 text-xs mb-0.5">Pago Total</p>
            <p className="text-lg font-bold text-white">${helperPay.total.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
          <Scissors size={12} />
          20% en todos los servicios · $5 fijo en "Baño y Corte"
        </p>
      </div>

      {/* Commission breakdown */}
      {helperPay.breakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-500" />
            <h3 className="text-slate-700 font-medium text-sm">Desglose de Comisiones</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {helperPay.breakdown.map(({ service, commission }) => {
              const owner = owners.find(o => o.id === service.ownerId);
              const pet = pets.find(p => p.id === service.petId);
              const types = service.types?.length ? service.types : ['Consulta'];
              return (
                <div key={service.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm truncate">{owner?.name ?? '—'} · {pet?.name ?? '—'}</p>
                    <p className="text-slate-400 text-xs">{types.join(', ')} · {service.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-500 text-xs">${service.price.toFixed(2)}</p>
                    <p className="text-teal-600 text-sm font-semibold">+${commission.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed weekly table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-slate-700 font-medium text-sm">Historial Detallado de la Semana</h3>
        </div>
        {sortedServices.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay servicios registrados esta semana.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    <span className="flex items-center gap-1.5"><User size={12} /> Cliente</span>
                  </th>
                  <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    <span className="flex items-center gap-1.5"><PawPrint size={12} /> Mascota</span>
                  </th>
                  <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Servicio</th>
                  <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Fecha</th>
                  <th className="text-right px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Costo</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map(s => {
                  const owner = owners.find(o => o.id === s.ownerId);
                  const pet = pets.find(p => p.id === s.petId);
                  const types = s.types?.length ? s.types : ['Consulta'];
                  return (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-700 text-sm">{owner?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{pet?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {types.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{s.date}</td>
                      <td className="px-4 py-3 text-right text-slate-800 text-sm font-semibold">${s.price.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={4} className="px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide text-right">Total:</td>
                  <td className="px-4 py-3 text-right text-slate-800 text-base font-bold">
                    ${sortedServices.reduce((a, s) => a + s.price, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
