import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import type { Ticket, Attachment, TicketComment } from '@repo/types'
import { StatusBadge, PriorityPill } from '@repo/ui'
import { formatDateTime } from '@repo/utils'

export default function TicketDetail() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchTicket()
  }, [id])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTicket(data.ticket)
      setAttachments(data.attachments || [])
      setComments(data.comments || [])
    } catch (err) {
      console.error('Failed to fetch ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, isInternal: false }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments([...comments, data.comment])
        setNewComment('')
      }
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-slate-500">Ticket not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </div>
              <span className="font-bold text-slate-900">Support Desk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link to="/" className="text-primary hover:text-blue-600">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-500">Ticket #{ticket.id}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 mb-2">{ticket.title}</h1>
                  <p className="text-sm text-slate-500">
                    Created on {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityPill priority={ticket.clientPriority} />
                </div>
              </div>
              {ticket.description && (
                <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-card">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Comments</h2>
              </div>

              <div className="divide-y divide-slate-200">
                {comments.filter(c => !c.isInternal).map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                        U
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">User</p>
                        <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 ml-11">{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="p-6 text-center text-slate-500">
                    No comments yet
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="p-6 border-t border-slate-200">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={3}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-white text-sm mb-4"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Properties */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Ticket Properties</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-slate-500">Status</dt>
                  <dd className="mt-1"><StatusBadge status={ticket.status} /></dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Priority</dt>
                  <dd className="mt-1"><PriorityPill priority={ticket.clientPriority} /></dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Severity</dt>
                  <dd className="mt-1"><PriorityPill priority={ticket.clientSeverity} /></dd>
                </div>
              </dl>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Attachments ({attachments.length})
                </h3>
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-blue-600"
                    >
                      <span className="material-symbols-outlined text-lg">attachment</span>
                      {att.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
