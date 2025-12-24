import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import type { Ticket, Attachment, TicketComment } from '@repo/types'
import { StatusBadge, PriorityPill } from '@repo/ui'
import { formatDateTime } from '@repo/utils'
import ImageModal from '../components/ImageModal'
import { useTheme } from '../hooks/useTheme'

export default function TicketDetail() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const { theme } = useTheme()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [modalImage, setModalImage] = useState<{ url: string; name: string; size?: number } | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Ticket not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-primary)' }}>
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Support Desk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link to="/" style={{ color: 'var(--primary)' }} className="hover:opacity-80">Home</Link>
          <span className="mx-2" style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Ticket #{ticket.id}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="rounded-xl shadow-card p-6" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{ticket.title}</h1>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Created on {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityPill priority={ticket.clientPriority} />
                </div>
              </div>
              {ticket.description && (
                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{ticket.description}</p>
              )}
            </div>

            {/* Comments */}
            <div className="rounded-xl shadow-card" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Comments</h2>
              </div>

              <div style={{ borderColor: 'var(--border-primary)' }} className="divide-y">
                {comments.filter(c => !c.isInternal).map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-primary)' }}>
                        U
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>User</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(comment.createdAt)}</p>
                      </div>
                    </div>
                    <p className="ml-11" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="p-6 text-center" style={{ color: 'var(--text-tertiary)' }}>
                    No comments yet
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="p-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={3}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-sm mb-4"
                  style={{
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-secondary)',
                  }}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-primary)' }}
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
            <div className="rounded-xl shadow-card p-6" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Ticket Properties</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Status</dt>
                  <dd className="mt-1"><StatusBadge status={ticket.status} /></dd>
                </div>
                <div>
                  <dt className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Priority</dt>
                  <dd className="mt-1"><PriorityPill priority={ticket.clientPriority} /></dd>
                </div>
                <div>
                  <dt className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Severity</dt>
                  <dd className="mt-1"><PriorityPill priority={ticket.clientSeverity} /></dd>
                </div>
              </dl>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="rounded-xl shadow-card p-6" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Attachments ({attachments.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {attachments.map((att) => (
                    <div key={att.id} className="group">
                      {/* Thumbnail */}
                      <div
                        onClick={() => setModalImage({ url: att.fileUrl, name: att.fileName, size: att.fileSize })}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-primary)' }}
                      >
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* File info */}
                      <div className="mt-2">
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }} title={att.fileName}>
                          {att.fileName}
                        </p>
                        {att.fileSize && (
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {att.fileSize < 1024
                              ? att.fileSize + ' B'
                              : att.fileSize < 1024 * 1024
                              ? (att.fileSize / 1024).toFixed(1) + ' KB'
                              : (att.fileSize / (1024 * 1024)).toFixed(1) + ' MB'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          imageUrl={modalImage.url}
          fileName={modalImage.name}
          fileSize={modalImage.size}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  )
}
