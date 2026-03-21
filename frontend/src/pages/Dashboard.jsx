import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useToast, ToastContainer } from '../components/Toast'

const STAGES = ['idea', 'mvp', 'launched']

const skeletonBase = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(192,132,252,0.06) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '600px 100%',
  animation: 'shimmer 1.6s infinite linear',
  borderRadius: '2px',
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(192,132,252,0.08)',
      padding: '28px',
    }}>
      <div style={{ ...skeletonBase, width: '80px', height: '20px', marginBottom: '16px' }} />
      <div style={{ ...skeletonBase, width: '65%', height: '18px', marginBottom: '12px' }} />
      <div style={{ ...skeletonBase, width: '100%', height: '13px', marginBottom: '8px' }} />
      <div style={{ ...skeletonBase, width: '80%', height: '13px', marginBottom: '20px' }} />
      <div style={{ ...skeletonBase, width: '100px', height: '11px', marginBottom: '20px' }} />
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ ...skeletonBase, flex: 1, height: '32px' }} />
        <div style={{ ...skeletonBase, width: '44px', height: '32px' }} />
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { toasts, toast } = useToast()
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)
  const [search, setSearch] = useState('')
  const [activeStage, setActiveStage] = useState('')
  const [activeIndustry, setActiveIndustry] = useState('')
  const [industries, setIndustries] = useState([])
  const initialized = useRef(false)

  const handleLogoClick = () => {
    navigate(localStorage.getItem('token') ? '/dashboard' : '/')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!initialized.current) return
    const timer = setTimeout(() => {
      fetchProjects({ search, stage: activeStage, industry: activeIndustry }, 1)
    }, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search, activeStage, activeIndustry])

  const fetchData = async () => {
    setFetchError('')
    setLoading(true)
    try {
      const [userRes, projectsRes] = await Promise.all([
        client.get('/auth/me'),
        client.get('/projects/?page=1&limit=10'),
      ])
      setUser(userRes.data)
      setProjects(projectsRes.data.projects || projectsRes.data)
      setTotalPages(projectsRes.data.pages || 1)
      setTotalProjects(projectsRes.data.total || 0)
      setCurrentPage(1)
      setIndustries([...new Set((projectsRes.data.projects || projectsRes.data).map(p => p.industry).filter(Boolean))])
      initialized.current = true
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setFetchError(err.response?.data?.detail || 'Failed to load your projects. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async (filters = {}, page = 1) => {
    setFetchError('')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.stage) params.set('stage', filters.stage)
      if (filters.industry) params.set('industry', filters.industry)
      params.set('page', page)
      params.set('limit', 10)
      const res = await client.get(`/projects/?${params}`)
      setProjects(res.data.projects || res.data)
      setTotalPages(res.data.pages || 1)
      setTotalProjects(res.data.total || 0)
      setCurrentPage(res.data.page || page)
      setIndustries([...new Set((res.data.projects || res.data).map(p => p.industry).filter(Boolean))])
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setFetchError(err.response?.data?.detail || 'Failed to load your projects. Please try again.')
      }
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
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, is_favourite: res.data.is_favourite } : p
      ))
    } catch (err) {
      console.error('Failed to update favourite')
    }
  }

  const handleDeleteProject = async (projectId) => {
    setDeleteError(null)
    setDeletingId(projectId)
    try {
      await client.delete(`/projects/${projectId}`)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      setConfirmDeleteId(null)
      toast.success('Project deleted')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete project. Please try again.'
      setDeleteError(msg)
      setConfirmDeleteId(null)
    } finally {
      setDeletingId(null)
    }
  }

  const Nav = () => (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 40px',
      borderBottom: '1px solid rgba(192,132,252,0.1)',
      backdropFilter: 'blur(10px)',
    }}>
      <div
        onClick={handleLogoClick}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'radial-gradient(circle, #C084FC, #9333EA)',
          boxShadow: '0 0 15px rgba(192,132,252,0.5)',
        }} />
        <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700', letterSpacing: '3px' }}>BELIS</span>
      </div>

      {[
        { label: 'Identity Lab', onClick: () => navigate('/lab') },
        { label: 'Resources', onClick: () => navigate('/resources') },
        {
          label: 'Kit Maker',
          onClick: () => projects.length > 0
            ? navigate(`/project/${projects[0].id}?tab=brand`)
            : navigate('/lab'),
        },
        {
          label: 'Market Intelligence',
          onClick: () => projects.length > 0
            ? navigate(`/project/${projects[0].id}?tab=market`)
            : navigate('/lab'),
        },
      ].map(item => (
        <span key={item.label} onClick={item.onClick} style={{
          color: '#94A3B8', fontSize: '14px', cursor: 'pointer', letterSpacing: '1px', transition: 'color 0.3s',
        }}
          onMouseEnter={e => e.target.style.color = '#C084FC'}
          onMouseLeave={e => e.target.style.color = '#94A3B8'}
        >{item.label}</span>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <span
            onClick={() => navigate('/profile')}
            style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = '#C084FC'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >{user.email}</span>
        )}
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid rgba(192,132,252,0.3)',
          color: '#94A3B8', padding: '8px 16px', fontSize: '11px', letterSpacing: '2px',
          textTransform: 'uppercase', cursor: 'pointer',
        }}
          onMouseEnter={e => e.target.style.borderColor = '#C084FC'}
          onMouseLeave={e => e.target.style.borderColor = 'rgba(192,132,252,0.3)'}
        >Logout</button>
      </div>
    </nav>
  )

  return (
    <div style={{ backgroundColor: '#030005', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        input::placeholder { color: #475569; }
      `}</style>

      <ToastContainer toasts={toasts} />
      <Nav />

      <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Delete Error Banner */}
        {deleteError && (
          <div style={{
            background: 'rgba(255,100,100,0.08)',
            border: '1px solid rgba(255,100,100,0.3)',
            color: 'rgba(255,100,100,0.9)',
            padding: '12px 20px', fontSize: '12px', letterSpacing: '1px',
            marginBottom: '24px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            {deleteError}
            <span onClick={() => setDeleteError(null)} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{
              color: '#FFFFFF', fontSize: '28px', fontWeight: '200',
              letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '8px',
            }}>Your Projects</h1>
            <p style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {loading ? 'Loading...' : `${totalProjects} ideas in your vault`}
            </p>
          </div>
          <button onClick={() => navigate('/lab')} style={{
            background: 'transparent', border: '1px solid #C084FC', color: '#C084FC',
            padding: '12px 32px', fontSize: '12px', letterSpacing: '3px',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(192,132,252,0.2)',
          }}
            onMouseEnter={e => { e.target.style.background = '#C084FC'; e.target.style.color = '#030005' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#C084FC' }}
          >+ New Identity</button>
        </div>

        {/* Search & Filters */}
        <div style={{ marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(192,132,252,0.15)',
              color: '#E2E8F0', padding: '10px 16px',
              fontSize: '13px', letterSpacing: '0.5px',
              outline: 'none', marginBottom: '16px',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(192,132,252,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.15)'}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: industries.length > 0 ? '10px' : '0' }}>
            {['', ...STAGES].map(s => {
              const active = activeStage === s
              return (
                <button key={s || 'all'} onClick={() => setActiveStage(s)} style={{
                  background: active ? 'rgba(192,132,252,0.15)' : 'transparent',
                  border: `1px solid ${active ? '#C084FC' : 'rgba(192,132,252,0.2)'}`,
                  color: active ? '#C084FC' : '#64748B',
                  padding: '5px 14px', fontSize: '10px',
                  letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                }}>{s || 'All'}</button>
              )
            })}
          </div>

          {industries.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['', ...industries].map(ind => {
                const active = activeIndustry === ind
                return (
                  <button key={ind || 'all-ind'} onClick={() => setActiveIndustry(ind)} style={{
                    background: active ? 'rgba(147,51,234,0.15)' : 'transparent',
                    border: `1px solid ${active ? '#9333EA' : 'rgba(147,51,234,0.2)'}`,
                    color: active ? '#9333EA' : '#64748B',
                    padding: '5px 14px', fontSize: '10px',
                    letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                  }}>{ind || 'All Industries'}</button>
                )
              })}
            </div>
          )}
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Fetch error */}
        {!loading && fetchError && (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '1px solid rgba(255,100,100,0.15)',
            background: 'rgba(255,100,100,0.03)',
          }}>
            <p style={{ color: '#ff6b6b', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Failed to load
            </p>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '28px' }}>{fetchError}</p>
            <button onClick={fetchData} style={{
              background: 'transparent', border: '1px solid rgba(192,132,252,0.4)',
              color: '#C084FC', padding: '10px 28px', fontSize: '12px',
              letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
            }}>Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && projects.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '1px solid rgba(192,132,252,0.1)',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(192,132,252,0.2), rgba(147,51,234,0.1))',
              margin: '0 auto 24px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '24px',
            }}>✦</div>
            {(search || activeStage || activeIndustry) ? (
              <>
                <p style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>
                  No projects match your filters
                </p>
                <button onClick={() => { setSearch(''); setActiveStage(''); setActiveIndustry('') }} style={{
                  background: 'transparent', border: '1px solid rgba(192,132,252,0.3)',
                  color: '#94A3B8', padding: '10px 28px', fontSize: '11px',
                  letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
                }}>Clear Filters</button>
              </>
            ) : (
              <>
                <p style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px' }}>
                  No projects yet
                </p>
                <button onClick={() => navigate('/lab')} style={{
                  background: 'transparent', border: '1px solid #C084FC',
                  color: '#C084FC', padding: '12px 32px', fontSize: '12px',
                  letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
                }}>Create Your First Identity</button>
              </>
            )}
          </div>
        )}

        {/* Projects grid */}
        {!loading && !fetchError && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {[...projects]
              .sort((a, b) => (b.is_favourite ? 1 : 0) - (a.is_favourite ? 1 : 0))
              .map(project => (
                <div key={project.id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(192,132,252,0.15)',
                  padding: '28px', cursor: 'pointer', transition: 'all 0.3s',
                  opacity: deletingId === project.id ? 0.4 : 1,
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
                    onClick={e => { e.stopPropagation(); handleToggleFavourite(project.id) }}
                    style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: '18px',
                      color: project.is_favourite ? '#FBBF24' : 'rgba(148,163,184,0.3)',
                      transition: 'color 0.2s', padding: '4px', lineHeight: 1,
                    }}
                    title={project.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
                  >★</button>

                  <div style={{
                    display: 'inline-block', background: 'rgba(192,132,252,0.1)',
                    border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC',
                    padding: '4px 12px', fontSize: '10px', letterSpacing: '2px',
                    textTransform: 'uppercase', marginBottom: '16px',
                  }}>{project.stage}</div>

                  <h3 style={{
                    color: '#FFFFFF', fontSize: '18px', fontWeight: '300',
                    letterSpacing: '2px', marginBottom: '12px',
                  }}>{project.title}</h3>

                  <p style={{
                    color: '#94A3B8', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{project.description}</p>

                  {project.industry && (
                    <p style={{
                      color: '#9333EA', fontSize: '11px', letterSpacing: '2px',
                      textTransform: 'uppercase', marginBottom: '20px',
                    }}>{project.industry}</p>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button onClick={() => navigate(`/project/${project.id}`)} style={{
                      flex: 1, background: 'transparent',
                      border: '1px solid rgba(192,132,252,0.3)', color: '#C084FC',
                      padding: '8px', fontSize: '11px', letterSpacing: '2px',
                      textTransform: 'uppercase', cursor: 'pointer',
                    }}>View</button>

                    {confirmDeleteId === project.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '1px' }}>Sure?</span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteProject(project.id) }}
                          style={{
                            background: 'rgba(255,100,100,0.15)',
                            border: '1px solid rgba(255,100,100,0.5)',
                            color: 'rgba(255,100,100,0.9)',
                            padding: '6px 12px', fontSize: '11px',
                            letterSpacing: '1px', cursor: 'pointer',
                          }}
                        >Yes</button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDeleteId(null) }}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(148,163,184,0.3)',
                            color: '#94A3B8', padding: '6px 12px',
                            fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
                          }}
                        >No</button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteId(project.id) }}
                        disabled={deletingId === project.id}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,100,100,0.2)',
                          color: 'rgba(255,100,100,0.6)', padding: '8px 16px',
                          fontSize: '11px', letterSpacing: '2px',
                          cursor: deletingId === project.id ? 'not-allowed' : 'pointer',
                        }}
                      >{deletingId === project.id ? '...' : '✕'}</button>
                    )}
                  </div>

                  <p style={{
                    color: 'rgba(148,163,184,0.4)', fontSize: '10px',
                    letterSpacing: '1px', marginTop: '16px',
                  }}>{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !fetchError && totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: '8px', marginTop: '40px',
          }}>
            <button
              onClick={() => fetchProjects({ search, stage: activeStage, industry: activeIndustry }, currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: '1px solid rgba(192,132,252,0.2)',
                color: currentPage === 1 ? '#334155' : '#94A3B8',
                padding: '8px 16px', fontSize: '11px', letterSpacing: '2px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >← Prev</button>

            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1}
                onClick={() => fetchProjects({ search, stage: activeStage, industry: activeIndustry }, i + 1)}
                style={{
                  background: currentPage === i + 1 ? 'rgba(192,132,252,0.15)' : 'transparent',
                  border: `1px solid ${currentPage === i + 1 ? '#C084FC' : 'rgba(192,132,252,0.2)'}`,
                  color: currentPage === i + 1 ? '#C084FC' : '#94A3B8',
                  padding: '8px 14px', fontSize: '11px',
                  letterSpacing: '2px', cursor: 'pointer',
                }}
              >{i + 1}</button>
            ))}

            <button
              onClick={() => fetchProjects({ search, stage: activeStage, industry: activeIndustry }, currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                background: 'transparent',
                border: '1px solid rgba(192,132,252,0.2)',
                color: currentPage === totalPages ? '#334155' : '#94A3B8',
                padding: '8px 16px', fontSize: '11px', letterSpacing: '2px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >Next →</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard
