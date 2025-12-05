import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import GalleryPage from './pages/Gallery';
import ContactPage from './pages/Contact';
import GithubPage from './pages/Github';
import ShopPage from './pages/Shop';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { cn } from './lib/cn';
import RequireAdmin from './components/RequireAdmin';
import { ADMIN_LOGIN_PATH, ADMIN_ROUTE_PATH } from './lib/adminRoutes';
import LogoSpinner from './components/LogoSpinner';
import './styles/header-hero.css';

const navItems = [
  { to: '/', label: 'Gallery', type: 'internal' },
  { to: '/shop', label: 'Shop', type: 'internal' },
  { to: '/contact', label: 'Contact', type: 'internal' },
  { to: '/github', label: 'GitHub', type: 'internal' },
];

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="header-with-bg relative z-20 border-b border-white/60 bg-slate-100/95 backdrop-blur-sm shadow-[0_6px_18px_-14px_rgba(15,23,42,0.55)] supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-0 px-4 py-1 sm:px-6 sm:py-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <LogoSpinner />
          </button>
          <nav className="grid w-full grid-cols-2 gap-1.5 text-center text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 sm:flex sm:flex-1 sm:flex-wrap sm:items-center sm:justify-center sm:gap-2 sm:text-[0.7rem] sm:tracking-[0.35em]">
            {navItems.map((item) =>
              item.type === 'internal' ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-3 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.3em] text-slate-500 transition-all duration-200 sm:px-4 sm:py-2 sm:text-[0.7rem] sm:tracking-[0.35em]',
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                        : 'hover:text-slate-900'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ) : null
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-220px)] max-w-6xl px-6 pt-40 sm:pt-28 lg:pt-24 pb-16">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/kontakt" element={<Navigate to="/contact" replace />} />
          <Route path="/github" element={<GithubPage />} />
          <Route path="/shop" element={<ShopPage />} />
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
          <p>© {new Date().getFullYear()} Jesnes Gallery</p>
          <p>Gallery</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
