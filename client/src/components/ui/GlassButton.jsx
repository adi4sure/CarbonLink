import { motion } from 'framer-motion';

export default function GlassButton({ 
  children, 
  variant = 'glass', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const baseClasses = {
    glass: 'btn-glass',
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: '',
    lg: 'text-base px-8 py-3',
    xl: 'text-lg px-10 py-4',
  };

  return (
    <motion.button
      type={type}
      className={`${baseClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full justify-center' : ''} ${disabled || loading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
