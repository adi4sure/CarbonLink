import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GlassInput({ 
  label, 
  icon: Icon, 
  error, 
  className = '',
  type = 'text',
  ...props 
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none z-10">
            <Icon size={16} />
          </div>
        )}
        <motion.input
          type={type}
          className={`input-glass ${Icon ? 'has-icon' : ''} ${error ? 'border-red-500/50' : ''}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          animate={{
            boxShadow: focused 
              ? '0 0 0 3px rgba(14, 165, 233, 0.1), 0 0 15px rgba(14, 165, 233, 0.05)' 
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          className="text-red-400 text-xs mt-1.5"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function GlassTextarea({ label, error, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <textarea
        className="input-glass min-h-[100px] resize-none"
        {...props}
      />
      {error && (
        <motion.p className="text-red-400 text-xs mt-1.5"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function GlassSelect({ label, options, icon: Icon, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none z-10">
            <Icon size={16} />
          </div>
        )}
        <select
          className={`input-glass appearance-none cursor-pointer ${Icon ? 'has-icon' : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a2e] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10L6 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
