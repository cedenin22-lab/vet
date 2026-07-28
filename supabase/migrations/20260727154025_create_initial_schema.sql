/*
# Consultorio Veterinario - Initial Schema

Single-tenant app (no auth). Clientes (owners) and Pacientes (pets) share a unified model.
Tracks: clients, patients, services, appointments, debts, payments, lab results, health certificates, helper commissions.

1. New Tables
- `clients` — owner of pets (name, phone, email, address, id_document)
- `patients` — pets belonging to a client (name, species, breed, gender, color, weight, birth_date)
- `services` — catalog of services offered (name, price, commission_type, commission_value)
- `appointments` — service rendered to a patient by a helper on a date (links service, patient, helper)
- `debts` — outstanding balance owed by a client for a patient (amount, date, description)
- `payments` — abonos (partial payments) made toward a debt
- `lab_results` — laboratory test results for a patient (jsonb tests, observations, photo)
- `health_certificates` — health/export certificates issued for a patient

2. Commission Rules (enforced in app logic, stored on services table)
- Exportación: 0% commission
- Baño y corte: $5 fixed commission
- All others (Corte de uña, baño medicado, etc.): 20% commission

3. Weekly Pay Formula
- $80 base salary + sum of commissions for the week

4. Security
- RLS enabled on all tables.
- Single-tenant (no auth): policies allow anon + authenticated full CRUD (data is intentionally shared).
*/

-- Clients (propietarios)
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  id_document text,
  created_at timestamptz DEFAULT now()
);

-- Patients (pacientes/mascotas)
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  gender text,
  color text,
  weight text,
  birth_date date,
  created_at timestamptz DEFAULT now()
);

-- Services catalog
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  commission_type text NOT NULL DEFAULT 'percentage',
  commission_value numeric(10,2) NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- Appointments (servicios prestados)
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  helper_name text NOT NULL DEFAULT 'Ayudante',
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Debts (cuentas por cobrar)
CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Payments (abonos)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id uuid NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Lab results
CREATE TABLE IF NOT EXISTS lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  tests jsonb NOT NULL DEFAULT '[]',
  observations text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Health certificates
CREATE TABLE IF NOT EXISTS health_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  passport text,
  address text,
  export_to text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_certificates ENABLE ROW LEVEL SECURITY;

-- Policies: single-tenant, anon + authenticated full access
CREATE POLICY "anon_crud_clients" ON clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_patients" ON patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_services" ON services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_appointments" ON appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_debts" ON debts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_payments" ON payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_lab_results" ON lab_results FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_crud_health_certificates" ON health_certificates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_client_id ON patients(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_debts_client_id ON debts(client_id);
CREATE INDEX IF NOT EXISTS idx_debts_patient_id ON debts(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_certificates_patient_id ON health_certificates(patient_id);

-- Seed default services
INSERT INTO services (name, price, commission_type, commission_value) VALUES
  ('Consulta General', 25.00, 'percentage', 20),
  ('Vacunación', 15.00, 'percentage', 20),
  ('Baño y Corte', 20.00, 'fixed', 5),
  ('Baño Medicado', 25.00, 'percentage', 20),
  ('Corte de Uña', 10.00, 'percentage', 20),
  ('Exportación', 40.00, 'percentage', 0),
  ('Desparasitación', 12.00, 'percentage', 20),
  ('Cirugía Menor', 50.00, 'percentage', 20)
ON CONFLICT DO NOTHING;
