import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative size-10 rounded-xl flex items-center justify-center overflow-hidden group"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1a1b24 0%, #2d2e3a 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 126, 255, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Icon container */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-violet-300"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Border glow */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          border: isDark ? '1px solid rgba(139, 126, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isDark
            ? '0 0 20px rgba(139, 126, 255, 0.3)'
            : '0 0 20px rgba(255, 255, 255, 0.2)',
        }}
        animate={{
          boxShadow: isDark
            ? ['0 0 20px rgba(139, 126, 255, 0.3)', '0 0 30px rgba(139, 126, 255, 0.4)', '0 0 20px rgba(139, 126, 255, 0.3)']
            : ['0 0 20px rgba(255, 255, 255, 0.2)', '0 0 30px rgba(255, 255, 255, 0.3)', '0 0 20px rgba(255, 255, 255, 0.2)'],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.button>
  )
}
