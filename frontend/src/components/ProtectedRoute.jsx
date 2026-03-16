import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Still checking if user is logged in → show loading
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#030005',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #C084FC, #9333EA)',
          boxShadow: '0 0 30px rgba(192,132,252,0.5)',
        }} />
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in → show the page
  return children
}

export default ProtectedRoute