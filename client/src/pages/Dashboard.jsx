import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { SkeletonCard } from '../components/ui/GlassLoader';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import {
  HiOutlineLightningBolt, HiOutlineCreditCard,
  HiOutlineShoppingCart, HiOutlineTrendingUp, HiOutlinePlus,
} from 'react-icons/hi';
import api from '../utils/api';
import { formatCO2, formatCurrency, formatDate } from '../utils/constants';

/** Animated counter */
function AnimatedValue({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;

  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(numVal * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numVal]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } } },
};

const demoStats = {
  totalCredits: 342,
  pendingActions: 5,
  totalSold: 128,
  totalEarnings: 25600,
  co2Offset: 342,
};

const demoChartData = [
  { month: 'Jan', credits: 12 }, { month: 'Feb', credits: 28 },
  { month: 'Mar', credits: 45 }, { month: 'Apr', credits: 62 },
  { month: 'May', credits: 85 }, { month: 'Jun', credits: 110 },
  { month: 'Jul', credits: 142 }, { month: 'Aug', credits: 178 },
  { month: 'Sep', credits: 215 }, { month: 'Oct', credits: 268 },
  { month: 'Nov', credits: 310 }, { month: 'Dec', credits: 342 },
];

const demoMonthlyBreakdown = [
  { month: 'Jan', earned: 12, sold: 4, bought: 2 },
  { month: 'Feb', earned: 18, sold: 8, bought: 5 },
  { month: 'Mar', earned: 22, sold: 12, bought: 8 },
  { month: 'Apr', earned: 30, sold: 10, bought: 15 },
  { month: 'May', earned: 35, sold: 18, bought: 12 },
  { month: 'Jun', earned: 42, sold: 22, bought: 8 },
  { month: 'Jul', earned: 38, sold: 15, bought: 20 },
  { month: 'Aug', earned: 50, sold: 28, bought: 10 },
  { month: 'Sep', earned: 45, sold: 20, bought: 14 },
  { month: 'Oct', earned: 55, sold: 32, bought: 18 },
  { month: 'Nov', earned: 48, sold: 25, bought: 12 },
  { month: 'Dec', earned: 60, sold: 35, bought: 22 },
];

const demoAssetBreakdown = [
  { name: 'Tree Planting', value: 120, color: '#10b981' },
  { name: 'Solar Energy', value: 85, color: '#f59e0b' },
  { name: 'Farming', value: 62, color: '#8b5cf6' },
  { name: 'Composting', value: 45, color: '#06b6d4' },
  { name: 'Reforestation', value: 30, color: '#ec4899' },
];

