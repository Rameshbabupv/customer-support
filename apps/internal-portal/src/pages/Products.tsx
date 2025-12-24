import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import { useAuthStore } from '../store/auth'
import { useTheme } from '../hooks/useTheme'

interface Product {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { token } = useAuthStore()
  const { theme } = useTheme()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setError('')
    setEditingProduct(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description || '')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (editingProduct) {
        // Update existing product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update product')
        }

        toast.success('Product updated successfully!')
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create product')
        }

        toast.success('Product created successfully!')
      }

      // Success
      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Theme-aware Gradient Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-16 px-6 flex items-center justify-between shrink-0 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(90deg, rgba(139, 126, 255, 0.1) 0%, rgba(157, 111, 212, 0.1) 100%)'
                : 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            }}
          />

          <div className="flex items-center gap-3 relative z-10">
            <motion.span
              className="text-2xl"
              aria-hidden="true"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              📦
            </motion.span>
            <h2
              className="text-lg font-display font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #8b7eff, #9d6fd4)'
                  : 'linear-gradient(to right, #667eea, #764ba2)',
              }}
            >
              Products
            </h2>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <ThemeToggle />
            <motion.button
              onClick={openAddModal}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-lg"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #8b7eff 0%, #9d6fd4 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: theme === 'dark'
                  ? '0 4px 20px rgba(139, 126, 255, 0.4)'
                  : '0 4px 20px rgba(102, 126, 234, 0.3)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
              Add Product
            </motion.button>
          </div>
        </motion.header>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            // Skeleton Loading
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-5 animate-pulse"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="size-10 rounded-lg" style={{ backgroundColor: 'var(--border-secondary)' }}></div>
                    <div className="size-5 rounded" style={{ backgroundColor: 'var(--border-secondary)' }}></div>
                  </div>
                  <div className="h-5 rounded mb-2 w-3/4" style={{ backgroundColor: 'var(--border-secondary)' }}></div>
                  <div className="h-4 rounded mb-3 w-full" style={{ backgroundColor: 'var(--border-secondary)' }}></div>
                  <div className="h-9 rounded" style={{ backgroundColor: 'var(--border-secondary)' }}></div>
                </motion.div>
              ))}
            </div>
          ) : products.length === 0 ? (
            // Enhanced Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <motion.div
                className="text-8xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                📦
              </motion.div>
              <h3
                className="text-2xl font-display font-bold bg-gradient-to-r bg-clip-text text-transparent mb-3"
                style={{
                  backgroundImage: theme === 'dark'
                    ? 'linear-gradient(to right, #8b7eff, #9d6fd4)'
                    : 'linear-gradient(to right, #667eea, #764ba2)',
                }}
              >
                No Products Yet
              </h3>
              <p className="mb-8 text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Create your first product offering to start managing customer subscriptions and support tickets
              </p>
              <motion.button
                onClick={openAddModal}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white shadow-lg"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #8b7eff 0%, #9d6fd4 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: theme === 'dark'
                    ? '0 4px 20px rgba(139, 126, 255, 0.4)'
                    : '0 4px 20px rgba(102, 126, 234, 0.3)',
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
                Create Your First Product
              </motion.button>
            </motion.div>
          ) : (
            // Animated Product Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-xl p-5 transition-all group relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 4px 12px var(--card-shadow)',
                  }}
                >
                  {/* Gradient shimmer overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, rgba(139, 126, 255, 0.1) 0%, rgba(157, 111, 212, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    }}
                  />

                  {/* Glow border effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: theme === 'dark'
                        ? '0 0 30px rgba(139, 126, 255, 0.3), inset 0 0 30px rgba(139, 126, 255, 0.1)'
                        : '0 0 20px rgba(102, 126, 234, 0.2)',
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="size-10 rounded-lg flex items-center justify-center text-white shadow-lg"
                        style={{
                          background: theme === 'dark'
                            ? 'linear-gradient(135deg, #8b7eff 0%, #9d6fd4 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">inventory_2</span>
                      </motion.div>
                      <motion.button
                        onClick={() => openEditModal(product)}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit</span>
                      </motion.button>
                    </div>

                    <h3
                      className="font-display font-semibold mb-1 transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                      {product.description || 'No description'}
                    </p>

                    <Link
                      to={`/products/${product.id}/dashboard`}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, rgba(139, 126, 255, 0.15) 0%, rgba(157, 111, 212, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        color: theme === 'dark' ? '#8b7eff' : '#667eea',
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">dashboard</span>
                      View Dashboard
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Animated Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); resetForm() }}
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{
                backgroundColor: 'var(--modal-backdrop)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div
                className="rounded-2xl shadow-2xl w-full max-w-md mx-4 pointer-events-auto overflow-hidden"
                style={{
                  backgroundColor: 'var(--modal-bg)',
                  border: theme === 'dark' ? '1px solid var(--border-primary)' : 'none',
                  boxShadow: theme === 'dark'
                    ? '0 0 60px rgba(139, 126, 255, 0.3)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Gradient Header */}
                <div
                  className="px-6 py-4 relative overflow-hidden"
                  style={{
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  {/* Background gradient */}
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, rgba(139, 126, 255, 0.1) 0%, rgba(157, 111, 212, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    }}
                  />

                  <div className="flex items-center gap-2 mb-1 relative z-10">
                    <span className="text-xl" aria-hidden="true">📦</span>
                    <h3
                      className="text-lg font-display font-bold bg-gradient-to-r bg-clip-text text-transparent"
                      style={{
                        backgroundImage: theme === 'dark'
                          ? 'linear-gradient(to right, #8b7eff, #9d6fd4)'
                          : 'linear-gradient(to right, #667eea, #764ba2)',
                      }}
                    >
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                  </div>
                  <p className="text-sm ml-7 relative z-10" style={{ color: 'var(--text-secondary)' }}>
                    {editingProduct ? 'Update product details' : 'Create a new product offering'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--error-bg)',
                        border: '1px solid var(--error-border)',
                        color: 'var(--error-text)',
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
                      {error}
                    </motion.div>
                  )}

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 transition-colors"
                      style={{ color: name ? 'var(--success-text)' : 'var(--error-text)' }}
                    >
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                      placeholder="e.g., HRM, Payroll, Attendance"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm resize-none transition-all"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                      rows={3}
                      placeholder="Brief description of the product"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <motion.button
                      type="button"
                      onClick={() => { setShowModal(false); resetForm() }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-tertiary)',
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-lg"
                      style={{
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #8b7eff 0%, #9d6fd4 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: theme === 'dark'
                          ? '0 4px 20px rgba(139, 126, 255, 0.4)'
                          : '0 4px 20px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      {saving ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors theme={theme} />
    </div>
  )
}
