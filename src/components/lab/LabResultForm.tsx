import { useState, useRef } from 'react';
import { X, Download, FlaskConical, ImagePlus, Stamp } from 'lucide-react';
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

// Auto-fill details for each result/test combination
const AUTOCOMPLETE_DETAILS: Record<string, Record<string, string>> = {
  'Giardia Ag': {
    Positivo: 'Presencia del antígeno de Giardia spp. detectada.',
    Negativo: 'No se detectó antígeno de Giardia spp.',
  },
  'CCV Ag (Coronavirus)': {
    Positivo: 'Antígeno de Coronavirus Canino (CCV) detectado.',
    Negativo: 'No se detectó antígeno de Coronavirus Canino.',
  },
  'CPV Ag (Parvovirus)': {
    Positivo: 'Antígeno de Parvovirus Canino (CPV) detectado. Caso positivo.',
    Negativo: 'No se detectó antígeno de Parvovirus Canino.',
  },
  'Distemper Ag (Moquillo)': {
    Positivo: 'Antígeno del virus del Distemper (Moquillo) detectado.',
    Negativo: 'No se detectó antígeno del virus del Distemper (Moquillo).',
  },
  'E. Canis Ab. (Ehrlichia canis)': {
    Positivo: 'Con anticuerpos contra Ehrlichia canis.',
    Negativo: 'Sin anticuerpos detectables contra Ehrlichia canis.',
  },
  'FIV Ag (Inmunodeficiencia Felina)': {
    Positivo: 'Antígeno del Virus de Inmunodeficiencia Felina (FIV) detectado.',
    Negativo: 'No se detectó antígeno del Virus de Inmunodeficiencia Felina.',
  },
  'FeLV Ac (Leucemia Felina)': {
    Positivo: 'Anticuerpos contra el Virus de Leucemia Felina (FeLV) detectados.',
    Negativo: 'No se detectaron anticuerpos contra el Virus de Leucemia Felina.',
  },
  'Babesia Ab': {
    Positivo: 'Con anticuerpos contra Babesia spp. Infección presente o pasada.',
    Negativo: 'Sin anticuerpos detectables contra Babesia spp.',
  },
  'Coprológico': {
    Positivo: 'Resultado positivo en examen coprológico. Se identificaron parásitos intestinales.',
    Negativo: 'Examen coprológico sin hallazgos parasitarios.',
  },
};

export default function LabResultForm({ petId, ownerId, onClose }: Props) {
  const { pets, owners, addLabResult } = useApp();
  const pet = pets.find(p => p.id === petId);
  const owner = owners.find(o => o.id === ownerId);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<Record<string, { details: string; result: string }>>(
    () => Object.fromEntries(LAB_TESTS.map(t => [t, { details: '', result: '' }]))
  );
  const [observations, setObservations] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [includeSignature, setIncludeSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!pet || !owner) return null;

  function handleResultChange(test: string, value: string) {
    const autoDetail = AUTOCOMPLETE_DETAILS[test]?.[value] ?? '';
    setResults(prev => ({
      ...prev,
      [test]: { ...prev[test], result: value, details: autoDetail || prev[test].details },
    }));
  }

  function handleDetailsChange(test: string, value: string) {
    setResults(prev => ({ ...prev, [test]: { ...prev[test], details: value } }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const filledTests: LabTestResult[] = LAB_TESTS
    .filter(t => results[t].result.trim() !== '')
    .map(t => ({ name: t, details: results[t].details, result: results[t].result }));

  const hasResults = filledTests.length > 0;

  async function handleSave(download: boolean) {
    setSaving(true);
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
      await generateLabResultPDF({
        date,
        petName: pet!.name,
        ownerName: owner!.name,
        tests: filledTests,
        observations,
        photoDataUrl,
        includeSignature,
      });
    }
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
            <h3 className="text-slate-700 text-sm font-semibold mb-1">Pruebas Disponibles</h3>
            <p className="text-slate-400 text-xs mb-3">Selecciona el resultado de cada prueba realizada. El detalle se llenará automáticamente y podrás editarlo.</p>
            <div className="space-y-2">
              {LAB_TESTS.map(test => (
                <div key={test} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <div className="col-span-4 text-slate-700 text-xs font-semibold leading-tight">{test}</div>
                  <select
                    value={results[test].result}
                    onChange={e => handleResultChange(test, e.target.value)}
                    className="col-span-3 px-2 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="">— Resultado</option>
                    <option value="Positivo">Positivo</option>
                    <option value="Negativo">Negativo</option>
                    <option value="Indeterminado">Indeterminado</option>
                    <option value="No realizado">No realizado</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Detalles / Observaciones"
                    value={results[test].details}
                    onChange={e => handleDetailsChange(test, e.target.value)}
                    className="col-span-5 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Evidencia Fotográfica</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors"
            >
              {photoDataUrl ? (
                <div className="space-y-2">
                  <img src={photoDataUrl} alt="Examen" className="max-h-40 mx-auto rounded-lg object-contain" />
                  <p className="text-xs text-slate-400">Clic para cambiar la imagen</p>
                </div>
              ) : (
                <div className="space-y-1 py-4">
                  <ImagePlus size={24} className="mx-auto text-slate-300" />
                  <p className="text-sm text-slate-400">Subir foto del examen</p>
                  <p className="text-xs text-slate-300">JPG, PNG, GIF · Clic para seleccionar</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 space-y-3">
          {/* Signature toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setIncludeSignature(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${includeSignature ? 'bg-teal-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeSignature ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Stamp size={15} className={includeSignature ? 'text-teal-600' : 'text-slate-400'} />
              <span>Incluir firma y sello digital</span>
            </div>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={!hasResults || saving}
              className="flex-1 px-4 py-2.5 rounded-lg border border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!hasResults || saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={15} /> {saving ? 'Generando...' : 'Guardar y PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
