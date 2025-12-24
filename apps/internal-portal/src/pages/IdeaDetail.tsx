import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'

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
  comments: Comment[]
  reactions: Reaction[]
}

interface Comment {
  id: number
  comment: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
}

interface Reaction {
  id: number
  reaction: 'thumbs_up' | 'heart' | 'fire'
  user: {
    id: number
    name: string
  }
}

const statusOptions = [
  { value: 'inbox', label: 'Inbox', icon: 'inbox', color: 'bg-slate-100 text-slate-700' },
  { value: 'discussing', label: 'Discussing', icon: 'forum', color: 'bg-blue-100 text-blue-700' },
  { value: 'vetted', label: 'Vetted', icon: 'verified', color: 'bg-green-100 text-green-700' },
  { value: 'in_progress', label: 'In Progress', icon: 'pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'shipped', label: 'Shipped', icon: 'rocket_launch', color: 'bg-purple-100 text-purple-700' },
]

const reactionEmojis = {
  thumbs_up: '👍',
  heart: '❤️',
  fire: '🔥',
}

export default function IdeaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchIdea()
  }, [id])

  async function fetchIdea() {
    try {
      const res = await fetch(`http://localhost:4000/api/ideas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setIdea(data.idea)
    } catch (error) {
      console.error('Fetch idea error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(status: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/ideas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchIdea()
      }
    } catch (error) {
      console.error('Update status error:', error)
    }
  }

  async function updateVisibility(visibility: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/ideas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ visibility })
      })
      if (res.ok) {
        fetchIdea()
      }
    } catch (error) {
      console.error('Update visibility error:', error)
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`http://localhost:4000/api/ideas/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentText })
      })
      if (res.ok) {
        setCommentText('')
        fetchIdea()
      }
    } catch (error) {
      console.error('Add comment error:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  async function toggleReaction(reaction: 'thumbs_up' | 'heart' | 'fire') {
    try {
      await fetch(`http://localhost:4000/api/ideas/${id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reaction })
      })
      fetchIdea()
    } catch (error) {
      console.error('Toggle reaction error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background-light">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Loading idea...</div>
        </main>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="flex h-screen bg-background-light">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Idea not found</h2>
            <button onClick={() => navigate('/ideas')} className="btn-primary">
              Back to Ideas
            </button>
          </div>
        </main>
      </div>
    )
  }

  const isCreator = user?.userId === idea.createdBy
  const isAdmin = user?.role === 'admin' || user?.isOwner

  // Group reactions by type
  const reactionCounts = idea.reactions.reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const userReactions = idea.reactions
    .filter(r => r.user.id === user?.userId)
    .map(r => r.reaction)

  return (
    <div className="flex h-screen bg-background-light overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/ideas')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Ideas
          </button>

          {/* Main card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{idea.title}</h1>
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

                {/* Edit/Delete buttons (if creator or admin) */}
                {(isCreator || isAdmin) && (
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status progression */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {statusOptions.map((s, idx) => {
                  const isActive = s.value === idea.status
                  const isPast = statusOptions.findIndex(x => x.value === idea.status) > idx
                  return (
                    <div key={s.value} className="flex items-center gap-2">
                      <button
                        onClick={() => isCreator || isAdmin ? updateStatus(s.value) : null}
                        disabled={!isCreator && !isAdmin}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? s.color
                            : isPast
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        } ${isCreator || isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                        {s.label}
                      </button>
                      {idx < statusOptions.length - 1 && (
                        <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            {idea.description && (
              <div className="p-6 border-b border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap">{idea.description}</p>
              </div>
            )}

            {/* Visibility & Reactions */}
            <div className="p-6 border-b border-slate-200 space-y-4">
              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Visibility</label>
                <select
                  value={idea.visibility}
                  onChange={(e) => updateVisibility(e.target.value)}
                  disabled={!isCreator && !isAdmin}
                  className="input-field"
                >
                  <option value="private">🔒 Private (just me)</option>
                  <option value="team">👥 Team (coming soon)</option>
                  <option value="public">🌐 Public (everyone)</option>
                </select>
              </div>

              {/* Reactions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reactions</label>
                <div className="flex gap-2">
                  {Object.entries(reactionEmojis).map(([key, emoji]) => {
                    const count = reactionCounts[key] || 0
                    const hasReacted = userReactions.includes(key as any)
                    return (
                      <button
                        key={key}
                        onClick={() => toggleReaction(key as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          hasReacted
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{emoji}</span>
                        <span className="font-medium text-slate-700">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                💬 Comments ({idea.commentCount})
              </h3>

              {/* Add comment form */}
              <form onSubmit={addComment} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add your thoughts..."
                  className="input-field min-h-[100px] mb-2"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="btn-primary"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments list */}
              <div className="space-y-4">
                {idea.comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  idea.comments.map(comment => (
                    <div key={comment.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                          {comment.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{comment.user.name}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
