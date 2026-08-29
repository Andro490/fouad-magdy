import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Coaches & Tactics', path: '/products' },
  { label: 'Account Store', path: '/store' },
  { label: 'Creator Board', path: '/leaderboard' },
];

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway', error);
    }

    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <>
      {/* ── Top Bar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full h-16 bg-black/80 md:bg-[#030510]/80 backdrop-blur-md border-b border-white/10 fixed top-0 z-50 flex items-center justify-between px-5 md:px-10"
      >
        {/* Logo */}
        <Link to="/" className="text-2xl font-black text-white">
          FOUAD<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">F9</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          {navLinks.map(l => (
            <Link key={l.path} to={l.path} className="hover:text-blue-400 transition-colors">{l.label}</Link>
          ))}
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' || user?.role === 'SELLER'
                ? <Link to="/admin" className="text-green-400 hover:text-green-300 transition-colors">Admin Panel</Link>
                : <Link to="/dashboard" className="text-green-400 hover:text-green-300 transition-colors">Dashboard</Link>
              }
              <Link to="/dashboard" className="text-white px-4 border-r border-gray-700 hover:text-green-400 transition-colors">Hello, {user?.name}</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors">Logout</button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 bg-white hover:bg-gray-200 rounded-lg text-gray-900 font-bold transition-all">Login</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-lg bg-white/5 border border-white/10"
          aria-label="Open menu"
        >
          <span className="w-5 h-0.5 bg-white rounded-full" />
          <span className="w-5 h-0.5 bg-white rounded-full" />
          <span className="w-5 h-0.5 bg-white rounded-full" />
        </button>
      </motion.nav>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/70 z-[60] md:hidden"
            />

            {/* Sidebar panel */}
            <motion.div
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#0d0d0d] border-l border-white/10 z-[70] flex flex-col md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <span className="text-xl font-black text-white">
                  FOUAD<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">F9</span>
                </span>
                {/* X close button */}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
                {navLinks.map((l, i) => (
                  <motion.div
                    key={l.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1 }}
                  >
                    <Link
                      to={l.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-300 font-semibold hover:bg-white/5 hover:text-white transition-all"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Auth links */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1">
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'ADMIN' || user?.role === 'SELLER' ? (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-green-400 font-bold hover:bg-green-400/10 transition-all">
                          Admin Panel
                        </Link>
                      ) : (
                        <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-green-400 font-bold hover:bg-green-400/10 transition-all">
                          Dashboard
                        </Link>
                      )}
                      <div className="px-4 py-2 text-gray-400 text-sm">Hello, {user?.name}</div>
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 font-bold hover:bg-red-400/10 transition-all text-left">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMenuOpen(false)}
                      className="mx-4 py-3 bg-white text-gray-900 font-black rounded-xl text-center hover:bg-gray-200 transition-all">
                      Login
                    </Link>
                  )}
                </div>
              </nav>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10">
                <p className="text-gray-600 text-xs text-center">© FOUAD F9 2026</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
