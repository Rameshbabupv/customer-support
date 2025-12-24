import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface ModuleCardProps {
  emoji: string
  title: string
  description: string
  count?: number
  countLabel?: string
  to: string
  badge?: string
  badgeColor?: string
}

export default function ModuleCard({
  emoji,
  title,
  description,
  count,
  countLabel = 'Total',
  to,
  badge,
  badgeColor = 'bg-blue-100 text-blue-700'
}: ModuleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={to}
        className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all group relative overflow-hidden"
      >
        {/* Gradient shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative">
          {/* Header with emoji and badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl" aria-hidden="true">{emoji}</div>
            {badge && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-display font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {description}
          </p>

          {/* Count */}
          {count !== undefined && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold bg-gradient-spark bg-clip-text text-transparent">
                {count}
              </span>
              <span className="text-sm text-slate-500">{countLabel}</span>
            </div>
          )}

          {/* Arrow icon */}
          <div className="absolute bottom-6 right-6 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
