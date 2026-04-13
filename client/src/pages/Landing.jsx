import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiArrowRight, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';

// Lazy-load the heavy 3D scene
const CarbonScene = lazy(() => import('../components/three/CarbonScene'));

const sceneLabels = ['Home', 'Features', 'Process', 'Impact', 'Join'];

/**
 * AnimatedCounter — number counts up when visible
 */
function AnimatedCounter({ value, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));

  useEffect(() => {
    let start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // EaseOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      start = Math.floor(numericValue * eased);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), 500);
    return () => clearTimeout(timer);
  }, [numericValue, duration]);

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/**
 * TypewriterText — types itself out character by character
 */
function TypewriterText({ texts, className = '' }) {
  const [currentTextIdx, setCurrentTextIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIdx];
    const speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(text.substring(0, displayText.length + 1));
        if (displayText.length === text.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(text.substring(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setCurrentTextIdx((prev) => (prev + 1) % texts.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentTextIdx, texts]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse text-sky-400">|</span>
    </span>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [currentScene, setCurrentScene] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const scrollCooldown = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSceneChange = useCallback((scene) => {
    if (scrollCooldown.current) return;
    scrollCooldown.current = true;
    setCurrentScene(scene);
    // Debounce — prevent rapid scene switching for smooth feel
    setTimeout(() => { scrollCooldown.current = false; }, 800);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* ─── 3D WEBGL SCENE (full screen canvas) ─── */}
      <Suspense fallback={
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-cyan-500/10 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-white/30 text-sm mt-6 font-medium tracking-wider">LOADING EXPERIENCE</p>
          <div className="mt-3 w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </div>
        </div>
      }>
        <CarbonScene onSceneChange={handleSceneChange} />
      </Suspense>

      {/* ─── 2D HUD OVERLAY ─── */}
      <AnimatePresence>
        {showUI && (
          <>
            {/* TOP BAR — Logo + Nav */}
            <motion.header
              className="fixed top-0 left-0 right-0 z-30 px-6 py-4"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group" id="landing-logo">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/50 transition-all duration-300">
                    <span className="text-black font-black text-xs">CL</span>
                  </div>
                  <span className="text-white/90 font-bold text-lg tracking-tight hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
                    Carbon<span className="text-gradient">Link</span>
                  </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-4">
                  {user ? (
                    <Link to="/dashboard" className="btn-primary text-sm py-2 px-5" id="landing-dashboard-btn">
                      Dashboard <HiArrowRight size={16} />
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="text-sm text-white/40 hover:text-white/80 font-medium transition-colors hidden sm:block" id="landing-signin">
                        Sign In
                      </Link>
                      <Link to="/register" className="btn-primary text-sm py-2 px-5" id="landing-getstarted">
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.header>

            {/* SCENE INDICATOR DOTS — Right side */}
            <motion.div
              className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {sceneLabels.map((label, i) => (
                <button
                  key={label}
                  onClick={() => handleSceneChange(i)}
                  className="group flex items-center gap-3 justify-end"
                  id={`scene-dot-${i}`}
                >
                  <span className={`text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                    currentScene === i ? 'text-sky-400 opacity-100' : 'text-white/0 group-hover:text-white/40 opacity-0 group-hover:opacity-100'
                  }`}>
                    {label}
                  </span>
                  <div className={`transition-all duration-300 rounded-full ${
                    currentScene === i
                      ? 'w-2.5 h-2.5 bg-sky-400 shadow-lg shadow-sky-400/50'
                      : 'w-1.5 h-1.5 bg-white/20 group-hover:bg-white/40'
                  }`} />
                </button>
              ))}
            </motion.div>

            {/* HERO CONTENT — Center overlay (only on scene 0) */}
            <AnimatePresence mode="wait">
              {currentScene === 0 && (
                <motion.div
                  key="hero"
                  className="fixed inset-0 z-20 flex items-start justify-center pt-[10vh] pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-center max-w-4xl px-6 pointer-events-auto" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                    {/* Badge */}
                    <motion.div
                      className="inline-flex items-center gap-2.5 border border-white/[0.08] rounded-full px-5 py-2 mb-8 bg-black/40 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50 animate-pulse" />
                      <span className="text-xs text-white/50 font-semibold tracking-wider">DECENTRALIZED CARBON CREDITS</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] leading-[0.9] mb-6"
                      style={{ fontFamily: 'var(--font-display)' }}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, type: 'spring', stiffness: 60 }}
                    >
                      <span className="text-gradient-hero">Measure.</span>
                      <br />
                      <span className="text-gradient-hero">Verify. </span>
                      <span className="text-gradient">
                        <TypewriterText texts={['Monetize.', 'Earn.', 'Impact.']} />
                      </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                      className="text-base sm:text-lg text-white/50 max-w-lg mx-auto mb-10 leading-relaxed font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                    >
                      Transform eco-actions into verified carbon credits.
                      Plant trees, farm sustainably, go solar — and earn real value.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                      className="flex flex-col sm:flex-row items-center justify-center gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                    >
                      <Link to="/register">
                        <motion.button
                          className="btn-primary text-base px-8 py-3.5 rounded-xl font-bold"
                          whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(14,165,233,0.5)' }}
                          whileTap={{ scale: 0.97 }}
                          id="hero-cta-register"
                        >
                          Start Earning <HiArrowRight size={18} />
                        </motion.button>
                      </Link>
                      <Link to="/login">
                        <motion.button
                          className="btn-glass text-base px-8 py-3.5 rounded-xl backdrop-blur-sm"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          id="hero-cta-login"
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    </motion.div>

                    {/* Animated Stats */}
                    <motion.div
                      className="flex justify-center gap-12 sm:gap-20 mt-16"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 }}
                    >
                      {[
                        { value: 12450, suffix: '+', label: 'Credits Issued' },
                        { value: 820, suffix: 'K', label: 'Value Traded (₹)' },
                        { value: 274, suffix: 'T', label: 'CO₂ Offset' },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <p className="text-2xl sm:text-3xl font-black text-gradient tabular-nums">
                            <AnimatedCounter value={s.value} suffix={s.suffix} />
                          </p>
                          <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] mt-2 font-semibold">{s.label}</p>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* FEATURES OVERLAY (scene 1) */}
              {currentScene === 1 && (
                <motion.div
                  key="features"
                  className="fixed inset-0 z-20 flex items-center pointer-events-none"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="ml-8 sm:ml-16 max-w-md pointer-events-auto">
                    <span className="text-[10px] text-sky-400/80 uppercase tracking-[0.25em] font-bold mb-4 block">Platform Features</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                      Everything to <span className="text-gradient">go green</span>
                    </h2>
                    <div className="space-y-3">
                      {[
                        { icon: '⚡', title: 'AI Verification', desc: 'Photo analysis, GPS validation, CO₂ estimation' },
                        { icon: '🪙', title: 'Instant Credits', desc: '1 CLC = 1 kg CO₂ offset. Mint instantly.' },
                        { icon: '🌍', title: 'Global Marketplace', desc: 'P2P trading with transparent pricing' },
                        { icon: '📊', title: 'Live Analytics', desc: 'Track impact and earnings in real-time' },
                      ].map((f, i) => (
                        <motion.div
                          key={f.title}
                          className="flex items-start gap-4 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/[0.06] hover:border-sky-500/20 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <span className="text-xl mt-0.5">{f.icon}</span>
                          <div>
                            <h3 className="text-sm font-bold text-white/85">{f.title}</h3>
                            <p className="text-xs text-white/35 mt-0.5">{f.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* HOW IT WORKS OVERLAY (scene 2) */}
              {currentScene === 2 && (
                <motion.div
                  key="process"
                  className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="max-w-2xl px-6 pointer-events-auto">
                    <div className="text-center mb-10">
                      <span className="text-[10px] text-emerald-400/80 uppercase tracking-[0.25em] font-bold mb-3 block">How It Works</span>
                      <h2 className="text-3xl sm:text-4xl font-black text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
                        Action → <span className="text-gradient-green">Income</span>
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { step: '01', title: 'Perform Eco-Action', desc: 'Plant trees, install solar, farm sustainably', emoji: '🌱' },
                        { step: '02', title: 'Upload Proof', desc: 'Photos with GPS timestamps for verification', emoji: '📸' },
                        { step: '03', title: 'AI Verification', desc: 'Algorithms verify and estimate CO₂ offset', emoji: '🤖' },
                        { step: '04', title: 'Earn & Trade', desc: 'Receive CLC tokens, trade on marketplace', emoji: '💰' },
                      ].map((s, i) => (
                        <motion.div
                          key={s.step}
                          className="p-5 rounded-xl bg-black/50 backdrop-blur-md border border-white/[0.06] hover:border-emerald-500/20 transition-colors relative overflow-hidden"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.12 }}
                        >
                          <div className="absolute top-3 right-3 text-5xl font-black text-white/[0.03]" style={{ fontFamily: 'var(--font-display)' }}>{s.step}</div>
                          <span className="text-2xl">{s.emoji}</span>
                          <h3 className="text-sm font-bold text-white/85 mt-3">{s.title}</h3>
                          <p className="text-xs text-white/35 mt-1">{s.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* IMPACT OVERLAY (scene 3) */}
              {currentScene === 3 && (
                <motion.div
                  key="impact"
                  className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-center max-w-lg px-6 pointer-events-auto">
                    <span className="text-[10px] text-cyan-400/80 uppercase tracking-[0.25em] font-bold mb-4 block">Global Impact</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white/90 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
                      Making the world <span className="text-gradient">greener</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { value: 45200, suffix: '+', label: 'Trees Planted', icon: '🌳' },
                        { value: 274, suffix: 'T', label: 'CO₂ Offset', icon: '💨' },
                        { value: 1250, suffix: '+', label: 'Active Users', icon: '👥' },
                        { value: 89, suffix: '%', label: 'Verified Rate', icon: '✅' },
                      ].map((s, i) => (
                        <motion.div
                          key={s.label}
                          className="p-5 rounded-xl bg-black/50 backdrop-blur-md border border-white/[0.06]"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <span className="text-2xl">{s.icon}</span>
                          <p className="text-2xl font-black text-gradient mt-2">
                            <AnimatedCounter value={s.value} suffix={s.suffix} />
                          </p>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1 font-semibold">{s.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTA OVERLAY (scene 4) */}
              {currentScene === 4 && (
                <motion.div
                  key="cta"
                  className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-center max-w-lg px-6 pointer-events-auto">
                    <h2 className="text-4xl sm:text-5xl font-black text-white/90 mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                      Ready to make an <span className="text-gradient">impact</span>?
                    </h2>
                    <p className="text-white/30 mb-8 text-sm">
                      Join thousands of eco-actors earning carbon credits on CarbonLink.
                    </p>
                    <Link to="/register">
                      <motion.button
                        className="btn-primary text-lg px-10 py-4 rounded-xl font-bold"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(14,165,233,0.5)' }}
                        whileTap={{ scale: 0.97 }}
                        id="cta-register"
                      >
                        Create Free Account <HiArrowRight size={20} />
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BOTTOM BAR — Scroll hint */}
            <motion.div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="flex flex-col items-center gap-2"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">Scroll to explore</span>
                <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
                  <motion.div
                    className="w-1 h-1.5 rounded-full bg-sky-400/50"
                    animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Scene title indicator */}
            <motion.div
              className="fixed bottom-6 left-6 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentScene}
                  className="text-[10px] text-white/15 uppercase tracking-[0.3em] font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {sceneLabels[currentScene]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
