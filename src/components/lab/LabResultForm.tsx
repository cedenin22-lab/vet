import { useState } from 'react';
import { X, Download, FlaskConical } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateLabResultPDF } from '../../utils/pdf';
import type { LabTestResult } from '../../types';

interface Props {
  petId: string;
  ownerId: string;
  onClose: () => void;
}

const LAB_TESTS = [
  'Giardia Ag',
  'CCV Ag (Coronavirus)',
  'CPV Ag (Parvovirus)',
  'Distemper Ag (Moquillo)',
  'E. Canis Ab. (Ehrlichia canis)',
  'FIV Ag (Inmunodeficiencia Felina)',
  'FeLV Ac (Leucemia Felina)',
  'Babesia Ab',
  'Coprológico',
];

export default function LabResultForm({ petId, ownerId, onClose }: Props) {
  const { pets, owners, addLabResult } = useApp();
  const pet = pets.find(p => p.id === petId);
  const owner = owners.find(o => o.id === ownerId);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<Record<string, { details: string; result: string }>>(
    () => Object.fromEntries(LAB_TESTS.map(t => [t, { details: '', result: '' }]))
  );
  const [observations, setObservations] = useState('');

  if (!pet || !owner) return null;

  function handleFieldChange(test: string, field: 'details' | 'result', value: string) {
    setResults(prev => ({
      ...prev,
      [test]: { ...prev[test], [field]: value },
    }));
  }

  const filledTests: LabTestResult[] = LAB_TESTS
    .filter(t => results[t].result.trim() !== '')
    .map(t => ({ name: t, details: results[t].details, result: results[t].result }));

  function handleSaveAndDownload(download: boolean) {
    const labResult = {
      id: crypto.randomUUID(),
      petId,
      ownerId,
      date,
      tests: filledTests,
      observations,
      createdAt: new Date().toISOString(),
    };
    addLabResult(labResult);

    if (download) {
      generateLabResultPDF({
        date,
        petName: pet!.name,
        ownerName: owner!.name,
        tests: filledTests,
        observations,
      });
    }
    onClose();
  }

  const hasResults = filledTests.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical size={20} className="text-teal-600" />
            <div>
              <h2 className="text-slate-800 font-semibold">Resultados de Laboratorio</h2>
              <p className="text-slate-400 text-xs">{pet.name} · {owner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <h3 className="text-slate-700 text-sm font-semibold mb-2">Pruebas Disponibles</h3>
            <p className="text-slate-400 text-xs mb-3">Llena solo las pruebas realizadas. Las que no tengan resultado no aparecerán en el PDF.</p>
            <div className="space-y-2">
              {LAB_TESTS.map(test => (
                <div key={test} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2.5">
                  <div className="col-span-5 text-slate-700 text-sm font-medium">{test}</div>
                  <input
                    type="text"
                    placeholder="Detalles / Observaciones"
                    value={results[test].details}
                    onChange={e => handleFieldChange(test, 'details', e.target.value)}
                    className="col-span-4 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Resultado"
                    value={results[test].result}
                    onChange={e => handleFieldChange(test, 'result', e.target.value)}
                    className="col-span-3 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Observaciones Clínicas</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={4}
              placeholder="Interpretación clínica, tratamiento recomendado, notas..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleSaveAndDownload(false)}
            disabled={!hasResults}
            className="flex-1 px-4 py-2.5 rounded-lg border border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
          <button
            onClick={() => handleSaveAndDownload(true)}
            disabled={!hasResults}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download size={15} /> Guardar y PDF
          </button>
        </div>
      </div>
    </div>
  );
}
