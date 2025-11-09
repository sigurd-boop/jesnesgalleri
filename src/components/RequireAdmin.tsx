import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Surface } from './Bits';

type RequireAdminProps = {
  children: ReactNode;
};

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { loading, user, isAdmin, firebaseReady, initializationError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Surface className="space-y-2 text-center text-sm text-slate-500">
        <p>Laster tilgang...</p>
      </Surface>
    );
  }

  if (!firebaseReady) {
    return (
      <Surface variant="subtle" className="space-y-4 border-dashed text-sm text-slate-600">
        <p>Firebase er ikke konfigurert. Oppdater miljøvariabler i Vite-prosjektet for å aktivere admin-panelet.</p>
        {initializationError ? <p className="font-mono text-xs text-slate-500">{initializationError.message}</p> : null}
      </Surface>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
