import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import GlassModal from '../components/ui/GlassModal';
import { formatCO2, formatCurrency, formatDateTime } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineSwitchHorizontal,
  HiOutlineRefresh, HiOutlineTrendingUp, HiOutlineTrendingDown,
} from 'react-icons/hi';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } },
  item: { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } },
};

const demoTransactions = [
  { id: 1, type: 'earned', amount: 220, desc: 'Tree Planting — 10 trees', date: '2026-04-04T10:30:00', txHash: '0x7a8b...3f2d' },
  { id: 2, type: 'sold', amount: 50, desc: 'Marketplace sale', date: '2026-04-03T14:15:00', txHash: '0x9c1e...7b4a', earnings: 1000 },
  { id: 3, type: 'earned', amount: 3000, desc: 'Solar Panel — 2kW installed', date: '2026-04-02T09:00:00', txHash: '0x2d5f...8e1c' },
  { id: 4, type: 'transferred', amount: 100, desc: 'Sent to GreenCorp NGO', date: '2026-03-30T16:45:00', txHash: '0x4f3a...1d9e' },
  { id: 5, type: 'earned', amount: 250, desc: 'Composting — 500kg', date: '2026-03-28T11:20:00', txHash: '0x6b2c...5a7f' },
  { id: 6, type: 'purchased', amount: 30, desc: 'Bought from marketplace', date: '2026-03-25T08:30:00', txHash: '0x8e4d...2c6b', cost: 600 },
];

const monthlyEarnings = [
  { month: 'Jan', earned: 240, spent: 80 },
  { month: 'Feb', earned: 360, spent: 150 },
  { month: 'Mar', earned: 580, spent: 200 },
  { month: 'Apr', earned: 720, spent: 320 },
  { month: 'May', earned: 950, spent: 180 },
  { month: 'Jun', earned: 1100, spent: 450 },
  { month: 'Jul', earned: 880, spent: 300 },
  { month: 'Aug', earned: 1350, spent: 520 },
  { month: 'Sep', earned: 1050, spent: 380 },
  { month: 'Oct', earned: 1500, spent: 600 },
  { month: 'Nov', earned: 1200, spent: 420 },
  { month: 'Dec', earned: 1680, spent: 550 },
];

const balanceHistory = [
  { day: '1', balance: 2800 }, { day: '5', balance: 2950 },
  { day: '10', balance: 3100 }, { day: '15', balance: 2980 },
  { day: '20', balance: 3200 }, { day: '25', balance: 3150 },
  { day: '30', balance: 3342 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-sm">
      <p className="text-white/60 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke || p.fill }} className="font-semibold">
          {p.name}: {p.value} CLC
        </p>
      ))}
    </div>
  );
};

