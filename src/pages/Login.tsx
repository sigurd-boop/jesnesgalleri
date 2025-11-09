import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import { useAuth } from '../context/AuthContext';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

const LoginPage = () => {
  const location = useLocation();
  const { user, isAdmin, login, loading, firebaseReady, initializationError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = (location.state as LocationState | null)?.from?.pathname ?? '/admin';

  if (!loading && user && isAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10">
      <header className="space-y-4">
        <Eyebrow>administrator</Eyebrow>
        <PageTitle>Logg inn for å administrere galleriet</PageTitle>
        <PageDescription>
          Skriv inn e-post og passord for en admin-bruker konfigurert i Firebase Authentication.
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
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition-opacity hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Logg inn
            </button>
          </form>
          <Muted className="text-xs">
            Tips: Bruk en dedikert admin-bruker i Firebase Authentication. Tilgangen begrenses i miljøvariabelen
            <code className="ml-1 rounded bg-slate-900/90 px-1 py-0.5 font-mono text-[0.6rem] text-white">
              VITE_FIREBASE_ADMIN_EMAILS
            </code>
            .
          </Muted>
        </Surface>
      )}
    </div>
  );
};

export default LoginPage;
