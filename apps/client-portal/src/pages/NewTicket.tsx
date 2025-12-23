import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function NewTicket() {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    clientPriority: 3,
    clientSeverity: 3,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to create ticket')

      const data = await res.json()
      navigate(`/tickets/${data.ticket.id}`)
    } catch (err) {
      console.error('Failed to create ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
                  <span className="material-symbols-outlined text-lg">support_agent</span>
                </div>
                <span className="font-bold text-slate-900">Support Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Support Ticket</h1>
            <p className="text-slate-500">Submit a new issue to our engineering team.</p>
          </div>
          <Link to="/" className="text-primary hover:text-blue-600">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Briefly summarize the issue (e.g. Login page timeout)"
              required
              className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-white text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Please provide detailed steps to reproduce the issue..."
              rows={6}
              className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-white text-sm"
            />
          </div>

          {/* Priority & Severity */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={form.clientPriority}
                onChange={(e) => setForm({ ...form, clientPriority: parseInt(e.target.value) })}
                className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary bg-white text-sm"
              >
                <option value={1}>P1 - Critical - Business blocked</option>
                <option value={2}>P2 - High - Major impact</option>
                <option value={3}>P3 - Medium - Workaround exists</option>
                <option value={4}>P4 - Low - Minor issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
              <select
                value={form.clientSeverity}
                onChange={(e) => setForm({ ...form, clientSeverity: parseInt(e.target.value) })}
                className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary bg-white text-sm"
              >
                <option value={1}>S1 - Critical - System down</option>
                <option value={2}>S2 - Major - Feature broken</option>
                <option value={3}>S3 - Minor - Degraded</option>
                <option value={4}>S4 - Cosmetic - Visual glitch</option>
              </select>
            </div>
          </div>

          {/* File Upload Placeholder */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Attachments</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
              <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (max. 5 files)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
