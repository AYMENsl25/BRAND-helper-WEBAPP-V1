import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Keyframes ────────────────────────────────────────────────────────────── */
const KEYFRAMES = `

  /* Aurora layer 1 — wide drift + breathe */
  @keyframes auroraGlow {
    0%, 100% { transform: translate(-50%, -50%) scale(1);     opacity: 0.95; }
    22%       { transform: translate(-44%, -52%) scale(1.08); opacity: 0.45; }
    52%       { transform: translate(-50%, -47%) scale(1.03); opacity: 0.75; }
    78%       { transform: translate(-56%, -51%) scale(0.95); opacity: 0.5;  }
  }

  /* Aurora layer 2 — counter-phase offset for depth */
  @keyframes auroraGlow2 {
    0%, 100% { transform: translate(-50%, -50%) scale(1);     opacity: 0.5;  }
    32%       { transform: translate(-55%, -48%) scale(1.06); opacity: 0.22; }
    68%       { transform: translate(-45%, -53%) scale(0.93); opacity: 0.4;  }
  }

  /* Beam — opacity pulse only (GPU-composited, no paint) */
  @keyframes beamPulse {
    0%, 100% { opacity: 1;    }
    40%       { opacity: 0.2; }
    72%       { opacity: 0.8; }
  }

  /* Beam shimmer — bright spot slides left to right */
  @keyframes beamShimmer {
    from { transform: translateX(-100%); }
    to   { transform: translateX(500%); }
  }

  /* Starfield container — slow diagonal drift, alternate for seamless loop */
  @keyframes starDrift {
    from { transform: translate(0px, 0px); }
    to   { transform: translate(60px, 45px); }
  }

  /* Star twinkle variants — fade + glow pulse */
  @keyframes twinkleSlow {
    0%, 100% { opacity: var(--s-op); filter: blur(0px) brightness(1) drop-shadow(0 0 3px rgba(200,170,255,0.9)); }
    50%       { opacity: 0.08;       filter: blur(0px) brightness(0.3) drop-shadow(0 0 1px rgba(200,170,255,0.2)); }
  }
  @keyframes twinkleMed {
    0%, 100% { opacity: var(--s-op); filter: blur(0px) brightness(1) drop-shadow(0 0 4px rgba(220,190,255,0.95)); }
    50%       { opacity: 0.06;       filter: blur(0px) brightness(0.2) drop-shadow(0 0 1px rgba(220,190,255,0.15)); }
  }
  @keyframes twinkleFast {
    0%, 100% { opacity: var(--s-op); filter: blur(0px) brightness(1) drop-shadow(0 0 3px rgba(255,255,255,0.9)); }
    50%       { opacity: 0.05;       filter: blur(0px) brightness(0.2) drop-shadow(0 0 1px rgba(255,255,255,0.1)); }
  }

  /* Dust particles — float upward */
  @keyframes particleDrift {
    0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
    10%  { opacity: var(--p-op); }
    90%  { opacity: var(--p-op); }
    100% { transform: translateY(-110px) translateX(var(--p-dx)); opacity: 0; }
  }
`

/* ─── Stars (55, deterministic) ─────────────────────────────────────────────
   ~20% twinkle using one of 3 shared keyframe names.
   The drifting container moves all 55 stars as a single GPU layer.
────────────────────────────────────────────────────────────────────────────── */
const TWINKLE_NAMES = ['twinkleSlow', 'twinkleMed', 'twinkleFast']
const TWINKLE_DUR   = ['7s', '4.5s', '3.2s']

const STARS = Array.from({ length: 55 }, (_, i) => {
  const opacity  = 0.55 + (i % 7) * 0.06           // 0.55 → 0.91
  const size     = i % 11 === 0 ? 3 : i % 5 === 0 ? 2 : 1.5
  const twinkles = i % 5 === 0
  const tv       = i % 3
  // Glow radius scales with size: bigger stars have a wider halo
  const glowPx   = size === 3 ? 6 : size === 2 ? 4 : 2.5
  const glowColor = i % 3 === 0 ? 'rgba(200,170,255,' : i % 3 === 1 ? 'rgba(220,190,255,' : 'rgba(255,255,255,'
  return {
    id:        i,
    left:      `${(i * 1.97 + 0.5) % 100}%`,
    top:       `${(i * 3.61 + 2)   % 100}%`,
    size,
    glow:      `0 0 ${glowPx}px ${glowPx / 2}px ${glowColor}0.7)`,
    opacity,
    twinkles,
    twinkleAnim: twinkles
      ? `${TWINKLE_NAMES[tv]} ${TWINKLE_DUR[tv]} ${-((i * 1.1) % 8).toFixed(1)}s ease-in-out infinite`
      : null,
  }
})

/* ─── Dust particles (25, deterministic) ─────────────────────────────────── */
const DUST_COLORS = [
  'rgba(255,255,255,',
  'rgba(192,132,252,',
  'rgba(216,180,254,',
  'rgba(167,139,250,',
]

const PARTICLES = Array.from({ length: 25 }, (_, i) => {
  const opacity = 0.18 + (i % 5) * 0.07
  const size    = 1   + (i % 3) * 0.6
  return {
    id:       i,
    left:     `${(i * 4.1 + 3)  % 100}%`,
    top:      `${(i * 7.7 + 10) % 100}%`,
    size,
    color:    `${DUST_COLORS[i % 4]}${opacity})`,
    blur:     `${(size * 0.7).toFixed(1)}px`,
    duration: `${16 + (i % 12) * 2}s`,
    delay:    `${-((i * 2.3) % 28)}s`,
    opacity,
    drift:    `${-12 + (i % 7) * 4}px`,
  }
})

