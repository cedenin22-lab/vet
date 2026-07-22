import { useState } from 'react';
import { Plus, Trash2, Pencil, X, ShoppingBag, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Expense } from '../../types';

export default function ExpensesModule() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ description: '', cost: 0, date: new Date().toISOString().slice(0, 10) });

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const total = expenses.reduce((a, e) => a + e.cost, 0);

  function openAdd() {
    setEditing(null);
    setForm({ description: '', cost: 0, date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setForm({ description: e.description, cost: e.cost, date: e.date });
    setShowForm(true);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.description.trim() || form.cost <= 0) return;
    if (editing) {
      updateExpense({ ...editing, description: form.description.trim(), cost: form.cost, date: form.date });
    } else {
      addExpense({
        id: crypto.randomUUID(),
        description: form.description.trim(),
        cost: form.cost,
        date: form.date,
        createdAt: new Date().toISOString(),
      });
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <ShoppingBag size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-slate-800 font-semibold text-lg">Gastos / Salidas</h2>
            <p className="text-slate-400 text-xs">Registro de compras de insumos al por mayor</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          <Plus size={16} /> Nuevo Gasto
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
          <TrendingDown size={22} className="text-red-500" />
        </div>
        <div>
          <p className="text-slate-400 text-xs">Total de gastos registrados</p>
          <p className="text-2xl font-bold text-slate-800">${total.toFixed(2)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-slate-400 text-xs">Cantidad de registros</p>
          <p className="text-lg font-semibold text-slate-600">{expenses.length}</p>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <ShoppingBag size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay gastos registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Descripción</th>
                <th className="text-right px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Costo</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Fecha</th>
                <th className="text-right px-4 py-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => (
                <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800 text-sm">{e.description}</td>
                  <td className="px-4 py-3 text-right text-slate-800 text-sm font-semibold">${e.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{e.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(e)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-slate-800 font-semibold">{editing ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Producto / Descripción *</label>
                <input
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  placeholder="Ej. Shampoo medicado, vacunas, etc."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Costo (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={e => setForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors">
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
