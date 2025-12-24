import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/dashboard', emoji: '📊', icon: 'dashboard', label: 'Dashboard', roles: ['admin', 'support', 'integrator', 'ceo', 'developer'] },
  { path: '/my-tasks', emoji: '✅', icon: 'task_alt', label: 'My Tasks', roles: ['developer'] },
  { path: '/tickets', emoji: '🎫', icon: 'confirmation_number', label: 'Tickets', roles: ['admin', 'support', 'integrator', 'ceo'] },
  { path: '/ideas', emoji: '💡', icon: 'lightbulb', label: 'Ideas', roles: ['admin', 'support', 'integrator', 'ceo', 'developer'] },
  { path: '/tenants', emoji: '🏢', icon: 'group', label: 'Tenants', roles: ['admin', 'support', 'integrator', 'ceo'] },
  { path: '/products', emoji: '📦', icon: 'inventory_2', label: 'Products', roles: ['admin', 'support', 'integrator', 'ceo'] },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const visibleNavItems = navItems.filter(item =>
    item.roles.includes(user?.role || '')
  )

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-spark flex items-center justify-center shadow-lg shadow-primary/20 text-white">
          <span className="material-symbols-outlined" aria-hidden="true">support_agent</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight text-slate-900 leading-none">SupportDesk</h1>
          <span className="text-xs text-slate-500 font-medium">Internal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1" role="navigation" aria-label="Main navigation">
        {visibleNavItems.map((item, index) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-spark text-white font-semibold shadow-md'
                    : 'text-slate-600 hover:bg-gradient-shimmer hover:border-primary/30'
                }`}
              >
                <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                <span className="text-sm flex-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="size-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Status Indicator */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
          <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">System Online</span>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-200 hover:border-primary/30 transition-all">
          <div className="size-8 rounded-full bg-gradient-spark flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-sm font-semibold truncate text-slate-900">{user?.name}</span>
            <span className="text-xs text-slate-500 truncate capitalize">{user?.role}</span>
          </div>
          <motion.button
            onClick={logout}
            className="text-slate-400 hover:text-primary transition-colors p-1 hover:bg-white rounded"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
          </motion.button>
        </div>
      </div>
    </aside>
  )
}
