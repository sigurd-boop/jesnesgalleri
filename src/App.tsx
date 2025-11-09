import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import GalleryPage from './pages/Gallery';
import ContactPage from './pages/Contact';
import GithubPage from './pages/Github';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { cn } from './lib/cn';
import RequireAdmin from './components/RequireAdmin';
import { ADMIN_LOGIN_PATH, ADMIN_ROUTE_PATH } from './lib/adminRoutes';
import LogoSpinner from './components/LogoSpinner';

type InternalNavItem = {
  type: 'internal';
  to: string;
  label: string;
};

type ExternalNavItem = {
  type: 'external';
  href: string;
  label: string;
};

const navItems: Array<InternalNavItem | ExternalNavItem> = [
  { to: '/', label: 'Galleri', type: 'internal' },
  { to: '/kontakt', label: 'Kontakt', type: 'internal' },
  { to: '/github', label: 'GitHub', type: 'internal' },
  { href: 'https://jesnesgalleri.bigcartel.com', label: 'Butikk', type: 'external' },
];

const App = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-slate-100/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <LogoSpinner />
            <span className="text-xl font-semibold tracking-tight text-slate-900">Jesnes Galleri</span>
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) =>
              item.type === 'internal' ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-slate-500 transition-colors duration-200',
                      isActive ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10' : 'hover:text-slate-900',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-220px)] max-w-6xl px-6 py-16">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/github" element={<GithubPage />} />
          <Route
            path={ADMIN_ROUTE_PATH}
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route path={ADMIN_LOGIN_PATH} element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-white/70 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs uppercase tracking-[0.35em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jesnes Galleri</p>
          <p>Bygget med React · TypeScript · Tailwind</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
