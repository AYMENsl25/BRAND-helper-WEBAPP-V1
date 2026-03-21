import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, projectsRes] = await Promise.all([
        client.get('/auth/me'),
        client.get('/projects/')
      ])
      setUser(userRes.data)
      setProjects(projectsRes.data)
    } catch (err) {
      localStorage.removeItem('token')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleToggleFavourite = async (projectId) => {
    try {
      const res = await client.patch(`/projects/${projectId}/favourite`)
      setProjects(projects.map(p => p.id === projectId ? { ...p, is_favourite: res.data.is_favourite } : p))
    } catch (err) {
      console.error('Failed to update favourite')
    }
  }

  const handleDeleteProject = async (projectId) => {
    setDeleteError(null)
    try {
      await client.delete(`/projects/${projectId}`)
      setProjects(projects.filter(p => p.id !== projectId))
      setConfirmDeleteId(null)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete project. Please try again.'
      setDeleteError(msg)
      setConfirmDeleteId(null)
    }
  }

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
          color: '#C084FC',
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#030005',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(192,132,252,0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
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

        {/* Nav Links */}
        {[
  { label: 'Identity Lab', path: '/lab' },
  { label: 'Kit Maker', path: '/dashboard?from=kit-maker' },
  { label: 'Market Intelligence', path: '/dashboard' },
].map((item) => (
  <span
    key={item.label}
    onClick={() => navigate(item.path)}
    style={{
      color: '#94A3B8',
      fontSize: '14px',
      cursor: 'pointer',
      letterSpacing: '1px',
      transition: 'color 0.3s',
    }}
    onMouseEnter={e => e.target.style.color = '#C084FC'}
    onMouseLeave={e => e.target.style.color = '#94A3B8'}
  >
    {item.label}
  </span>
))}


        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{
            color: '#94A3B8',
            fontSize: '12px',
            letterSpacing: '1px',
          }}>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(192,132,252,0.3)',
              color: '#94A3B8',
              padding: '8px 16px',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.target.style.borderColor = '#C084FC'}
            onMouseLeave={e => e.target.style.borderColor = 'rgba(192,132,252,0.3)'}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Delete Error Banner */}
        {deleteError && (
          <div style={{
            background: 'rgba(255,100,100,0.08)',
            border: '1px solid rgba(255,100,100,0.3)',
            color: 'rgba(255,100,100,0.9)',
            padding: '12px 20px',
            fontSize: '12px',
            letterSpacing: '1px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {deleteError}
            <span
              onClick={() => setDeleteError(null)}
              style={{ cursor: 'pointer', opacity: 0.7 }}
            >✕</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '48px',
        }}>
          <div>
            <h1 style={{
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '200',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>Your Projects</h1>
            <p style={{
              color: '#94A3B8',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>{projects.length} ideas in your vault</p>
          </div>

          {/* New Project Button */}
          <button
            onClick={() => navigate('/lab')}
            style={{
              background: 'transparent',
              border: '1px solid #C084FC',
              color: '#C084FC',
              padding: '12px 32px',
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(192,132,252,0.2)',
            }}
            onMouseEnter={e => {
              e.target.style.background = '#C084FC'
              e.target.style.color = '#030005'
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#C084FC'
            }}
          >
            + New Identity
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            border: '1px solid rgba(192,132,252,0.1)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(192,132,252,0.2), rgba(147,51,234,0.1))',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>✦</div>
            <p style={{
              color: '#94A3B8',
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>No projects yet</p>
            <button
              onClick={() => navigate('/lab')}
              style={{
                background: 'transparent',
                border: '1px solid #C084FC',
                color: '#C084FC',
                padding: '12px 32px',
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Create Your First Identity
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}>
            {[...projects].sort((a, b) => b.is_favourite - a.is_favourite).map(project => (
              <div
                key={project.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(192,132,252,0.15)',
                  padding: '28px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(192,132,252,0.4)'
                  e.currentTarget.style.background = 'rgba(192,132,252,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(192,132,252,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
              >
                {/* Favourite Star */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavourite(project.id) }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: project.is_favourite ? '#FBBF24' : 'rgba(148,163,184,0.3)',
                    transition: 'color 0.2s',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                  title={project.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
                >★</button>

                {/* Stage Badge */}
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(192,132,252,0.1)',
                  border: '1px solid rgba(192,132,252,0.2)',
                  color: '#C084FC',
                  padding: '4px 12px',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}>
                  {project.stage}
                </div>

                {/* Title */}
                <h3 style={{
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: '300',
                  letterSpacing: '2px',
                  marginBottom: '12px',
                }}>{project.title}</h3>

                {/* Description */}
                <p style={{
                  color: '#94A3B8',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {project.description}
                </p>

                {/* Industry */}
                {project.industry && (
                  <p style={{
                    color: '#9333EA',
                    fontSize: '11px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                  }}>{project.industry}</p>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '8px',
                }}>
                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid rgba(192,132,252,0.3)',
                      color: '#C084FC',
                      padding: '8px',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                  {confirmDeleteId === project.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '1px' }}>Sure?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                        style={{
                          background: 'rgba(255,100,100,0.15)',
                          border: '1px solid rgba(255,100,100,0.5)',
                          color: 'rgba(255,100,100,0.9)',
                          padding: '6px 12px',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                        }}
                      >Yes</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(148,163,184,0.3)',
                          color: '#94A3B8',
                          padding: '6px 12px',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                        }}
                      >No</button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(project.id) }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,100,100,0.2)',
                        color: 'rgba(255,100,100,0.6)',
                        padding: '8px 16px',
                        fontSize: '11px',
                        letterSpacing: '2px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Date */}
                <p style={{
                  color: 'rgba(148,163,184,0.4)',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  marginTop: '16px',
                }}>
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard