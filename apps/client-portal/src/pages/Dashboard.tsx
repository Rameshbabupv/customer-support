import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuthStore } from '../store/auth'
import type { Ticket } from '@repo/types'
import { StatusBadge, PriorityPill } from '@repo/ui'
import { formatDate } from '@repo/utils'
import StatCard from '../components/StatCard'
import ModuleCard from '../components/ModuleCard'
import NewTicketModal from '../components/NewTicketModal'
import { useTheme } from '../hooks/useTheme'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard() {
  const { user, token, logout } = useAuthStore()
  const { theme } = useTheme()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to right, #1a1b24, #2d2e3a)'
            : 'linear-gradient(to right, #ffffff, rgba(237, 233, 254, 0.3))',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg">
                <span className="material-symbols-outlined text-xl">support_agent</span>
              </div>
              <div>
                <span
                  className="font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: theme === 'dark'
                      ? 'linear-gradient(to right, #8b7eff, #9d6fd4)'
                      : 'linear-gradient(to right, #667eea, #764ba2)'
                  }}
                >
                  Support Desk
                </span>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.tenant?.name || 'Client Portal'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setShowNewTicketModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
                New Ticket
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
                </div>
                <ThemeToggle />
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: 'var(--text-tertiary)',
                    background: 'var(--bg-elevated)'
                  }}
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl" aria-hidden="true">📊</span>
            <h1
              className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #8b7eff, #9d6fd4)'
                  : 'linear-gradient(to right, #667eea, #764ba2)'
              }}
            >
              Dashboard
            </h1>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setShowNewTicketModal(true)} className="cursor-pointer">
              <ModuleCard
                emoji="🎫"
                title="Create Ticket"
                description="Submit a new support request for our team to assist you"
                to="#"
                badge="Start Here"
                badgeColor="bg-gradient-to-r from-primary to-purple-600 text-white"
              />
            </div>
            <ModuleCard
              emoji="📋"
              title="My Tickets"
              description="View and track all your support tickets in one place"
              count={stats.total}
              countLabel="Total"
              to="/tickets"
              badge={stats.open > 0 ? 'Active' : undefined}
              badgeColor={stats.open > 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
            />
            <ModuleCard
              emoji="📚"
              title="Knowledge Base"
              description="Browse helpful articles and common solutions"
              to="/help"
              badge="Coming Soon"
              badgeColor="bg-purple-100 text-purple-700"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ticket Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon="confirmation_number"
              emoji="🎫"
              label="Total Tickets"
              value={stats.total}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon="folder_open"
              emoji="📂"
              label="Open"
              value={stats.open}
              color="bg-amber-50 text-amber-600"
            />
            <StatCard
              icon="pending"
              emoji="⏳"
              label="In Progress"
              value={stats.inProgress}
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon="check_circle"
              emoji="✅"
              label="Resolved"
              value={stats.resolved}
              color="bg-green-50 text-green-600"
            />
          </div>
        </motion.div>

        {/* Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border transition-shadow"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">📋</span>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recent Tickets</h2>
            </div>
            <Link to="/tickets" className="text-sm text-primary hover:text-purple-600 flex items-center gap-1 font-semibold group">
              View all
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No tickets yet</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Get started by creating your first support ticket</p>
              <motion.button
                onClick={() => setShowNewTicketModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
                Create your first ticket
              </motion.button>
            </div>
          ) : (
            <table className="w-full">
              <thead style={{ background: 'var(--bg-secondary)' }}>
                <tr className="text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                {tickets.slice(0, 5).map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="transition-colors"
                    style={{
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'dark'
                        ? 'linear-gradient(to right, rgba(139, 126, 255, 0.1), rgba(157, 111, 212, 0.1))'
                        : 'linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityPill priority={ticket.clientPriority} />
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(ticket.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </main>

      {/* New Ticket Modal */}
      <NewTicketModal isOpen={showNewTicketModal} onClose={() => setShowNewTicketModal(false)} />

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors theme={theme} />
    </div>
  )
}