/* ─── Component ──────────────────────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-home-anim', '1')
    style.textContent = KEYFRAMES
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div style={{
      backgroundColor: '#030005',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Starfield — oversized container drifts as one GPU layer ── */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'starDrift 65s ease-in-out infinite alternate',
      }}>
        {STARS.map(s => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left:         s.left,
              top:          s.top,
              width:        `${s.size}px`,
              height:       `${s.size}px`,
              borderRadius: '50%',
              background:   '#ffffff',
              /* Non-twinkling: static opacity + box-shadow glow.
                 Twinkling: animation handles opacity + drop-shadow via filter. */
              ...(s.twinkles
                ? { animation: s.twinkleAnim, '--s-op': s.opacity }
                : { opacity: s.opacity, boxShadow: s.glow }
              ),
            }}
          />
        ))}
      </div>

      {/* ── Aurora layer 1 — main glow, wide drift ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(192,132,252,0.22) 0%, rgba(147,51,234,0.12) 50%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'auroraGlow 22s ease-in-out infinite',
      }} />

      {/* ── Aurora layer 2 — secondary band, counter-phase for depth ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '80%',
        height: '70%',
        background: 'radial-gradient(ellipse 65% 30% at 50% 50%, rgba(168,85,247,0.15) 0%, rgba(124,58,237,0.07) 55%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'auroraGlow2 17s ease-in-out infinite',
      }} />

      {/* ── Beam — glow line with opacity pulse ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        transform: 'translateY(-50%)',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #9333EA, #C084FC, #9333EA, transparent)',
        boxShadow: '0 0 70px 24px rgba(192,132,252,0.4), 0 0 150px 55px rgba(147,51,234,0.26)',
        pointerEvents: 'none',
        zIndex: 2,
        animation: 'beamPulse 8s ease-in-out infinite',
      }} />

      {/* ── Beam shimmer — bright point slides across (clipped to 2px line) ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        transform: 'translateY(-50%)',
        height: '2px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,248,255,0.85), rgba(255,255,255,1), rgba(255,248,255,0.85), transparent)',
          animation: 'beamShimmer 5s linear 2s infinite',
        }} />
      </div>

      {/* ── Cosmic dust particles ── */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left:         p.left,
            top:          p.top,
            width:        `${p.size}px`,
            height:       `${p.size}px`,
            borderRadius: '50%',
            background:   p.color,
            filter:       `blur(${p.blur})`,
            pointerEvents: 'none',
            zIndex: 3,
            animation: `particleDrift ${p.duration} ${p.delay} ease-in-out infinite`,
            '--p-op': p.opacity,
            '--p-dx': p.drift,
          }}
        />
      ))}

      {/* ── Navigation Bar ── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        position: 'relative',
        zIndex: 10,
        borderBottom: '1px solid rgba(192,132,252,0.1)',
        backdropFilter: 'blur(10px)',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #C084FC, #9333EA)',
            boxShadow: '0 0 15px rgba(192,132,252,0.5)',
          }} />
          <span style={{
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: '700',
            letterSpacing: '3px',
          }}>BELIS</span>
        </div>

        {/* Nav Links — centered */}
        <div style={{
          display: 'flex',
          gap: '40px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          {[
            { label: 'Identity Lab',        path: '/lab'       },
            { label: 'Kit Maker',           path: '/dashboard' },
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
        </div>

        {/* Profile Circle */}
        <div
          onClick={() => navigate('/login')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid rgba(192,132,252,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94A3B8',
            fontSize: '16px',
          }}>
          👤
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '40px',
      }}>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '56px',
          fontWeight: '200',
          letterSpacing: '8px',
          marginBottom: '16px',
          lineHeight: '1.2',
          textTransform: 'uppercase',
        }}>
          Building the core
        </h1>
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '56px',
          fontWeight: '200',
          letterSpacing: '8px',
          marginBottom: '40px',
          lineHeight: '1.2',
          textTransform: 'uppercase',
        }}>
          of your brand.
        </h1>

        <p style={{
          color: '#94A3B8',
          fontSize: '16px',
          letterSpacing: '3px',
          marginBottom: '60px',
          textTransform: 'uppercase',
        }}>
          AI-Powered Brand Identity & Startup Validation
        </p>

        <button
          onClick={() => navigate('/register')}
          style={{
            background: 'transparent',
            border: '1px solid #C084FC',
            color: '#C084FC',
            padding: '16px 48px',
            fontSize: '14px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(192,132,252,0.2)',
          }}
          onMouseEnter={e => {
            e.target.style.background = '#C084FC'
            e.target.style.color = '#030005'
            e.target.style.boxShadow = '0 0 40px rgba(192,132,252,0.5)'
          }}
          onMouseLeave={e => {
            e.target.style.background = 'transparent'
            e.target.style.color = '#C084FC'
            e.target.style.boxShadow = '0 0 20px rgba(192,132,252,0.2)'
          }}
        >
          Create Your Identity
        </button>
      </div>

      {/* ── Chatbot Bubble ── */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'rgba(3,0,5,0.8)',
        border: '1px solid rgba(192,132,252,0.4)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(192,132,252,0.2)',
        zIndex: 100,
      }}>
        <span style={{ fontSize: '18px' }}>···</span>
      </div>

    </div>
  )
}

export default Home
