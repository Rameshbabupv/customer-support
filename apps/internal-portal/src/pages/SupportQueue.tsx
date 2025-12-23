import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'

interface Ticket {
  id: number
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  clientPriority: number
  internalPriority: number | null
  tenantName: string
  createdAt: string
}

const columns = [
  { key: 'open', label: 'Open', color: 'slate' },
  { key: 'in_progress', label: 'In Progress', color: 'blue' },
  { key: 'resolved', label: 'Resolved', color: 'emerald' },
  { key: 'closed', label: 'Closed', color: 'gray' },
]

const priorityConfig: Record<number, { label: string; className: string; stripe: string }> = {
  1: { label: 'P1 - Critical', className: 'bg-red-50 text-red-600 border-red-100', stripe: 'bg-red-500' },
  2: { label: 'P2 - High', className: 'bg-amber-50 text-amber-600 border-amber-100', stripe: 'bg-amber-400' },
  3: { label: 'P3 - Medium', className: 'bg-blue-50 text-blue-600 border-blue-100', stripe: 'bg-blue-400' },
  4: { label: 'P4 - Low', className: 'bg-emerald-50 text-emerald-600 border-emerald-100', stripe: 'bg-emerald-400' },
  5: { label: 'P5 - Trivial', className: 'bg-slate-100 text-slate-600 border-slate-200', stripe: 'bg-slate-300' },
}

export default function SupportQueue() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTickets(data)
    } catch (err) {
      console.error('Failed to fetch tickets', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTickets()
    } catch (err) {
      console.error('Failed to update ticket', err)
    }
  }

  const getColumnTickets = (status: string) => tickets.filter((t) => t.status === status)

  const getCountColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'resolved': return 'bg-emerald-100 text-emerald-700'
      case 'closed': return 'bg-slate-200 text-slate-600'
      default: return 'bg-slate-200 text-slate-600'
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">Support Queue</h2>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-100 border-none rounded-lg text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTickets}
              className="size-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
          ) : (
            <div className="flex h-full gap-4">
              {columns.map((col) => {
                const colTickets = getColumnTickets(col.key)
                return (
                  <div
                    key={col.key}
                    className="flex flex-col flex-1 min-w-[280px] max-w-[350px] bg-slate-100 rounded-xl border border-slate-200"
                  >
                    {/* Column Header */}
                    <div className="p-4 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-700">{col.label}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getCountColor(col.key)}`}>
                          {colTickets.length}
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-3">
                      {colTickets.map((ticket) => {
                        const priority = ticket.internalPriority || ticket.clientPriority || 3
                        const pConfig = priorityConfig[priority] || priorityConfig[3]

                        return (
                          <Link
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                            className="group bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all relative overflow-hidden"
                          >
                            {priority <= 2 && (
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${pConfig.stripe} rounded-l-lg`} />
                            )}
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-mono font-medium text-slate-500">#{ticket.id}</span>
                              <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${pConfig.className}`}>
                                {pConfig.label}
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">{ticket.title}</h4>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{ticket.tenantName}</span>
                              <div className="flex items-center gap-1 text-slate-400 text-xs">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        )
                      })}

                      {colTickets.length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-8">No tickets</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
