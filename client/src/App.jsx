import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EcoActions from './pages/EcoActions';
import Wallet from './pages/Wallet';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';

// Layout
import GlassSidebar from './components/ui/GlassSidebar';
import GlassLoader from './components/ui/GlassLoader';

// Lazy-load 3D background for app pages
const AppBackground = lazy(() => import('./components/three/AppBackground'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="bg-cosmos min-h-screen flex items-center justify-center"><GlassLoader text="Authenticating..." /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  const { isOpen } = useSidebar();

  return (
    <div className="bg-cosmos min-h-screen relative">
      {/* WebGL particle background */}
      <Suspense fallback={null}>
        <AppBackground />
      </Suspense>
      <div className="orb orb-1 opacity-40" />
      <div className="orb orb-2 opacity-30" />
      <GlassSidebar />
      {/* Main content — shrinks/expands with sidebar */}
      <motion.main
        className="p-5 sm:p-6 lg:p-8 pt-6 pb-24 md:pb-8 min-h-screen relative z-10"
        initial={false}
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768
            ? (isOpen ? 260 : 72)
            : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 10, 46, 0.9)',
            backdropFilter: 'blur(20px)',
            color: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            fontSize: '14px',
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/eco-actions" element={<ProtectedRoute><AppLayout><EcoActions /></AppLayout></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><AppLayout><Wallet /></AppLayout></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </SidebarProvider>
  );
}
