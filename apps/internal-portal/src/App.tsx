import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SupportQueue from './pages/SupportQueue'
import TicketDetail from './pages/TicketDetail'
import Tenants from './pages/Tenants'
import Products from './pages/Products'
import ProductDashboard from './pages/ProductDashboard'
import MyTasks from './pages/MyTasks'
import Ideas from './pages/Ideas'
import IdeaDetail from './pages/IdeaDetail'
import DevUserSwitcher from './components/DevUserSwitcher'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }

  // Only owners can access internal portal
  if (!user?.isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-slate-600 mt-2">This portal is for internal team only.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tickets" element={<PrivateRoute><SupportQueue /></PrivateRoute>} />
        <Route path="/tickets/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />
        <Route path="/tenants" element={<PrivateRoute><Tenants /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/products/:id/dashboard" element={<PrivateRoute><ProductDashboard /></PrivateRoute>} />
        <Route path="/my-tasks" element={<PrivateRoute><MyTasks /></PrivateRoute>} />
        <Route path="/ideas" element={<PrivateRoute><Ideas /></PrivateRoute>} />
        <Route path="/ideas/:id" element={<PrivateRoute><IdeaDetail /></PrivateRoute>} />
      </Routes>
      <DevUserSwitcher />
    </BrowserRouter>
  )
}
