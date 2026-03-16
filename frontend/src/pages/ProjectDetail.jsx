import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useToast, ToastContainer } from '../components/Toast'

const skeletonBase = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(192,132,252,0.06) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '600px 100%',
  animation: 'shimmer 1.6s infinite linear',
  borderRadius: '2px',
}

function SkeletonBlock({ width = '100%', height = '16px', style = {} }) {
  return <div style={{ ...skeletonBase, width, height, ...style }} />
}

function SkeletonContent() {
  return (
    <div style={{ padding: '48px 40px 0', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Stage badge */}
      <SkeletonBlock width="90px" height="24px" style={{ marginBottom: '20px' }} />
      {/* Title */}
      <SkeletonBlock width="55%" height="40px" style={{ marginBottom: '16px' }} />
      {/* Description */}
      <SkeletonBlock width="70%" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="50%" height="14px" style={{ marginBottom: '32px' }} />
      {/* Viability score */}
      <SkeletonBlock width="220px" height="52px" style={{ marginBottom: '40px' }} />
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(192,132,252,0.1)', paddingBottom: '0' }}>
        {[80, 60, 110, 100].map((w, i) => (
          <div key={i} style={{ padding: '12px 24px' }}>
            <SkeletonBlock width={`${w}px`} height="12px" />
          </div>
        ))}
      </div>
      {/* Content blocks */}
      <div style={{ paddingTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            padding: '24px', border: '1px solid rgba(192,132,252,0.06)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <SkeletonBlock width="80px" height="11px" style={{ marginBottom: '16px' }} />
            <SkeletonBlock width="100%" height="13px" style={{ marginBottom: '8px' }} />
            <SkeletonBlock width="85%" height="13px" style={{ marginBottom: '8px' }} />
            <SkeletonBlock width="60%" height="13px" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, toast } = useToast()
  const [project, setProject] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [brand, setBrand] = useState(null)
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [activeTab, setActiveTab] = useState('analysis')

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setFetchError('')
    setLoading(true)
    try {
      const [projectRes, analysisRes, brandRes, competitorsRes] = await Promise.all([
        client.get(`/projects/${id}`),
        client.get(`/analysis/${id}`),
        client.get(`/brand/${id}`),
        client.get(`/analysis/${id}/competitors`),
      ])
      setProject(projectRes.data)
      setAnalysis(analysisRes.data)
      setBrand(brandRes.data)
      setCompetitors(competitorsRes.data)
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else if (status === 404) {
        setFetchError('Project not found. It may have been deleted.')
      } else {
        setFetchError(err.response?.data?.detail || 'Failed to load project data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const Nav = () => (
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
      <button onClick={() => navigate('/dashboard')} style={{
        background: 'transparent', border: '1px solid rgba(192,132,252,0.2)',
        color: '#94A3B8', padding: '8px 20px', fontSize: '11px',
        letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
      }}>← Dashboard</button>
    </nav>
  )

  const tabs = [
    { id: 'analysis', label: 'Analysis' },
    { id: 'market', label: 'Market' },
    { id: 'brand', label: 'Brand Identity' },
    { id: 'competitors', label: 'Competitors' },
  ]

  return (
    <div style={{ backgroundColor: '#030005', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
      `}</style>

      <ToastContainer toasts={toasts} />
      <Nav />

      {/* Skeleton state */}
      {loading && <SkeletonContent />}

      {/* Error state */}
      {!loading && fetchError && (
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '80px 40px', textAlign: 'center',
        }}>
          <div style={{
            border: '1px solid rgba(255,100,100,0.15)',
            background: 'rgba(255,100,100,0.03)',
            padding: '60px 40px',
          }}>
            <p style={{
              color: '#ff6b6b', fontSize: '12px', letterSpacing: '3px',
              textTransform: 'uppercase', marginBottom: '12px',
            }}>Something went wrong</p>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '32px' }}>{fetchError}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={fetchAll} style={{
                background: 'transparent', border: '1px solid #C084FC', color: '#C084FC',
                padding: '10px 28px', fontSize: '12px', letterSpacing: '3px',
                textTransform: 'uppercase', cursor: 'pointer',
              }}>Try Again</button>
              <button onClick={() => navigate('/dashboard')} style={{
                background: 'transparent', border: '1px solid rgba(192,132,252,0.3)',
                color: '#94A3B8', padding: '10px 28px', fontSize: '12px',
                letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
              }}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {/* Loaded state */}
      {!loading && !fetchError && project && (
        <>
          {/* Project Header */}
          <div style={{ padding: '48px 40px 0', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(192,132,252,0.1)',
              border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC',
              padding: '4px 16px', fontSize: '10px', letterSpacing: '3px',
              textTransform: 'uppercase', marginBottom: '16px',
            }}>{project.stage}</div>

            <h1 style={{
              color: '#FFFFFF', fontSize: '40px', fontWeight: '200',
              letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '8px',
            }}>{project.title}</h1>

            <p style={{
              color: '#94A3B8', fontSize: '14px', lineHeight: '1.7',
              maxWidth: '600px', marginBottom: '16px',
            }}>{project.description}</p>

            {analysis && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                padding: '12px 24px', border: '1px solid rgba(192,132,252,0.2)',
                background: 'rgba(192,132,252,0.05)', marginBottom: '40px',
              }}>
                <span style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Viability Score
                </span>
                <span style={{ color: '#C084FC', fontSize: '28px', fontWeight: '300', letterSpacing: '2px' }}>
                  {analysis.viability_score}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '11px' }}>/100</span>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(192,132,252,0.1)' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#C084FC' : 'transparent'}`,
                  color: activeTab === tab.id ? '#C084FC' : '#94A3B8',
                  padding: '12px 24px', fontSize: '12px', letterSpacing: '2px',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
                }}>{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* ANALYSIS TAB */}
            {activeTab === 'analysis' && (
              analysis ? (
                <div>
                  <p style={{
                    color: '#94A3B8', fontSize: '14px', lineHeight: '1.8',
                    marginBottom: '40px', maxWidth: '700px',
                  }}>{analysis.summary}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: 'Strengths', value: analysis.strengths, color: '#4ade80' },
                      { label: 'Weaknesses', value: analysis.weaknesses, color: '#f87171' },
                      { label: 'Opportunities', value: analysis.opportunities, color: '#60a5fa' },
                      { label: 'Threats', value: analysis.threats, color: '#fb923c' },
                    ].map(item => (
                      <div key={item.label} style={{
                        padding: '24px', border: '1px solid rgba(192,132,252,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <p style={{
                          color: item.color, fontSize: '11px', letterSpacing: '3px',
                          textTransform: 'uppercase', marginBottom: '12px',
                        }}>{item.label}</p>
                        <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.7' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px', letterSpacing: '1px' }}>Analysis data not available.</p>
              )
            )}

            {/* MARKET TAB */}
            {activeTab === 'market' && (
              analysis ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {[
                    { label: 'Market Size', value: analysis.estimated_market_size, large: true },
                    { label: 'Target Region', value: analysis.target_region, large: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: '32px', border: '1px solid rgba(192,132,252,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <p style={{
                        color: '#94A3B8', fontSize: '11px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '16px',
                      }}>{item.label}</p>
                      <p style={{
                        color: '#C084FC', fontSize: item.large ? '28px' : '20px',
                        fontWeight: '200', letterSpacing: '2px',
                      }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px', letterSpacing: '1px' }}>Market data not available.</p>
              )
            )}

            {/* BRAND TAB */}
            {activeTab === 'brand' && (
              brand ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {[
                      { label: 'Tagline', value: brand.tagline },
                      { label: 'Brand Voice', value: brand.brand_voice },
                      { label: 'Personality', value: brand.personality_type },
                    ].map(item => (
                      <div key={item.label} style={{
                        padding: '24px', border: '1px solid rgba(192,132,252,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <p style={{
                          color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                          textTransform: 'uppercase', marginBottom: '12px',
                        }}>{item.label}</p>
                        <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6', letterSpacing: '1px' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {brand.mission_statement && (
                    <div style={{
                      padding: '24px', border: '1px solid rgba(192,132,252,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <p style={{
                        color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '12px',
                      }}>Mission Statement</p>
                      <p style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '1.8', fontStyle: 'italic' }}>
                        {brand.mission_statement}
                      </p>
                    </div>
                  )}

                  {brand.color_palette && (
                    <div style={{
                      padding: '24px', border: '1px solid rgba(192,132,252,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <p style={{
                        color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '20px',
                      }}>Color Palette — {brand.color_palette.palette_name}</p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Primary',    hex: brand.color_palette.primary_hex },
                          { label: 'Secondary',  hex: brand.color_palette.secondary_hex },
                          { label: 'Accent',     hex: brand.color_palette.accent_hex },
                          { label: 'Background', hex: brand.color_palette.background_hex },
                        ].map(color => (
                          <div key={color.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '64px', height: '64px', borderRadius: '2px',
                              background: color.hex, border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: `0 0 20px ${color.hex}40`,
                            }} />
                            <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '1px' }}>{color.label}</p>
                            <p style={{ color: '#FFFFFF', fontSize: '10px', letterSpacing: '1px', fontFamily: 'monospace' }}>
                              {color.hex}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px', letterSpacing: '1px' }}>Brand data not available.</p>
              )
            )}

            {/* COMPETITORS TAB */}
            {activeTab === 'competitors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {competitors.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '13px', letterSpacing: '1px' }}>No competitors found.</p>
                ) : (
                  competitors.map(comp => (
                    <div key={comp.id} style={{
                      padding: '24px', border: '1px solid rgba(192,132,252,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: '12px',
                      }}>
                        <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '300', letterSpacing: '2px' }}>
                          {comp.name}
                        </h3>
                        {comp.country && (
                          <span style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '2px' }}>{comp.country}</span>
                        )}
                      </div>
                      {comp.website && (
                        <a href={comp.website} target="_blank" rel="noreferrer" style={{
                          color: '#9333EA', fontSize: '12px', letterSpacing: '1px',
                          textDecoration: 'none', display: 'block', marginBottom: '8px',
                        }}>{comp.website}</a>
                      )}
                      <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>{comp.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectDetail
