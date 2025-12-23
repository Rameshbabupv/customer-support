import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'

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
      }

      // Success
      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Products</h2>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Product
          </button>
        </header>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
                  onClick={() => openEditModal(product)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="size-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <button className="text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {product.description || 'No description'}
                  </p>
                </div>
              ))}

              {products.length === 0 && (
                <div className="col-span-full text-center text-slate-400 py-12">
                  No products found. Click "Add Product" to create one.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {editingProduct ? 'Update product details' : 'Create a new product offering'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1 ${name ? 'text-green-600' : 'text-red-500'}`}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., HRM, Payroll, Attendance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={3}
                  placeholder="Brief description of the product"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
