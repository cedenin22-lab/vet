import { useState } from 'react';
import { X, Download, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateHealthCertificatePDF } from '../../utils/pdf';

interface Props {
  petId: string;
  ownerId: string;
  onClose: () => void;
}

export default function HealthCertificateForm({ petId, ownerId, onClose }: Props) {
  const { pets, owners, addHealthCertificate } = useApp();
  const pet = pets.find(p => p.id === petId);
  const owner = owners.find(o => o.id === ownerId);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [passport, setPassport] = useState('');
  const [address, setAddress] = useState(owner?.address || '');
  const [exportTo, setExportTo] = useState('');

  if (!pet || !owner) return null;

  function handleDownload() {
    addHealthCertificate({
      id: crypto.randomUUID(),
      petId,
      ownerId,
      date,
      passport,
      address,
      exportTo,
      createdAt: new Date().toISOString(),
    });

    generateHealthCertificatePDF({
      date,
      petName: pet!.name,
      breed: pet!.breed,
      species: pet!.species,
      weight: pet!.weight || '',
      color: pet!.color || '',
      gender: pet!.gender,
      birthDate: pet!.birthDate || '',
      ownerName: owner!.name,
      ownerPhone: owner!.phone,
      passport,
      address,
      exportTo,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-teal-600" />
            <div>
              <h2 className="text-slate-800 font-semibold">Certificado de Buena Salud y Exportación</h2>
              <p className="text-slate-400 text-xs">{pet.name} · {owner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Auto-filled preview */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-1.5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Datos del Paciente (Autocompletados)</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p><span className="text-slate-400">Nombre:</span> <span className="text-slate-700 font-medium">{pet.name}</span></p>
              <p><span className="text-slate-400">Raza:</span> <span className="text-slate-700 font-medium">{pet.breed || '—'}</span></p>
              <p><span className="text-slate-400">Especie:</span> <span className="text-slate-700 font-medium">{pet.species}</span></p>
              <p><span className="text-slate-400">Peso:</span> <span className="text-slate-700 font-medium">{pet.weight ? `${pet.weight} kg` : '—'}</span></p>
              <p><span className="text-slate-400">Color:</span> <span className="text-slate-700 font-medium">{pet.color || '—'}</span></p>
              <p><span className="text-slate-400">Sexo:</span> <span className="text-slate-700 font-medium">{pet.gender}</span></p>
              <p><span className="text-slate-400">Nacimiento:</span> <span className="text-slate-700 font-medium">{pet.birthDate || '—'}</span></p>
            </div>
          </div>

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
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Propietario (Autocompletado)</label>
            <input
              value={owner.name}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sslate-600 text-sm font-medium mb-1.5">Pasaporte / Cédula *</label>
            <input
              value={passport}
              onChange={e => setPassport(e.target.value)}
              placeholder="Número de pasaporte o cédula del propietario"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Dirección *</label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Dirección del propietario"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Exportación hacia *</label>
            <input
              value={exportTo}
              onChange={e => setExportTo(e.target.value)}
              placeholder="País o destino de exportación"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            onClick={handleDownload}
            disabled={!passport || !address || !exportTo}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download size={15} /> Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
