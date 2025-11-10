import { useEffect, useRef, useState } from 'react';
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
  { to: '/', label: 'Gallery', type: 'internal' },
  { to: '/contact', label: 'Contact', type: 'internal' },
  { to: '/github', label: 'GitHub', type: 'internal' },
  { href: 'https://jesnesgalleri.bigcartel.com', label: 'Shop', type: 'external' },
];

const App = () => {
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const isMobile = window.innerWidth < 640;

      if (!isMobile) {
        setHeaderHidden(false);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY > lastScrollY.current + 8 && currentY > 80) {
        setHeaderHidden(true);
      } else if (currentY < lastScrollY.current - 8) {
        setHeaderHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <header
        className={cn(
          'sticky top-0 z-30 border-b border-white/60 bg-slate-100/90 backdrop-blur-sm shadow-[0_6px_18px_-14px_rgba(15,23,42,0.55)] supports-[backdrop-filter]:backdrop-blur transition-transform duration-300 ease-out lg:static',
          headerHidden ? '-translate-y-full opacity-0 pointer-events-none sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto' : 'translate-y-0 opacity-100',
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 lg:gap-6">
          <NavLink
            to="/"
            className="flex w-full flex-col items-center sm:flex sm:flex-1 sm:min-w-0 sm:items-center sm:justify-start sm:gap-4"
            aria-label="Jesnes Gallery home"
          >
            <LogoSpinner />
          </NavLink>
          <nav
            className={cn(
              'grid w-full grid-cols-2 gap-2 overflow-hidden text-center transition-all duration-300 ease-out sm:flex sm:flex-1 sm:min-w-0 sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 sm:overflow-visible',
              headerHidden ? 'max-h-0 opacity-0 pointer-events-none sm:max-h-none sm:opacity-100 sm:pointer-events-auto' : 'max-h-24 opacity-100',
            )}
          >
            {navItems.map((item) =>
              item.type === 'internal' ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-slate-500 transition-all duration-200 sm:text-[0.7rem]',
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
                  className="rounded-full border border-slate-200 px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-slate-500 transition-all duration-200 hover:border-slate-300 hover:text-slate-900 sm:text-[0.7rem]"
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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/kontakt" element={<Navigate to="/contact" replace />} />
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
          <p>© {new Date().getFullYear()} Jesnes Gallery</p>
          <p>Crafted with React · TypeScript · Tailwind</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
