import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput, { GlassTextarea, GlassSelect } from '../components/ui/GlassInput';
import GlassModal from '../components/ui/GlassModal';
import { ECO_ACTION_TYPES, formatDate, formatCO2 } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  HiOutlinePlus, HiOutlinePhotograph, HiOutlineCheck, HiOutlineX,
  HiOutlineTrendingUp, HiOutlineClock, HiOutlineClipboardCheck,
} from 'react-icons/hi';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } } },
};

const demoActions = [
  { _id: '1', type: 'tree_planting', quantity: 10, status: 'approved', co2Estimate: 220, description: 'Planted 10 neem trees along highway', createdAt: '2026-04-03', proof: { photos: ['/placeholder.jpg'], gps: { lat: 28.612, lng: 77.229 } } },
  { _id: '2', type: 'solar_panel', quantity: 2, status: 'in_review', co2Estimate: 3000, description: 'Installed 2kW rooftop solar panels', createdAt: '2026-04-02', proof: { photos: ['/placeholder.jpg'], gps: { lat: 28.612, lng: 77.229 } } },
  { _id: '3', type: 'sustainable_farming', quantity: 0.5, status: 'pending', co2Estimate: 1835, description: 'Organic farming on 0.5 hectare', createdAt: '2026-04-01', proof: { photos: ['/placeholder.jpg'], gps: { lat: 28.612, lng: 77.229 } } },
  { _id: '4', type: 'composting', quantity: 500, status: 'approved', co2Estimate: 250, description: 'Community composting drive - 500kg waste', createdAt: '2026-03-28', proof: { photos: ['/placeholder.jpg'], gps: { lat: 28.612, lng: 77.229 } } },
  { _id: '5', type: 'reforestation', quantity: 25, status: 'rejected', co2Estimate: 875, description: 'Reforestation project on degraded land', createdAt: '2026-03-25', proof: { photos: ['/placeholder.jpg'], gps: { lat: 28.612, lng: 77.229 } } },
  { _id: '6', type: 'renewable_energy', quantity: 1.2, status: 'approved', co2Estimate: 600, description: 'Wind-powered irrigation system', createdAt: '2026-03-20', proof: { photos: ['/placeholder.jpg'], gps: { lat: 28.612, lng: 77.229 } } },
];

const BAR_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-sm">
      <p className="text-white/60 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.value} kg CO₂
        </p>
      ))}
    </div>
  );
};

