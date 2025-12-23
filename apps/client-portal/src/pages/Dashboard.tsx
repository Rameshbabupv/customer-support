import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import type { Ticket } from '@repo/types'
import { StatusBadge, PriorityPill } from '@repo/ui'
import { formatDate } from '@repo/utils'

export default function Dashboard() {
  const { user, token, logout } = useAuthStore()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTickets()
  }, [])

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
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </div>
              <span className="font-bold text-slate-900">Support Desk</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/tickets/new"
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Ticket
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tickets', value: stats.total, icon: 'confirmation_number', color: 'bg-blue-50 text-blue-600' },
            { label: 'Open', value: stats.open, icon: 'folder_open', color: 'bg-amber-50 text-amber-600' },
            { label: 'In Progress', value: stats.inProgress, icon: 'pending', color: 'bg-purple-50 text-purple-600' },
            { label: 'Resolved', value: stats.resolved, icon: 'check_circle', color: 'bg-green-50 text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-slate-200 shadow-card">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm text-primary hover:text-blue-600 flex items-center gap-1">
              View all <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No tickets yet.{' '}
              <Link to="/tickets/new" className="text-primary hover:text-blue-600">
                Create your first ticket
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-500">#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-primary"
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
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
