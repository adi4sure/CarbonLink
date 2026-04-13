import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';

export default function GlassNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const isAuth = ['/login', '/register'].includes(location.pathname);

  if (!isLanding && !isAuth && !user) return null;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30, delay: 0.1 }}
    >
      <div className="mx-4 mt-4">
        <div className="rounded-2xl px-6 py-3 flex items-center justify-between max-w-6xl mx-auto border border-white/[0.04] bg-black/60 backdrop-blur-xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
              <span className="text-black font-black text-xs">CL</span>
            </div>
            <span className="text-white/90 font-bold text-base tracking-tight hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
              Carbon<span className="text-gradient">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isLanding && (
              <>
                <NavLink href="#features">Features</NavLink>
                <NavLink href="#how-it-works">How It Works</NavLink>
                <NavLink href="#impact">Impact</NavLink>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-glass text-sm py-2">Dashboard</Link>
                <button onClick={logout} className="btn-glass text-sm py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/50 hover:text-white/90 font-medium px-4 py-2 transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white/60 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            className="md:hidden rounded-2xl mt-2 p-4 max-w-6xl mx-auto border border-white/[0.04] bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {user ? (
              <div className="flex flex-col gap-2">
                <Link to="/dashboard" className="dock-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="dock-item text-left">Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="dock-item" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="px-4 py-2 text-sm text-white/40 hover:text-white/80 font-medium rounded-lg hover:bg-white/[0.04] transition-all duration-200"
    >
      {children}
    </a>
  );
}