const demoActivity = [
  { id: 1, type: 'credit_earned', title: '22 CLC earned', desc: 'Tree planting verified', date: '2026-04-04', icon: '🌳' },
  { id: 2, type: 'sale', title: '50 CLC sold', desc: 'Marketplace transaction', date: '2026-04-03', icon: '💰' },
  { id: 3, type: 'verification', title: 'Solar panel verified', desc: 'AI verification passed', date: '2026-04-02', icon: '☀️' },
  { id: 4, type: 'credit_earned', title: '110 CLC earned', desc: 'Sustainable farming', date: '2026-04-01', icon: '🌾' },
  { id: 5, type: 'purchase', title: 'Bought 30 CLC', desc: 'From marketplace', date: '2026-03-30', icon: '🛒' },
];

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

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(demoStats);
  const [chartData] = useState(demoChartData);
  const [activity] = useState(demoActivity);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creditsRes] = await Promise.all([
          api.get('/credits'),
          api.get('/eco-actions'),
        ]);
        if (creditsRes.data) setStats(prev => ({ ...prev, ...creditsRes.data }));
      } catch {
        // Use demo data on error
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Credits', rawValue: stats.totalCredits, suffix: ' CLC', icon: HiOutlineCreditCard, color: 'from-sky-500 to-cyan-500', glow: 'shadow-sky-500/20' },
    { title: 'CO₂ Offset', rawValue: stats.co2Offset, suffix: ' kg', icon: HiOutlineTrendingUp, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
    { title: 'Pending Actions', rawValue: stats.pendingActions, suffix: '', icon: HiOutlineLightningBolt, color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
    { title: 'Total Earnings', rawValue: stats.totalEarnings, suffix: '', prefix: '₹', icon: HiOutlineShoppingCart, color: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/20' },
  ];

  const totalAssets = demoAssetBreakdown.reduce((s, a) => s + a.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Here's your carbon credit overview</p>
        </div>
        <Link to="/eco-actions">
          <GlassButton variant="primary">
            <HiOutlinePlus size={18} />
            New Eco-Action
          </GlassButton>
        </Link>
      </motion.div>

      {/* Stats Grid — fixed overflow */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        {statCards.map((card) => (
          <motion.div key={card.title} variants={stagger.item}>
            <GlassCard>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider truncate">{card.title}</p>
                  <p className="text-2xl font-bold text-white/90 mt-2 truncate">
                    <AnimatedValue value={card.rawValue} prefix={card.prefix || ''} suffix={card.suffix} />
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.glow} shrink-0`}>
                  <card.icon className="text-white" size={20} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Area Chart */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white/80">Credit Growth</h3>
                <p className="text-xs text-white/35">Cumulative CLC tokens earned</p>
              </div>
              <span className="badge badge-approved">+28% ↑</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="credits" stroke="#0ea5e9" strokeWidth={2} fill="url(#creditGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard hover={false} className="h-full">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Recent Activity</h3>
            <div className="space-y-1">
              {activity.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{item.title}</p>
                    <p className="text-xs text-white/35 truncate">{item.desc}</p>
                  </div>
                  <span className="text-xs text-white/25 shrink-0">{formatDate(item.date)}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Monthly Breakdown Bar Chart + Asset Distribution */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white/80">Monthly Breakdown</h3>
                <p className="text-xs text-white/35">Credits earned, sold & bought per month</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Earned</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Sold</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Bought</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoMonthlyBreakdown} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="earned" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bought" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Asset Distribution */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard hover={false} className="h-full">
            <h3 className="text-lg font-semibold text-white/80 mb-2">Credit Sources</h3>
            <p className="text-xs text-white/35 mb-4">Breakdown by eco-action type</p>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoAssetBreakdown}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {demoAssetBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {demoAssetBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-white/60 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-white/80">{item.value}</span>
                    <span className="text-xs text-white/30 w-10 text-right">{Math.round(item.value / totalAssets * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-white/80 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/eco-actions">
              <motion.div
                className="glass-subtle rounded-2xl p-4 cursor-pointer group"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(99,102,241,0.08)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">🌱</span>
                <h4 className="text-sm font-semibold text-white/70 mt-2 group-hover:text-white/90">Submit Eco-Action</h4>
                <p className="text-xs text-white/30 mt-1">Upload proof of your sustainable activity</p>
              </motion.div>
            </Link>
            <Link to="/marketplace">
              <motion.div
                className="glass-subtle rounded-2xl p-4 cursor-pointer group"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(16,185,129,0.08)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">🛒</span>
                <h4 className="text-sm font-semibold text-white/70 mt-2 group-hover:text-white/90">Browse Marketplace</h4>
                <p className="text-xs text-white/30 mt-1">Buy or sell carbon credits</p>
              </motion.div>
            </Link>
            <Link to="/wallet">
              <motion.div
                className="glass-subtle rounded-2xl p-4 cursor-pointer group"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(139,92,246,0.08)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">💳</span>
                <h4 className="text-sm font-semibold text-white/70 mt-2 group-hover:text-white/90">View Wallet</h4>
                <p className="text-xs text-white/30 mt-1">Check balance and transactions</p>
              </motion.div>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
