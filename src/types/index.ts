export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  id_document: string | null;
  created_at: string;
}

export interface Patient {
  id: string;
  client_id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  weight: string | null;
  birth_date: string | null;
  created_at: string;
}

export type CommissionType = 'percentage' | 'fixed';

export interface Service {
  id: string;
  name: string;
  price: number;
  commission_type: CommissionType;
  commission_value: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  service_id: string;
  helper_name: string;
  date: string;
  notes: string | null;
  created_at: string;
  service?: Service;
  patient?: Patient;
}

export interface Debt {
  id: string;
  client_id: string;
  patient_id: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  patient?: Patient;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  debt_id: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface LabTestResult {
  name: string;
  details: string;
  result: string;
}

export interface LabResult {
  id: string;
  patient_id: string;
  client_id: string;
  date: string;
  tests: LabTestResult[];
  observations: string | null;
  photo_url: string | null;
  created_at: string;
  patient?: Patient;
  client?: Client;
}

export interface HealthCertificate {
  id: string;
  patient_id: string;
  client_id: string;
  date: string;
  passport: string | null;
  address: string | null;
  export_to: string | null;
  created_at: string;
  patient?: Patient;
  client?: Client;
}