export default function Wallet() {
  const [transactions, setTransactions] = useState(demoTransactions);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ to: '', amount: '' });
  const [balance, setBalance] = useState(3342);
  const co2Total = 3342;

  const handleTransfer = () => {
    if (!transferForm.to || !transferForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    const amt = parseFloat(transferForm.amount);
    if (amt <= 0 || amt > balance) {
      toast.error('Invalid transfer amount');
      return;
    }
    const newTx = {
      id: Date.now(),
      type: 'transferred',
      amount: amt,
      desc: `Sent to ${transferForm.to}`,
      date: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    setBalance(prev => prev - amt);
    setShowTransferModal(false);
    setTransferForm({ to: '', amount: '' });
    toast.success(`Transferred ${amt} CLC successfully!`);
  };

  const typeIcon = (type) => {
    const map = {
      earned: { icon: <HiOutlineArrowDown size={16} />, color: 'text-emerald-400 bg-emerald-500/15', sign: '+' },
      sold: { icon: <HiOutlineArrowUp size={16} />, color: 'text-amber-400 bg-amber-500/15', sign: '-' },
      transferred: { icon: <HiOutlineSwitchHorizontal size={16} />, color: 'text-blue-400 bg-blue-500/15', sign: '-' },
      purchased: { icon: <HiOutlineArrowDown size={16} />, color: 'text-violet-400 bg-violet-500/15', sign: '+' },
    };
    return map[type] || map.earned;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Credit Wallet</h1>
        <p className="text-white/40 text-sm mt-1">Your CarbonLink Credits (CLC) overview</p>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          className="sm:col-span-2 lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard variant="strong" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-sky-500/10 blur-3xl" />
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Balance</p>
            <motion.p
              className="text-4xl sm:text-5xl font-bold text-gradient mt-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {formatCO2(balance)}
              <span className="text-lg text-white/30 ml-2">CLC</span>
            </motion.p>
            <p className="text-sm text-white/35 mt-2">≈ {formatCO2(co2Total)} kg CO₂ offset</p>
            <div className="flex gap-3 mt-6">
              <GlassButton variant="primary" size="sm" onClick={() => setShowTransferModal(true)}>
                <HiOutlineSwitchHorizontal size={16} />
                Transfer
              </GlassButton>
              <GlassButton variant="glass" size="sm" onClick={() => toast.success('Balance refreshed!')}>
                <HiOutlineRefresh size={16} />
                Refresh
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="h-full">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Earned This Month</p>
            <p className="text-3xl font-bold text-gradient-green mt-3">+3,470</p>
            <p className="text-xs text-white/35 mt-2">From 4 verified actions</p>
            <div className="mt-4 glass-subtle rounded-xl p-3">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Market Value</span>
                <span className="font-semibold text-emerald-400">{formatCurrency(69400)}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="h-full">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Trading Summary</p>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Sold</span>
                <span className="text-sm font-semibold text-amber-400">50 CLC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Bought</span>
                <span className="text-sm font-semibold text-violet-400">30 CLC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Transferred</span>
                <span className="text-sm font-semibold text-blue-400">100 CLC</span>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Net Earnings</span>
                  <span className="text-sm font-bold text-gradient">{formatCurrency(400)}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Balance Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white/80">Balance Trend</h3>
                <p className="text-xs text-white/35">30-day wallet balance</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <HiOutlineTrendingUp size={16} /> +19.4%
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceHistory}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} domain={['dataMin - 200', 'dataMax + 100']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={2} fill="url(#balGrad)" name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Monthly Earned vs Spent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white/80">Earned vs Spent</h3>
                <p className="text-xs text-white/35">Monthly credit flow comparison</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Earned</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Spent</span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEarnings} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="earned" fill="#10b981" radius={[4, 4, 0, 0]} name="Earned" />
                  <Bar dataKey="spent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/80">Transaction History</h3>
            <span className="badge badge-info">{transactions.length} transactions</span>
          </div>

          <motion.div
            className="space-y-1"
            variants={stagger.container}
            initial="hidden"
            animate="show"
          >
            {transactions.map((tx) => {
              const ti = typeIcon(tx.type);
              return (
                <motion.div
                  key={tx.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                  variants={stagger.item}
                >
                  <div className={`w-10 h-10 rounded-xl ${ti.color} flex items-center justify-center shrink-0`}>
                    {ti.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{tx.desc}</p>
                    <p className="text-xs text-white/30">{formatDateTime(tx.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.type === 'earned' || tx.type === 'purchased' ? 'text-emerald-400' : 'text-white/60'}`}>
                      {ti.sign}{tx.amount} CLC
                    </p>
                    <p className="text-xs text-white/20 font-mono">{tx.txHash}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </GlassCard>
      </motion.div>

      {/* Transfer Modal */}
      <GlassModal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Credits">
        <div className="space-y-4">
          <GlassInput
            label="Recipient Email or Wallet ID"
            placeholder="user@example.com"
            value={transferForm.to}
            onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
          />
          <GlassInput
            label="Amount (CLC)"
            type="number"
            placeholder="0"
            value={transferForm.amount}
            onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
          />
          {transferForm.amount && parseFloat(transferForm.amount) > 0 && (
            <motion.div
              className="glass-subtle rounded-xl p-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-xs text-white/40">Remaining Balance</p>
              <p className={`text-xl font-bold mt-1 ${balance - parseFloat(transferForm.amount) < 0 ? 'text-red-400' : 'text-gradient'}`}>
                {formatCO2(Math.max(0, balance - parseFloat(transferForm.amount || 0)))} CLC
              </p>
            </motion.div>
          )}
          <div className="glass-subtle rounded-xl p-3 flex justify-between text-sm">
            <span className="text-white/40">Available Balance</span>
            <span className="font-semibold text-white/70">{formatCO2(balance)} CLC</span>
          </div>
          <div className="flex gap-3">
            <GlassButton variant="glass" fullWidth onClick={() => setShowTransferModal(false)}>Cancel</GlassButton>
            <GlassButton variant="primary" fullWidth onClick={handleTransfer}>Confirm Transfer</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
