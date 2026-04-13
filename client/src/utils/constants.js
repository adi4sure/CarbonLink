const API_BASE = '/api';

export const API_URLS = {
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    ME: `${API_BASE}/auth/me`,
    GOOGLE: `${API_BASE}/auth/google`,
  },
  ECO_ACTIONS: {
    BASE: `${API_BASE}/eco-actions`,
    BY_ID: (id) => `${API_BASE}/eco-actions/${id}`,
    VERIFY: (id) => `${API_BASE}/eco-actions/${id}/verify`,
  },
  CREDITS: {
    BASE: `${API_BASE}/credits`,
    TRANSFER: `${API_BASE}/credits/transfer`,
  },
  MARKETPLACE: {
    BASE: `${API_BASE}/marketplace`,
    BY_ID: (id) => `${API_BASE}/marketplace/${id}`,
    BUY: (id) => `${API_BASE}/marketplace/${id}/buy`,
  },
};

export const ECO_ACTION_TYPES = [
  { value: 'tree_planting', label: 'Tree Planting', icon: '🌳', co2PerUnit: 22, unit: 'trees' },
  { value: 'solar_panel', label: 'Solar Panel Installation', icon: '☀️', co2PerUnit: 1500, unit: 'kW' },
  { value: 'sustainable_farming', label: 'Sustainable Farming', icon: '🌾', co2PerUnit: 3670, unit: 'hectares' },
  { value: 'composting', label: 'Composting', icon: '♻️', co2PerUnit: 0.5, unit: 'kg waste' },
  { value: 'renewable_energy', label: 'Renewable Energy Usage', icon: '⚡', co2PerUnit: 500, unit: 'MWh' },
  { value: 'reforestation', label: 'Reforestation', icon: '🌲', co2PerUnit: 35, unit: 'trees' },
];

export const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const formatCO2 = (kg) => {
  if (kg >= 1000000) return `${(kg / 1000000).toFixed(1)}M`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}K`;
  return kg.toFixed(0);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
