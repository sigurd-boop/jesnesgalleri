import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import GalleryPage from './pages/Gallery';
import ContactPage from './pages/Contact';
import GithubPage from './pages/Github';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { cn } from './lib/cn';
import RequireAdmin from './components/RequireAdmin';

const navItems = [
  { to: '/', label: 'Galleri' },
  { to: '/kontakt', label: 'Kontakt' },
  { to: '/github', label: 'GitHub' },
  { to: '/admin', label: 'Admin' },
];

const App = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-slate-100/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="text-xl font-semibold tracking-tight text-slate-900">
            Jesnes Galleri
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-slate-500 transition-colors duration-200',
                    isActive ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10' : 'hover:text-slate-900',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-220px)] max-w-6xl px-6 py-16">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/github" element={<GithubPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route path="/admin/login" element={<LoginPage />} />
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
