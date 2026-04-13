import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'p-6',
  onClick,
  ...props 
}) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
  };

  return (
    <motion.div
      className={`${variants[variant]} rounded-3xl ${padding} relative overflow-hidden ${className}`}
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
