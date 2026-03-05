import { Navigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-gold font-mono text-sm animate-pulse">
        Authenticating...
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PrivateRoute