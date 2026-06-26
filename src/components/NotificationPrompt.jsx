import { useState, useEffect, useRef } from 'react'

const SUPPORT = typeof window !== 'undefined' && 'Notification' in window

function hasTriggered(messages) {
  let sawUser = false
  for (const m of messages) {
    if (m.role === 'user') sawUser = true
    if (m.role === 'bot' && sawUser) return true
  }
  return false
}

export function NotificationPrompt({ messages }) {
  const [state, setState] = useState('idle') // idle | prompt | granted | denied
  const triggered = useRef(false)
  const grantedTimer = useRef(null)

  useEffect(() => {
    if (!SUPPORT) return
    if (Notification.permission !== 'default') return
    if (triggered.current) return
    if (hasTriggered(messages)) {
      triggered.current = true
      setState('prompt')
    }
  }, [messages])

  useEffect(() => () => clearTimeout(grantedTimer.current), [])

  const handleActivate = async () => {
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setState('granted')
      grantedTimer.current = setTimeout(() => setState('idle'), 3500)
    } else {
      setState('denied')
    }
  }

  if (state === 'idle') return null

  return (
    <div style={wrapStyle}>
      <style>{`
        @keyframes np-slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .np-card { animation: np-slide-up 220ms ease forwards; }
        .np-btn-primary {
          background: var(--cw-primary); color: #fff; border: none;
          border-radius: 10px; padding: 9px 16px; font-size: 13px;
          font-weight: 600; cursor: pointer; font-family: var(--cw-font-family);
          transition: opacity 120ms;
        }
        .np-btn-primary:hover { opacity: 0.88; }
        .np-btn-dismiss {
          width: 28px; height: 28px; border-radius: 50%; border: none;
          background: transparent; cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; justify-content: center;
          transition: background 120ms, color 120ms; flex-shrink: 0;
        }
        .np-btn-dismiss:hover { background: #f3f4f6; color: #374151; }
      `}</style>

      {state === 'prompt' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#bfdbfe', background: '#f0f7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={iconWrap('#dbeafe', '#2563eb')}>
              <BellIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={titleStyle}>¿Querés recibir avisos?</div>
              <div style={descStyle}>Te notificamos cuando un agente te responda, aunque cierres esta pestaña.</div>
            </div>
            <button className="np-btn-primary" onClick={handleActivate} style={{ flexShrink: 0 }}>
              Activar
            </button>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {state === 'granted' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={iconWrap('#dcfce7', '#16a34a')}>
              <CheckIcon />
            </div>
            <div>
              <div style={{ ...titleStyle, color: '#15803d' }}>¡Notificaciones activadas!</div>
              <div style={{ ...descStyle, marginTop: 2 }}>Te avisaremos cuando tengas respuestas.</div>
            </div>
          </div>
        </div>
      )}

      {state === 'denied' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={iconWrap('#f3f4f6', '#6b7280')}>
              <BlockedIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...titleStyle, color: '#374151' }}>Notificaciones bloqueadas</div>
              <div style={descStyle}>
                Para activarlas, hacé clic en el <strong>🔒 candado</strong> de la barra de URL y habilitá los permisos de notificación.
              </div>
            </div>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapStyle = {
  padding: '0 12px 8px',
  flexShrink: 0,
}

const cardBase = {
  borderRadius: 14,
  border: '1px solid',
  padding: '14px 14px 14px 14px',
}

const iconWrap = (bg, color) => ({
  width: 38, height: 38, borderRadius: 10,
  background: bg, color, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
})

const titleStyle = {
  fontWeight: 700, fontSize: 13.5, color: '#111827',
  fontFamily: 'var(--cw-font-family)', lineHeight: 1.3,
}

const descStyle = {
  fontSize: 12.5, color: '#6b7280', marginTop: 4, lineHeight: 1.5,
  fontFamily: 'var(--cw-font-family)',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BlockedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
