import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { 
  HiOutlineViewGrid, 
  HiOutlineLightningBolt, 
  HiOutlineCreditCard,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineChevronLeft,
  HiOutlineFire,
  HiOutlineGlobeAlt,
  HiOutlineTrendingUp,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/eco-actions', label: 'Eco Actions', icon: HiOutlineLightningBolt },
  { path: '/wallet', label: 'Wallet', icon: HiOutlineCreditCard },
  { path: '/marketplace', label: 'Marketplace', icon: HiOutlineShoppingCart },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

/* ─── Circular Progress Ring ────────────────────────── */
function ProgressRing({ value, max, size = 44, strokeWidth = 3.5, color = '#0ea5e9' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ─── Live CO₂ Counter ──────────────────────────────── */
function LiveCounter() {
  const [count, setCount] = useState(274.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + (Math.random() * 0.02));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return count.toFixed(1);
}

/* ─── Daily Eco Tips ────────────────────────────────── */
const ecoTips = [
  { tip: 'Switch to LED bulbs to save 75% electricity', icon: '💡' },
  { tip: 'A single tree absorbs ~22kg of CO₂ per year', icon: '🌳' },
  { tip: 'Composting reduces methane by up to 50%', icon: '♻️' },
  { tip: 'Solar panels offset 1.5 tonnes CO₂ per year', icon: '☀️' },
  { tip: 'Walking 5km saves 1.2kg of CO₂ vs driving', icon: '🚶' },
  { tip: 'Reusable bags eliminate 500 plastic bags/year', icon: '🛍️' },
  { tip: 'Cold water laundry saves 90% of washing energy', icon: '🧺' },
];

/* ─── Mini Leaderboard ──────────────────────────────── */
const leaderboard = [
  { rank: 1, name: 'GreenEarth NGO', score: '12.4K', medal: '🥇' },
  { rank: 2, name: 'SolarTech Ltd', score: '8.7K', medal: '🥈' },
  { rank: 3, name: 'Rajesh Kumar', score: '5.2K', medal: '🥉' },
];

export default function GlassSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isOpen, toggle } = useSidebar();

  // Rotate tip of the day
  const tipIndex = useMemo(() => {
    const day = new Date().getDate();
    return day % ecoTips.length;
  }, []);
  const currentTip = ecoTips[tipIndex];

  // Simulated streak
  const streak = 12;
  const monthlyGoal = { current: 342, target: 500 };
  const goalPct = Math.round((monthlyGoal.current / monthlyGoal.target) * 100);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 dock flex-col z-40"
        initial={false}
        animate={{ width: isOpen ? 260 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ overflow: 'hidden' }}
      >
        {/* Header — Logo + Collapse toggle */}
        <div className="px-4 py-5 border-b border-white/[0.06] flex items-center justify-between gap-2">
          <NavLink to="/" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="text-white/90 font-semibold text-lg tracking-tight">
                    Carbon<span className="text-gradient">Link</span>
                  </span>
                  <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">Carbon Credits</p>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all shrink-0"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <HiOutlineChevronLeft size={18} /> : <HiOutlineMenuAlt2 size={18} />}
          </button>
        </div>

        {/* ─── Monthly Goal Ring ─────────────────────── */}
        <div className={`px-3 py-3 border-b border-white/[0.06] ${!isOpen ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : 'px-2'}`}>
            <div className="relative shrink-0">
              <ProgressRing value={monthlyGoal.current} max={monthlyGoal.target} size={isOpen ? 44 : 38} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-sky-400">
                {goalPct}%
              </span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-xs font-medium text-white/70">Monthly Goal</p>
                  <p className="text-[10px] text-white/35">{monthlyGoal.current}/{monthlyGoal.target} CLC</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence>
            {isOpen && (
              <motion.p
                className="text-[10px] font-semibold text-white/25 uppercase tracking-wider px-3 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Platform
              </motion.p>
            )}
          </AnimatePresence>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={!isOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                } ${!isOpen ? 'justify-center' : ''}`}
              >
                <item.icon size={20} className="shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}

          {/* ─── Streak Badge ─────────────────────────── */}
          <div className={`mt-3 ${!isOpen ? 'flex justify-center' : ''}`}>
            <AnimatePresence>
              {isOpen && (
                <motion.p
                  className="text-[10px] font-semibold text-white/25 uppercase tracking-wider px-3 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Activity
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div
              className={`rounded-xl transition-all ${isOpen
                ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/15 px-3 py-2.5'
                : 'flex justify-center py-2'
              }`}
              whileHover={{ scale: 1.02 }}
              title={!isOpen ? `${streak} day streak` : undefined}
            >
              <div className={`flex items-center gap-2 ${!isOpen ? 'justify-center' : ''}`}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <HiOutlineFire size={isOpen ? 18 : 20} className="text-amber-400 shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      <span className="text-sm font-semibold text-amber-400">{streak} Day Streak</span>
                      <p className="text-[10px] text-white/30">Keep it going! 🔥</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ─── Live Global Impact ───────────────────── */}
          <div className={`mt-2 ${!isOpen ? 'flex justify-center' : ''}`}>
            <motion.div
              className={`rounded-xl transition-all ${isOpen
                ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 px-3 py-2.5'
                : 'flex justify-center py-2'
              }`}
              title={!isOpen ? 'Global CO₂ offset' : undefined}
            >
              <div className={`flex items-center gap-2 ${!isOpen ? 'justify-center' : ''}`}>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                >
                  <HiOutlineGlobeAlt size={isOpen ? 18 : 20} className="text-emerald-400 shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-emerald-400"><LiveCounter /></span>
                        <span className="text-[10px] text-white/35">T CO₂</span>
                      </div>
                      <p className="text-[10px] text-white/30">Global offset (live)</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ─── Mini Leaderboard ─────────────────────── */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider px-3 mb-2">
                  Top Contributors
                </p>
                <div className="space-y-1">
                  {leaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.rank}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <span className="text-sm shrink-0">{entry.medal}</span>
                      <span className="text-xs text-white/50 truncate flex-1">{entry.name}</span>
                      <span className="text-xs font-semibold text-white/70 shrink-0">{entry.score}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Daily Eco Tip ────────────────────────── */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider px-3 mb-2 flex items-center gap-1">
                  <HiOutlineSparkles size={10} /> Tip of the Day
                </p>
                <motion.div
                  className="rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/15 px-3 py-2.5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0 mt-0.5">{currentTip.icon}</span>
                    <p className="text-[11px] text-white/55 leading-relaxed">{currentTip.tip}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          {user && (
            <div className={`flex items-center gap-3 px-3 mb-3 ${!isOpen ? 'justify-center' : ''}`}>
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {/* Online indicator */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0a2e]" />
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="min-w-0 overflow-hidden"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-white/80 truncate">{user.name}</p>
                      <span className="text-[8px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">PRO</span>
                    </div>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button
            onClick={logout}
            title={!isOpen ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all ${!isOpen ? 'justify-center' : ''}`}
          >
            <HiOutlineLogout size={20} className="shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile bottom bar */}
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        <div className="mx-3 mb-3">
          <div className="glass rounded-2xl px-2 py-2 flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                    isActive 
                      ? 'text-sky-400 bg-sky-500/15' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}
