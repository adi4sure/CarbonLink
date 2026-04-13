import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import GlassModal from '../components/ui/GlassModal';
import { formatCO2, formatCurrency } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Cell,
} from 'recharts';
import {
  HiOutlineSearch, HiOutlineShoppingCart, HiOutlineTag,
  HiOutlineTrendingUp, HiOutlineTrendingDown,
} from 'react-icons/hi';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } } },
};

const initialListings = [
  { _id: '1', seller: { name: 'Rajesh Kumar', avatar: 'RK' }, amount: 100, pricePerKg: 20, totalPrice: 2000, icon: '🌳', description: 'Verified tree planting credits from Uttarakhand', type: 'Tree Planting' },
  { _id: '2', seller: { name: 'Priya Sharma', avatar: 'PS' }, amount: 250, pricePerKg: 18, totalPrice: 4500, icon: '🌾', description: 'Organic farming credits from MP', type: 'Farming' },
  { _id: '3', seller: { name: 'GreenEarth NGO', avatar: 'GE' }, amount: 500, pricePerKg: 22, totalPrice: 11000, icon: '🌲', description: 'Large-scale reforestation credits', type: 'Reforestation' },
  { _id: '4', seller: { name: 'SolarTech Ltd', avatar: 'ST' }, amount: 1500, pricePerKg: 15, totalPrice: 22500, icon: '☀️', description: 'Solar installation offset credits', type: 'Solar' },
  { _id: '5', seller: { name: 'Amit Patel', avatar: 'AP' }, amount: 75, pricePerKg: 25, totalPrice: 1875, icon: '♻️', description: 'Community composting credits', type: 'Composting' },
  { _id: '6', seller: { name: 'WindFarm Co', avatar: 'WF' }, amount: 800, pricePerKg: 16, totalPrice: 12800, icon: '⚡', description: 'Wind energy offset certificates', type: 'Wind Energy' },
];

const priceTrend = [
  { day: 'Mon', price: 18 }, { day: 'Tue', price: 19 },
  { day: 'Wed', price: 17.5 }, { day: 'Thu', price: 20 },
  { day: 'Fri', price: 21 }, { day: 'Sat', price: 19.5 },
  { day: 'Sun', price: 22 },
];

