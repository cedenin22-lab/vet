import { useState } from 'react';
import { Search, Plus, X, Dog, Cat, Bird, FlaskConical, Award, Phone, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LabResultForm from '../lab/LabResultForm';
import HealthCertificateForm from '../certificates/HealthCertificateForm';

export default function ClientsView() {
  const { clients, patients, labResults, healthCertificates, addClient, addPatient } = useApp();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [labModal, setLabModal] = useState<{ petId: string; ownerId: string } | null>(null);
  const [certModal, setCertModal] = useState<{ petId: string; ownerId: string } | null>(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const client = selectedClient ? clients.find(c => c.id === selectedClient) : null;
  const clientPets = patients.filter(p => p.client_id === selectedClient);

  function speciesIcon(species: string) {
    const s = species.toLowerCase();
    if (s.includes('perro') || s.includes('can')) return <Dog size={16} className="text-teal-600" />;
    if (s.includes('gato') || s.includes('fel')) return <Cat size={16} className="text-teal-600" />;
    return <Bird size={16} className="text-teal-600" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Clientes y Pacientes</h2>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {!client ? (
        <>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid gap-3">
            {filteredClients.map(c => {
              const cPets = patients.filter(p => p.client_id === c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClient(c.id)}
                  className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100 hover:border-teal-300 hover:shadow-sm transition-all text-left"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                      {c.phone && <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>}
                      {c.address && <span className="flex items-center gap-1"><MapPin size={12} /> {c.address}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-teal-600">{cPets.length} mascota(s)</div>
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
              <p className="text-sm text-slate-400">
                {client.phone && `${client.phone} - `}
                {client.address || 'Sin direccion'}
              </p>
            </div>
            <button
              onClick={() => setShowAddPatient(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus size={16} /> Nueva Mascota
            </button>
          </div>

          <div className="grid gap-3">
            {clientPets.map(pet => {
              const petLabResults = labResults.filter(l => l.patient_id === pet.id);
              const petCerts = healthCertificates.filter(h => h.patient_id === pet.id);
              return (
                <div key={pet.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 border-b border-slate-100">
                    {speciesIcon(pet.species)}
                    <span className="font-semibold text-slate-700">{pet.name}</span>
                    <span className="text-xs text-slate-400">{' '} ({pet.species} - {pet.breed || 'Sin raza'})</span>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 text-sm mb-3">
                      <p><span className="text-slate-400">Sexo:</span> <span className="text-slate-700">{pet.gender || '---'}</span></p>
                      <p><span className="text-slate-400">Color:</span> <span className="text-slate-700">{pet.color || '---'}</span></p>
                      <p><span className="text-slate-400">Peso:</span> <span className="text-slate-700">{pet.weight ? `${pet.weight} kg` : '---'}</span></p>
                      <p><span className="text-slate-400">Nacimiento:</span> <span className="text-slate-700">{pet.birth_date || '---'}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setLabModal({ petId: pet.id, ownerId: client.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors"
                      >
                        <FlaskConical size={14} /> Resultados de Laboratorio
                      </button>
                      <button
                        onClick={() => setCertModal({ petId: pet.id, ownerId: client.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100 transition-colors"
                      >
                        <Award size={14} /> Certificado de Salud
                      </button>
                    </div>

                    {petLabResults.length > 0 && (
                      <div className="mt-3 text-xs text-slate-400">
                        {petLabResults.length} resultado(s) de laboratorio registrado(s)
                      </div>
                    )}
                    {petCerts.length > 0 && (
                      <div className="mt-1 text-xs text-slate-400">
                        {petCerts.length} certificado(s) de salud emitido(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {clientPets.length === 0 && (
              <p className="text-center text-slate-400 py-8">Este cliente no tiene mascotas registradas.</p>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onAdd={async (name, phone, address, idDocument) => {
            await addClient({ name, phone, email: null, address, id_document: idDocument });
            setShowAddClient(false);
          }}
        />
      )}

      {showAddPatient && client && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onAdd={async (name, species, breed, gender, color, weight, birthDate) => {
            await addPatient({
              client_id: client.id, name, species, breed, gender, color, weight, birth_date: birthDate,
            });
            setShowAddPatient(false);
          }}
        />
      )}

      {labModal && (
        <LabResultForm
          petId={labModal.petId}
          ownerId={labModal.ownerId}
          onClose={() => setLabModal(null)}
        />
      )}

      {certModal && (
        <HealthCertificateForm
          petId={certModal.petId}
          ownerId={certModal.ownerId}
          onClose={() => setCertModal(null)}
        />
      )}
    </div>
  );
}

function AddClientModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string, phone: string, address: string, idDocument: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idDocument, setIdDocument] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Nuevo Cliente</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Telefono</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Direccion</label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Cedula / ID</label>
            <input value={idDocument} onChange={e => setIdDocument(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button
            onClick={() => onAdd(name, phone, address, idDocument)}
            disabled={!name}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >Agregar</button>
        </div>
      </div>
    </div>
  );
}

function AddPatientModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string, species: string, breed: string, gender: string, color: string, weight: string, birthDate: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Perro');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Macho');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-semibold text-slate-800">Nueva Mascota</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-1.5">Nombre *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Especie</label>
              <select value={species} onChange={e => setSpecies(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option>Perro</option>
                <option>Gato</option>
                <option>Ave</option>
                <option>Conejo</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Raza</label>
              <input value={breed} onChange={e => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Sexo</label>
              <select value={gender} onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option>Macho</option>
                <option>Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Color</label>
              <input value={color} onChange={e => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Peso (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Fecha Nacimiento</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
          <button
            onClick={() => onAdd(name, species, breed, gender, color, weight, birthDate)}
            disabled={!name}
            className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
          >Agregar</button>
        </div>
      </div>
    </div>
  );
}
