import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { CursorGlow, TiltCard, MagneticButton, ParallaxLayer } from '../components/ui/InteractiveElements';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  // Google callback — receives credential (ID token)
  const handleGoogleCallback = useCallback(async (response) => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.');
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, navigate]);

  // Initialize Google Identity Services with a hidden rendered button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render Google's official button into a hidden container.
      // We'll programmatically click it from our custom button.
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          size: 'large',
          width: 400,
          text: 'continue_with',
        });
        setGoogleReady(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, [handleGoogleCallback]);

  // Custom button click → forward to the real hidden Google button
  const triggerGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }

    // Try to click the real Google button (rendered inside the hidden ref)
    const realBtn = googleBtnRef.current?.querySelector('div[role="button"]');
    if (realBtn) {
      realBtn.click();
      return;
    }

    // Fallback: try One Tap prompt
    window.google?.accounts?.id?.prompt?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@carbonlink.io', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Make sure the backend & database are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex">
      <CursorGlow />

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <div className="orb orb-1" />
        <div className="orb orb-3" />
        <div className="grid-pattern" />

        {/* Rotating rings */}
        <motion.div className="absolute w-[400px] h-[400px] rounded-full border border-sky-500/10" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/[0.06]" animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }} />

        <ParallaxLayer speed={0.02} className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-sky-500/30">
              <span className="text-black font-black text-3xl tracking-tight">CL</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Carbon<span className="text-gradient">Link</span>
            </h2>
            <p className="text-white/30 text-base leading-relaxed max-w-sm mx-auto">
              The decentralized platform turning real-world eco-actions into verified carbon credits.
            </p>
          </motion.div>

          <motion.div className="flex gap-8 mt-14 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {[
              { v: '12K+', l: 'Credits' },
              { v: '274T', l: 'CO₂ Offset' },
              { v: '2.4K', l: 'Users' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-bold text-gradient">{s.v}</p>
                <p className="text-[10px] text-white/25 uppercase tracking-wider mt-1.5 font-semibold">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </ParallaxLayer>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 relative">
        <div className="orb orb-4 lg:hidden" />

        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 25 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <span className="text-black font-black text-lg">CL</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Carbon<span className="text-gradient">Link</span>
            </span>
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome back
            </h1>
            <p className="text-white/30 text-sm mb-10">Sign in to continue to your dashboard.</p>
          </motion.div>

          {/* Hidden real Google button container */}
          <div
            ref={googleBtnRef}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
              height: 0,
              width: 0,
            }}
          />

          {/* Google — custom styled button that triggers the real one */}
          <MagneticButton className="w-full" intensity={0.15}>
            <motion.button
              className="btn-google mb-7"
              onClick={triggerGoogleLogin}
              disabled={googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {googleLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              <span className="font-semibold">Continue with Google</span>
            </motion.button>
          </MagneticButton>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20 uppercase tracking-[0.15em] font-semibold">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassInput label="Email" icon={HiOutlineMail} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
            <GlassInput label="Password" icon={HiOutlineLockClosed} type="password" placeholder="Enter password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />

            {error && (
              <motion.div className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-xl py-3 px-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {error}
              </motion.div>
            )}

            <div className="space-y-3 pt-3">
              <GlassButton type="submit" variant="primary" fullWidth loading={loading} size="lg">
                Sign In
              </GlassButton>
              <GlassButton type="button" variant="glass" fullWidth onClick={handleDemo}>
                <HiOutlineSparkles size={16} />
                Try Demo Account
              </GlassButton>
            </div>
          </motion.form>

          <p className="text-sm text-white/25 mt-10">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">Sign up free</Link>
          </p>
        </motion.div>

        <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-sky-500/20 to-transparent" />
      </div>
    </div>
  );
}
