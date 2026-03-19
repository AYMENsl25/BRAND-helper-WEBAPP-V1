import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
      <SkeletonBlock width="90px" height="24px" style={{ marginBottom: '20px' }} />
      <SkeletonBlock width="55%" height="40px" style={{ marginBottom: '16px' }} />
      <SkeletonBlock width="70%" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="50%" height="14px" style={{ marginBottom: '32px' }} />
      <SkeletonBlock width="220px" height="52px" style={{ marginBottom: '40px' }} />
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(192,132,252,0.1)', paddingBottom: '0' }}>
        {[80, 60, 110, 100].map((w, i) => (
          <div key={i} style={{ padding: '12px 24px' }}>
            <SkeletonBlock width={`${w}px`} height="12px" />
          </div>
        ))}
      </div>
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

const FONT_OPTIONS = [
  { id: 'editorial', label: 'Editorial Serif', family: '"Georgia", "Times New Roman", serif', pdfFamily: 'times', pdfStyle: 'normal' },
  { id: 'modern', label: 'Modern Sans', family: '"Trebuchet MS", "Gill Sans", sans-serif', pdfFamily: 'helvetica', pdfStyle: 'normal' },
  { id: 'mono', label: 'Technical Mono', family: '"Courier New", monospace', pdfFamily: 'courier', pdfStyle: 'normal' },
  { id: 'grotesk', label: 'Grotesk Bold', family: '"Arial Black", "Arial Bold", sans-serif', pdfFamily: 'helvetica', pdfStyle: 'bold' },
  { id: 'classic', label: 'Classic Roman', family: '"Palatino Linotype", "Book Antiqua", serif', pdfFamily: 'times', pdfStyle: 'italic' },
]

