import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const [focused, setFocused] = useState({ email: false, password: false })
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = (name, value) => {
    if (name === 'email') {
      if (!value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
      return ''
    }
    if (name === 'password') {
      if (!value) return 'Password is required'
      return ''
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setFocused(prev => ({ ...prev, [name]: false }))
    setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }))
  }

  const handleFocus = (e) => {
    setFocused(prev => ({ ...prev, [e.target.name]: true }))
  }

  const getBorderColor = (name) => {
    if (fieldErrors[name] && touched[name]) return 'rgba(255,100,100,0.8)'
    if (touched[name] && !fieldErrors[name] && formData[name]) return 'rgba(100,220,130,0.6)'
    if (focused[name]) return '#C084FC'
    return 'rgba(192,132,252,0.2)'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailErr = validate('email', formData.email)
    const passwordErr = validate('password', formData.password)
    setFieldErrors({ email: emailErr, password: passwordErr })
    setTouched({ email: true, password: true })
    if (emailErr || passwordErr) return

    setLoading(true)
    try {
      const form = new FormData()
      form.append('username', formData.email)
      form.append('password', formData.password)
      const response = await client.post('/auth/login', form)
      localStorage.setItem('token', response.data.access_token)
      login(response.data.access_token)
      navigate('/dashboard')

    } catch (err) {
      const detail = err.response?.data?.detail || 'Invalid email or password'
      setFieldErrors({ email: detail, password: '' })
      setTouched({ email: true, password: true })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${getBorderColor(name)}`,
    color: '#FFFFFF',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    letterSpacing: '1px',
    transition: 'border-color 0.2s',
  })

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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle('email')}
            />
            {fieldErrors.email && touched.email && (
              <p style={{
                color: '#ff6b6b',
                fontSize: '11px',
                letterSpacing: '0.5px',
                marginTop: '6px',
                marginBottom: '0',
              }}>{fieldErrors.email}</p>
            )}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle('password')}
            />
            {fieldErrors.password && touched.password && (
              <p style={{
                color: '#ff6b6b',
                fontSize: '11px',
                letterSpacing: '0.5px',
                marginTop: '6px',
                marginBottom: '0',
              }}>{fieldErrors.password}</p>
            )}
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
          <Link to="/register" style={{ color: '#C084FC', textDecoration: 'none' }}>Create one</Link>
        </p>

      </div>
    </div>
  )
}

export default Login
