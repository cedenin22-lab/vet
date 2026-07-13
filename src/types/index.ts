export type PaymentMethod = 'Efectivo' | 'Yappy';

export type ServiceType =
  | 'Consulta'
  | 'Vacunación'
  | 'Desparasitación'
  | 'Cirugía'
  | 'Grooming'
  | 'Tratamiento'
  | 'Otro';

export type AppointmentStatus = 'Pendiente' | 'Completada' | 'Cancelada';

// Available vaccines - easy to extend by adding more options
export const VACCINES: string[] = [
  'Parvovirus',
  'Parvovirus/Distemper',
  'Rabia',
  'Múltiple',
  'Quíntuple',
  'Séxtuple',
  'Leptospira',
  'Bordetella',
  'Influenza Canina',
];

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  gender: 'Macho' | 'Hembra';
  color: string;
  birthDate: string;
  ageManual: string;
  weight: string;
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  petId: string;
  ownerId: string;
  date: string;
  type: ServiceType;
  vaccines: string[];
  description: string;
  observations: string;
  diagnosis: string;
  treatment: string;
  price: number;
  paymentMethod: PaymentMethod;
  vet: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  ownerName: string;
  petName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
}

export interface WeeklySnapshot {
  weekStart: string;
  weekEnd: string;
  totalCash: number;
  totalYappy: number;
  totalRevenue: number;
  serviceCount: number;
}

export interface Appointment {
  id: string;
  ownerId: string;
  petId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}