function normalizeHexColor(value) {
  if (!value) return null
  const trimmed = value.trim()
  const shortMatch = trimmed.match(/^#([0-9a-f]{3})$/i)
  if (shortMatch) {
    return `#${shortMatch[1].split('').map(char => char + char).join('').toUpperCase()}`
  }
  const longMatch = trimmed.match(/^#([0-9a-f]{6})$/i)
  if (longMatch) {
    return `#${longMatch[1].toUpperCase()}`
  }
  return null
}

function rgbStringToHex(value) {
  const match = value.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i)
  if (!match) return null
  const [r, g, b] = match.slice(1, 4).map(Number)
  if ([r, g, b].some(channel => channel < 0 || channel > 255)) return null
  return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

function extractHexColorsFromSvg(svgString) {
  if (!svgString) return []
  const uniqueColors = new Set()
  const hexMatches = svgString.match(/#([0-9A-Fa-f]{6})/g) || []
  const rgbMatches = svgString.match(/rgb\s*\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)/g) || []

  hexMatches.forEach(match => {
    const normalized = normalizeHexColor(match)
    if (normalized) uniqueColors.add(normalized)
  })

  rgbMatches.forEach(match => {
    const normalized = rgbStringToHex(match)
    if (normalized) uniqueColors.add(normalized)
  })

  return Array.from(uniqueColors)
}

function escapeSvgText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildFallbackSvg(title, colors) {
  const initials = (title || 'B')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || '')
    .join('') || 'B'

  const primary = colors[0] || '#1F2937'
  const secondary = colors[1] || '#8B5CF6'
  const accent = colors[2] || '#E5E7EB'

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="#FFFFFF"/>
      <rect x="72" y="72" width="368" height="368" rx="56" fill="${primary}"/>
      <circle cx="390" cy="122" r="34" fill="${secondary}"/>
      <path d="M128 376C183 284 251 238 360 172" stroke="${accent}" stroke-width="22" stroke-linecap="round" fill="none"/>
      <text x="256" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="124" font-weight="700" fill="#FFFFFF">${escapeSvgText(initials)}</text>
    </svg>
  `.trim()
}

function ensureArrayColors(values) {
  return Array.from(new Set(values.map(normalizeHexColor).filter(Boolean)))
}

function mmToPt(mm) {
  return mm * 2.834645669
}

function buildAbsoluteAssetUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`
}

async function loadImage(src) {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function svgToPngDataUrl(svgString, size = 1200) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)

  try {
    const img = await loadImage(objectUrl)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    context.fillStyle = '#FFFFFF'
    context.fillRect(0, 0, size, size)
    context.drawImage(img, 0, 0, size, size)
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function sanitizeFileName(value) {
  return (value || 'Brand')
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toasts, toast } = useToast()
  const [project, setProject] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [brand, setBrand] = useState(null)
  const [competitors, setCompetitors] = useState([])
  const [feedback, setFeedback] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analysis')

  const [fbRating, setFbRating] = useState(0)
  const [fbHover, setFbHover] = useState(0)
  const [fbComment, setFbComment] = useState('')
  const [fbSubmitting, setFbSubmitting] = useState(false)
  const [selectedFontId, setSelectedFontId] = useState(FONT_OPTIONS[0].id)
  const [logoSvgString, setLogoSvgString] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)

  const handleLogoClick = () => {
    navigate(localStorage.getItem('token') ? '/dashboard' : '/')
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    let cancelled = false

    const loadJspdf = async () => {
      if (window.jspdf?.jsPDF) {
        if (!cancelled) setPdfReady(true)
        return
      }

      const existing = document.querySelector('script[data-jspdf-cdn="1"]')
      if (existing) {
        const onLoad = () => !cancelled && setPdfReady(true)
        existing.addEventListener('load', onLoad)
        return () => existing.removeEventListener('load', onLoad)
      }

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.async = true
      script.setAttribute('data-jspdf-cdn', '1')
      script.onload = () => !cancelled && setPdfReady(true)
      document.body.appendChild(script)
    }

    loadJspdf()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadLogoSvg = async () => {
      if (!brand || !project) {
        setLogoSvgString('')
        return
      }

      const paletteSeed = ensureArrayColors([
        brand.color_palette?.primary_hex,
        brand.color_palette?.secondary_hex,
        brand.color_palette?.accent_hex,
        brand.color_palette?.background_hex,
      ])

      const selectedLogo = brand.logo_prompts?.find(item => item.is_selected) || brand.logo_prompts?.[0]
      const inlineSvg = selectedLogo?.svg_string || brand.svg_string || ''
      if (inlineSvg) {
        if (!cancelled) setLogoSvgString(inlineSvg)
        return
      }

      const logoUrl = buildAbsoluteAssetUrl(selectedLogo?.image_url)
      if (logoUrl && /\.svg($|\?)/i.test(logoUrl)) {
        try {
          const response = await fetch(logoUrl)
          const svgText = await response.text()
          if (!cancelled && svgText.includes('<svg')) {
            setLogoSvgString(svgText)
            return
          }
        } catch {
          // Fall back to a generated SVG shell if the asset can't be loaded as text.
        }
      }

      if (!cancelled) {
        setLogoSvgString(buildFallbackSvg(project.title, paletteSeed))
      }
    }

    loadLogoSvg()

    return () => {
      cancelled = true
    }
  }, [brand, project])

  const fetchAll = async () => {
    setFetchError('')
    setLoading(true)
    try {
      const [projectRes, analysisRes, brandRes, competitorsRes, feedbackRes, userRes] = await Promise.all([
        client.get(`/projects/${id}`),
        client.get(`/analysis/${id}`),
        client.get(`/brand/${id}`),
        client.get(`/analysis/${id}/competitors`),
        client.get(`/feedback/${id}`),
        client.get('/auth/me'),
      ])
      setProject(projectRes.data)
      setAnalysis(analysisRes.data)
      setBrand(brandRes.data)
      setCompetitors(competitorsRes.data)
      setFeedback(feedbackRes.data)
      setUser(userRes.data)
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (fbRating === 0) return
    setFbSubmitting(true)
    try {
      const res = await client.post('/feedback/', {
        project_id: parseInt(id),
        rating: fbRating,
        comment: fbComment || null,
      })
      setFeedback(prev => [...prev, res.data])
      setFbRating(0)
      setFbComment('')
      toast.success('Feedback submitted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit feedback')
    } finally {
      setFbSubmitting(false)
    }
  }

  const handleDownloadBrandKit = async () => {
    if (!window.jspdf?.jsPDF) {
      toast.error('PDF generator is still loading. Please try again in a moment.')
      return
    }

    if (!project || !brand) {
      toast.error('Brand kit data is not ready yet.')
      return
    }

    setPdfLoading(true)

    try {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const headerHeight = 46
      const footerHeight = 28
      const safeLeft = 48
      const safeRight = pageWidth - 48
      const bodyTop = 84
      const bodyBottom = pageHeight - 54
      const logoPng = await svgToPngDataUrl(logoSvgString || buildFallbackSvg(project.title, kitColors), 1400)

      const drawPageChrome = (title) => {
        doc.setFillColor(primaryColor)
        doc.rect(0, 0, pageWidth, headerHeight, 'F')
        doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F')
        doc.setTextColor('#FFFFFF')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text(title, safeLeft, 30)
      }

      drawPageChrome(`${project.title} Brand Kit`)

      doc.addImage(logoPng, 'PNG', safeLeft, bodyTop, 150, 150)
      doc.setTextColor('#111827')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('Logo & Palette', safeLeft, bodyTop - 14)

      const swatchTop = bodyTop + 184
      kitColors.slice(0, 5).forEach((color, index) => {
        const x = safeLeft + (index * 98)
        doc.setFillColor(color)
        doc.roundedRect(x, swatchTop, 72, 72, 8, 8, 'F')
        doc.setTextColor('#111827')
        doc.setFont('courier', 'normal')
        doc.setFontSize(10)
        doc.text(color, x, swatchTop + 90)
      })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('Typography', safeLeft, swatchTop + 138)
      FONT_OPTIONS.forEach((font, index) => {
        const y = swatchTop + 170 + (index * 28)
        doc.setFont(font.pdfFamily, font.id === selectedFont.id ? 'bold' : font.pdfStyle)
        doc.setFontSize(16)
        doc.text(`${project.title}  ${font.label}`, safeLeft, y)
      })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      const promptText = selectedLogo?.prompt_text || brand.tagline || 'Generated brand logo'
      doc.text(doc.splitTextToSize(promptText, 260), safeRight - 260, bodyTop + 20)

      doc.addPage()
      drawPageChrome('Business Cards')

      const cardW = mmToPt(90)
      const cardH = mmToPt(55)
      const gap = 28
      const cardsY = 190
      const frontX = safeLeft
      const backX = safeLeft + cardW + gap

      doc.setFillColor(primaryColor)
      doc.roundedRect(frontX, cardsY, cardW, cardH, 12, 12, 'F')
      doc.setFillColor(secondaryColor)
      doc.rect(frontX + 18, cardsY + 18, 5, cardH - 36, 'F')
      doc.setTextColor('#FFFFFF')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text(project.title, frontX + 34, cardsY + 34)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Alex Morgan', frontX + 34, cardsY + 62)
      doc.text('Creative Director', frontX + 34, cardsY + 78)
      doc.text('hello@brand.com', frontX + 34, cardsY + 102)
      doc.text('+1 (555) 240-1188', frontX + 34, cardsY + 118)

      doc.setFillColor(backgroundColor)
      doc.roundedRect(backX, cardsY, cardW, cardH, 12, 12, 'F')
      doc.setFillColor(primaryColor)
      doc.roundedRect(backX + 16, cardsY + 16, cardW - 32, cardH - 32, 10, 10, 'F')
      doc.addImage(logoPng, 'PNG', backX + (cardW / 2) - 38, cardsY + 20, 76, 76)
      doc.setDrawColor(accentColor)
      doc.setLineWidth(2)
      doc.line(backX + 24, cardsY + cardH - 24, backX + cardW - 24, cardsY + cardH - 24)

      doc.setTextColor('#111827')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('Front', frontX, cardsY - 20)
      doc.text('Back', backX, cardsY - 20)

      doc.addPage()
      drawPageChrome('Letterhead')

      const sheetX = safeLeft
      const sheetY = 96
      const sheetW = pageWidth - (safeLeft * 2)
      const sheetH = bodyBottom - sheetY
      doc.setFillColor(backgroundColor)
      doc.rect(sheetX, sheetY, sheetW, sheetH, 'F')
      doc.setFillColor(primaryColor)
      doc.rect(sheetX, sheetY, sheetW, 74, 'F')
      doc.addImage(logoPng, 'PNG', sheetX + 24, sheetY + 14, 44, 44)
      doc.setTextColor('#FFFFFF')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.text(project.title, sheetX + 82, sheetY + 42)
      doc.setDrawColor(secondaryColor)
      doc.setLineWidth(3)
      doc.line(sheetX + 24, sheetY + 102, sheetX + sheetW - 24, sheetY + 102)
      doc.setTextColor('#111827')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.text(['123 Creative Avenue', 'Istanbul, TR 34000', 'hello@brand.com', '+1 (555) 240-1188'], sheetX + 24, sheetY + 132)
      const linesStart = sheetY + 220
      ;[0, 1, 2, 3, 4, 5].forEach(index => {
        const y = linesStart + (index * 28)
        doc.setDrawColor('#D1D5DB')
        doc.setLineWidth(1)
        doc.line(sheetX + 24, y, sheetX + sheetW - 24, y)
      })
      doc.setFillColor(accentColor)
      doc.rect(sheetX, sheetY + sheetH - 42, sheetW, 42, 'F')

      doc.save(`${sanitizeFileName(project.title)}-Brand-Kit.pdf`)
      toast.success('Brand kit PDF downloaded')
    } catch {
      toast.error('Failed to generate brand kit PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const Nav = () => (
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
    { id: 'kit', label: 'Kit Maker' },
    { id: 'competitors', label: 'Competitors' },
  ]

  const selectedFont = FONT_OPTIONS.find(option => option.id === selectedFontId) || FONT_OPTIONS[0]
  const extractedSvgColors = useMemo(() => extractHexColorsFromSvg(logoSvgString), [logoSvgString])
  const paletteColors = useMemo(() => ensureArrayColors([
    brand?.color_palette?.primary_hex,
    brand?.color_palette?.secondary_hex,
    brand?.color_palette?.accent_hex,
    brand?.color_palette?.background_hex,
  ]), [brand])
  const kitColors = useMemo(() => {
    const combined = [...extractedSvgColors, ...paletteColors]
    const unique = ensureArrayColors(combined)
    return unique.slice(0, 5)
  }, [extractedSvgColors, paletteColors])
  const primaryColor = kitColors[0] || '#1F2937'
  const secondaryColor = kitColors[1] || brand?.color_palette?.secondary_hex || '#8B5CF6'
  const accentColor = kitColors[2] || brand?.color_palette?.accent_hex || '#CBD5E1'
  const backgroundColor = normalizeHexColor(brand?.color_palette?.background_hex) || '#F8FAFC'
  const logoDataUri = useMemo(() => {
    if (!logoSvgString) return ''
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvgString)}`
  }, [logoSvgString])
  const selectedLogo = brand?.logo_prompts?.find(item => item.is_selected) || brand?.logo_prompts?.[0]
  const displayLogoSrc = logoDataUri || buildAbsoluteAssetUrl(selectedLogo?.image_url) || ''

  return (
    <div style={{ backgroundColor: '#030005', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        textarea::placeholder { color: #475569; }
      `}</style>

      <ToastContainer toasts={toasts} />
      <Nav />

      {loading && <SkeletonContent />}

      {!loading && fetchError && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{
            border: '1px solid rgba(255,100,100,0.15)',
            background: 'rgba(255,100,100,0.03)', padding: '60px 40px',
          }}>
            <p style={{ color: '#ff6b6b', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Something went wrong
            </p>
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

      {!loading && !fetchError && project && (
        <>
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
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>Analysis data not available.</p>
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
                        color: '#C084FC',
                        fontSize: item.large ? '28px' : '20px',
                        fontWeight: '200', letterSpacing: '2px',
                      }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>Market data not available.</p>
              )
            )}

            {/* BRAND TAB */}
            {activeTab === 'brand' && (
              brand ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Tagline, Voice, Personality */}
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
                        <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6', letterSpacing: '1px' }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Mission Statement */}
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

                  {/* Color Palette */}
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
                          { label: 'Primary', hex: brand.color_palette.primary_hex },
                          { label: 'Secondary', hex: brand.color_palette.secondary_hex },
                          { label: 'Accent', hex: brand.color_palette.accent_hex },
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

                  {/* Generated Logo */}
                  {brand.logo_prompts && brand.logo_prompts.length > 0 && (
                    <div style={{
                      padding: '24px', border: '1px solid rgba(192,132,252,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <p style={{
                        color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '20px',
                      }}>Generated Logo</p>

                      {brand.logo_prompts[0].image_url ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
                          <img
                            src={brand.logo_prompts[0].image_url}
                            alt="Generated Logo"
                            style={{
                              width: '200px', height: '200px',
                              objectFit: 'contain',
                              border: '1px solid rgba(192,132,252,0.2)',
                              background: '#ffffff', padding: '16px',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{
                              color: '#64748B', fontSize: '10px', letterSpacing: '2px',
                              textTransform: 'uppercase', marginBottom: '8px',
                            }}>Logo Prompt</p>
                            <p style={{
                              color: '#94A3B8', fontSize: '12px', lineHeight: '1.7',
                              marginBottom: '20px', maxWidth: '400px',
                            }}>{brand.logo_prompts[0].prompt_text}</p>
                            <a
                              href={brand.logo_prompts[0].image_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#C084FC', fontSize: '11px',
                                letterSpacing: '2px', textTransform: 'uppercase',
                                textDecoration: 'none',
                                border: '1px solid rgba(192,132,252,0.3)',
                                padding: '8px 20px', display: 'inline-block',
                              }}
                              onMouseEnter={e => e.target.style.borderColor = '#C084FC'}
                              onMouseLeave={e => e.target.style.borderColor = 'rgba(192,132,252,0.3)'}
                            >Download Logo &#8599;</a>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{
                            color: '#64748B', fontSize: '10px', letterSpacing: '2px',
                            textTransform: 'uppercase', marginBottom: '8px',
                          }}>Logo Prompt</p>
                          <p style={{
                            color: '#94A3B8', fontSize: '12px',
                            lineHeight: '1.7', marginBottom: '16px',
                          }}>{brand.logo_prompts[0].prompt_text}</p>
                          <p style={{ color: '#475569', fontSize: '11px', letterSpacing: '1px' }}>
                            Logo image generation in progress...
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>Brand data not available.</p>
              )
            )}

            {activeTab === 'kit' && (
              brand ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px',
                    flexWrap: 'wrap',
                    padding: '24px',
                    border: '1px solid rgba(192,132,252,0.1)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div>
                      <p style={{
                        color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '10px',
                      }}>Page 2</p>
                      <h2 style={{
                        color: '#FFFFFF', fontSize: '28px', fontWeight: '300',
                        letterSpacing: '3px', marginBottom: '10px',
                      }}>Kit Maker</h2>
                      <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.7', maxWidth: '620px' }}>
                        This page turns the generated logo into a ready-to-use brand kit with extracted colors,
                        typography exploration, live collateral previews, and a downloadable PDF.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadBrandKit}
                      disabled={!pdfReady || pdfLoading}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${!pdfReady || pdfLoading ? 'rgba(192,132,252,0.2)' : '#C084FC'}`,
                        color: !pdfReady || pdfLoading ? '#475569' : '#C084FC',
                        padding: '12px 24px',
                        fontSize: '11px',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        cursor: !pdfReady || pdfLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {pdfLoading ? 'Generating PDF...' : 'Download Brand Kit PDF'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '24px' }}>
                    <div style={{
                      padding: '24px',
                      border: '1px solid rgba(192,132,252,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <p style={{
                        color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '18px',
                      }}>Processed Logo</p>
                      <div style={{
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        minHeight: '260px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        marginBottom: '20px',
                      }}>
                        {displayLogoSrc ? (
                          <img
                            src={displayLogoSrc}
                            alt={`${project.title} logo`}
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ color: '#475569', fontSize: '12px', letterSpacing: '2px' }}>Logo unavailable</span>
                        )}
                      </div>

                      <p style={{
                        color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                        textTransform: 'uppercase', marginBottom: '14px',
                      }}>Extracted Colors</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: '14px' }}>
                        {kitColors.slice(0, 5).map(color => (
                          <div key={color}>
                            <div style={{
                              height: '72px',
                              borderRadius: '8px',
                              background: color,
                              border: '1px solid rgba(255,255,255,0.08)',
                              marginBottom: '8px',
                            }} />
                            <p style={{ color: '#E2E8F0', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{color}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{
                        padding: '24px',
                        border: '1px solid rgba(192,132,252,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <p style={{
                          color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                          textTransform: 'uppercase', marginBottom: '16px',
                        }}>Typography</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                          {FONT_OPTIONS.map(option => {
                            const active = option.id === selectedFont.id
                            return (
                              <button
                                key={option.id}
                                onClick={() => setSelectedFontId(option.id)}
                                style={{
                                  background: active ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.01)',
                                  border: `1px solid ${active ? '#C084FC' : 'rgba(192,132,252,0.14)'}`,
                                  color: '#FFFFFF',
                                  padding: '18px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                }}
                              >
                                <p style={{ color: active ? '#C084FC' : '#94A3B8', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                                  {option.label}
                                </p>
                                <p style={{ fontFamily: option.family, fontSize: '28px', lineHeight: '1.2' }}>
                                  {project.title}
                                </p>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div style={{
                        padding: '24px',
                        border: '1px solid rgba(192,132,252,0.1)',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <p style={{
                          color: '#94A3B8', fontSize: '10px', letterSpacing: '3px',
                          textTransform: 'uppercase', marginBottom: '20px',
                        }}>Live Previews</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '22px' }}>
                          <div style={{
                            background: primaryColor,
                            borderRadius: '12px',
                            minHeight: '220px',
                            overflow: 'hidden',
                            position: 'relative',
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '10px',
                              height: '100%',
                              background: secondaryColor,
                            }} />
                            <div style={{ padding: '28px 32px 28px 42px', color: '#FFFFFF', fontFamily: selectedFont.family }}>
                              <p style={{ fontSize: '34px', marginBottom: '20px', lineHeight: '1.1' }}>{project.title}</p>
                              <p style={{ fontSize: '15px', marginBottom: '6px', opacity: 0.96 }}>Alex Morgan</p>
                              <p style={{ fontSize: '12px', marginBottom: '22px', letterSpacing: '1px', textTransform: 'uppercase', color: accentColor }}>
                                Brand Strategist
                              </p>
                              <div style={{ display: 'grid', gap: '8px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', letterSpacing: '0.6px' }}>
                                <span>hello@brand.com</span>
                                <span>+1 (555) 240-1188</span>
                              </div>
                            </div>
                          </div>

                          <div style={{
                            background: backgroundColor,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(148,163,184,0.18)',
                          }}>
                            <div style={{ background: primaryColor, height: '76px', padding: '22px 28px', color: '#FFFFFF' }}>
                              <p style={{ fontFamily: selectedFont.family, fontSize: '26px', lineHeight: '1.1' }}>{project.title}</p>
                            </div>
                            <div style={{ height: '4px', background: secondaryColor }} />
                            <div style={{ padding: '24px 28px 32px', color: '#111827' }}>
                              <div style={{ marginBottom: '28px', fontSize: '12px', lineHeight: '1.8' }}>
                                <p>123 Creative Avenue</p>
                                <p>Istanbul, TR 34000</p>
                                <p>hello@brand.com</p>
                              </div>
                              <div style={{ display: 'grid', gap: '14px', marginBottom: '34px' }}>
                                {[1, 2, 3, 4, 5].map(line => (
                                  <div key={line} style={{ height: '1px', background: 'rgba(148,163,184,0.35)' }} />
                                ))}
                              </div>
                            </div>
                            <div style={{ background: accentColor, height: '22px' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '13px' }}>Brand data not available.</p>
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

          {/* Feedback Section */}
          <div style={{ padding: '0 40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid rgba(192,132,252,0.08)', paddingTop: '40px' }}>
              <p style={{
                color: '#64748B', fontSize: '10px', letterSpacing: '3px',
                textTransform: 'uppercase', marginBottom: '28px',
              }}>Feedback</p>

              {feedback.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {feedback.map(f => (
                    <div key={f.id} style={{
                      padding: '16px 20px',
                      border: '1px solid rgba(192,132,252,0.08)',
                      background: 'rgba(255,255,255,0.01)',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: f.comment ? '10px' : '0',
                      }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ fontSize: '18px', color: s <= f.rating ? '#C084FC' : '#2d1f3d' }}>★</span>
                          ))}
                        </div>
                        <span style={{ color: '#475569', fontSize: '10px', letterSpacing: '1px' }}>
                          {new Date(f.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {f.comment && (
                        <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>{f.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {user && feedback.some(f => f.user_id === user.id) ? (
                <p style={{ color: '#475569', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  You have already submitted feedback for this project.
                </p>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{
                      color: '#64748B', fontSize: '10px', letterSpacing: '2px',
                      textTransform: 'uppercase', marginBottom: '12px',
                    }}>Your Rating</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span
                          key={s}
                          onClick={() => setFbRating(s)}
                          onMouseEnter={() => setFbHover(s)}
                          onMouseLeave={() => setFbHover(0)}
                          style={{
                            fontSize: '32px', cursor: 'pointer',
                            color: s <= (fbHover || fbRating) ? '#C084FC' : '#2d1f3d',
                            transition: 'color 0.1s', userSelect: 'none',
                          }}
                        >★</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{
                      color: '#64748B', fontSize: '10px', letterSpacing: '2px',
                      textTransform: 'uppercase', marginBottom: '12px',
                    }}>Comment <span style={{ color: '#334155', textTransform: 'none', letterSpacing: '0' }}>(optional)</span></p>
                    <textarea
                      value={fbComment}
                      onChange={e => setFbComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(192,132,252,0.15)',
                        color: '#E2E8F0', padding: '10px 14px',
                        fontSize: '13px', minHeight: '80px',
                        resize: 'vertical', outline: 'none',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(192,132,252,0.45)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.15)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={fbRating === 0 || fbSubmitting}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${fbRating === 0 ? 'rgba(192,132,252,0.2)' : '#C084FC'}`,
                      color: fbRating === 0 ? '#475569' : '#C084FC',
                      padding: '10px 32px', fontSize: '11px',
                      letterSpacing: '3px', textTransform: 'uppercase',
                      cursor: fbRating === 0 || fbSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {fbSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectDetail
