import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useToast, ToastContainer } from '../components/Toast'

const ROLES = ['founder', 'designer', 'developer', 'investor']

function Profile() {
  const navigate = useNavigate()
  const { toasts, toast } = useToast()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    country: '',
    role: 'founder',
    bio: '',
  })

  const handleLogoClick = () => {
    navigate(localStorage.getItem('token') ? '/dashboard' : '/')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [userRes, profileRes, statsRes] = await Promise.all([
        client.get('/auth/me'),
        client.get('/auth/profile'),
        client.get('/auth/stats'),
      ])
      setUser(userRes.data)
      setProfile(profileRes.data)
      setStats(statsRes.data)
      setForm({
        full_name: profileRes.data.full_name || '',
        country: profileRes.data.country || '',
        role: profileRes.data.role || 'founder',
        bio: profileRes.data.bio || '',
      })
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        toast.error('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await client.put('/auth/profile', form)
      setProfile(res.data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const memberSince = stats?.member_since
    ? new Date(stats.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(192,132,252,0.2)',
    color: '#E2E8F0',
    padding: '10px 14px',
    fontSize: '13px',
    letterSpacing: '0.5px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    color: '#64748B',
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  }

  return (
    <div style={{ backgroundColor: '#030005', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: #475569; }
        input:focus, textarea:focus, select:focus { border-color: rgba(192,132,252,0.5) !important; }
        select option { background: #0f0015; }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid rgba(192,132,252,0.1)',
      }}>
        <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'radial-gradient(circle, #C084FC, #9333EA)',
            boxShadow: '0 0 15px rgba(192,132,252,0.5)',
          }} />
          <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700', letterSpacing: '3px' }}>BELIS</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Identity Lab', path: '/lab' },
            { label: 'Dashboard', path: '/dashboard' },
          ].map(item => (
            <span key={item.label} onClick={() => navigate(item.path)} style={{
              color: '#94A3B8', fontSize: '14px', cursor: 'pointer', letterSpacing: '1px',
            }}
              onMouseEnter={e => e.target.style.color = '#C084FC'}
              onMouseLeave={e => e.target.style.color = '#94A3B8'}
            >{item.label}</span>
          ))}
        </div>
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid rgba(192,132,252,0.3)',
          color: '#94A3B8', padding: '8px 16px', fontSize: '11px',
          letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
        }}
          onMouseEnter={e => e.target.style.borderColor = '#C084FC'}
          onMouseLeave={e => e.target.style.borderColor = 'rgba(192,132,252,0.3)'}
        >Logout</button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>

        {/* Header */}
        <p style={{ color: '#C084FC', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Account
        </p>
        <h1 style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: '300', letterSpacing: '2px', marginBottom: '48px' }}>
          Profile &amp; Settings
        </h1>

        {loading ? (
          <p style={{ color: '#475569', fontSize: '13px', letterSpacing: '1px' }}>Loading...</p>
        ) : (
          <>
            {/* User Info */}
            <div style={{
              border: '1px solid rgba(192,132,252,0.08)',
              background: 'rgba(255,255,255,0.01)',
              padding: '28px',
              marginBottom: '24px',
            }}>
              <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
                Account Info
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                <div>
                  <p style={labelStyle}>Email</p>
                  <p style={{ color: '#E2E8F0', fontSize: '13px' }}>{user?.email}</p>
                </div>
                <div>
                  <p style={labelStyle}>Role</p>
                  <p style={{ color: '#E2E8F0', fontSize: '13px', textTransform: 'capitalize' }}>{profile?.role || '—'}</p>
                </div>
                <div>
                  <p style={labelStyle}>Country</p>
                  <p style={{ color: '#E2E8F0', fontSize: '13px' }}>{profile?.country || '—'}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              border: '1px solid rgba(192,132,252,0.08)',
              background: 'rgba(255,255,255,0.01)',
              padding: '28px',
              marginBottom: '24px',
            }}>
              <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
                Stats
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <p style={labelStyle}>Total Projects</p>
                  <p style={{ color: '#C084FC', fontSize: '28px', fontWeight: '300' }}>{stats?.total_projects ?? '—'}</p>
                </div>
                <div>
                  <p style={labelStyle}>Member Since</p>
                  <p style={{ color: '#C084FC', fontSize: '28px', fontWeight: '300' }}>{memberSince}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div style={{
              border: '1px solid rgba(192,132,252,0.08)',
              background: 'rgba(255,255,255,0.01)',
              padding: '28px',
            }}>
              <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>
                Edit Profile
              </p>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      style={inputStyle}
                      placeholder="Your name"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. United States"
                      value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Role</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    placeholder="A short bio..."
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  />
                </div>

                <button type="submit" disabled={saving} style={{
                  background: saving ? 'rgba(192,132,252,0.1)' : 'transparent',
                  border: '1px solid #C084FC',
                  color: '#C084FC',
                  padding: '10px 32px',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Profile
