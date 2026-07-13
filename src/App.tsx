import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout, { type ActiveView } from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientsModule from './components/clients/ClientsListModule';
import ServicesList from './components/services/ServicesList';
import BillingModule from './components/billing/BillingModule';
import AppointmentsModule from './components/appointments/AppointmentsModule';

function AppInner() {
  const [view, setView] = useState<ActiveView>('dashboard');

  function renderView() {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <AppointmentsModule />;
      case 'clients':
        return <ClientsModule />;
      case 'services':
        return <ServicesList />;
      case 'billing':
        return <BillingModule />;
    }
  }

  return (
    <Layout active={view} onNavigate={setView}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
