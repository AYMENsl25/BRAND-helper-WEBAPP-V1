import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useToast, ToastContainer } from '../components/Toast'

const CATEGORIES = ['article', 'tool', 'video', 'book', 'course', 'other']

const CATEGORY_COLORS = {
  article: '#60a5fa',
  tool:    '#4ade80',
  video:   '#f87171',
  book:    '#fb923c',
  course:  '#a78bfa',
  other:   '#94A3B8',
}

function Resources() {
  const navigate = useNavigate()
  const { toasts, toast } = useToast()

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [activeCategory, setActiveCategory] = useState('')

  const [form, setForm] = useState({ title: '', url: '', category: 'article', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setFetchError('')
    setLoading(true)
    try {
      const res = await client.get('/resources/')
      setResources(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setFetchError('Failed to load resources. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    setSubmitting(true)
    try {
      const res = await client.post('/resources/', {
        title: form.title.trim(),
        url: form.url.trim(),
        category: form.category,
        notes: form.notes.trim() || null,
      })
      setResources(prev => [res.data, ...prev])
      setForm({ title: '', url: '', category: 'article', notes: '' })
      setShowForm(false)
      toast.success('Resource saved')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save resource')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await client.delete(`/resources/${id}`)
      setResources(prev => prev.filter(r => r.id !== id))
      toast.success('Resource removed')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete resource')
    } finally {
      setDeletingId(null)
    }
  }

  const displayed = activeCategory
    ? resources.filter(r => r.category === activeCategory)
    : resources

  const usedCategories = [...new Set(resources.map(r => r.category))]

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(192,132,252,0.15)',
    color: '#E2E8F0', padding: '10px 14px',
    fontSize: '13px', outline: 'none',
  }

  const labelStyle = {
    color: '#64748B', fontSize: '10px', letterSpacing: '2px',
    textTransform: 'uppercase', display: 'block', marginBottom: '8px',
  }

  return (
    <div style={{ backgroundColor: '#030005', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: #475569; }
        input:focus, textarea:focus, select:focus { border-color: rgba(192,132,252,0.45) !important; }
        select option { background: #0f0015; }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid rgba(192,132,252,0.1)',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'radial-gradient(circle, #C084FC, #9333EA)',
            boxShadow: '0 0 15px rgba(192,132,252,0.5)',
          }} />
          <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700', letterSpacing: '3px' }}>BELIS</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Identity Lab', path: '/lab' },
          ].map(item => (
            <span key={item.label} onClick={() => navigate(item.path)} style={{
              color: '#94A3B8', fontSize: '14px', cursor: 'pointer', letterSpacing: '1px',
            }}
              onMouseEnter={e => e.target.style.color = '#C084FC'}
              onMouseLeave={e => e.target.style.color = '#94A3B8'}
            >{item.label}</span>
          ))}
        </div>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/') }} style={{
          background: 'transparent', border: '1px solid rgba(192,132,252,0.3)',
          color: '#94A3B8', padding: '8px 16px', fontSize: '11px',
          letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
        }}
          onMouseEnter={e => e.target.style.borderColor = '#C084FC'}
          onMouseLeave={e => e.target.style.borderColor = 'rgba(192,132,252,0.3)'}
        >Logout</button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <p style={{ color: '#C084FC', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Library
            </p>
            <h1 style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: '300', letterSpacing: '2px' }}>
              Saved Resources
            </h1>
          </div>
          <button
            onClick={() => setShowForm(f => !f)}
            style={{
              background: showForm ? 'rgba(192,132,252,0.1)' : 'transparent',
              border: '1px solid #C084FC', color: '#C084FC',
              padding: '10px 24px', fontSize: '11px',
              letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >{showForm ? '✕ Cancel' : '+ Add Resource'}</button>
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{
            border: '1px solid rgba(192,132,252,0.15)',
            background: 'rgba(255,255,255,0.01)',
            padding: '28px', marginBottom: '32px',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Stripe Docs"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>URL *</label>
                  <input
                    style={inputStyle}
                    placeholder="https://..."
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Category</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Notes <span style={{ color: '#334155', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <textarea
                  style={{ ...inputStyle, minHeight: '64px', resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                  placeholder="Why did you save this?"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <button type="submit" disabled={submitting || !form.title.trim() || !form.url.trim()} style={{
                background: 'transparent', border: '1px solid #C084FC',
                color: '#C084FC', padding: '10px 28px', fontSize: '11px',
                letterSpacing: '3px', textTransform: 'uppercase',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? 'Saving...' : 'Save Resource'}
              </button>
            </form>
          </div>
        )}

        {/* Category filter */}
        {usedCategories.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {['', ...usedCategories].map(cat => {
              const active = activeCategory === cat
              const color = cat ? CATEGORY_COLORS[cat] || '#94A3B8' : '#C084FC'
              return (
                <button key={cat || 'all'} onClick={() => setActiveCategory(cat)} style={{
                  background: active ? `${color}18` : 'transparent',
                  border: `1px solid ${active ? color : 'rgba(192,132,252,0.2)'}`,
                  color: active ? color : '#64748B',
                  padding: '5px 14px', fontSize: '10px',
                  letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  {cat || 'All'}
                </button>
              )
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ color: '#475569', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading...</p>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(255,100,100,0.15)', background: 'rgba(255,100,100,0.03)' }}>
            <p style={{ color: '#ff6b6b', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Error</p>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>{fetchError}</p>
            <button onClick={fetchResources} style={{
              background: 'transparent', border: '1px solid rgba(192,132,252,0.4)',
              color: '#C084FC', padding: '8px 24px', fontSize: '11px',
              letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
            }}>Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid rgba(192,132,252,0.08)' }}>
            <p style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
              {activeCategory ? `No ${activeCategory} resources saved` : 'No resources saved yet'}
            </p>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{
                background: 'transparent', border: '1px solid #C084FC',
                color: '#C084FC', padding: '10px 28px', fontSize: '11px',
                letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
              }}>Add Your First Resource</button>
            )}
          </div>
        )}

        {/* Resources list */}
        {!loading && !fetchError && displayed.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayed.map(r => {
              const color = CATEGORY_COLORS[r.category] || '#94A3B8'
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
                  padding: '20px 24px',
                  border: '1px solid rgba(192,132,252,0.1)',
                  background: 'rgba(255,255,255,0.01)',
                  opacity: deletingId === r.id ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{
                        background: `${color}18`, border: `1px solid ${color}40`,
                        color, padding: '2px 10px', fontSize: '9px',
                        letterSpacing: '2px', textTransform: 'uppercase',
                        flexShrink: 0,
                      }}>{r.category}</span>
                      <span style={{
                        color: '#FFFFFF', fontSize: '14px', fontWeight: '300',
                        letterSpacing: '1px', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{r.title}</span>
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#9333EA', fontSize: '12px', letterSpacing: '0.5px',
                        textDecoration: 'none', display: 'block',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginBottom: r.notes ? '8px' : '0',
                      }}
                      onMouseEnter={e => e.target.style.color = '#C084FC'}
                      onMouseLeave={e => e.target.style.color = '#9333EA'}
                    >{r.url}</a>
                    {r.notes && (
                      <p style={{ color: '#64748B', fontSize: '12px', lineHeight: '1.5', marginTop: '4px' }}>{r.notes}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{ color: '#334155', fontSize: '10px', letterSpacing: '1px' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,100,100,0.2)',
                        color: 'rgba(255,100,100,0.5)',
                        padding: '6px 12px', fontSize: '11px',
                        cursor: deletingId === r.id ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,100,100,0.5)'; e.target.style.color = '#f87171' }}
                      onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,100,100,0.2)'; e.target.style.color = 'rgba(255,100,100,0.5)' }}
                    >{deletingId === r.id ? '...' : '✕'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Resources
