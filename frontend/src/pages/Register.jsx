import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

const getPasswordStrength = (password) => {
  if (!password) return null
  if (password.length < 4) return 'weak'
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const isLong = password.length >= 8
  const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length
  if (score <= 2) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
}

const strengthConfig = {
  weak:   { label: 'Weak',   color: '#ff6b6b', bars: 1 },
  medium: { label: 'Medium', color: '#ffa94d', bars: 2 },
  strong: { label: 'Strong', color: '#69db7c', bars: 3 },
}

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false })
  const [focused, setFocused] = useState({ email: false, password: false, confirmPassword: false })
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const passwordStrength = getPasswordStrength(formData.password)

  const validate = (name, value, currentFormData = formData) => {
    if (name === 'email') {
      if (!value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
      return ''
    }
    if (name === 'password') {
      if (!value) return 'Password is required'
      if (value.length < 8) return 'Password must be at least 8 characters'
      if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
      return ''
    }
    if (name === 'confirmPassword') {
      if (!value) return 'Please confirm your password'
      if (value !== currentFormData.password) return 'Passwords do not match'
      return ''
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validate(name, value, updated) }))
    }
    // Re-validate confirmPassword live if password changes
    if (name === 'password' && touched.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: validate('confirmPassword', updated.confirmPassword, updated),
      }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailErr = validate('email', formData.email)
    const passwordErr = validate('password', formData.password)
    const confirmErr = validate('confirmPassword', formData.confirmPassword)
    setFieldErrors({ email: emailErr, password: passwordErr, confirmPassword: confirmErr })
    setTouched({ email: true, password: true, confirmPassword: true })
    if (emailErr || passwordErr || confirmErr) return

    setServerError('')
    setLoading(true)
    try {
      await client.post('/auth/register', {
        email: formData.email,
        password: formData.password,
      })
      navigate('/login')
    } catch (err) {
      console.error('Register error:', err)
      if (!err.response) {
        setServerError('Cannot connect to server. Make sure the backend is running on port 8000.')
      } else {
        const raw = err.response.data?.detail
        const detail = Array.isArray(raw)
          ? raw.map(e => e.msg.replace('Value error, ', '')).join('. ')
          : (typeof raw === 'string' ? raw : `Server error (${err.response.status}). Please try again.`)
        const isEmailError = detail.toLowerCase().includes('email') || detail.toLowerCase().includes('exist')
        if (isEmailError) {
          setFieldErrors(prev => ({ ...prev, email: detail }))
          setTouched(prev => ({ ...prev, email: true }))
        } else {
          setServerError(detail)
        }
      }
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

      {/* Register Card */}
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
        }}>Create Account</h2>

        <p style={{
          color: '#94A3B8',
          fontSize: '12px',
          letterSpacing: '2px',
          textAlign: 'center',
          marginBottom: '36px',
          textTransform: 'uppercase',
        }}>Begin your brand journey</p>

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
          <div style={{ marginBottom: '20px' }}>
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

            {/* Password Strength Indicator */}
            {formData.password && passwordStrength && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3].map(bar => (
                    <div key={bar} style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '2px',
                      background: bar <= strengthConfig[passwordStrength].bars
                        ? strengthConfig[passwordStrength].color
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{
                  color: strengthConfig[passwordStrength].color,
                  fontSize: '11px',
                  letterSpacing: '1px',
                  margin: '0',
                }}>
                  {strengthConfig[passwordStrength].label} password
                  {passwordStrength === 'weak' && ' — add uppercase, numbers, or symbols'}
                  {passwordStrength === 'medium' && ' — add more variety to strengthen'}
                </p>
              </div>
            )}

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

          {/* Confirm Password */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px',
            }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle('confirmPassword')}
            />
            {fieldErrors.confirmPassword && touched.confirmPassword && (
              <p style={{
                color: '#ff6b6b',
                fontSize: '11px',
                letterSpacing: '0.5px',
                marginTop: '6px',
                marginBottom: '0',
              }}>{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div style={{
              background: 'rgba(255,0,0,0.08)',
              border: '1px solid rgba(255,100,100,0.3)',
              color: '#ff6b6b',
              padding: '11px 14px',
              fontSize: '12px',
              letterSpacing: '0.5px',
              marginBottom: '16px',
            }}>{serverError}</div>
          )}

          {/* Submit Button */}
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
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p style={{
          color: '#94A3B8',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '24px',
          letterSpacing: '1px',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C084FC', textDecoration: 'none' }}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}

export default Register
