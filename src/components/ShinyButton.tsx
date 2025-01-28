import { motion } from 'framer-motion';

export default function ShinyButton({ children, onClick, className = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 w-[200%] animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.button>
  );
}