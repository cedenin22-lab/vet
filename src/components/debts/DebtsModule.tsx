import { useState } from 'react';
import { Plus, Trash2, Pencil, X, CreditCard, DollarSign, Calendar, Search, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Debt, DebtPayment } from '../../types';

export default function DebtsModule() {
  const { debts, owners, pets, addDebt, updateDebt, deleteDebt, addDebtPayment, deleteDebtPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, date: new Date().toISOString().slice(0, 10) });

  const [form, setForm] = useState({
    ownerId: '',
    petId: '',
    description: '',
    totalAmount: 0,
    date: new Date().toISOString().slice(0, 10),
  });

  const sorted = [...debts].sort((a, b) => b.date.localeCompare(a.date));
  const totalDebt = debts.reduce((a, d) => a + d.totalAmount, 0);
  const totalPaid = debts.reduce((a, d) => a + d.payments.reduce((s, p) => s + p.amount, 0), 0);
  const totalPending = totalDebt - totalPaid;

  function openAdd() {
    setEditing(null);
    setForm({ ownerId: '', petId: '', description: '', totalAmount: 0, date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  }

  function openEdit(d: Debt) {
    setEditing(d);
    setForm({ ownerId: d.ownerId, petId: d.petId, description: d.description, totalAmount: d.totalAmount, date: d.date });
    setShowForm(true);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.ownerId || !form.petId || form.totalAmount <= 0) return;
    if (editing) {
      updateDebt({ ...editing, ownerId: form.ownerId, petId: form.petId, description: form.description, totalAmount: form.totalAmount, date: form.date });
    } else {
      addDebt({
        id: crypto.randomUUID(),
        ownerId: form.ownerId,
        petId: form.petId,
        description: form.description.trim(),
        totalAmount: form.totalAmount,
        date: form.date,
        payments: [],
        createdAt: new Date().toISOString(),
      });
    }
    setShowForm(false);
  }

  function handleAddPayment(debtId: string) {
    if (paymentForm.amount <= 0) return;
    const payment: DebtPayment = {
      id: crypto.randomUUID(),
      amount: paymentForm.amount,
      date: paymentForm.date,
      createdAt: new Date().toISOString(),
    };
    addDebtPayment(debtId, payment);
    setPaymentForm({ amount: 0, date: new Date().toISOString().slice(0, 10) });
  }

  const ownerPets = pets.filter(p => p.ownerId === form.ownerId);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const clientResults = (() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q) return [];
    return owners.filter(o => {
      const ownerMatch = o.name.toLowerCase().includes(q);
      const petMatch = pets.some(p => p.ownerId === o.id && p.name.toLowerCase().includes(q));
      return ownerMatch || petMatch;
    }).slice(0, 8);
  })();

  const selectedOwner = owners.find(o => o.id === form.ownerId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <CreditCard size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-slate-800 font-semibold text-lg">Deudas / Cuentas por Cobrar</h2>
            <p className="text-slate-400 text-xs">Gestión de pagos pendientes de clientes</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Plus size={16} /> Nueva Deuda
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-400 text-xs mb-1">Deuda Total</p>
          <p className="text-xl font-bold text-slate-800">${totalDebt.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-400 text-xs mb-1">Total Abonado</p>
          <p className="text-xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-slate-400 text-xs mb-1">Saldo Pendiente</p>
          <p className="text-xl font-bold text-red-600">${totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <CreditCard size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay deudas registradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(d => {
            const owner = owners.find(o => o.id === d.ownerId);
            const pet = pets.find(p => p.id === d.petId);
            const paid = d.payments.reduce((s, p) => s + p.amount, 0);
            const balance = d.totalAmount - paid;
            const isExpanded = expandedId === d.id;

            return (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-500 text-sm font-bold">{owner?.name?.charAt(0).toUpperCase() ?? '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium text-sm truncate">{owner?.name ?? 'Cliente desconocido'}</p>
                    <p className="text-slate-400 text-xs truncate">{pet?.name ?? '—'} ({pet?.species ?? '—'}) · {d.date}</p>
                    {d.description && <p className="text-slate-400 text-xs truncate mt-0.5">{d.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-800 font-bold text-sm">${balance.toFixed(2)}</p>
                    <p className="text-slate-400 text-xs">pendiente</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-2">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${d.totalAmount > 0 ? (paid / d.totalAmount) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-400 text-xs">Pagado: ${paid.toFixed(2)}</span>
                    <span className="text-slate-400 text-xs">Total: ${d.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Expanded: payments + actions */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/30">
                    {/* Payments list */}
                    {d.payments.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Abonos realizados</p>
                        {d.payments.map(p => (
                          <div key={p.id} className="flex items-center gap-2 bg-white rounded-lg border border-slate-100 px-3 py-2">
                            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-500 text-xs flex-1">{p.date}</span>
                            <span className="text-green-600 text-sm font-medium">${p.amount.toFixed(2)}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteDebtPayment(d.id, p.id); }}
                              className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add payment */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-slate-500 text-xs mb-1">Monto del abono</label>
                        <div className="relative">
                          <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentForm.amount}
                            onChange={e => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 text-xs mb-1">Fecha</label>
                        <input
                          type="date"
                          value={paymentForm.date}
                          onChange={e => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <button
                        onClick={() => handleAddPayment(d.id)}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Edit / Delete debt */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(d); setShowForm(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDebt(d.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold">{editing ? 'Editar Deuda' : 'Nueva Deuda'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Cliente *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.ownerId ? selectedOwner?.name ?? clientSearch : clientSearch}
                    onChange={e => {
                      setClientSearch(e.target.value);
                      setForm(prev => ({ ...prev, ownerId: '', petId: '' }));
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                    placeholder="Buscar por cliente o mascota..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  {showClientDropdown && clientResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg max-h-56 overflow-y-auto">
                      {clientResults.map(o => {
                        const ownerPets = pets.filter(p => p.ownerId === o.id);
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onMouseDown={() => {
                              setForm(prev => ({ ...prev, ownerId: o.id, petId: '' }));
                              setClientSearch(o.name);
                              setShowClientDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              {form.ownerId === o.id && <Check size={14} className="text-red-500 flex-shrink-0" />}
                              <div className="min-w-0">
                                <p className="text-slate-800 text-sm font-medium truncate">{o.name}</p>
                                {ownerPets.length > 0 && (
                                  <p className="text-slate-400 text-xs truncate">
                                    {ownerPets.map(p => p.name).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Mascota *</label>
                <select
                  value={form.petId}
                  onChange={e => setForm(prev => ({ ...prev, petId: e.target.value }))}
                  required
                  disabled={!form.ownerId}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-50"
                >
                  <option value="">Seleccionar mascota...</option>
                  {ownerPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Descripción</label>
                <input
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej. Cirugía, tratamiento prolongado..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1.5">Monto Total (USD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalAmount}
                    onChange={e => setForm(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
                  {editing ? 'Guardar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
