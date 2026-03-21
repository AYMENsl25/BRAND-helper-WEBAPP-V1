import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
  }

  return { toasts, toast }
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'success' ? 'rgba(8,25,12,0.97)' : 'rgba(28,8,8,0.97)',
            border: `1px solid ${t.type === 'success' ? 'rgba(105,219,124,0.45)' : 'rgba(255,107,107,0.45)'}`,
            color: t.type === 'success' ? '#69db7c' : '#ff6b6b',
            padding: '13px 20px',
            fontSize: '12px',
            letterSpacing: '1px',
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 32px ${t.type === 'success' ? 'rgba(105,219,124,0.12)' : 'rgba(255,107,107,0.12)'}`,
            maxWidth: '340px',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'toastIn 0.2s ease',
          }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>
              {t.type === 'success' ? '✓' : '✕'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  )
}
