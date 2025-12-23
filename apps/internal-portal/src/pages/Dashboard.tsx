import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import TenantCard from '../components/TenantCard'
import { useAuthStore } from '../store/auth'

interface Tenant {
  id: number
  name: string
  subdomain: string | null
  tier: 'enterprise' | 'business' | 'starter'
  isActive: boolean
  createdAt: string
}

interface Ticket {
  id: number
  title: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  clientPriority: number
  clientSeverity: number
  internalPriority: number | null
  internalSeverity: number | null
  tenantName: string
  createdAt: string
}

interface Product {
  id: number
  name: string
  description: string | null
}

interface User {
  id: number
  email: string
  name: string
  role: string
  isActive: boolean
}

interface TenantWithStats {
  id: number
  name: string
  tier: 'enterprise' | 'business' | 'starter'
  isActive: boolean
  userCount: number
  ticketCount: number
}

interface DashboardMetrics {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  activeUsers: number
  totalProducts: number
  openTickets: number
  ticketsByStatus: {
    open: number
    in_progress: number
    resolved: number
    closed: number
  }
  ticketsByPriority: { priority: number; count: number }[]
  tenantCards: TenantWithStats[]
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuthStore()

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch core data in parallel
      const [tenantsRes, ticketsRes, productsRes] = await Promise.all([
        fetch('/api/tenants', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/tickets/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!tenantsRes.ok || !ticketsRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const tenantsData = await tenantsRes.json()
      const tenants: Tenant[] = tenantsData.tenants || []
      const tickets: Ticket[] = await ticketsRes.json()
      const products: Product[] = await productsRes.json()

      // Fetch user counts for each tenant in parallel
      const userCountPromises = tenants.map(async (tenant) => {
        try {
          const res = await fetch(`/api/users/tenant/${tenant.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) return { tenantId: tenant.id, users: [] }
          const users: User[] = await res.json()
          return { tenantId: tenant.id, users }
        } catch (err) {
          console.error(`Failed to fetch users for tenant ${tenant.id}`, err)
          return { tenantId: tenant.id, users: [] }
        }
      })

      const userCounts = await Promise.all(userCountPromises)

      // Calculate metrics
      const totalTenants = tenants.length
      const activeTenants = tenants.filter((t) => t.isActive).length

      const allUsers = userCounts.flatMap((uc) => uc.users)
      const totalUsers = allUsers.length
      const activeUsers = allUsers.filter((u) => u.isActive).length

      const totalProducts = products.length

      const ticketsByStatus = {
        open: tickets.filter((t) => t.status === 'open').length,
        in_progress: tickets.filter((t) => t.status === 'in_progress').length,
        resolved: tickets.filter((t) => t.status === 'resolved').length,
        closed: tickets.filter((t) => t.status === 'closed').length,
      }

      const openTickets = ticketsByStatus.open

      // Calculate tickets by priority (P1-P5)
      const ticketsByPriority = [1, 2, 3, 4, 5].map((p) => ({
        priority: p,
        count: tickets.filter((t) => {
          const priority = t.internalPriority || t.clientPriority
          return priority === p
        }).length,
      }))

      // Create tenant cards with stats
      const tenantCards: TenantWithStats[] = tenants.map((tenant) => {
        const userCount = userCounts.find((uc) => uc.tenantId === tenant.id)?.users.length || 0
        const ticketCount = tickets.filter((t) => t.tenantName === tenant.name).length

        return {
          id: tenant.id,
          name: tenant.name,
          tier: tenant.tier,
          isActive: tenant.isActive,
          userCount,
          ticketCount,
        }
      })

      setMetrics({
        totalTenants,
        activeTenants,
        totalUsers,
        activeUsers,
        totalProducts,
        openTickets,
        ticketsByStatus,
        ticketsByPriority,
        tenantCards,
      })
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && !metrics && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500">Loading dashboard...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {metrics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon="group_work"
                  label="Total Tenants"
                  value={metrics.totalTenants}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  icon="group"
                  label="Active Users"
                  value={metrics.activeUsers}
                  color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  icon="confirmation_number"
                  label="Open Tickets"
                  value={metrics.openTickets}
                  color="bg-amber-50 text-amber-600"
                />
                <StatCard
                  icon="inventory_2"
                  label="Products"
                  value={metrics.totalProducts}
                  color="bg-purple-50 text-purple-600"
                />
              </div>

              {/* Workload Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Workload by Status */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Ticket Workload</h3>
                  <div className="space-y-3">
                    {[
                      { status: 'open', label: 'Open', count: metrics.ticketsByStatus.open, color: 'bg-slate-200 text-slate-700' },
                      { status: 'in_progress', label: 'In Progress', count: metrics.ticketsByStatus.in_progress, color: 'bg-blue-100 text-blue-700' },
                      { status: 'resolved', label: 'Resolved', count: metrics.ticketsByStatus.resolved, color: 'bg-emerald-100 text-emerald-700' },
                      { status: 'closed', label: 'Closed', count: metrics.ticketsByStatus.closed, color: 'bg-slate-200 text-slate-700' },
                    ].map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${item.color}`}>
                          {item.label}
                        </span>
                        <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Priority Distribution</h3>
                  <div className="space-y-3">
                    {metrics.ticketsByPriority.map((item) => {
                      const priorityColors = [
                        'bg-red-50 text-red-600 border-red-100',
                        'bg-amber-50 text-amber-600 border-amber-100',
                        'bg-blue-50 text-blue-600 border-blue-100',
                        'bg-emerald-50 text-emerald-600 border-emerald-100',
                        'bg-slate-100 text-slate-600 border-slate-200',
                      ]
                      const color = priorityColors[item.priority - 1]

                      return (
                        <div key={item.priority} className="flex items-center justify-between">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${color}`}>
                            P{item.priority}
                          </span>
                          <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Tenant Cards Grid */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tenants Overview</h3>
                {metrics.tenantCards.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <p className="text-slate-400">No tenants found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {metrics.tenantCards.map((tenant) => (
                      <TenantCard key={tenant.id} tenant={tenant} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