export default function EcoActions() {
  const [actions, setActions] = useState(demoActions);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    type: 'tree_planting', quantity: '', description: '', photos: []
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = filter === 'all' ? actions : actions.filter(a => a.status === filter);

  // Compute stats
  const totalCO2 = actions.reduce((s, a) => s + a.co2Estimate, 0);
  const approvedCount = actions.filter(a => a.status === 'approved').length;
  const pendingCount = actions.filter(a => a.status === 'pending' || a.status === 'in_review').length;

  // Chart data grouped by action type
  const co2ByType = ECO_ACTION_TYPES.map(t => {
    const total = actions.filter(a => a.type === t.value).reduce((s, a) => s + a.co2Estimate, 0);
    return { name: t.label.split(' ')[0], fullName: t.label, icon: t.icon, co2: total };
  }).filter(d => d.co2 > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quantity || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const actionType = ECO_ACTION_TYPES.find(t => t.value === form.type);
      const co2 = parseFloat(form.quantity) * (actionType?.co2PerUnit || 22);
      const newAction = {
        _id: Date.now().toString(),
        ...form,
        quantity: parseFloat(form.quantity),
        status: 'pending',
        co2Estimate: co2,
        createdAt: new Date().toISOString(),
        proof: { photos: form.photos.map(f => URL.createObjectURL(f)), gps: { lat: 28.612, lng: 77.229 } },
      };
      setActions(prev => [newAction, ...prev]);
      setShowModal(false);
      setForm({ type: 'tree_planting', quantity: '', description: '', photos: [] });
      toast.success(`Eco-action submitted! Est. ${formatCO2(co2)} kg CO₂`);
    } catch (err) {
      toast.error('Failed to submit action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setActions(prev => prev.filter(a => a._id !== id));
    toast.success('Action removed');
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'badge-pending',
      in_review: 'badge-info',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    const labels = {
      pending: 'Pending',
      in_review: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return <span className={`badge ${map[status]}`}>{labels[status]}</span>;
  };

  const getActionType = (type) => ECO_ACTION_TYPES.find(t => t.value === type) || ECO_ACTION_TYPES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">Eco Actions</h1>
          <p className="text-white/40 text-sm mt-1">Submit and track your eco-friendly activities</p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus size={18} />
          New Action
        </GlassButton>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        {[
          { title: 'Total CO₂ Offset', value: `${formatCO2(totalCO2)} kg`, icon: HiOutlineTrendingUp, color: 'from-emerald-500 to-teal-500' },
          { title: 'Total Actions', value: actions.length, icon: HiOutlineClipboardCheck, color: 'from-sky-500 to-cyan-500' },
          { title: 'Approved', value: approvedCount, icon: HiOutlineCheck, color: 'from-violet-500 to-purple-500' },
          { title: 'In Progress', value: pendingCount, icon: HiOutlineClock, color: 'from-amber-500 to-orange-500' },
        ].map((card) => (
          <motion.div key={card.title} variants={stagger.item}>
            <GlassCard>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider truncate">{card.title}</p>
                  <p className="text-2xl font-bold text-white/90 mt-2 truncate">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <card.icon className="text-white" size={20} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* CO₂ by Action Type Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white/80">CO₂ Offset by Action Type</h3>
              <p className="text-xs text-white/35">Comparison of your eco-action categories</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={co2ByType} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} unit=" kg" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="co2" radius={[6, 6, 0, 0]}>
                  {co2ByType.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {['all', 'pending', 'in_review', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'glass text-white/50 hover:text-white/70'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            <span className="ml-2 text-xs opacity-60">
              {f === 'all' ? actions.length : actions.filter(a => a.status === f).length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Actions Grid */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((action) => {
            const actionType = getActionType(action.type);
            return (
              <motion.div
                key={action._id}
                variants={stagger.item}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{actionType.icon}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white/80 truncate">{actionType.label}</h3>
                        <p className="text-xs text-white/35">{formatDate(action.createdAt)}</p>
                      </div>
                    </div>
                    {statusBadge(action.status)}
                  </div>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">{action.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-subtle rounded-xl p-3 text-center">
                      <p className="text-xs text-white/35">Quantity</p>
                      <p className="text-lg font-bold text-white/80 truncate">{action.quantity} <span className="text-xs text-white/35">{actionType.unit}</span></p>
                    </div>
                    <div className="glass-subtle rounded-xl p-3 text-center">
                      <p className="text-xs text-white/35">CO₂ Offset</p>
                      <p className="text-lg font-bold text-gradient-green truncate">{formatCO2(action.co2Estimate)} <span className="text-xs">kg</span></p>
                    </div>
                  </div>
                  {action.status === 'approved' && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-400/70 text-xs">
                      <HiOutlineCheck size={14} />
                      <span>Credits minted to wallet</span>
                    </div>
                  )}
                  {(action.status === 'pending' || action.status === 'rejected') && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDelete(action._id)}
                        className="text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <HiOutlineX size={12} /> Remove
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-4xl mb-3">🌿</p>
          <p className="text-white/40 text-sm">No actions match this filter</p>
        </motion.div>
      )}

      {/* New Action Modal */}
      <GlassModal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit New Eco-Action" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassSelect
            label="Action Type"
            options={ECO_ACTION_TYPES.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` }))}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <GlassInput
            label={`Quantity (${getActionType(form.type).unit})`}
            type="number"
            placeholder="e.g. 10"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
          {form.quantity && (
            <motion.div
              className="glass-subtle rounded-xl p-3 text-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <p className="text-xs text-white/40">Estimated CO₂ Offset</p>
              <p className="text-xl font-bold text-gradient-green mt-1">
                {formatCO2(parseFloat(form.quantity || 0) * getActionType(form.type).co2PerUnit)} kg
              </p>
            </motion.div>
          )}
          <GlassTextarea
            label="Description"
            placeholder="Describe your eco-action..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Upload Proof Photos</label>
            <label className="flex flex-col items-center justify-center gap-2 glass rounded-xl py-8 cursor-pointer hover:bg-white/[0.06] transition-colors">
              <HiOutlinePhotograph size={32} className="text-white/30" />
              <span className="text-sm text-white/40">Click to upload photos</span>
              <span className="text-xs text-white/20">GPS and timestamp will be extracted automatically</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setForm({ ...form, photos: [...form.photos, ...Array.from(e.target.files)] })}
              />
            </label>
            {form.photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.photos.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden glass">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center"
                      onClick={() => setForm({ ...form, photos: form.photos.filter((_, j) => j !== i) })}
                    >
                      <HiOutlineX size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <GlassButton type="button" variant="glass" onClick={() => setShowModal(false)} fullWidth>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" loading={submitting} fullWidth>
              Submit for Verification
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
