import { useState } from 'react';
import { Search, Plus, TrendingDown, DollarSign, PawPrint, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function DebtsView() {
  const { clients, patients, debts, addDebt, addPayment } = useApp();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const client = selectedClient ? clients.find(c => c.id === selectedClient) : null;
  const clientPatients = patients.filter(p => p.client_id === selectedClient);
  const clientDebts = debts.filter(d => d.client_id === selectedClient);

  // Group debts by patient
  const debtsByPatient = clientPatients.map(pat => {
    const patDebts = clientDebts.filter(d => d.patient_id === pat.id);
    const totalDebt = patDebts.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalPaid = patDebts.reduce((sum, d) =>
      sum + (d.payments || []).reduce((s, p) => s + Number(p.amount), 0), 0
    );
    return {
      patient: pat,
      debts: patDebts,
      subtotal: totalDebt - totalPaid,
      totalDebt,
      totalPaid,
    };
  }).filter(g => g.debts.length > 0);

  const grandTotal = debtsByPatient.reduce((sum, g) => sum + g.subtotal, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Control de Deudas</h2>
      </div>

      {!client ? (
        <>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente por nombre o telefono..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid gap-3">
            {filteredClients.map(c => {
              const cDebts = debts.filter(d => d.client_id === c.id);
              const total = cDebts.reduce((sum, d) => {
                const paid = (d.payments || []).reduce((s, p) => s + Number(p.amount), 0);
                return sum + (Number(d.amount) - paid);
              }, 0);
              const cPets = patients.filter(p => p.client_id === c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClient(c.id)}
                  className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100 hover:border-teal-300 hover:shadow-sm transition-all text-left"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {c.phone || 'Sin telefono'} {' '} - {' '} {cPets.length} {' '} mascota(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${total.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">{cDebts.length} {' '} cuenta(s)</div>
                  </div>
                </button>
              );
            })}
            {filteredClients.length === 0 && (
              <p className="text-center text-slate-400 py-8">No se encontraron clientes.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100">
            <div>
              <button onClick={() => setSelectedClient(null)} className="text-teal-600 text-sm font-medium hover:underline mb-1">
                - Volver
              </button>
              <h3 className="text-lg font-bold text-slate-800">{client.name}</h3>
              <p className="text-sm text-slate-400">{client.phone || 'Sin telefono'} {' '} - {' '} {client.address || 'Sin direccion'}</p>
            </div>
            <button
              onClick={() => setShowAddDebt(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus size={16} /> Nueva Deuda
            </button>
          </div>

          {/* Grand total banner */}
          <div className={`rounded-xl p-5 border-2 ${grandTotal > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className={grandTotal > 0 ? 'text-red-600' : 'text-green-600'} />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total General Adeudado</span>
              </div>
              <span className={`text-2xl font-bold ${grandTotal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Per-patient breakdown */}
          <div className="space-y-4">
            {debtsByPatient.map(group => (
              <div key={group.patient.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <PawPrint size={16} className="text-teal-600" />
                    <span className="font-semibold text-slate-700">{group.patient.name}</span>
                    <span className="text-xs text-slate-400">{' '} ({group.patient.species})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Subtotal: </span>
                    <span className={`font-bold ${group.subtotal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${group.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100">
                      <th className="text-left px-4 py-2 font-medium">Fecha</th>
                      <th className="text-left px-4 py-2 font-medium">Descripcion</th>
                      <th className="text-right px-4 py-2 font-medium">Monto</th>
                      <th className="text-right px-4 py-2 font-medium">Abonado</th>
                      <th className="text-right px-4 py-2 font-medium">Saldo</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.debts.map(d => {
                      const paid = (d.payments || []).reduce((s, p) => s + Number(p.amount), 0);
                      const balance = Number(d.amount) - paid;
                      return (
                        <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 text-slate-600">{d.date}</td>
                          <td className="px-4 py-2.5 text-slate-600">{d.description || '---'}</td>
                          <td className="px-4 py-2.5 text-right text-slate-700 font-medium">${Number(d.amount).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-green-600">${paid.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-red-600">${balance.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right">
                            {balance > 0 && (
                              <button
                                onClick={() => setPaymentDebtId(d.id)}
                                className="text-xs px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 font-medium hover:bg-teal-100 transition-colors"
                              >
                                Abonar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}

            {debtsByPatient.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <TrendingDown size={32} className="mx-auto mb-2 text-slate-300" />
                <p>Este cliente no tiene deudas registradas.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add debt modal */}
      {showAddDebt && client && (
        <AddDebtModal
          clientId={client.id}
          patients={clientPatients}
          onClose={() => setShowAddDebt(false)}
          onAdd={async (patientId, amount, description, date) => {
            await addDebt({ client_id: client.id, patient_id: patientId, amount, description, date });
            setShowAddDebt(false);
          }}
        />
      )}

      {/* Payment modal */}
      {paymentDebtId && (
        <PaymentModal
          onClose={() => setPaymentDebtId(null)}
          onAdd={async (amount, date, notes) => {
            await addPayment({ debt_id: paymentDebtId, amount, date, notes });
            setPaymentDebtId(null);
          }}
        />
      )}
    </div>
  );
}

function AddDebtModal({ clientId, patients, onClose, onAdd }: {
  clientId: string;
  patients: { id: string; name: string }[];
  onClose: () => void;
  onAdd: (patientId: string, amount: number, description: string, date: string) => Promise<void>;
}) {
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Nueva Deuda</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Mascota</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Monto ($)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Descripcion</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
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
            onClick={() => onAdd(patientId, Number(amount), description, date)}
            disabled={!patientId || !amount}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >Agregar</button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (amount: number, date: string, notes: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Registrar Abono</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Monto del Abono ($)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Notas</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button
            onClick={() => onAdd(Number(amount), date, notes)}
            disabled={!amount}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >Abonar</button>
        </div>
      </div>
    </div>
  );
}
