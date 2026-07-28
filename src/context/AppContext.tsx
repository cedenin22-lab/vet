import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Client, Patient, Service, Appointment, Debt, Payment, LabResult, HealthCertificate } from '../types';

interface AppContextType {
  clients: Client[];
  patients: Patient[];
  services: Service[];
  appointments: Appointment[];
  debts: Debt[];
  payments: Payment[];
  labResults: LabResult[];
  healthCertificates: HealthCertificate[];
  loading: boolean;
  refresh: () => Promise<void>;
  addClient: (c: Omit<Client, 'id' | 'created_at'>) => Promise<Client | null>;
  addPatient: (p: Omit<Patient, 'id' | 'created_at'>) => Promise<Patient | null>;
  addService: (s: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  addAppointment: (a: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  addDebt: (d: Omit<Debt, 'id' | 'created_at' | 'payments'>) => Promise<void>;
  addPayment: (p: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  addLabResult: (l: Omit<LabResult, 'id' | 'created_at'>) => Promise<void>;
  addHealthCertificate: (h: Omit<HealthCertificate, 'id' | 'created_at'>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [healthCertificates, setHealthCertificates] = useState<HealthCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [c, p, s, a, d, pay, lr, hc] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('patients').select('*').order('name'),
      supabase.from('services').select('*').order('name'),
      supabase.from('appointments').select('*, service:services(*), patient:patients(*)').order('date', { ascending: false }),
      supabase.from('debts').select('*, patient:patients(*)').order('date', { ascending: false }),
      supabase.from('payments').select('*').order('date', { ascending: false }),
      supabase.from('lab_results').select('*, patient:patients(*), client:clients(*)').order('date', { ascending: false }),
      supabase.from('health_certificates').select('*, patient:patients(*), client:clients(*)').order('date', { ascending: false }),
    ]);

    setClients(c.data || []);
    setPatients(p.data || []);
    setServices(s.data || []);
    setAppointments(a.data || []);
    const debtsWithPayments = (d.data || []).map((debt: Debt) => ({
      ...debt,
      payments: (pay.data || []).filter((pay: Payment) => pay.debt_id === debt.id),
    }));
    setDebts(debtsWithPayments);
    setPayments(pay.data || []);
    setLabResults(lr.data || []);
    setHealthCertificates(hc.data || []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function addClient(client: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('clients').insert(client).select().single();
    if (error) { console.error(error); return null; }
    await refresh();
    return data;
  }

  async function addPatient(patient: Omit<Patient, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) { console.error(error); return null; }
    await refresh();
    return data;
  }

  async function addService(service: Omit<Service, 'id' | 'created_at'>) {
    const { error } = await supabase.from('services').insert(service);
    if (error) console.error(error);
    await refresh();
  }

  async function addAppointment(appt: Omit<Appointment, 'id' | 'created_at'>) {
    const { error } = await supabase.from('appointments').insert(appt);
    if (error) console.error(error);
    await refresh();
  }

  async function addDebt(debt: Omit<Debt, 'id' | 'created_at' | 'payments'>) {
    const { error } = await supabase.from('debts').insert(debt);
    if (error) console.error(error);
    await refresh();
  }

  async function addPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { error } = await supabase.from('payments').insert(payment);
    if (error) console.error(error);
    await refresh();
  }

  async function addLabResult(lr: Omit<LabResult, 'id' | 'created_at'>) {
    const { error } = await supabase.from('lab_results').insert(lr);
    if (error) console.error(error);
    await refresh();
  }

  async function addHealthCertificate(hc: Omit<HealthCertificate, 'id' | 'created_at'>) {
    const { error } = await supabase.from('health_certificates').insert(hc);
    if (error) console.error(error);
    await refresh();
  }

  async function deleteDebt(id: string) {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) console.error(error);
    await refresh();
  }

  return (
    <AppContext.Provider value={{
      clients, patients, services, appointments, debts, payments, labResults, healthCertificates,
      loading, refresh, addClient, addPatient, addService, addAppointment, addDebt, addPayment,
      addLabResult, addHealthCertificate, deleteDebt,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
