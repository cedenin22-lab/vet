import { useState } from 'react';
import { Stethoscope, Users, TrendingDown, Wrench, Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import ClientsView from './components/clients/ClientsView';
import DebtsView from './components/debts/DebtsView';
import CommissionsView from './components/commissions/CommissionsView';

type Tab = 'clients' | 'debts' | 'commissions';

function AppContent() {
  const { loading } = useApp();
  const [tab, setTab] = useState<Tab>('clients');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'clients', label: 'Clientes y Pacientes', icon: Users },
    { id: 'debts', label: 'Control de Deudas', icon: TrendingDown },
    { id: 'commissions', label: 'Servicios y Comisiones', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 font-bold text-sm leading-tight">Consultorio Veterinario</h1>
              <p className="text-slate-400 text-xs leading-tight">Dr. Cedeno</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'clients' && <ClientsView />}
        {tab === 'debts' && <DebtsView />}
        {tab === 'commissions' && <CommissionsView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
