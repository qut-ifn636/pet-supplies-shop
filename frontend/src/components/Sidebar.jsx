import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '⊞' },
  { to: '/products',   label: 'Products',   icon: '📦' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/users',      label: 'Users',      icon: '👥' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to) =>
    pathname === to || (to !== '/dashboard' && pathname.startsWith(to));

  const linkClass = (to) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive(to)
        ? 'bg-teal-700 text-teal-50 font-semibold'
        : 'text-teal-300 hover:bg-teal-800 hover:text-teal-50'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-teal-800">
        <span className="text-teal-50 font-bold text-base tracking-tight">🐾 Petopia Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-teal-500 uppercase tracking-widest">Menu</p>
        {navLinks.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={linkClass(to)} onClick={() => setOpen(false)}>
            <span>{icon}</span> {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-teal-800 space-y-1">
        <Link to="/profile" className={linkClass('/profile')} onClick={() => setOpen(false)}>
          <span>👤</span> Profile
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-teal-800 hover:text-rose-200 transition-colors"
        >
          <span>⎋</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 bg-teal-900 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-teal-900 px-4 py-3 flex items-center justify-between shadow-md">
        <span className="text-teal-50 font-bold text-sm">🐾 Petopia Admin</span>
        <button
          onClick={() => setOpen(true)}
          className="text-teal-200 hover:text-teal-50 focus:outline-none"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-52 bg-teal-900 flex flex-col h-full shadow-xl">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
        </div>
      )}
    </>
  );
};

export default Sidebar;
