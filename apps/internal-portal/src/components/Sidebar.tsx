import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['admin', 'support', 'integrator', 'ceo', 'developer'] },
  { path: '/my-tasks', icon: 'task_alt', label: 'My Tasks', roles: ['developer'] },
  { path: '/tickets', icon: 'confirmation_number', label: 'Tickets', roles: ['admin', 'support', 'integrator', 'ceo'] },
  { path: '/ideas', icon: 'lightbulb', label: 'Ideas', roles: ['admin', 'support', 'integrator', 'ceo', 'developer'] },
  { path: '/tenants', icon: 'group', label: 'Tenants', roles: ['admin', 'support', 'integrator', 'ceo'] },
  { path: '/products', icon: 'inventory_2', label: 'Products', roles: ['admin', 'support', 'integrator', 'ceo'] },
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
        <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <span className="material-symbols-outlined">support_agent</span>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">SupportDesk</h1>
          <span className="text-xs text-slate-500 font-medium">Internal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-sm font-semibold truncate text-slate-900">{user?.name}</span>
            <span className="text-xs text-slate-500 truncate">{user?.role}</span>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
