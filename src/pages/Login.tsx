import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROUTE_PATH } from '../lib/adminRoutes';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const LoginPage = () => {
  const location = useLocation();
  const { user, isAdmin, login, resetPassword, loading, firebaseReady, initializationError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const redirectPath = (location.state as LocationState | null)?.from?.pathname ?? ADMIN_ROUTE_PATH;

  if (!loading && user && isAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResetMessage(null);

    try {
      await login(email, password);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Kunne ikke logge inn. Prøv igjen senere.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Skriv inn e-posten din først for å motta tilbakestillingslenken.');
      return;
    }
    setError(null);
    setResetMessage(null);
    setResetting(true);
    try {
      await resetPassword(email);
      setResetMessage('Vi sendte en lenke for å tilbakestille passordet til adressen du oppga.');
    } catch (resetError) {
      const message =
        resetError instanceof Error
          ? resetError.message
          : 'Kunne ikke sende tilbakestillingslenken. Prøv igjen senere.';
      setError(message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10">
      <header className="space-y-4">
        <Eyebrow>administrator</Eyebrow>
        <PageTitle>Logg inn for å administrere galleriet</PageTitle>
        <PageDescription>
          Skriv inn e-post og passord for å få tilgang.
        </PageDescription>
      </header>

      {!firebaseReady ? (
        <Surface variant="subtle" className="space-y-4 border-dashed text-sm text-slate-600">
          <p>Firebase er ikke konfigurert. Legg til miljøvariabler i prosjektet for å aktivere innlogging.</p>
          {initializationError ? (
            <p className="font-mono text-xs text-slate-500">{initializationError.message}</p>
          ) : null}
          <ButtonLink href="https://firebase.google.com/docs/web/setup" tone="neutral">
            Veiledning for Firebase
          </ButtonLink>
        </Surface>
      ) : (
        <Surface className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">E-post</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Passord</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              />
            </label>
            {error ? <Muted className="text-xs text-rose-600">{error}</Muted> : null}
            {resetMessage ? <Muted className="text-xs text-emerald-600">{resetMessage}</Muted> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-opacity hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Logg inn
            </button>
          </form>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetting}
            className="w-full text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Glemte passordet?
          </button>
        </Surface>
      )}
    </div>
  );
};

export default LoginPage;
