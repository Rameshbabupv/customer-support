import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'
import { Link } from 'react-router-dom'

interface Idea {
  id: number
  title: string
  description: string | null
  status: 'inbox' | 'discussing' | 'vetted' | 'in_progress' | 'shipped' | 'archived'
  visibility: 'private' | 'team' | 'public'
  teamId: number | null
  createdBy: number
  createdAt: string
  publishedAt: string | null
  voteCount: number
  commentCount: number
  creator: {
    id: number
    name: string
    email: string
  }
  team: {
    id: number
    name: string
  } | null
}

const statusColors = {
  inbox: 'bg-slate-100 text-slate-700',
  discussing: 'bg-blue-100 text-blue-700',
  vetted: 'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-500',
}

const visibilityIcons = {
  private: { icon: 'lock', color: 'text-slate-500', label: 'Private' },
  team: { icon: 'group', color: 'text-blue-600', label: 'Team' },
  public: { icon: 'public', color: 'text-green-600', label: 'Public' },
}

export default function Ideas() {
  const { token } = useAuthStore()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'my' | 'team' | 'private'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [])

  async function fetchIdeas() {
    try {
      const res = await fetch('http://localhost:4000/api/ideas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error('Fetch ideas error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIdeas = ideas.filter(idea => {
    // Status filter
    if (statusFilter !== 'all' && idea.status !== statusFilter) {
      return false
    }
    // Visibility filter
    if (filter === 'private' && idea.visibility !== 'private') {
      return false
    }
    if (filter === 'team' && idea.visibility !== 'team') {
      return false
    }
    return true
  })

  return (
    <div className="flex h-screen bg-background-light overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">💡 SPARK Ideas</h1>
                <p className="text-slate-600 mt-1">Capture ideas without constraints. Vet them with your team.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                New Idea
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Tab filters */}
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'my', label: 'My Ideas' },
                  { key: 'team', label: 'Team' },
                  { key: 'private', label: 'Private' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === tab.key
                        ? 'bg-primary text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="inbox">Inbox</option>
                <option value="discussing">Discussing</option>
                <option value="vetted">Vetted</option>
                <option value="in_progress">In Progress</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
          </div>

          {/* Ideas Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading ideas...</div>
          ) : filteredIdeas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No ideas yet</h3>
              <p className="text-slate-600 mb-4">Start capturing your brilliant thoughts!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Your First Idea
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredIdeas.map(idea => (
                <Link
                  key={idea.id}
                  to={`/ideas/${idea.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">
                        {idea.title}
                      </h3>

                      {/* Description */}
                      {idea.description && (
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                          {idea.creator.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">schedule</span>
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Status, visibility, stats */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Visibility */}
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[20px] ${visibilityIcons[idea.visibility].color}`}>
                          {visibilityIcons[idea.visibility].icon}
                        </span>
                        <span className="text-sm text-slate-600">
                          {idea.visibility === 'team' && idea.team ? idea.team.name : visibilityIcons[idea.visibility].label}
                        </span>
                      </div>

                      {/* Status */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[idea.status]}`}>
                        {idea.status.replace('_', ' ')}
                      </span>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                          {idea.voteCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">comment</span>
                          {idea.commentCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal - placeholder for now */}
      {showCreateModal && (
        <CreateIdeaModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchIdeas()
          }}
        />
      )}
    </div>
  )
}

// Placeholder modal component
function CreateIdeaModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const { token } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'team' | 'public'>('private')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:4000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, visibility })
      })

      if (res.ok) {
        onCreated()
      }
    } catch (error) {
      console.error('Create idea error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">💡 New Idea</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Add dark mode support"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea..."
              className="input-field min-h-[120px]"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Who can see this?
            </label>
            <div className="space-y-2">
              {[
                { value: 'private', icon: 'lock', label: 'Private', desc: 'Just me for now' },
                { value: 'team', icon: 'group', label: 'Team', desc: 'Share with my team (coming soon)' },
                { value: 'public', icon: 'public', label: 'Public', desc: 'Everyone in organization' },
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    visibility === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="mt-1"
                    disabled={option.value === 'team'}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
                      <span className="font-medium text-slate-900">{option.label}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="btn-primary flex-1"
            >
              {submitting ? 'Creating...' : 'Create Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