const volumeByType = [
  { type: 'Trees', volume: 850, color: '#10b981' },
  { type: 'Solar', volume: 1500, color: '#f59e0b' },
  { type: 'Farming', volume: 620, color: '#8b5cf6' },
  { type: 'Compost', volume: 340, color: '#06b6d4' },
  { type: 'Wind', volume: 800, color: '#ec4899' },
  { type: 'Reforest', volume: 500, color: '#6366f1' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-sm">
      <p className="text-white/60 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke || p.fill }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name === 'price' ? `₹${p.value}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Marketplace() {
  const [listings, setListings] = useState(initialListings);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [buyModal, setBuyModal] = useState(null);
  const [sellModal, setSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({ amount: '', pricePerKg: '', description: '' });
  const [buyAmount, setBuyAmount] = useState('');

  const filtered = listings
    .filter(l =>
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.seller.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.pricePerKg - b.pricePerKg;
      if (sortBy === 'price_high') return b.pricePerKg - a.pricePerKg;
      return 0;
    });

  const handleBuy = () => {
    if (!buyModal || !buyAmount) return;
    const amt = parseFloat(buyAmount);
    if (amt <= 0 || amt > buyModal.amount) {
      toast.error('Invalid amount');
      return;
    }
    const cost = amt * buyModal.pricePerKg;
    toast.success(`Purchased ${amt} kg credits for ${formatCurrency(cost)}!`);
    // Update listing amount
    setListings(prev => prev.map(l =>
      l._id === buyModal._id
        ? { ...l, amount: l.amount - amt, totalPrice: (l.amount - amt) * l.pricePerKg }
        : l
    ).filter(l => l.amount > 0));
    setBuyModal(null);
    setBuyAmount('');
  };

  const handleSell = () => {
    if (!sellForm.amount || !sellForm.pricePerKg) {
      toast.error('Please fill in all fields');
      return;
    }
    const amt = parseFloat(sellForm.amount);
    const price = parseFloat(sellForm.pricePerKg);
    const newListing = {
      _id: Date.now().toString(),
      seller: { name: 'You', avatar: 'YO' },
      amount: amt,
      pricePerKg: price,
      totalPrice: amt * price,
      icon: '🌱',
      description: sellForm.description || `${amt} CLC credits listed for sale`,
      type: 'Mixed',
    };
    setListings(prev => [newListing, ...prev]);
    setSellModal(false);
    setSellForm({ amount: '', pricePerKg: '', description: '' });
    toast.success(`Listed ${amt} CLC for sale at ${formatCurrency(price)}/kg!`);
  };

  const totalVolume = listings.reduce((s, l) => s + l.amount, 0);
  const avgPrice = listings.length ? (listings.reduce((s, l) => s + l.pricePerKg, 0) / listings.length).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Marketplace</h1>
          <p className="text-white/40 text-sm mt-1">Buy and sell verified carbon credits</p>
        </div>
        <GlassButton variant="success" onClick={() => setSellModal(true)}>
          <HiOutlineTag size={18} /> Sell Credits
        </GlassButton>
      </motion.div>

      {/* Stats Row — fixed overflow */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {[
          { l: 'Total Listings', v: listings.length },
          { l: 'Avg Price/kg', v: `₹${avgPrice}` },
          { l: 'Volume (Total)', v: formatCO2(totalVolume) },
          { l: 'Total Value', v: formatCurrency(listings.reduce((s, l) => s + l.totalPrice, 0)) },
        ].map(s => (
          <GlassCard key={s.l} padding="p-4">
            <p className="text-[10px] text-white/30 uppercase truncate">{s.l}</p>
            <p className="text-xl font-bold text-white/80 mt-1 truncate">{s.v}</p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Price Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white/80">Price Trend</h3>
                <p className="text-xs text-white/35">Average ₹/kg this week</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <HiOutlineTrendingUp size={16} /> +12%
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 4 }} name="price" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Volume by Credit Type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white/80">Market Volume</h3>
                <p className="text-xs text-white/35">Credits available by category</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByType} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]} name="Volume (kg)">
                    {volumeByType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={16} />
          <input type="text" className="input-glass has-icon" placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-glass sm:w-48 appearance-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest" className="bg-[#0a0a2e]">Newest</option>
          <option value="price_low" className="bg-[#0a0a2e]">Price: Low</option>
          <option value="price_high" className="bg-[#0a0a2e]">Price: High</option>
        </select>
      </div>

      {/* Listings */}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={stagger.container} initial="hidden" animate="show">
        <AnimatePresence mode="popLayout">
          {filtered.map((listing) => (
            <motion.div key={listing._id} variants={stagger.item} layout exit={{ opacity: 0, scale: 0.9 }}>
              <GlassCard className="group h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{listing.seller.avatar}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/75 truncate">{listing.seller.name}</p>
                    <p className="text-xs text-white/30">Verified • {listing.type}</p>
                  </div>
                  <span className="text-2xl shrink-0">{listing.icon}</span>
                </div>
                <p className="text-sm text-white/50 mb-4 flex-1 line-clamp-2">{listing.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="glass-subtle rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-white/30">Amount</p>
                    <p className="text-lg font-bold text-white/80 truncate">{formatCO2(listing.amount)}<span className="text-xs text-white/30 ml-1">kg</span></p>
                  </div>
                  <div className="glass-subtle rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-white/30">Price/kg</p>
                    <p className="text-lg font-bold text-gradient truncate">{formatCurrency(listing.pricePerKg)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="min-w-0">
                    <p className="text-xs text-white/30">Total</p>
                    <p className="text-lg font-bold text-emerald-400 truncate">{formatCurrency(listing.totalPrice)}</p>
                  </div>
                  <GlassButton variant="primary" size="sm" onClick={() => { setBuyModal(listing); setBuyAmount(String(listing.amount)); }}>
                    <HiOutlineShoppingCart size={16} /> Buy
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white/40 text-sm">No listings found</p>
        </motion.div>
      )}

      {/* Buy Modal */}
      <GlassModal isOpen={!!buyModal} onClose={() => setBuyModal(null)} title="Purchase Credits">
        {buyModal && (
          <div className="space-y-4">
            <div className="glass-subtle rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl shrink-0">{buyModal.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-white/80 truncate">{buyModal.seller.name}</p>
                <p className="text-sm text-white/40 truncate">{buyModal.description}</p>
              </div>
            </div>
            <GlassInput label="Amount (kg)" type="number" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} />
            {parseFloat(buyAmount) > buyModal.amount && (
              <p className="text-red-400 text-xs">Cannot exceed available {buyModal.amount} kg</p>
            )}
            <div className="glass-subtle rounded-xl p-4 flex justify-between">
              <span className="text-white/40">Total</span>
              <span className="font-bold text-xl text-gradient">{formatCurrency((parseFloat(buyAmount) || 0) * buyModal.pricePerKg)}</span>
            </div>
            <div className="flex gap-3">
              <GlassButton variant="glass" fullWidth onClick={() => setBuyModal(null)}>Cancel</GlassButton>
              <GlassButton variant="success" fullWidth onClick={handleBuy}>Confirm Purchase</GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Sell Modal */}
      <GlassModal isOpen={sellModal} onClose={() => setSellModal(false)} title="List Credits for Sale">
        <div className="space-y-4">
          <GlassInput label="Amount (CLC)" type="number" placeholder="100" value={sellForm.amount} onChange={(e) => setSellForm({ ...sellForm, amount: e.target.value })} />
          <GlassInput label="Price per kg (₹)" type="number" placeholder="20" value={sellForm.pricePerKg} onChange={(e) => setSellForm({ ...sellForm, pricePerKg: e.target.value })} />
          <GlassInput label="Description (optional)" placeholder="Describe your credits..." value={sellForm.description} onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })} />
          {sellForm.amount && sellForm.pricePerKg && (
            <motion.div
              className="glass-subtle rounded-xl p-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-xs text-white/40">You'll receive</p>
              <p className="text-2xl font-bold text-gradient-green mt-1">{formatCurrency(parseFloat(sellForm.amount || 0) * parseFloat(sellForm.pricePerKg || 0))}</p>
            </motion.div>
          )}
          <div className="flex gap-3">
            <GlassButton variant="glass" fullWidth onClick={() => setSellModal(false)}>Cancel</GlassButton>
            <GlassButton variant="success" fullWidth onClick={handleSell}>List for Sale</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
