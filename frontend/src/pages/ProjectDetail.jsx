import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
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
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(192,132,252,0.1)' }}>
        {[80, 60, 140, 100].map((w, i) => (
          <div key={i} style={{ padding: '12px 24px' }}>
            <SkeletonBlock width={`${w}px`} height="12px" />
          </div>
        ))}
      </div>
      <div style={{ paddingTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: '24px', border: '1px solid rgba(192,132,252,0.06)', background: 'rgba(255,255,255,0.01)' }}>
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

const INDUSTRY_REGIONS = {
  'AI / Machine Learning': ['north-america', 'europe', 'asia'],
  'Fintech': ['north-america', 'europe', 'asia'],
  'Health / MedTech': ['north-america', 'europe', 'asia', 'oceania'],
  'Education': ['north-america', 'europe', 'asia', 'africa'],
  'E-commerce': ['north-america', 'europe', 'asia'],
  'Food & Delivery': ['europe', 'asia', 'mena'],
  'Transport / Mobility': ['europe', 'asia', 'north-america'],
  'Sustainability': ['europe', 'north-america', 'oceania'],
  'Entertainment': ['north-america', 'europe'],
  'Real Estate': ['north-america', 'europe', 'mena'],
  'Agriculture': ['asia', 'africa', 'south-america'],
  'Fashion': ['europe', 'north-america', 'asia'],
  'Other': ['north-america', 'europe', 'asia', 'south-america', 'africa', 'oceania', 'mena'],
}

const LOGO_VARIANTS = [
  { id: 'primary', label: 'Primary', icon: '◈', filter: 'none', bg: '#FFFFFF', desc: 'Full Color' },
  { id: 'minimal', label: 'Minimal', icon: '◇', filter: 'grayscale(100%)', bg: '#FFFFFF', desc: 'Monochrome' },
  { id: 'inverted', label: 'Inverted', icon: '◆', filter: 'invert(1)', bg: '#111111', desc: 'Dark BG' },
]

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const REGION_COUNTRIES = {
  'north-america': ['840', '124', '484', '320', '188', '222', '558', '340', '862', '591', '630'],
  'south-america': ['076', '032', '152', '170', '604', '858', '600', '218', '068', '862'],
  'europe': ['276', '250', '826', '380', '724', '752', '578', '056', '040', '756', '620', '528', '616', '203', '348', '642', '100', '498', '804', '703', '705', '191', '070', '008'],
  'africa': ['566', '024', '818', '710', '404', '012', '504', '788', '686', '288', '020', '231', '706', '716', '894', '674'],
  'asia': ['156', '392', '410', '356', '643', '704', '764', '458', '702', '360', '050', '586', '144', '004', '050'],
  'mena': ['682', '784', '368', '400', '376', '818', '760', '275', '422', '504', '788', '012', '434'],
  'oceania': ['036', '554', '598', '242', '776', '882'],
}

function normalizeHexColor(value) {
  if (!value) return null
  const trimmed = value.trim()
  const shortMatch = trimmed.match(/^#([0-9a-f]{3})$/i)
  if (shortMatch) return `#${shortMatch[1].split('').map(c => c + c).join('').toUpperCase()}`
  const longMatch = trimmed.match(/^#([0-9a-f]{6})$/i)
  if (longMatch) return `#${longMatch[1].toUpperCase()}`
  return null
}

function rgbStringToHex(value) {
  const match = value.match(/rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i)
  if (!match) return null
  const [r, g, b] = match.slice(1, 4).map(Number)
  if ([r, g, b].some(ch => ch < 0 || ch > 255)) return null
  return `#${[r, g, b].map(ch => ch.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

function hexToHsl(hex) {
  const n = normalizeHexColor(hex)
  if (!n) return [0, 0, 50]
  const r = parseInt(n.slice(1, 3), 16) / 255
  const g = parseInt(n.slice(3, 5), 16) / 255
  const b = parseInt(n.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0').toUpperCase()
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generateHarmonies(hex) {
  const [h, s, l] = hexToHsl(hex)
  return {
    complementary: [hex, hslToHex(h + 180, s, l)],
    analogous: [hslToHex(h - 30, s, l), hex, hslToHex(h + 30, s, l)],
    triadic: [hex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)],
  }
}

function extractHexColorsFromSvg(svgString) {
  if (!svgString) return []
  const uniqueColors = new Set()
  const hexMatches = svgString.match(/#([0-9A-Fa-f]{6})/g) || []
  const rgbMatches = svgString.match(/rgb\s*\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)/g) || []
  hexMatches.forEach(m => { const n = normalizeHexColor(m); if (n) uniqueColors.add(n) })
  rgbMatches.forEach(m => { const n = rgbStringToHex(m); if (n) uniqueColors.add(n) })
  return Array.from(uniqueColors)
}

function escapeSvgText(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function buildFallbackSvg(title, colors) {
  const initials = (title || 'B').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || 'B'
  const primary = colors[0] || '#1F2937'
  const secondary = colors[1] || '#8B5CF6'
  const accent = colors[2] || '#E5E7EB'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#FFFFFF"/>
    <rect x="72" y="72" width="368" height="368" rx="56" fill="${primary}"/>
    <circle cx="390" cy="122" r="34" fill="${secondary}"/>
    <path d="M128 376C183 284 251 238 360 172" stroke="${accent}" stroke-width="22" stroke-linecap="round" fill="none"/>
    <text x="256" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="124" font-weight="700" fill="#FFFFFF">${escapeSvgText(initials)}</text>
  </svg>`.trim()
}

function ensureArrayColors(values) {
  return Array.from(new Set(values.map(normalizeHexColor).filter(Boolean)))
}

function mmToPt(mm) { return mm * 2.834645669 }

function buildAbsoluteAssetUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
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
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
    return canvas.toDataURL('image/png')
  } finally { URL.revokeObjectURL(objectUrl) }
}

function sanitizeFileName(value) {
  return (value || 'Brand').replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '-').slice(0, 80)
}

function getContrastColor(hex) {
  const n = normalizeHexColor(hex) || '#000000'
  const raw = n.replace('#', '')
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128 ? [255, 255, 255] : [0, 0, 0]
}

