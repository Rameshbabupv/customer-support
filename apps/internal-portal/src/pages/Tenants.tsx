import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/auth'

interface Tenant {
  id: number
  name: string
  subdomain: string | null
  tier: 'enterprise' | 'business' | 'starter'
  isOwner: boolean
  isActive: boolean
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
  createdAt?: string
}

const tierColors: Record<string, string> = {
  enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
  business: 'bg-blue-100 text-blue-700 border-blue-200',
  starter: 'bg-slate-100 text-slate-700 border-slate-200',
}

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [userModalTenant, setUserModalTenant] = useState<Tenant | null>(null)
  const [tenantUsers, setTenantUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState<'user' | 'company_admin'>('user')
  const [savingUser, setSavingUser] = useState(false)
  const [userError, setUserError] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [tenantProducts, setTenantProducts] = useState<Product[]>([])
  const [userSelectedProducts, setUserSelectedProducts] = useState<number[]>([])
  const { token } = useAuthStore()

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [tier, setTier] = useState<'enterprise' | 'business' | 'starter'>('starter')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTenants()
    fetchProducts()
  }, [])

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTenants(data.tenants || [])
    } catch (err) {
      console.error('Failed to fetch tenants', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products', err)
    }
  }

  const fetchTenantProducts = async (tenantId: number) => {
    try {
      const res = await fetch(`/api/products/tenant/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSelectedProducts(data.map((p: Product) => p.id))
    } catch (err) {
      console.error('Failed to fetch tenant products', err)
    }
  }

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const resetForm = () => {
    setCompanyName('')
    setTier('starter')
    setSelectedProducts([])
    setAdminEmail('')
    setAdminName('')
    setError('')
    setEditingTenant(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = async (tenant: Tenant) => {
    setEditingTenant(tenant)
    setCompanyName(tenant.name)
    setTier(tenant.tier)
    await fetchTenantProducts(tenant.id)
    setShowModal(true)
  }

  const fetchTenantUsers = async (tenantId: number) => {
    setLoadingUsers(true)
    try {
      const res = await fetch(`/api/users/tenant/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setTenantUsers(data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const openUserModal = async (tenant: Tenant) => {
    setUserModalTenant(tenant)
    setEditingUser(null)
    setUserName('')
    setUserEmail('')
    setUserRole('user')
    setUserError('')
    setUserSearchQuery('')
    setUserSelectedProducts([])
    setShowUserModal(true)
    await fetchTenantUsers(tenant.id)

    // Fetch tenant's products
    try {
      const res = await fetch(`/api/products/tenant/${tenant.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTenantProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch tenant products:', err)
    }
  }

  const startEditUser = async (user: User) => {
    setEditingUser(user)
    setUserName(user.name)
    setUserEmail(user.email)
    setUserRole(user.role as 'user' | 'company_admin')
    setUserError('')

    // Fetch user's assigned products
    try {
      const res = await fetch(`/api/users/${user.id}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const productIds = data.map((p: Product) => p.id)
        setUserSelectedProducts(productIds)
      }
    } catch (err) {
      console.error('Failed to fetch user products:', err)
      setUserSelectedProducts([])
    }
  }

  const cancelEditUser = () => {
    setEditingUser(null)
    setUserName('')
    setUserEmail('')
    setUserRole('user')
    setUserError('')
    setUserSelectedProducts([])
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userModalTenant) return
    setUserError('')
    setSavingUser(true)

    try {
      let userId: number

      if (editingUser) {
        // Update existing user
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: userName, role: userRole }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update user')
        }
        userId = editingUser.id
      } else {
        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            role: userRole,
            tenantId: userModalTenant.id,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create user')
        }
        const data = await res.json()
        userId = data.id
      }

      // Update user's product assignments
      const productsRes = await fetch(`/api/users/${userId}/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds: userSelectedProducts }),
      })
      if (!productsRes.ok) {
        throw new Error('Failed to update product assignments')
      }

      // Refresh user list
      await fetchTenantUsers(userModalTenant.id)
      cancelEditUser()
    } catch (err: any) {
      setUserError(err.message)
    } finally {
      setSavingUser(false)
    }
  }

  const toggleTenantActive = async (tenant: Tenant) => {
    try {
      const res = await fetch(`/api/tenants/${tenant.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchTenants()
      }
    } catch (err) {
      console.error('Toggle tenant error:', err)
    }
  }

  const toggleUserActive = async (user: User) => {
    if (!userModalTenant) return
    try {
      const res = await fetch(`/api/users/${user.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchTenantUsers(userModalTenant.id)
      }
    } catch (err) {
      console.error('Toggle user error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (editingTenant) {
        // Update existing tenant
        const tenantRes = await fetch(`/api/tenants/${editingTenant.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: companyName, tier }),
        })

        if (!tenantRes.ok) {
          const data = await tenantRes.json()
          throw new Error(data.error || 'Failed to update tenant')
        }

        // Update product assignments
        await fetch(`/api/products/tenant/${editingTenant.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productIds: selectedProducts }),
        })
      } else {
        // Create new tenant
        const tenantRes = await fetch('/api/tenants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: companyName, tier }),
        })

        if (!tenantRes.ok) {
          const data = await tenantRes.json()
          throw new Error(data.error || 'Failed to create tenant')
        }

        const { tenant } = await tenantRes.json()

        // Assign products
        if (selectedProducts.length > 0) {
          await fetch('/api/products/assign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              tenantId: tenant.id,
              productIds: selectedProducts,
            }),
          })
        }

        // Create admin user
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: adminEmail,
            name: adminName,
            role: 'company_admin',
            tenantId: tenant.id,
          }),
        })

        if (!userRes.ok) {
          const data = await userRes.json()
          throw new Error(data.error || 'Failed to create admin user')
        }
      }

      // Success
      setShowModal(false)
      resetForm()
      fetchTenants()
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
          <h2 className="text-lg font-bold text-slate-900">Tenants</h2>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Tenant
          </button>
        </header>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tenant Code</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tier</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className={`hover:bg-slate-50 ${!tenant.isActive ? 'opacity-50 bg-slate-100' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {tenant.name.charAt(0)}
                          </div>
                          <button
                            onClick={() => openEditModal(tenant)}
                            className="font-medium text-primary hover:text-blue-700 hover:underline"
                          >
                            {tenant.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">{tenant.subdomain || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${tierColors[tenant.tier]}`}>
                          {tenant.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tenant.isOwner ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tenant.isOwner ? 'Owner' : 'Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleTenantActive(tenant)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            tenant.isActive ? 'bg-green-500' : 'bg-slate-300'
                          }`}
                          title={tenant.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              tenant.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openUserModal(tenant)}
                            className="text-slate-400 hover:text-primary"
                            title="Manage Users"
                          >
                            <span className="material-symbols-outlined">group</span>
                          </button>
                          <button
                            onClick={() => openEditModal(tenant)}
                            className="text-slate-400 hover:text-primary"
                            title="Edit Tenant"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tenants.length === 0 && (
                <div className="text-center text-slate-400 py-12">No tenants found</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {editingTenant
                  ? `Tenant Code: ${editingTenant.subdomain}`
                  : 'Onboard a new client company'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Company Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">business</span>
                  Company Information
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${companyName ? 'text-green-600' : 'text-red-500'}`}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">Enter your company name</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="starter">Starter</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    {!editingTenant && (
                      <p className="text-xs text-slate-400 mt-1">Tenant ID will be auto-generated</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  Products
                </h4>
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        selectedProducts.includes(product.id)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
                {products.length === 0 && (
                  <p className="text-xs text-slate-400">No products available</p>
                )}
              </div>

              {/* Admin User - only for new tenants */}
              {!editingTenant && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Admin User
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${adminName ? 'text-green-600' : 'text-red-500'}`}>
                        Admin Name *
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">Company admin name</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${adminEmail ? 'text-green-600' : 'text-red-500'}`}>
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">Your company email ID</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Note:</span> An email will be sent to verify this email address.
                      Default password: <span className="font-mono font-medium">systech@123</span>
                    </p>
                  </div>
                </div>
              )}

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
                  {saving ? 'Saving...' : (editingTenant ? 'Save Changes' : 'Create Tenant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && userModalTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Users - {userModalTenant.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tenant Code: <span className="font-mono">{userModalTenant.subdomain}</span>
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {userError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {userError}
                </div>
              )}

              {/* Add/Edit User Form */}
              {userModalTenant.isActive ? (
                <form onSubmit={handleUserSubmit} className="p-4 bg-slate-50 rounded-lg space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${userName ? 'text-green-600' : 'text-red-500'}`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${userEmail || editingUser ? 'text-green-600' : 'text-red-500'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100"
                      required={!editingUser}
                      disabled={!!editingUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="user">User</option>
                      <option value="company_admin">Company Admin</option>
                    </select>
                  </div>
                </div>

                {/* Product Assignment */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assigned Products (1-2 products)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-white">
                    {tenantProducts.length === 0 ? (
                      <p className="text-sm text-slate-400">No products available for this tenant</p>
                    ) : (
                      tenantProducts.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={userSelectedProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (userSelectedProducts.length < 2) {
                                  setUserSelectedProducts([...userSelectedProducts, product.id])
                                } else {
                                  alert('Maximum 2 products can be assigned')
                                }
                              } else {
                                setUserSelectedProducts(userSelectedProducts.filter(id => id !== product.id))
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-slate-500">{product.description}</div>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Select 1-2 products this user will work on. Leave empty for all tenant products.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {savingUser ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={cancelEditUser}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  {!editingUser && (
                    <p className="text-xs text-slate-500">
                      Default password: <span className="font-mono">systech@123</span>
                    </p>
                  )}
                </div>
              </form>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                    <p className="text-sm font-medium">
                      Tenant is inactive. Activate the tenant to manage users.
                    </p>
                  </div>
                </div>
              )}

              {/* User List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Existing Users ({tenantUsers.filter(u =>
                      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                    ).length})
                  </h4>
                  {tenantUsers.length > 0 && (
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                        search
                      </span>
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  )}
                </div>
                {loadingUsers ? (
                  <div className="text-center text-slate-400 py-6">Loading users...</div>
                ) : tenantUsers.length === 0 ? (
                  <div className="text-center text-slate-400 py-6">No users found</div>
                ) : tenantUsers.filter(u =>
                    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                  ).length === 0 ? (
                  <div className="text-center text-slate-400 py-6">
                    No users match "{userSearchQuery}"
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tenantUsers
                          .filter(u =>
                            u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                            u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                          )
                          .map((user) => (
                          <tr key={user.id} className={`hover:bg-slate-50 ${!user.isActive ? 'opacity-50 bg-slate-100' : ''}`}>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === 'company_admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {user.role === 'company_admin' ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleUserActive(user)}
                                disabled={!userModalTenant.isActive}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  user.isActive ? 'bg-green-500' : 'bg-slate-300'
                                } ${!userModalTenant.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={
                                  !userModalTenant.isActive
                                    ? 'Tenant is inactive - Cannot modify users'
                                    : user.isActive
                                    ? 'Active - Click to deactivate'
                                    : 'Inactive - Click to activate'
                                }
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                                    user.isActive ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => startEditUser(user)}
                                disabled={!userModalTenant.isActive}
                                className={`text-slate-400 hover:text-primary ${!userModalTenant.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={!userModalTenant.isActive ? 'Tenant is inactive - Cannot edit users' : 'Edit user'}
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
