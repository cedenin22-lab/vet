import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Owner, Pet, ServiceRecord, Invoice, WeeklySnapshot, Appointment } from '../types';

interface AppContextValue {
  owners: Owner[];
  pets: Pet[];
  services: ServiceRecord[];
  invoices: Invoice[];
  weeklySnapshots: WeeklySnapshot[];
  appointments: Appointment[];

  addOwner: (owner: Owner) => void;
  updateOwner: (owner: Owner) => void;
  deleteOwner: (id: string) => void;

  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (id: string) => void;

  addService: (service: ServiceRecord) => void;
  updateService: (service: ServiceRecord) => void;
  deleteService: (id: string) => void;

  addInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  getTodayAppointments: () => Appointment[];
  getUpcomingAppointments: (limit?: number) => Appointment[];

  getCurrentWeekServices: () => ServiceRecord[];
  getWeeklyTotals: () => { cash: number; yappy: number; total: number; count: number };
}

const AppContext = createContext<AppContextValue | null>(null);

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 5);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [owners, setOwners] = useState<Owner[]>(() => load('vc_owners', []));
  const [pets, setPets] = useState<Pet[]>(() => load('vc_pets', []));
  const [services, setServices] = useState<ServiceRecord[]>(() => load('vc_services', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => load('vc_invoices', []));
  const [weeklySnapshots, setWeeklySnapshots] = useState<WeeklySnapshot[]>(() =>
    load('vc_weekly_snapshots', [])
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    load('vc_appointments', [])
  );

  useEffect(() => { save('vc_owners', owners); }, [owners]);
  useEffect(() => { save('vc_pets', pets); }, [pets]);
  useEffect(() => { save('vc_services', services); }, [services]);
  useEffect(() => { save('vc_invoices', invoices); }, [invoices]);
  useEffect(() => { save('vc_weekly_snapshots', weeklySnapshots); }, [weeklySnapshots]);
  useEffect(() => { save('vc_appointments', appointments); }, [appointments]);

  const addOwner = useCallback((o: Owner) => setOwners(prev => [...prev, o]), []);
  const updateOwner = useCallback((o: Owner) => setOwners(prev => prev.map(x => x.id === o.id ? o : x)), []);
  const deleteOwner = useCallback((id: string) => {
    setOwners(prev => prev.filter(x => x.id !== id));
    setPets(prev => prev.filter(x => x.ownerId !== id));
    setAppointments(prev => prev.filter(x => x.ownerId !== id));
  }, []);

  const addPet = useCallback((p: Pet) => setPets(prev => [...prev, p]), []);
  const updatePet = useCallback((p: Pet) => setPets(prev => prev.map(x => x.id === p.id ? p : x)), []);
  const deletePet = useCallback((id: string) => {
    setPets(prev => prev.filter(x => x.id !== id));
    setServices(prev => prev.filter(x => x.petId !== id));
    setAppointments(prev => prev.filter(x => x.petId !== id));
  }, []);

  const addService = useCallback((s: ServiceRecord) => setServices(prev => [...prev, s]), []);
  const updateService = useCallback((s: ServiceRecord) => setServices(prev => prev.map(x => x.id === s.id ? s : x)), []);
  const deleteService = useCallback((id: string) => setServices(prev => prev.filter(x => x.id !== id)), []);

  const addInvoice = useCallback((inv: Invoice) => setInvoices(prev => [...prev, inv]), []);
  const deleteInvoice = useCallback((id: string) => setInvoices(prev => prev.filter(x => x.id !== id)), []);

  const addAppointment = useCallback((a: Appointment) => setAppointments(prev => [...prev, a]), []);
  const updateAppointment = useCallback((a: Appointment) =>
    setAppointments(prev => prev.map(x => x.id === a.id ? a : x)), []);
  const deleteAppointment = useCallback((id: string) =>
    setAppointments(prev => prev.filter(x => x.id !== id)), []);

  const getTodayAppointments = useCallback((): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date === today && a.status !== 'Cancelada')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments]);

  const getUpcomingAppointments = useCallback((limit = 10): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date >= today && a.status !== 'Cancelada')
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.time.localeCompare(b.time);
      })
      .slice(0, limit);
  }, [appointments]);

  const getCurrentWeekServices = useCallback((): ServiceRecord[] => {
    const { start, end } = getWeekBounds(new Date());
    return services.filter(s => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
  }, [services]);

  const getWeeklyTotals = useCallback(() => {
    const current = getCurrentWeekServices();
    const cash = current.filter(s => s.paymentMethod === 'Efectivo').reduce((a, s) => a + s.price, 0);
    const yappy = current.filter(s => s.paymentMethod === 'Yappy').reduce((a, s) => a + s.price, 0);
    return { cash, yappy, total: cash + yappy, count: current.length };
  }, [getCurrentWeekServices]);

  const value: AppContextValue = {
    owners, pets, services, invoices, weeklySnapshots, appointments,
    addOwner, updateOwner, deleteOwner,
    addPet, updatePet, deletePet,
    addService, updateService, deleteService,
    addInvoice, deleteInvoice,
    addAppointment, updateAppointment, deleteAppointment,
    getTodayAppointments, getUpcomingAppointments,
    getCurrentWeekServices, getWeeklyTotals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
