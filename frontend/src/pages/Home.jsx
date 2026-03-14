import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

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

      {/* Aurora Background Effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(192,132,252,0.15) 0%, rgba(147,51,234,0.08) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Aurora Beam */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        transform: 'translateY(-50%)',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #9333EA, #C084FC, #9333EA, transparent)',
        boxShadow: '0 0 60px 20px rgba(192,132,252,0.3), 0 0 120px 40px rgba(147,51,234,0.2)',
        pointerEvents: 'none',
      }} />

      {/* Navigation Bar */}
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
            { label: 'Identity Lab', path: '/lab' },
            { label: 'Kit Maker', path: '/dashboard' },
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

      {/* Hero Section */}
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

      {/* Chatbot Bubble */}
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