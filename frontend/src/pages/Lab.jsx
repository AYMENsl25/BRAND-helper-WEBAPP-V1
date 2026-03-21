import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const INDUSTRIES = [
  'AI / Machine Learning', 'Fintech', 'Health / MedTech',
  'Education', 'E-commerce', 'Food & Delivery',
  'Transport / Mobility', 'Sustainability', 'Entertainment',
  'Real Estate', 'Agriculture', 'Fashion', 'Other'
]

const PERSONALITIES = [
  { label: 'Minimal', desc: 'Clean, simple, less is more', icon: '◻' },
  { label: 'Bold', desc: 'Strong, confident, impactful', icon: '◼' },
  { label: 'Playful', desc: 'Fun, energetic, creative', icon: '◈' },
  { label: 'Luxury', desc: 'Premium, elegant, refined', icon: '◇' },
]

const STAGES = [
  { label: 'Just an Idea', value: 'idea', icon: '💡' },
  { label: 'Building MVP', value: 'mvp', icon: '🚀' },
  { label: 'Already Launched', value: 'launched', icon: '✅' },
]

function Lab() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otherIndustry, setOtherIndustry] = useState('')

  const [formData, setFormData] = useState({
    description: '',
    personality: '',
    industry: '',
    stage: 'idea',
    title: '',
  })

  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      // Create project
      const industryValue = formData.industry === 'Other' ? otherIndustry.trim() : formData.industry

      const projectRes = await client.post('/projects/', {
        title: formData.title,
        description: formData.description,
        industry: industryValue,
        stage: formData.stage,
      })

      const projectId = projectRes.data.id

      // Trigger AI analysis
      await client.post(`/analysis/${projectId}/analyze`)

      // Generate brand
      await client.post(`/brand/${projectId}/generate`)

      // Go to project detail
      navigate(`/project/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.description.length > 20
    if (step === 2) return formData.personality !== ''
    if (step === 3) return formData.industry !== '' && (formData.industry !== 'Other' || otherIndustry.trim().length > 0)
    if (step === 4) return formData.stage !== ''
    if (step === 5) return formData.title.length > 2
    return true
  }

  return (
    <div style={{
      backgroundColor: '#030005',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(192,132,252,0.1)',
      }}>
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

        <span style={{
          color: '#94A3B8',
          fontSize: '12px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>Identity Lab</span>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '2px',
          }}
        >✕ Exit</button>
      </div>

      {/* Progress Bar */}
      <div style={{
        padding: '0 40px',
        marginTop: '32px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          {[1,2,3,4,5].map(s => (
            <div key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: s <= step ? '#C084FC' : 'rgba(192,132,252,0.1)',
                border: `1px solid ${s <= step ? '#C084FC' : 'rgba(192,132,252,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: s <= step ? '#030005' : '#94A3B8',
                fontWeight: '700',
                transition: 'all 0.3s',
              }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{
          height: '1px',
          background: 'rgba(192,132,252,0.1)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
            background: 'linear-gradient(90deg, #9333EA, #C084FC)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Step Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        maxWidth: '700px',
        margin: '0 auto',
        width: '100%',
      }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{
              color: '#9333EA',
              fontSize: '11px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>Step 1 of 5</p>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '200',
              letterSpacing: '4px',
              marginBottom: '16px',
            }}>What is the soul of your business?</h2>
            <p style={{
              color: '#94A3B8',
              fontSize: '13px',
              letterSpacing: '2px',
              marginBottom: '40px',
            }}>Describe your startup idea in a few sentences</p>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="e.g. A platform that helps small restaurants manage their online orders and delivery..."
              rows={5}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(192,132,252,0.2)',
                color: '#FFFFFF',
                padding: '20px',
                fontSize: '15px',
                outline: 'none',
                resize: 'none',
                lineHeight: '1.8',
                letterSpacing: '0.5px',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#C084FC'}
              onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.2)'}
            />
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {formData.description.length > 0 && formData.description.length <= 20 ? (
                <p style={{ color: '#ff6b6b', fontSize: '11px', letterSpacing: '1px', margin: 0 }}>
                  Minimum 21 characters required
                </p>
              ) : <span />}
              <p style={{
                color: formData.description.length > 20 ? '#9333EA' : '#94A3B8',
                fontSize: '11px',
                letterSpacing: '2px',
                margin: 0,
              }}>{formData.description.length} characters</p>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{
              color: '#9333EA',
              fontSize: '11px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>Step 2 of 5</p>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '200',
              letterSpacing: '4px',
              marginBottom: '16px',
            }}>Choose your brand's personality</h2>
            <p style={{
              color: '#94A3B8',
              fontSize: '13px',
              letterSpacing: '2px',
              marginBottom: '40px',
            }}>This shapes your logo, colors and voice</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              {PERSONALITIES.map(p => (
                <div
                  key={p.label}
                  onClick={() => setFormData({...formData, personality: p.label})}
                  style={{
                    padding: '28px',
                    border: `1px solid ${formData.personality === p.label ? '#C084FC' : 'rgba(192,132,252,0.15)'}`,
                    background: formData.personality === p.label ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    marginBottom: '12px',
                    color: '#C084FC',
                  }}>{p.icon}</div>
                  <div style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                  }}>{p.label}</div>
                  <div style={{
                    color: '#94A3B8',
                    fontSize: '12px',
                    letterSpacing: '1px',
                  }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{
              color: '#9333EA',
              fontSize: '11px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>Step 3 of 5</p>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '200',
              letterSpacing: '4px',
              marginBottom: '16px',
            }}>What industry are you in?</h2>
            <p style={{
              color: '#94A3B8',
              fontSize: '13px',
              letterSpacing: '2px',
              marginBottom: '40px',
            }}>Select the closest match to your business</p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
            }}>
              {INDUSTRIES.map(ind => (
                <div
                  key={ind}
                  onClick={() => setFormData({...formData, industry: ind})}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${formData.industry === ind ? '#C084FC' : 'rgba(192,132,252,0.15)'}`,
                    background: formData.industry === ind ? 'rgba(192,132,252,0.1)' : 'transparent',
                    color: formData.industry === ind ? '#C084FC' : '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s',
                  }}
                >{ind}</div>
              ))}
            </div>
            {formData.industry === 'Other' && (
              <input
                autoFocus
                type="text"
                value={otherIndustry}
                onChange={e => setOtherIndustry(e.target.value)}
                placeholder="Enter your industry..."
                style={{
                  marginTop: '24px',
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #C084FC',
                  color: '#FFFFFF',
                  padding: '14px 20px',
                  fontSize: '14px',
                  outline: 'none',
                  letterSpacing: '1px',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{
              color: '#9333EA',
              fontSize: '11px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>Step 4 of 5</p>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '200',
              letterSpacing: '4px',
              marginBottom: '16px',
            }}>Where are you in the journey?</h2>
            <p style={{
              color: '#94A3B8',
              fontSize: '13px',
              letterSpacing: '2px',
              marginBottom: '40px',
            }}>Select your current stage</p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {STAGES.map(s => (
                <div
                  key={s.value}
                  onClick={() => setFormData({...formData, stage: s.value})}
                  style={{
                    padding: '24px 32px',
                    border: `1px solid ${formData.stage === s.value ? '#C084FC' : 'rgba(192,132,252,0.15)'}`,
                    background: formData.stage === s.value ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <span style={{
                    color: formData.stage === s.value ? '#C084FC' : '#FFFFFF',
                    fontSize: '16px',
                    letterSpacing: '2px',
                  }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{
              color: '#9333EA',
              fontSize: '11px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>Step 5 of 5</p>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '200',
              letterSpacing: '4px',
              marginBottom: '16px',
            }}>What should we call it?</h2>
            <p style={{
              color: '#94A3B8',
              fontSize: '13px',
              letterSpacing: '2px',
              marginBottom: '40px',
            }}>Give your startup a name</p>

            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. BrandForge, EcoRide, HealthAI..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(192,132,252,0.2)',
                color: '#FFFFFF',
                padding: '20px',
                fontSize: '20px',
                outline: 'none',
                letterSpacing: '3px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#C084FC'}
              onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.2)'}
            />

            {/* Summary */}
            <div style={{
              marginTop: '40px',
              padding: '24px',
              border: '1px solid rgba(192,132,252,0.1)',
              background: 'rgba(192,132,252,0.03)',
              textAlign: 'left',
            }}>
              <p style={{
                color: '#94A3B8',
                fontSize: '10px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>Your Identity Summary</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Personality', value: formData.personality },
                  { label: 'Industry', value: formData.industry === 'Other' ? otherIndustry : formData.industry },
                  { label: 'Stage', value: formData.stage },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      color: '#94A3B8',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}>{item.label}</span>
                    <span style={{
                      color: '#C084FC',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                marginTop: '16px',
                color: '#ff6b6b',
                fontSize: '13px',
                letterSpacing: '1px',
              }}>{error}</div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: '48px',
          gap: '16px',
        }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: '1px solid rgba(192,132,252,0.2)',
                color: '#94A3B8',
                padding: '14px 32px',
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >← Back</button>
          )}

          <button
            onClick={step === totalSteps ? handleSubmit : handleNext}
            disabled={!canProceed() || loading}
            style={{
              marginLeft: 'auto',
              background: canProceed() && !loading ? 'transparent' : 'transparent',
              border: `1px solid ${canProceed() && !loading ? '#C084FC' : 'rgba(192,132,252,0.2)'}`,
              color: canProceed() && !loading ? '#C084FC' : 'rgba(192,132,252,0.3)',
              padding: '14px 48px',
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: canProceed() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              boxShadow: canProceed() && !loading ? '0 0 20px rgba(192,132,252,0.2)' : 'none',
            }}
            onMouseEnter={e => {
              if (canProceed() && !loading) {
                e.target.style.background = '#C084FC'
                e.target.style.color = '#030005'
              }
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent'
              e.target.style.color = canProceed() && !loading ? '#C084FC' : 'rgba(192,132,252,0.3)'
            }}
          >
            {loading ? 'Generating...' : step === totalSteps ? 'Generate Identity →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Lab