import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

interface TenantCardProps {
  tenant: {
    id: number
    name: string
    tier: 'enterprise' | 'business' | 'starter'
    isActive: boolean
    userCount: number
    ticketCount: number
  }
}

const tierColors: Record<string, Record<string, { bg: string; text: string; border: string }>> = {
  light: {
    enterprise: { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
    business: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
    starter: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
  },
  dark: {
    enterprise: { bg: '#581c87', text: '#e9d5ff', border: '#7e22ce' },
    business: { bg: '#1e3a8a', text: '#bfdbfe', border: '#1d4ed8' },
    starter: { bg: '#334155', text: '#e2e8f0', border: '#475569' },
  },
}

const gradients: Record<string, string[]> = {
  light: [
    'linear-gradient(to right, #eff6ff, #e0e7ff)',
    'linear-gradient(to right, #fff7ed, #fee2e2)',
    'linear-gradient(to right, #f9fafb, #f3f4f6)',
    'linear-gradient(to right, #ecfdf5, #f0fdfa)',
    'linear-gradient(to right, #ecfeff, #f0f9ff)',
    'linear-gradient(to right, #fdf4ff, #fce7f3)',
  ],
  dark: [
    'linear-gradient(to right, #1e3a8a, #3730a3)',
    'linear-gradient(to right, #9a3412, #991b1b)',
    'linear-gradient(to right, #374151, #1f2937)',
    'linear-gradient(to right, #065f46, #115e59)',
    'linear-gradient(to right, #155e75, #0c4a6e)',
    'linear-gradient(to right, #86198f, #9f1239)',
  ],
}

export default function TenantCard({ tenant }: TenantCardProps) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const gradient = gradients[theme][tenant.id % gradients[theme].length]
  const tierColor = tierColors[theme][tenant.tier]

  return (
    <div
      className="group rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-primary)'
      }}
    >
      {/* Header with gradient */}
      <div
        className="h-24 relative"
        style={{ background: gradient }}
      >
        <div className="absolute top-3 right-3">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
            style={{
              backgroundColor: tenant.isActive
                ? (theme === 'light' ? '#dcfce7' : '#065f46')
                : (theme === 'light' ? '#fee2e2' : '#991b1b'),
              color: tenant.isActive
                ? (theme === 'light' ? '#166534' : '#dcfce7')
                : (theme === 'light' ? '#991b1b' : '#fee2e2'),
              borderColor: tenant.isActive
                ? (theme === 'light' ? '#bbf7d0' : '#166534')
                : (theme === 'light' ? '#fecaca' : '#991b1b')
            }}
          >
            {tenant.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col">
        {/* Logo placeholder */}
        <div className="relative -mt-10 mb-3">
          <div
            className="size-16 rounded-xl p-1 shadow-sm"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div
              className="w-full h-full rounded-lg flex items-center justify-center font-bold text-xl border"
              style={{
                background: theme === 'light'
                  ? 'linear-gradient(to bottom right, #e2e8f0, #cbd5e1)'
                  : 'linear-gradient(to bottom right, #475569, #334155)',
                color: 'var(--text-secondary)',
                borderColor: theme === 'light' ? '#f1f5f9' : '#1e293b'
              }}
            >
              {tenant.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Tenant name */}
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="text-lg font-bold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {tenant.name}
          </h3>
        </div>

        {/* Tier badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border"
            style={{
              backgroundColor: tierColor.bg,
              color: tierColor.text,
              borderColor: tierColor.border
            }}
          >
            {tenant.tier.charAt(0).toUpperCase() + tenant.tier.slice(1)}
          </span>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 gap-4 py-4 border-t mb-4"
          style={{ borderColor: 'var(--border-secondary)' }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-xs uppercase font-semibold tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Users
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                group
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {tenant.userCount}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-xs uppercase font-semibold tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tickets
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                confirmation_number
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {tenant.ticketCount}
              </span>
            </div>
          </div>
        </div>

        {/* Configure button */}
        <div className="mt-auto">
          <button
            onClick={() => navigate('/tenants')}
            className="w-full flex items-center justify-center gap-2 rounded-lg border py-2 px-4 text-sm font-bold shadow-sm hover:opacity-80 transition-colors"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Configure
          </button>
        </div>
      </div>
    </div>
  )
}
