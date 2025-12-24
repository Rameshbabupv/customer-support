import { motion } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  color?: string
  emoji?: string
  trend?: {
    value: number
    label: string
  }
}

export default function StatCard({
  icon,
  label,
  value,
  color = 'bg-blue-50 text-blue-600',
  emoji,
  trend
}: StatCardProps) {
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-primary)',
        boxShadow: theme === 'dark' ? '0 0 0 1px rgba(255, 255, 255, 0.05)' : undefined
      }}
      className="rounded-xl border p-6 hover:shadow-lg hover:border-primary/30 transition-all group relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <div className="flex items-center gap-2 mb-2">
            {emoji && <span className="text-lg" aria-hidden="true">{emoji}</span>}
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>

          {/* Value */}
          <p className="text-3xl font-display font-bold bg-gradient-spark bg-clip-text text-transparent">
            {value}
          </p>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="text-xs font-medium"
                style={{ color: trend.value > 0 ? 'var(--success-text)' : 'var(--error-text)' }}
              >
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{trend.label}</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <motion.div
          className={`size-12 rounded-xl ${color} flex items-center justify-center shadow-md`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="material-symbols-outlined text-[28px]" aria-hidden="true">{icon}</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