function parseMarketSize(text) {
  if (!text) return { tam: 'N/A', sam: 'N/A', demographic: 'General Market' }
  const billionMatch = text.match(/\$?([\d.]+)\s*[Bb]illion/i)
  const millionMatch = text.match(/\$?([\d.]+)\s*[Mm]illion/i)
  let tam = text, sam = 'N/A'
  if (billionMatch) {
    const val = parseFloat(billionMatch[1])
    tam = `$${val}B+`; sam = `$${(val * 0.1).toFixed(1)}B`
  } else if (millionMatch) {
    const val = parseFloat(millionMatch[1])
    tam = `$${val}M+`; sam = `$${(val * 0.1).toFixed(0)}M`
  }
  return { tam, sam, demographic: 'Early Adopters' }
}

function WorldMap({ highlightedRegions, primaryColor }) {
  const highlightedCountries = useMemo(() => {
    return new Set(
      (highlightedRegions || []).flatMap(r => REGION_COUNTRIES[r] || [])
    )
  }, [highlightedRegions])

  return (
    <ComposableMap
      projectionConfig={{ scale: 140, center: [15, 10] }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map(geo => {
            const countryId = String(geo.id).padStart(3, '0')
            const isHighlighted = highlightedCountries.has(countryId)
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: isHighlighted ? primaryColor : 'rgba(192,132,252,0.08)',
                    stroke: isHighlighted ? `${primaryColor}80` : 'rgba(192,132,252,0.12)',
                    strokeWidth: 0.5,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  },
                  hover: {
                    fill: isHighlighted ? primaryColor : 'rgba(192,132,252,0.18)',
                    stroke: '#C084FC',
                    strokeWidth: 0.8,
                    outline: 'none',
                    cursor: 'pointer',
                  },
                  pressed: { outline: 'none' },
                }}
              />
            )
          })
        }
      </Geographies>
    </ComposableMap>
  )
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
  const [tabKey, setTabKey] = useState(0)

  const [fbRating, setFbRating] = useState(0)
  const [fbHover, setFbHover] = useState(0)
  const [fbComment, setFbComment] = useState('')
  const [fbSubmitting, setFbSubmitting] = useState(false)

  const [selectedFontId, setSelectedFontId] = useState(FONT_OPTIONS[0].id)
  const [logoSvgString, setLogoSvgString] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)
  const [logoVariant, setLogoVariant] = useState('primary')
  const [colorHarmony, setColorHarmony] = useState('original')

  const [cardName, setCardName] = useState('Alex Morgan')
  const [cardTitle, setCardTitle] = useState('Creative Director')
  const [cardEmail, setCardEmail] = useState('hello@brand.com')
  const [cardPhone, setCardPhone] = useState('+1 (555) 240-1188')
  const [cardBgColor, setCardBgColor] = useState('')

  const logoRef = useRef(null)
  const cardRef = useRef(null)
  const [logoTilt, setLogoTilt] = useState({ x: 0, y: 0 })
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 })
  const [logoHovered, setLogoHovered] = useState(false)
  const [cardHovered, setCardHovered] = useState(false)

  const handleLogoClick = () => navigate(localStorage.getItem('token') ? '/dashboard' : '/')

  const handleTilt = useCallback((e, ref, setter) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 25
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -25
    setter({ x, y })
  }, [])

  const handleTabChange = (tabId) => { setActiveTab(tabId); setTabKey(k => k + 1) }

  const handleDownloadLogo = async (e) => {
    e.preventDefault()
    if (!rawLogoSrc) return
    try {
      const img = await loadImage(rawLogoSrc)
      const canvas = document.createElement('canvas')
      canvas.width = 800; canvas.height = 800
      const ctx = canvas.getContext('2d')
      if (logoVariant === 'inverted') {
        ctx.fillStyle = '#111111'
      } else {
        ctx.fillStyle = '#FFFFFF'
      }
      ctx.fillRect(0, 0, 800, 800)
      if (logoVariant === 'minimal') {
        ctx.filter = 'grayscale(1)'
      } else if (logoVariant === 'inverted') {
        ctx.filter = 'invert(1)'
      }
      const scale = Math.min(760 / img.width, 760 / img.height)
      const x = (800 - img.width * scale) / 2
      const y = (800 - img.height * scale) / 2
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      const link = document.createElement('a')
      link.download = `${sanitizeFileName(project?.title || 'logo')}-${logoVariant}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success(`Logo downloaded (${logoVariant} variant)`)
    } catch {
      window.open(rawLogoSrc, '_blank')
    }
  }

  useEffect(() => { fetchAll() }, [id])

  useEffect(() => {
    let cancelled = false
    const loadJspdf = async () => {
      if (window.jspdf?.jsPDF) { if (!cancelled) setPdfReady(true); return }
      const existing = document.querySelector('script[data-jspdf-cdn="1"]')
      if (existing) {
        const onLoad = () => !cancelled && setPdfReady(true)
        existing.addEventListener('load', onLoad); return
      }
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.async = true; script.setAttribute('data-jspdf-cdn', '1')
      script.onload = () => !cancelled && setPdfReady(true)
      document.body.appendChild(script)
    }
    loadJspdf()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadLogoSvg = async () => {
      if (!brand || !project) { setLogoSvgString(''); return }
      const paletteSeed = ensureArrayColors([brand.color_palette?.primary_hex, brand.color_palette?.secondary_hex, brand.color_palette?.accent_hex, brand.color_palette?.background_hex])
      const selectedLogo = brand.logo_prompts?.find(i => i.is_selected) || brand.logo_prompts?.[0]
      const inlineSvg = selectedLogo?.svg_string || brand.svg_string || ''
      if (inlineSvg) { if (!cancelled) setLogoSvgString(inlineSvg); return }
      const logoUrl = buildAbsoluteAssetUrl(selectedLogo?.image_url)
      if (logoUrl && /\.svg($|\?)/i.test(logoUrl)) {
        try {
          const response = await fetch(logoUrl)
          const svgText = await response.text()
          if (!cancelled && svgText.includes('<svg')) { setLogoSvgString(svgText); return }
        } catch { }
      }
      if (!cancelled) setLogoSvgString(buildFallbackSvg(project.title, paletteSeed))
    }
    loadLogoSvg()
    return () => { cancelled = true }
  }, [brand, project])

  const fetchAll = async () => {
    setFetchError(''); setLoading(true)
    try {
      const [projectRes, analysisRes, brandRes, competitorsRes, feedbackRes, userRes] = await Promise.all([
        client.get(`/projects/${id}`),
        client.get(`/analysis/${id}`),
        client.get(`/brand/${id}`),
        client.get(`/analysis/${id}/competitors`),
        client.get(`/feedback/${id}`),
        client.get('/auth/me'),
      ])
      setProject(projectRes.data); setAnalysis(analysisRes.data); setBrand(brandRes.data)
      setCompetitors(competitorsRes.data); setFeedback(feedbackRes.data); setUser(userRes.data)
    } catch (err) {
      const status = err.response?.status
      if (status === 401) { localStorage.removeItem('token'); navigate('/login') }
      else if (status === 404) setFetchError('Project not found.')
      else setFetchError(err.response?.data?.detail || 'Failed to load project data.')
    } finally { setLoading(false) }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault(); if (fbRating === 0) return; setFbSubmitting(true)
    try {
      const res = await client.post('/feedback/', { project_id: parseInt(id), rating: fbRating, comment: fbComment || null })
      setFeedback(prev => [...prev, res.data]); setFbRating(0); setFbComment('')
      toast.success('Feedback submitted')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to submit feedback') }
    finally { setFbSubmitting(false) }
  }

  const handleDownloadBrandKit = async () => {
    if (!window.jspdf?.jsPDF) { toast.error('PDF generator loading...'); return }
    if (!project || !brand) { toast.error('Brand data not ready.'); return }
    setPdfLoading(true)
    try {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const safeLeft = 48, safeRight = pageWidth - 48, bodyTop = 84, bodyBottom = pageHeight - 54
      const cardColor = cardBgColor || primaryColor

      // Use real AI logo if available
      let logoPng
      if (rawLogoSrc && !rawLogoSrc.startsWith('data:image/svg')) {
        try {
          const img = await loadImage(rawLogoSrc)
          const canvas = document.createElement('canvas')
          canvas.width = 1400; canvas.height = 1400
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1400, 1400)
          const scale = Math.min(1400 / img.width, 1400 / img.height)
          const x = (1400 - img.width * scale) / 2
          const y = (1400 - img.height * scale) / 2
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
          logoPng = canvas.toDataURL('image/png')
        } catch {
          logoPng = await svgToPngDataUrl(logoSvgString || buildFallbackSvg(project.title, kitColors), 1400)
        }
      } else {
        logoPng = await svgToPngDataUrl(logoSvgString || buildFallbackSvg(project.title, kitColors), 1400)
      }

      const drawPageChrome = (title) => {
        const btc = getContrastColor(primaryColor)
        doc.setFillColor(primaryColor); doc.rect(0, 0, pageWidth, 46, 'F')
        doc.rect(0, pageHeight - 28, pageWidth, 28, 'F')
        doc.setTextColor(...btc); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
        doc.text(title, safeLeft, 30); doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
        doc.text(`${project.title} Brand System`, safeRight - 118, pageHeight - 10)
      }

      drawPageChrome(`${project.title} Brand Kit`)
      doc.addImage(logoPng, 'PNG', safeLeft, bodyTop, 150, 150)
      doc.setTextColor('#111827'); doc.setFont('helvetica', 'bold'); doc.setFontSize(22)
      doc.text('Logo & Palette', safeLeft, bodyTop - 14)

      // Tagline next to logo
      if (brand.tagline) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(14)
        doc.setTextColor('#334155')
        doc.text(brand.tagline, safeLeft + 170, bodyTop + 20)
      }

      // Mission
      if (brand.mission_statement) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
        doc.setTextColor('#64748B')
        doc.text(doc.splitTextToSize(brand.mission_statement, 340), safeLeft + 170, bodyTop + 50)
      }

      const swatchTop = bodyTop + 184
      kitColors.slice(0, 5).forEach((color, i) => {
        const x = safeLeft + (i * 98)
        doc.setFillColor(color); doc.roundedRect(x, swatchTop, 72, 72, 8, 8, 'F')
        doc.setTextColor(...getContrastColor(color)); doc.setFont('courier', 'normal'); doc.setFontSize(10)
        doc.text(color, x + 8, swatchTop + 44, { baseline: 'middle' })
      })

      doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
      doc.text('Typography', safeLeft, swatchTop + 138)
      FONT_OPTIONS.forEach((font, i) => {
        const y = swatchTop + 170 + (i * 28)
        doc.setFont(font.pdfFamily, font.id === selectedFont.id ? 'bold' : font.pdfStyle)
        doc.setFontSize(16); doc.text(`${project.title}  ${font.label}`, safeLeft, y)
      })

      doc.addPage(); drawPageChrome('Business Cards')
      const cardW = mmToPt(90), cardH = mmToPt(55), cardsY = 190
      const frontX = safeLeft, backX = safeLeft + cardW + 28

      doc.setFillColor(cardColor); doc.roundedRect(frontX, cardsY, cardW, cardH, 12, 12, 'F')
      doc.setFillColor(secondaryColor); doc.rect(frontX + 18, cardsY + 18, 5, cardH - 36, 'F')
      doc.setTextColor(...getContrastColor(cardColor))
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22)
      doc.text(project.title, frontX + 34, cardsY + 34)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
      doc.text(cardName, frontX + 34, cardsY + 62)
      doc.text(cardTitle, frontX + 34, cardsY + 78)
      doc.text(cardEmail, frontX + 34, cardsY + 102)
      doc.text(cardPhone, frontX + 34, cardsY + 118)

      doc.setFillColor(backgroundColor); doc.roundedRect(backX, cardsY, cardW, cardH, 12, 12, 'F')
      doc.setFillColor(cardColor); doc.roundedRect(backX + 16, cardsY + 16, cardW - 32, cardH - 32, 10, 10, 'F')
      doc.addImage(logoPng, 'PNG', backX + (cardW / 2) - 38, cardsY + 20, 76, 76)
      doc.setTextColor(...getContrastColor(cardColor))
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
      doc.text(project.title.toUpperCase(), backX + 24, cardsY + cardH - 32)
      doc.setTextColor('#111827'); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
      doc.text('Front', frontX, cardsY - 20); doc.text('Back', backX, cardsY - 20)

      doc.save(`${sanitizeFileName(project.title)}-Brand-Kit.pdf`)
      toast.success('Brand kit PDF downloaded!')
    } catch { toast.error('Failed to generate PDF') }
    finally { setPdfLoading(false) }
  }

  const selectedFont = FONT_OPTIONS.find(o => o.id === selectedFontId) || FONT_OPTIONS[0]
  const extractedSvgColors = useMemo(() => extractHexColorsFromSvg(logoSvgString), [logoSvgString])
  const paletteColors = useMemo(() => ensureArrayColors([brand?.color_palette?.primary_hex, brand?.color_palette?.secondary_hex, brand?.color_palette?.accent_hex, brand?.color_palette?.background_hex]), [brand])
  const kitColors = useMemo(() => ensureArrayColors([...extractedSvgColors, ...paletteColors]).slice(0, 5), [extractedSvgColors, paletteColors])
  const primaryColor = kitColors[0] || '#1F2937'
  const secondaryColor = kitColors[1] || brand?.color_palette?.secondary_hex || '#8B5CF6'
  const accentColor = kitColors[2] || brand?.color_palette?.accent_hex || '#CBD5E1'
  const backgroundColor = normalizeHexColor(brand?.color_palette?.background_hex) || '#F8FAFC'
  const harmonies = useMemo(() => generateHarmonies(primaryColor), [primaryColor])
  const activeHarmonyColors = colorHarmony === 'original' ? kitColors : (harmonies[colorHarmony] || kitColors)
  const logoDataUri = useMemo(() => {
    if (!logoSvgString) return ''
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvgString)}`
  }, [logoSvgString])
  const selectedLogo = brand?.logo_prompts?.find(i => i.is_selected) || brand?.logo_prompts?.[0]
  const rawLogoSrc = brand?.logo_prompts?.[0]?.image_url
    ? buildAbsoluteAssetUrl(brand.logo_prompts[0].image_url)
    : logoDataUri || ''
  const activeVariant = LOGO_VARIANTS.find(v => v.id === logoVariant) || LOGO_VARIANTS[0]
  const highlightedRegions = INDUSTRY_REGIONS[project?.industry] || INDUSTRY_REGIONS['Other']
  const marketMetrics = useMemo(() => parseMarketSize(analysis?.estimated_market_size), [analysis])

  const scoreColor = analysis
    ? analysis.viability_score >= 75 ? '#4ade80'
      : analysis.viability_score >= 50 ? '#C084FC'
      : '#f87171'
    : '#C084FC'

  const scoreLabel = analysis
    ? analysis.viability_score >= 75 ? 'Strong Potential'
      : analysis.viability_score >= 50 ? 'Good Potential'
      : 'Needs Work'
    : ''

  const tabs = [
     { id: 'brand', label: 'Brand Identity & Kit' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'market', label: 'Market' },
    { id: 'competitors', label: 'Competitors' },
  ]

  const glassCard = {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '4px',
  }

  const Nav = () => (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(192,132,252,0.1)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 10 }}>
      <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'radial-gradient(circle, #C084FC, #9333EA)', boxShadow: '0 0 15px rgba(192,132,252,0.5)' }} />
        <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700', letterSpacing: '3px' }}>BELIS</span>
      </div>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(192,132,252,0.2)', color: '#94A3B8', padding: '8px 20px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>← Dashboard</button>
    </nav>
  )

  return (
    <div style={{ backgroundColor: '#030005', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.4); opacity: 0.4; } }
        @keyframes glow-line { 0%, 100% { filter: drop-shadow(0 0 4px currentColor); } 50% { filter: drop-shadow(0 0 12px currentColor); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes logo-glow { 0%, 100% { box-shadow: 0 20px 60px rgba(192,132,252,0.3), 0 0 0 1px rgba(192,132,252,0.1); } 50% { box-shadow: 0 30px 80px rgba(192,132,252,0.5), 0 0 0 1px rgba(192,132,252,0.2); } }
        @keyframes hero-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .tab-content { animation: fadeInUp 0.35s ease forwards; }
        .logo-float { animation: float 4s ease-in-out infinite; }
        textarea::placeholder, input::placeholder { color: #475569; }
        .variant-btn { position: relative; overflow: hidden; transition: all 0.3s; }
        .variant-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%); transform: translateX(-100%); transition: transform 0.4s; }
        .variant-btn:hover::before { transform: translateX(100%); }
      `}</style>

      <ToastContainer toasts={toasts} />
      <Nav />

      {loading && <SkeletonContent />}

      {!loading && fetchError && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ ...glassCard, border: '1px solid rgba(255,100,100,0.15)', background: 'rgba(255,100,100,0.03)', padding: '60px 40px' }}>
            <p style={{ color: '#ff6b6b', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Something went wrong</p>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '32px' }}>{fetchError}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={fetchAll} style={{ background: 'transparent', border: '1px solid #C084FC', color: '#C084FC', padding: '10px 28px', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' }}>Try Again</button>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(192,132,252,0.3)', color: '#94A3B8', padding: '10px 28px', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {!loading && !fetchError && project && (
        <>
          {/* ── HERO HEADER ── */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '40px 40px 32px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(147,51,234,0.12) 0%, rgba(3,0,5,0) 100%)',
            borderBottom: '1px solid rgba(192,132,252,0.1)',
          }}>
            <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '400px', height: '400px', background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)`, pointerEvents: 'none', animation: 'hero-pulse 4s infinite' }} />
            <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.4), transparent)' }} />

            <div style={{ display: 'inline-block', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC', padding: '4px 16px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '32px', position: 'relative' }}>
              {project.stage}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '40px', position: 'relative' }}>
              {rawLogoSrc && (
                <div className="logo-float" style={{
                  width: '250px', height: '240px', background: '#ffffff',
                  borderRadius: '28px', padding: '20px',
                  boxShadow: '0 8px 40px rgba(192,132,252,0.4), 0 0 0 1px rgba(192,132,252,0.2), 0 0 80px rgba(192,132,252,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={rawLogoSrc} alt="logo" style={{ maxWidth: '250%', maxHeight: '250px', objectFit: 'contain' }} />
                </div>
              )}

              <h1 style={{
                color: '#FFFFFF', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: '100',
                letterSpacing: '12px', textTransform: 'uppercase', lineHeight: '1',
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(192,132,252,0.9) 50%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0',
              }}>{project.title}</h1>

              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.7', maxWidth: '500px', letterSpacing: '0.5px' }}>
                {project.description}
              </p>
            </div>

            {/* Viability Score */}
            {analysis && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '28px', position: 'relative' }}>
                <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="50" fill="none" stroke={`${scoreColor}10`} strokeWidth="12" />
                    <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    {[...Array(10)].map((_, i) => {
                      const angle = (i * 36 - 90) * (Math.PI / 180)
                      const x1 = 55 + 48 * Math.cos(angle), y1 = 55 + 48 * Math.sin(angle)
                      const x2 = 55 + 44 * Math.cos(angle), y2 = 55 + 44 * Math.sin(angle)
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                    })}
                    <circle cx="55" cy="55" r="44" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(analysis.viability_score / 100) * 276.5} 276.5`}
                      strokeDashoffset="0"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '55px 55px', filter: `drop-shadow(0 0 10px ${scoreColor})`, transition: 'stroke-dasharray 1.5s ease' }}
                    />
                    <circle cx="55" cy="55" r="32" fill="rgba(3,0,5,0.8)" stroke={`${scoreColor}20`} strokeWidth="1" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '200', letterSpacing: '-1px', display: 'block', lineHeight: '1' }}>{analysis.viability_score}</span>
                    <span style={{ color: '#64748B', fontSize: '8px', letterSpacing: '1px' }}>/100</span>
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: '#64748B', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Viability Score</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: scoreColor, boxShadow: `0 0 10px ${scoreColor}`, animation: 'pulse-dot 2s infinite' }} />
                    <p style={{ color: scoreColor, fontSize: '18px', fontWeight: '200', letterSpacing: '3px', textTransform: 'uppercase' }}>{scoreLabel}</p>
                  </div>
                  <p style={{ color: '#334155', fontSize: '11px', letterSpacing: '1px' }}>Based on market analysis</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(192,132,252,0.1)' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#C084FC' : 'transparent'}`,
                  color: activeTab === tab.id ? '#C084FC' : '#94A3B8',
                  padding: '16px 24px', fontSize: '12px', letterSpacing: '2px',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
                }}>{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div key={tabKey} className="tab-content">

              {/* ── ANALYSIS TAB ── */}
              {activeTab === 'analysis' && (
                analysis ? (
                  <div>
                    <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.8', marginBottom: '40px', maxWidth: '700px' }}>{analysis.summary}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {[
                        { label: 'Strengths', value: analysis.strengths, color: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)', icon: '↑' },
                        { label: 'Weaknesses', value: analysis.weaknesses, color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', icon: '↓' },
                        { label: 'Opportunities', value: analysis.opportunities, color: '#60a5fa', bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.2)', icon: '◎' },
                        { label: 'Threats', value: analysis.threats, color: '#fb923c', bg: 'rgba(251,146,60,0.06)', border: 'rgba(251,146,60,0.2)', icon: '⚡' },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '24px', border: `1px solid ${item.border}`, background: item.bg, backdropFilter: 'blur(10px)', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${item.color}20`, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: item.color, fontWeight: '700' }}>{item.icon}</div>
                            <p style={{ color: item.color, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '600' }}>{item.label}</p>
                          </div>
                          <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.8' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p style={{ color: '#94A3B8' }}>Analysis data not available.</p>
              )}

              {/* ── MARKET TAB ── */}
              {activeTab === 'market' && (
                analysis ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {[
                        { label: 'TAM', sublabel: 'Total Addressable Market', value: marketMetrics.tam, icon: '◈' },
                        { label: 'SAM', sublabel: 'Serviceable Addressable Market', value: marketMetrics.sam, icon: '◇' },
                        { label: 'Target', sublabel: 'Primary Demographic', value: marketMetrics.demographic, icon: '◎' },
                      ].map(m => (
                        <div key={m.label} style={{ padding: '28px', ...glassCard, border: '1px solid rgba(192,132,252,0.15)', textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', color: '#C084FC', marginBottom: '8px' }}>{m.icon}</div>
                          <p style={{ color: '#94A3B8', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>{m.label}</p>
                          <p style={{ color: '#C084FC', fontSize: '22px', fontWeight: '300', marginBottom: '6px' }}>{m.value}</p>
                          <p style={{ color: '#64748B', fontSize: '10px' }}>{m.sublabel}</p>
                        </div>
                      ))}
                    </div>

                    {/* Real World Map */}
                    <div style={{ padding: '28px', ...glassCard, border: '1px solid rgba(192,132,252,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Target Reach</p>
                          <p style={{ color: '#FFFFFF', fontSize: '13px' }}>{analysis.target_region || 'Global Market'}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }} />
                            <span style={{ color: '#94A3B8', fontSize: '11px' }}>Target regions</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)' }} />
                            <span style={{ color: '#64748B', fontSize: '11px' }}>Other regions</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ height: '340px', borderRadius: '8px', overflow: 'hidden' }}>
                        <WorldMap highlightedRegions={highlightedRegions} primaryColor={primaryColor} />
                      </div>
                      <p style={{ color: '#334155', fontSize: '10px', letterSpacing: '1px', marginTop: '12px', textAlign: 'center' }}>
                        Highlighted based on industry: {project.industry}
                      </p>
                    </div>

                    {/* Growth Chart */}
                    <div style={{ padding: '28px', ...glassCard, border: '1px solid rgba(192,132,252,0.15)' }}>
                      <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>Market Growth Trend</p>
                      <svg viewBox="0 0 500 120" style={{ width: '100%', height: '120px' }}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[20, 40, 60, 80, 100].map(y => (
                          <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        ))}
                        <path d="M 0 100 L 60 88 L 130 75 L 200 65 L 270 52 L 350 40 L 420 30 L 500 20 L 500 120 L 0 120 Z" fill="url(#chartGrad)" />
                        <path d="M 0 100 L 60 88 L 130 75 L 200 65 L 270 52 L 350 40 L 420 30 L 500 20"
                          fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 6px ${accentColor})`, animation: 'glow-line 3s infinite' }}
                        />
                        {[[0, 100], [130, 75], [270, 52], [420, 30], [500, 20]].map(([x, y], i) => (
                          <circle key={i} cx={x} cy={y} r="4" fill={accentColor} style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }} />
                        ))}
                        {['2020', '2021', '2022', '2023', '2024'].map((label, i) => (
                          <text key={label} x={i * 125} y="118" fill="#64748B" fontSize="10" textAnchor="middle">{label}</text>
                        ))}
                      </svg>
                      <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '2px', background: accentColor, borderRadius: '1px' }} />
                          <span style={{ color: '#94A3B8', fontSize: '11px' }}>Market Growth</span>
                        </div>
                        <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>+15% YoY avg.</span>
                      </div>
                    </div>
                  </div>
                ) : <p style={{ color: '#94A3B8' }}>Market data not available.</p>
              )}

              {/* ── BRAND IDENTITY & KIT TAB ── */}
              {activeTab === 'brand' && (
                brand ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {[
                        { label: 'Tagline', value: brand.tagline },
                        { label: 'Brand Voice', value: brand.brand_voice },
                        { label: 'Personality', value: brand.personality_type },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '24px', ...glassCard }}>
                          <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>{item.label}</p>
                          <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: '1.6', letterSpacing: '1px' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {brand.mission_statement && (
                      <div style={{ padding: '24px', ...glassCard }}>
                        <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Mission Statement</p>
                        <p style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '1.8', fontStyle: 'italic' }}>{brand.mission_statement}</p>
                      </div>
                    )}

                    {/* Logo Studio */}
                    <div style={{ padding: '40px', border: '1px solid rgba(192,132,252,0.2)', background: 'linear-gradient(135deg, rgba(147,51,234,0.05) 0%, rgba(3,0,5,0.8) 100%)', backdropFilter: 'blur(20px)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: `radial-gradient(circle, ${primaryColor}15 0%, transparent 70%)`, pointerEvents: 'none' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', position: 'relative' }}>
                        <div>
                          <p style={{ color: '#C084FC', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '6px' }}>Logo Studio</p>
                          <p style={{ color: '#64748B', fontSize: '12px' }}>Hover to tilt and float</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0', border: '1px solid rgba(192,132,252,0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                          {LOGO_VARIANTS.map(v => (
                            <button key={v.id} className="variant-btn" onClick={() => setLogoVariant(v.id)} style={{
                              background: logoVariant === v.id ? `linear-gradient(135deg, ${primaryColor}40, rgba(192,132,252,0.2))` : 'rgba(255,255,255,0.02)',
                              border: 'none', borderRight: '1px solid rgba(192,132,252,0.15)',
                              color: logoVariant === v.id ? '#C084FC' : '#64748B',
                              padding: '12px 24px', fontSize: '10px', letterSpacing: '2px',
                              textTransform: 'uppercase', cursor: 'pointer',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '88px',
                            }}>
                              <span style={{ fontSize: '18px', marginBottom: '2px' }}>{v.icon}</span>
                              <span style={{ fontWeight: '600' }}>{v.label}</span>
                              <span style={{ fontSize: '8px', color: logoVariant === v.id ? '#9333EA' : '#334155', letterSpacing: '1px' }}>{v.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '48px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div
                            ref={logoRef}
                            className={!logoHovered ? 'logo-float' : ''}
                            onMouseMove={e => { handleTilt(e, logoRef, setLogoTilt); setLogoHovered(true) }}
                            onMouseLeave={() => { setLogoTilt({ x: 0, y: 0 }); setLogoHovered(false) }}
                            style={{
                              width: '280px', height: '280px', background: activeVariant.bg,
                              borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '32px', cursor: 'grab',
                              transition: logoHovered ? 'transform 0.1s ease' : 'transform 0.8s ease',
                              transform: `perspective(800px) rotateY(${logoTilt.x}deg) rotateX(${logoTilt.y}deg) scale(${logoHovered ? 1.02 : 1})`,
                              animation: logoHovered ? 'none' : 'logo-glow 3s infinite ease-in-out',
                              boxShadow: logoHovered ? `${logoTilt.x * 3}px ${logoTilt.y * -3}px 60px rgba(192,132,252,0.4), inset 0 0 40px rgba(255,255,255,0.05)` : '0 20px 60px rgba(192,132,252,0.3), 0 0 0 1px rgba(192,132,252,0.1)',
                              position: 'relative', overflow: 'hidden',
                            }}
                          >
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: `linear-gradient(${135 + logoTilt.x * 2}deg, rgba(255,255,255,0.18) 0%, transparent 60%)`, pointerEvents: 'none', transition: 'background 0.1s' }} />
                            {rawLogoSrc ? (
                              <img src={rawLogoSrc} alt="logo" draggable={false} style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', filter: activeVariant.filter, transition: 'filter 0.4s ease', userSelect: 'none' }} />
                            ) : (
                              <span style={{ color: '#475569', fontSize: '12px' }}>Logo unavailable</span>
                            )}
                          </div>
                          <div style={{ width: '200px', height: '16px', background: `radial-gradient(ellipse, ${primaryColor}40 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(8px)', transform: `scaleX(${1 + logoTilt.x * 0.02})`, transition: 'transform 0.1s' }} />
                        </div>

                        <div style={{ maxWidth: '300px' }}>
                          <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>AI Generated</p>
                          <h3 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '200', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>{project.title}</h3>
                          {selectedLogo?.prompt_text && (
                            <p style={{ color: '#64748B', fontSize: '12px', lineHeight: '1.7', marginBottom: '24px' }}>{selectedLogo.prompt_text}</p>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                            {LOGO_VARIANTS.map(v => (
                              <div key={v.id} onClick={() => setLogoVariant(v.id)} style={{ width: '44px', height: '44px', borderRadius: '10px', background: v.bg, border: `2px solid ${logoVariant === v.id ? '#C084FC' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: logoVariant === v.id ? '0 0 14px rgba(192,132,252,0.5)' : 'none' }}>
                                <span style={{ fontSize: '16px', color: v.bg === '#111111' ? '#fff' : '#000' }}>◈</span>
                              </div>
                            ))}
                          </div>
                          {rawLogoSrc && (
                            <button
                              onClick={handleDownloadLogo}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                color: '#C084FC', fontSize: '11px', letterSpacing: '2px',
                                textTransform: 'uppercase', textDecoration: 'none',
                                border: '1px solid rgba(192,132,252,0.3)', padding: '10px 20px',
                                background: 'rgba(192,132,252,0.05)', borderRadius: '2px', cursor: 'pointer',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.15)'; e.currentTarget.style.borderColor = '#C084FC' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.05)'; e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)' }}
                            >
                              Download {activeVariant.label} Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Color Palette */}
                    {brand.color_palette && (
                      <div style={{ padding: '24px', ...glassCard }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                          <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>Color Palette</p>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {['original', 'complementary', 'analogous', 'triadic'].map(h => (
                              <button key={h} onClick={() => setColorHarmony(h)} style={{ background: colorHarmony === h ? 'rgba(192,132,252,0.15)' : 'transparent', border: `1px solid ${colorHarmony === h ? '#C084FC' : 'rgba(192,132,252,0.2)'}`, color: colorHarmony === h ? '#C084FC' : '#64748B', padding: '4px 10px', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>{h}</button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                          {activeHarmonyColors.map((color, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: color, border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 20px ${color}40`, cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => setCardBgColor(color)}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              />
                              <p style={{ color: '#94A3B8', fontSize: '10px' }}>{['Primary', 'Secondary', 'Accent', 'Background', 'Extra'][i]}</p>
                              <p style={{ color: '#FFFFFF', fontSize: '10px', fontFamily: 'monospace' }}>{color}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p style={{ color: '#64748B', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>60 — 30 — 10 Rule</p>
                          <div style={{ display: 'flex', height: '32px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
                            <div style={{ flex: 60, background: backgroundColor, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#333', fontWeight: '600' }}>60%</span>
                            </div>
                            <div style={{ flex: 30, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#fff', fontWeight: '600' }}>30%</span>
                            </div>
                            <div style={{ flex: 10, background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: '600' }}>10%</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                            {[['Background', backgroundColor], ['Primary', primaryColor], ['Accent', accentColor]].map(([label, color]) => (
                              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
                                <span style={{ color: '#64748B', fontSize: '10px' }}>{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Kit Maker */}
                    <div style={{ padding: '32px', border: '1px solid rgba(192,132,252,0.2)', background: 'rgba(192,132,252,0.03)', backdropFilter: 'blur(10px)', borderRadius: '8px' }}>
                      <p style={{ color: '#C084FC', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '6px' }}>Kit Maker</p>
                      <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '32px' }}>Typography & live business card preview</p>

                      <div style={{ marginBottom: '32px' }}>
                        <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Type Scale</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                          {FONT_OPTIONS.map(option => {
                            const active = option.id === selectedFont.id
                            return (
                              <button key={option.id} onClick={() => setSelectedFontId(option.id)} style={{ background: active ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.01)', border: `1px solid ${active ? '#C084FC' : 'rgba(192,132,252,0.12)'}`, color: '#FFFFFF', padding: '16px', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s' }}>
                                <p style={{ color: active ? '#C084FC' : '#64748B', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{option.label}</p>
                                <p style={{ fontFamily: option.family, fontSize: '20px', lineHeight: '1.1', color: active ? primaryColor : '#FFFFFF', fontWeight: '700', marginBottom: '4px' }}>{project.title}</p>
                                <p style={{ fontFamily: option.family, fontSize: '14px', color: '#94A3B8', marginBottom: '2px' }}>{project.title}</p>
                                <p style={{ fontFamily: option.family, fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>{project.title}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>Business Card</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                          <div
                            ref={cardRef}
                            onMouseMove={e => { handleTilt(e, cardRef, setCardTilt); setCardHovered(true) }}
                            onMouseLeave={() => { setCardTilt({ x: 0, y: 0 }); setCardHovered(false) }}
                            style={{
                              width: '100%', maxWidth: '480px', height: '280px',
                              background: `linear-gradient(135deg, ${cardBgColor || primaryColor} 0%, ${cardBgColor || secondaryColor}88 100%)`,
                              borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer',
                              transition: cardHovered ? 'transform 0.08s ease' : 'transform 0.6s ease',
                              transform: `perspective(1000px) rotateY(${cardTilt.x}deg) rotateX(${cardTilt.y}deg) scale(${cardHovered ? 1.02 : 1})`,
                              boxShadow: cardHovered ? `${cardTilt.x * 4}px ${cardTilt.y * -4}px 80px rgba(0,0,0,0.6), ${cardTilt.x * 2}px ${cardTilt.y * -2}px 40px ${(cardBgColor || primaryColor)}50` : '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                            }}
                          >
                            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${125 + cardTilt.x * 3}deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)`, pointerEvents: 'none', borderRadius: '20px' }} />
                            <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', background: secondaryColor, opacity: 0.8 }} />
                            {rawLogoSrc && (
                              <div style={{ position: 'absolute', right: '24px', bottom: '24px', opacity: 0.12 }}>
                                <img src={rawLogoSrc} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'brightness(10)' }} />
                              </div>
                            )}
                            <div style={{ padding: '36px 32px 36px 40px', color: '#FFFFFF', fontFamily: selectedFont.family, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
                              <div>
                                <p style={{ fontSize: '32px', lineHeight: '1.1', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{project.title}</p>
                                <div style={{ width: '40px', height: '2px', background: accentColor, marginBottom: '16px', opacity: 0.8 }} />
                              </div>
                              <div>
                                <p style={{ fontSize: '16px', marginBottom: '4px', opacity: 0.95 }}>{cardName}</p>
                                <p style={{ fontSize: '11px', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase', color: accentColor, opacity: 0.9 }}>{cardTitle}</p>
                                <div style={{ fontSize: '12px', display: 'grid', gap: '5px', opacity: 0.8 }}>
                                  <span>{cardEmail}</span>
                                  <span>{cardPhone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ width: '60%', height: '12px', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)', filter: 'blur(12px)', transform: `scaleX(${1 + cardTilt.x * 0.01}) translateY(-8px)` }} />
                        </div>

                        <div style={{ padding: '24px', border: '1px solid rgba(192,132,252,0.1)', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                          <p style={{ color: '#94A3B8', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>Customize</p>
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {[
                              { label: 'Full Name', value: cardName, setter: setCardName, placeholder: 'e.g. Alex Morgan' },
                              { label: 'Job Title', value: cardTitle, setter: setCardTitle, placeholder: 'e.g. Creative Director' },
                              { label: 'Email', value: cardEmail, setter: setCardEmail, placeholder: 'hello@brand.com' },
                              { label: 'Phone', value: cardPhone, setter: setCardPhone, placeholder: '+1 (555) 000-0000' },
                            ].map(field => (
                              <div key={field.label}>
                                <p style={{ color: '#64748B', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>{field.label}</p>
                                <input type="text" value={field.value} onChange={e => field.setter(e.target.value)} placeholder={field.placeholder}
                                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.15)', color: '#E2E8F0', padding: '8px 12px', fontSize: '12px', outline: 'none', borderRadius: '2px' }}
                                  onFocus={e => e.target.style.borderColor = 'rgba(192,132,252,0.5)'}
                                  onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.15)'}
                                />
                              </div>
                            ))}
                            <div>
                              <p style={{ color: '#64748B', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Card Color</p>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="color" value={cardBgColor || primaryColor} onChange={e => setCardBgColor(e.target.value)}
                                  style={{ width: '36px', height: '32px', border: '1px solid rgba(192,132,252,0.3)', background: 'transparent', cursor: 'pointer', padding: '2px', borderRadius: '4px' }}
                                />
                                {kitColors.map(color => (
                                  <div key={color} onClick={() => setCardBgColor(color)} style={{ width: '28px', height: '28px', borderRadius: '6px', background: color, cursor: 'pointer', border: cardBgColor === color ? '2px solid #C084FC' : '1px solid rgba(255,255,255,0.15)', boxShadow: cardBgColor === color ? `0 0 8px ${color}80` : 'none', transition: 'all 0.2s' }} />
                                ))}
                                <button onClick={() => setCardBgColor('')} style={{ background: 'transparent', border: '1px solid rgba(192,132,252,0.2)', color: '#94A3B8', padding: '4px 10px', fontSize: '9px', cursor: 'pointer', borderRadius: '2px' }}>Reset</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '32px', padding: '24px', border: '1px solid rgba(192,132,252,0.2)', background: 'rgba(192,132,252,0.05)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <p style={{ color: '#C084FC', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Export Brand Kit</p>
                          <p style={{ color: '#64748B', fontSize: '12px' }}>Logo, palette, typography, and business card in one PDF</p>
                        </div>
                        <button
                          onClick={handleDownloadBrandKit}
                          disabled={!pdfReady || pdfLoading}
                          style={{
                            background: !pdfReady || pdfLoading ? 'transparent' : 'linear-gradient(135deg, #9333EA, #C084FC)',
                            border: `1px solid ${!pdfReady || pdfLoading ? 'rgba(192,132,252,0.2)' : 'transparent'}`,
                            color: !pdfReady || pdfLoading ? '#475569' : '#FFFFFF',
                            padding: '12px 32px', fontSize: '12px', letterSpacing: '3px',
                            textTransform: 'uppercase', cursor: !pdfReady || pdfLoading ? 'not-allowed' : 'pointer',
                            boxShadow: !pdfReady || pdfLoading ? 'none' : '0 0 24px rgba(192,132,252,0.4)',
                            borderRadius: '2px', transition: 'all 0.3s',
                          }}
                        >
                          {pdfLoading ? 'Generating...' : 'Download Brand Kit PDF'}
                        </button>
                      </div>
                    </div>

                  </div>
                ) : <p style={{ color: '#94A3B8' }}>Brand data not available.</p>
              )}

              {/* Competitors */}
              {activeTab === 'competitors' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {competitors.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '13px' }}>No competitors found.</p>
                  ) : (
                    competitors.map(comp => (
                      <div key={comp.id} style={{ padding: '24px', ...glassCard }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '300', letterSpacing: '2px' }}>{comp.name}</h3>
                          {comp.country && <span style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '2px' }}>{comp.country}</span>}
                        </div>
                        {comp.website && (
                          <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: '#9333EA', fontSize: '12px', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{comp.website}</a>
                        )}
                        <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>{comp.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Feedback */}
          <div style={{ padding: '0 40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid rgba(192,132,252,0.08)', paddingTop: '40px' }}>
              <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '28px' }}>Feedback</p>
              {feedback.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {feedback.map(f => (
                    <div key={f.id} style={{ padding: '16px 20px', ...glassCard }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: f.comment ? '10px' : '0' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: '18px', color: s <= f.rating ? '#C084FC' : '#2d1f3d' }}>★</span>)}
                        </div>
                        <span style={{ color: '#475569', fontSize: '10px' }}>{new Date(f.created_at).toLocaleDateString()}</span>
                      </div>
                      {f.comment && <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>{f.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
              {user && feedback.some(f => f.user_id === user.id) ? (
                <p style={{ color: '#475569', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>You have already submitted feedback for this project.</p>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Your Rating</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} onClick={() => setFbRating(s)} onMouseEnter={() => setFbHover(s)} onMouseLeave={() => setFbHover(0)}
                          style={{ fontSize: '32px', cursor: 'pointer', color: s <= (fbHover || fbRating) ? '#C084FC' : '#2d1f3d', transition: 'color 0.1s', userSelect: 'none' }}
                        >★</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#64748B', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                      Comment <span style={{ color: '#334155', textTransform: 'none', letterSpacing: '0' }}>(optional)</span>
                    </p>
                    <textarea value={fbComment} onChange={e => setFbComment(e.target.value)} placeholder="Share your thoughts..."
                      style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,132,252,0.15)', color: '#E2E8F0', padding: '10px 14px', fontSize: '13px', minHeight: '80px', resize: 'vertical', outline: 'none', fontFamily: 'system-ui, sans-serif' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(192,132,252,0.45)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(192,132,252,0.15)'}
                    />
                  </div>
                  <button type="submit" disabled={fbRating === 0 || fbSubmitting} style={{
                    background: 'transparent',
                    border: `1px solid ${fbRating === 0 ? 'rgba(192,132,252,0.2)' : '#C084FC'}`,
                    color: fbRating === 0 ? '#475569' : '#C084FC',
                    padding: '10px 32px', fontSize: '11px', letterSpacing: '3px',
                    textTransform: 'uppercase', cursor: fbRating === 0 || fbSubmitting ? 'not-allowed' : 'pointer',
                  }}>{fbSubmitting ? 'Submitting...' : 'Submit Feedback'}</button>
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