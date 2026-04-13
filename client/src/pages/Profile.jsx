import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Cell,
} from 'recharts';
import {
  HiOutlineMail, HiOutlineUser, HiOutlineShieldCheck,
  HiOutlineClock, HiOutlineFire, HiOutlineStar,
} from 'react-icons/hi';

/* ──────────────────────────────────────────────
   GitHub-style Contribution Graph
   ────────────────────────────────────────────── */
function ContributionGraph() {
  const weeks = 52;
  const days = 7;
  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate random but deterministic-looking contribution data
  const data = useMemo(() => {
    const result = [];
    const seed = 42;
    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < days; d++) {
        // Simulate more activity in recent weeks and weekdays
        const recencyBoost = w / weeks;
        const weekdayBoost = d < 5 ? 0.3 : 0;
        const rand = Math.sin(seed + w * 7 + d * 13) * 0.5 + 0.5;
        const level = Math.floor((rand + recencyBoost + weekdayBoost) * 2.5);
        week.push(Math.min(level, 4));
      }
      result.push(week);
    }
    return result;
  }, []);

  const totalContributions = data.flat().reduce((s, v) => s + v, 0);

  const getColor = (level) => {
    const colors = [
      'rgba(255,255,255,0.04)',  // 0 - empty
      'rgba(14,165,233,0.25)',   // 1 - low
      'rgba(14,165,233,0.45)',   // 2 - med
      'rgba(14,165,233,0.7)',    // 3 - high
      'rgba(14,165,233,1)',      // 4 - max
    ];
    return colors[level] || colors[0];
  };

  // Compute month label positions
  const monthPositions = useMemo(() => {
    const positions = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + w * 7);
      const month = d.getMonth();
      if (month !== lastMonth) {
        positions.push({ week: w, label: monthLabels[month] });
        lastMonth = month;
      }
    }
    return positions;
  }, []);

  const cellSize = 12;
  const cellGap = 3;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white/80">Contribution Activity</h3>
          <p className="text-xs text-white/35">{totalContributions} eco-contributions in the last year</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(l => (
            <span
              key={l}
              className="rounded-sm"
              style={{
                width: cellSize,
                height: cellSize,
                background: getColor(l),
                display: 'inline-block',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: weeks * (cellSize + cellGap) + 40 }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: 32 }}>
            {monthPositions.map((mp, i) => (
              <span
                key={i}
                className="text-[10px] text-white/25 absolute"
                style={{
                  position: 'relative',
                  left: mp.week * (cellSize + cellGap) - (i > 0 ? monthPositions[i - 1].week * (cellSize + cellGap) : 0) - (i > 0 ? 0 : 0),
                  width: 'max-content',
                  marginRight: 'auto',
                }}
              >
                {mp.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col mr-2" style={{ gap: cellGap }}>
              {dayLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-[10px] text-white/25 flex items-center justify-end"
                  style={{ height: cellSize, width: 24 }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: cellGap }}>
              {data.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: cellGap }}>
                  {week.map((level, di) => (
                    <motion.div
                      key={`${wi}-${di}`}
                      className="rounded-sm cursor-pointer"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        background: getColor(level),
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: wi * 0.008 + di * 0.003, duration: 0.15 }}
                      whileHover={{ scale: 1.4, boxShadow: '0 0 8px rgba(14,165,233,0.5)' }}
                      title={`${level} eco-action${level !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Profile Page
   ────────────────────────────────────────────── */

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
};

const actionBreakdown = [
  { type: 'Trees', count: 45, co2: 990, color: '#10b981' },
  { type: 'Solar', count: 3, co2: 4500, color: '#f59e0b' },
  { type: 'Farming', count: 8, co2: 2936, color: '#8b5cf6' },
  { type: 'Compost', count: 12, co2: 600, color: '#06b6d4' },
  { type: 'Wind', count: 2, co2: 1000, color: '#ec4899' },
  { type: 'Reforest', count: 5, co2: 1750, color: '#6366f1' },
];

const skillRadar = [
  { skill: 'Tree Planting', value: 90 },
  { skill: 'Solar', value: 60 },
  { skill: 'Farming', value: 70 },
  { skill: 'Composting', value: 80 },
  { skill: 'Energy', value: 40 },
  { skill: 'Reforestation', value: 55 },
];

const achievements = [
  { icon: '🌳', title: 'Tree Guardian', desc: 'Planted 25+ trees', unlocked: true },
  { icon: '☀️', title: 'Solar Pioneer', desc: 'First solar installation', unlocked: true },
  { icon: '🔥', title: '30-Day Streak', desc: '30 consecutive activity days', unlocked: true },
  { icon: '💎', title: 'Diamond Earner', desc: 'Earned 500+ CLC', unlocked: false },
  { icon: '🌍', title: 'Global Impact', desc: 'Offset 10 tonnes CO₂', unlocked: false },
  { icon: '🏆', title: 'Top Seller', desc: 'Sold 1000+ CLC', unlocked: false },
];

const BAR_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-sm">
      <p className="text-white/60 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Profile</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account & view your impact</p>
      </motion.div>

      {/* Top Row: Profile Card + Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard variant="strong" hover={false} className="h-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-sky-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-white/90 mt-4">{user?.name || 'Demo User'}</h2>
              <p className="text-white/40 text-sm">{user?.email || 'demo@carbonlink.io'}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="badge badge-approved">
                  <HiOutlineShieldCheck size={12} /> Verified
                </span>
                <span className="badge badge-info">{user?.role === 'buyer' ? '🏢 Buyer' : '🌱 Eco Actor'}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 text-amber-400 text-sm">
                <HiOutlineFire size={16} />
                <span className="font-semibold">12 day streak</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="lg:col-span-2"
          variants={stagger.container}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full">
            {[
              { label: 'Credits Earned', value: '342', icon: '🪙', sub: 'CLC Total' },
              { label: 'Actions Taken', value: '75', icon: '🌱', sub: 'Lifetime' },
              { label: 'Trees Planted', value: '45', icon: '🌳', sub: 'Verified' },
              { label: 'CO₂ Offset', value: '11.8T', icon: '🌍', sub: 'Tonnes' },
              { label: 'Marketplace Sales', value: '18', icon: '💰', sub: 'Completed' },
              { label: 'Rank', value: '#42', icon: '🏅', sub: 'Community' },
              { label: 'Longest Streak', value: '28', icon: '🔥', sub: 'Days' },
              { label: 'Member Since', value: 'Mar 2026', icon: '📅', sub: '' },
            ].map(s => (
              <motion.div key={s.label} variants={stagger.item}>
                <GlassCard padding="p-4" className="h-full">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-lg font-bold text-white/80 mt-2 truncate">{s.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider truncate">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Contribution Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard hover={false}>
          <ContributionGraph />
        </GlassCard>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Action Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard hover={false}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white/80">Action Breakdown</h3>
              <p className="text-xs text-white/35">CO₂ offset by eco-action category</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionBreakdown} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} unit=" kg" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="co2" radius={[6, 6, 0, 0]} name="CO₂ (kg)">
                    {actionBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Eco-Skill Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard hover={false}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white/80">Eco-Skill Radar</h3>
              <p className="text-xs text-white/35">Your strengths across categories</p>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Skill" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white/80">Achievements</h3>
              <p className="text-xs text-white/35">{achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked</p>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <HiOutlineStar size={16} />
              <span className="text-sm font-semibold">{achievements.filter(a => a.unlocked).length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {achievements.map((a, i) => (
              <motion.div
                key={a.title}
                className={`glass-subtle rounded-2xl p-4 text-center transition-all ${
                  a.unlocked ? 'opacity-100' : 'opacity-40 grayscale'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: a.unlocked ? 1 : 0.4, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                whileHover={a.unlocked ? { scale: 1.05, y: -3 } : {}}
              >
                <span className="text-3xl">{a.icon}</span>
                <p className="text-xs font-semibold text-white/80 mt-2">{a.title}</p>
                <p className="text-[10px] text-white/30 mt-1">{a.desc}</p>
                {!a.unlocked && (
                  <p className="text-[10px] text-white/20 mt-1">🔒 Locked</p>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Settings + Security */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard hover={false} className="h-full">
            <h3 className="text-lg font-semibold text-white/80 mb-6">Account Settings</h3>
            <div className="space-y-4">
              <GlassInput label="Full Name" icon={HiOutlineUser} value={user?.name || 'Demo User'} readOnly />
              <GlassInput label="Email" icon={HiOutlineMail} value={user?.email || 'demo@carbonlink.io'} readOnly />
              <div className="flex gap-3 pt-2">
                <GlassButton variant="primary" onClick={() => toast.success('Settings saved!')}>Save Changes</GlassButton>
                <GlassButton variant="danger" onClick={logout}>Sign Out</GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <GlassCard hover={false} className="h-full">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <HiOutlineShieldCheck className="text-emerald-400 shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="text-sm text-white/70">Two-Factor Authentication</p>
                    <p className="text-xs text-white/30">Add an extra layer of security</p>
                  </div>
                </div>
                <GlassButton variant="glass" size="sm" onClick={() => toast.success('2FA enabled!')}>Enable</GlassButton>
              </div>
              <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <HiOutlineClock className="text-amber-400 shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="text-sm text-white/70">Session History</p>
                    <p className="text-xs text-white/30">View recent login activity</p>
                  </div>
                </div>
                <GlassButton variant="glass" size="sm" onClick={() => toast('Last login: Today 10:30 AM', { icon: '🕐' })}>View</GlassButton>
              </div>
              <div className="flex items-center justify-between p-3 glass-subtle rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <HiOutlineMail className="text-blue-400 shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="text-sm text-white/70">Email Notifications</p>
                    <p className="text-xs text-white/30">Get updates on your actions</p>
                  </div>
                </div>
                <GlassButton variant="glass" size="sm" onClick={() => toast.success('Notifications on!')}>On</GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
