import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Send as form data (OAuth2 format)
      const form = new FormData()
      form.append('username', formData.email)
      form.append('password', formData.password)

      const response = await client.post('/auth/login', form)
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.access_token)
      
      // Go to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#030005',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Aurora Background */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(192,132,252,0.1) 0%, rgba(147,51,234,0.05) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(192,132,252,0.2)',
        borderRadius: '2px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '40px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #C084FC, #9333EA)',
            boxShadow: '0 0 15px rgba(192,132,252,0.5)',
          }} />
          <span style={{
            color: '#FFFFFF',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '3px',
          }}>BELIS</span>
        </div>

        {/* Title */}
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: '200',
          letterSpacing: '4px',
          textAlign: 'center',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}>Welcome Back</h2>

        <p style={{
          color: '#94A3B8',
          fontSize: '12px',
          letterSpacing: '2px',
          textAlign: 'center',
          marginBottom: '36px',
          textTransform: 'uppercase',
        }}>Sign in to continue</p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.3)',
            color: '#ff6b6b',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            letterSpacing: '1px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(192,132,252,0.2)',
                color: '#FFFFFF',
                padding: '12px 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: '1px',
              }}
              onFocus={e => e.target.style.borderColor = '#C084FC'}
              onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.2)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(192,132,252,0.2)',
                color: '#FFFFFF',
                padding: '12px 16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: '1px',
              }}
              onFocus={e => e.target.style.borderColor = '#C084FC'}
              onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.2)'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid #C084FC',
              color: '#C084FC',
              padding: '14px',
              fontSize: '12px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(192,132,252,0.2)',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = '#C084FC'
                e.target.style.color = '#030005'
              }
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#C084FC'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <p style={{
          color: '#94A3B8',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '24px',
          letterSpacing: '1px',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: '#C084FC',
            textDecoration: 'none',
          }}>Create one</Link>
        </p>

      </div>
    </div>
  )
}

export default Login