import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neural-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neural-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neural-muted text-sm">Loading NeuralPath...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/auth" replace />
  return children
}
