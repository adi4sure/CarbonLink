import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { CursorGlow, MagneticButton, ParallaxLayer } from '../components/ui/InteractiveElements';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiArrowRight } from 'react-icons/hi';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'eco_actor' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const handleGoogleCallback = useCallback(async (response) => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed.');
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, navigate]);

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
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          size: 'large',
          width: 400,
          text: 'signup_with',
        });
      }
    };
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch {} };
  }, [handleGoogleCallback]);

  const triggerGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google OAuth not configured. Add VITE_GOOGLE_CLIENT_ID to your .env.');
      return;
    }
    const realBtn = googleBtnRef.current?.querySelector('div[role="button"]');
    if (realBtn) { realBtn.click(); return; }
    window.google?.accounts?.id?.prompt?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

        <motion.div className="absolute w-[350px] h-[350px] rounded-full border border-cyan-500/10" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute w-[250px] h-[250px] rounded-full border border-sky-500/[0.06]" animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />

        <ParallaxLayer speed={0.02} className="relative z-10 text-center px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="text-6xl mb-8">🌱</div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              Go <span className="text-gradient-green">green</span>,<br />earn <span className="text-gradient">credits</span>.
            </h2>
            <p className="text-white/30 text-base leading-relaxed max-w-sm mx-auto">
              Plant trees, install solar, farm sustainably — and get rewarded for every verified eco-action.
            </p>
          </motion.div>

          <motion.div className="flex gap-5 mt-14 justify-center flex-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {['🌳 Plant', '☀️ Solar', '🌾 Farm', '♻️ Recycle'].map((item) => (
              <MagneticButton key={item} intensity={0.4}>
                <motion.div
                  className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 font-medium cursor-default"
                  whileHover={{ borderColor: 'rgba(14,165,233,0.3)', color: 'rgba(255,255,255,0.8)', y: -3 }}
                >
                  {item}
                </motion.div>
              </MagneticButton>
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
              Create account
            </h1>
            <p className="text-white/30 text-sm mb-10">Join CarbonLink and start earning carbon credits.</p>
          </motion.div>

          {/* Hidden real Google button */}
          <div ref={googleBtnRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', overflow: 'hidden', height: 0, width: 0 }} />

          {/* Google */}
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

          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20 uppercase tracking-[0.15em] font-semibold">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassInput label="Full Name" icon={HiOutlineUser} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoComplete="name" />
            <GlassInput label="Email" icon={HiOutlineMail} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
            <GlassInput label="Password" icon={HiOutlineLockClosed} type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" />

            {/* Role */}
            <div>
              <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-[0.1em] mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'eco_actor', label: '🌱 Eco Actor', desc: 'Farmer, Landowner' },
                  { value: 'buyer', label: '🏢 Buyer', desc: 'Company, NGO' },
                ].map((role) => (
                  <MagneticButton key={role.value} intensity={0.3}>
                    <motion.button
                      type="button"
                      className={`w-full rounded-xl p-4 text-left transition-all cursor-pointer border ${
                        form.role === role.value
                          ? 'border-sky-500/30 bg-sky-500/5'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                      onClick={() => setForm({ ...form, role: role.value })}
                      whileTap={{ scale: 0.97 }}
                      style={form.role === role.value ? { boxShadow: '0 0 20px rgba(14,165,233,0.08)' } : {}}
                    >
                      <span className="text-sm font-semibold text-white/85">{role.label}</span>
                      <p className="text-[11px] text-white/25 mt-0.5">{role.desc}</p>
                    </motion.button>
                  </MagneticButton>
                ))}
              </div>
            </div>

            {error && (
              <motion.div className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-xl py-3 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.div>
            )}

            <div className="pt-3">
              <GlassButton type="submit" variant="primary" fullWidth loading={loading} size="lg">
                Create Account <HiArrowRight size={16} />
              </GlassButton>
            </div>
          </motion.form>

          <p className="text-sm text-white/25 mt-10">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </motion.div>

        <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-sky-500/20 to-transparent" />
      </div>
    </div>
  );
}
