import { useMemo } from 'react';
import {
  DollarSign,
  Banknote,
  Smartphone,
  Activity,
  TrendingUp,
  Calendar,
  PawPrint,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ServiceType } from '../types';

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  const sat = new Date(mon);
  sat.setDate(mon.getDate() + 5);
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short' });
  return `${fmt(mon)} – ${fmt(sat)}`;
}

const SERVICE_COLORS: Record<ServiceType, string> = {
  Consulta: 'bg-blue-500',
  Vacunación: 'bg-teal-500',
  Desparasitación: 'bg-green-500',
  Cirugía: 'bg-red-500',
  Grooming: 'bg-amber-500',
  Tratamiento: 'bg-cyan-500',
  Otro: 'bg-slate-400',
};

export default function Dashboard() {
  const { owners, pets, getCurrentWeekServices, services } = useApp();

  const weekServices = getCurrentWeekServices();

  const totals = useMemo(() => {
    const cash = weekServices.filter(s => s.paymentMethod === 'Efectivo').reduce((a, s) => a + s.price, 0);
    const yappy = weekServices.filter(s => s.paymentMethod === 'Yappy').reduce((a, s) => a + s.price, 0);
    return { cash, yappy, total: cash + yappy, count: weekServices.length };
  }, [weekServices]);

  const cashPct = totals.total > 0 ? (totals.cash / totals.total) * 100 : 0;
  const yappyPct = totals.total > 0 ? (totals.yappy / totals.total) * 100 : 0;

  const servicesByType = useMemo(() => {
    const map: Partial<Record<ServiceType, number>> = {};
    weekServices.forEach(s => {
      map[s.type] = (map[s.type] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => (b[1] as number) - (a[1] as number)) as [ServiceType, number][];
  }, [weekServices]);

  const recentServices = useMemo(() => {
    return [...services]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [services]);

  const dailyRevenue = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return days.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const total = weekServices
        .filter(s => {
          const sd = new Date(s.date);
          return (
            sd.getFullYear() === d.getFullYear() &&
            sd.getMonth() === d.getMonth() &&
            sd.getDate() === d.getDate()
          );
        })
        .reduce((a, s) => a + s.price, 0);
      return { label, total };
    });
  }, [weekServices]);

  const maxDaily = Math.max(...dailyRevenue.map(d => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Week header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 font-bold text-xl">Dashboard Financiero</h2>
          <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
            <Calendar size={14} />
            Semana actual: {getWeekLabel()}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Semanal"
          value={formatCurrency(totals.total)}
          icon={<DollarSign size={20} />}
          color="bg-teal-500"
          sub={`${totals.count} servicio${totals.count !== 1 ? 's' : ''}`}
        />
        <KpiCard
          label="Total Efectivo"
          value={formatCurrency(totals.cash)}
          icon={<Banknote size={20} />}
          color="bg-green-500"
          sub={`${cashPct.toFixed(0)}% del total`}
        />
        <KpiCard
          label="Total Yappy"
          value={formatCurrency(totals.yappy)}
          icon={<Smartphone size={20} />}
          color="bg-blue-500"
          sub={`${yappyPct.toFixed(0)}% del total`}
        />
        <KpiCard
          label="Pacientes"
          value={String(pets.length)}
          icon={<PawPrint size={20} />}
          color="bg-amber-500"
          sub={`${owners.length} cliente${owners.length !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily revenue bar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-700 font-semibold text-sm">Ingresos por Día</h3>
            <TrendingUp size={16} className="text-teal-500" />
          </div>
          <div className="flex items-end gap-3 h-32">
            {dailyRevenue.map(({ label, total }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-slate-500 text-xs font-medium">
                  {total > 0 ? `$${total.toFixed(0)}` : ''}
                </span>
                <div className="w-full bg-slate-100 rounded-md overflow-hidden" style={{ height: '80px' }}>
                  <div
                    className="w-full bg-teal-500 rounded-md transition-all duration-500"
                    style={{ height: `${(total / maxDaily) * 100}%`, marginTop: 'auto' }}
                  />
                </div>
                <span className="text-slate-500 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment split */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-700 font-semibold text-sm">Métodos de Pago</h3>
            <Activity size={16} className="text-blue-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Banknote size={14} className="text-green-500" /> Efectivo
                </span>
                <span className="text-slate-700 font-semibold">{formatCurrency(totals.cash)}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${cashPct}%` }}
                />
              </div>
              <p className="text-right text-slate-400 text-xs mt-0.5">{cashPct.toFixed(0)}%</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Smartphone size={14} className="text-blue-500" /> Yappy
                </span>
                <span className="text-slate-700 font-semibold">{formatCurrency(totals.yappy)}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${yappyPct}%` }}
                />
              </div>
              <p className="text-right text-slate-400 text-xs mt-0.5">{yappyPct.toFixed(0)}%</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Total</span>
                <span className="text-slate-800 font-bold">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services by type + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By type */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-slate-700 font-semibold text-sm mb-4">Servicios esta Semana</h3>
          {servicesByType.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Sin servicios esta semana</p>
          ) : (
            <ul className="space-y-2.5">
              {servicesByType.map(([type, count]) => (
                <li key={type} className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${SERVICE_COLORS[type]}`} />
                  <span className="text-slate-600 text-sm flex-1">{type}</span>
                  <span className="text-slate-800 font-semibold text-sm">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent services */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-700 font-semibold text-sm">Actividad Reciente</h3>
            <Users size={16} className="text-slate-400" />
          </div>
          {recentServices.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No hay servicios registrados</p>
          ) : (
            <div className="space-y-2">
              {recentServices.map(s => (
                <RecentRow key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon, color, sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-slate-800 font-bold text-2xl leading-none">{value}</p>
        <p className="text-slate-400 text-xs mt-1">{sub}</p>
      </div>
    </div>
  );
}

function RecentRow({ service }: { service: import('../types').ServiceRecord }) {
  const { pets, owners } = useApp();
  const pet = pets.find(p => p.id === service.petId);
  const owner = owners.find(o => o.id === service.ownerId);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
        <PawPrint size={14} className="text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-700 text-sm font-medium truncate">
          {pet?.name ?? '–'} <span className="text-slate-400 font-normal">({owner?.name ?? '–'})</span>
        </p>
        <p className="text-slate-400 text-xs truncate">{service.type} · {new Date(service.date).toLocaleDateString('es-PA')}</p>
      </div>
      <span className="text-slate-700 font-semibold text-sm flex-shrink-0">
        ${service.price.toFixed(2)}
      </span>
    </div>
  );
}
