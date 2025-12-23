import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/NewTicket'
import TicketDetail from './pages/TicketDetail'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <ProtectedRoute>
            <NewTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
