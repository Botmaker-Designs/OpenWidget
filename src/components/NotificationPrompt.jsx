import { useState, useEffect, useRef } from 'react'

// ─── Device detection ────────────────────────────────────────────────────────

function getDeviceOS() {
  const uaPlatform = navigator.userAgentData?.platform?.toLowerCase()
  if (uaPlatform === 'android') return 'android'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function getIOSVersion() {
  const match = navigator.userAgent.match(/OS (\d+)_/)
  return match ? parseInt(match[1], 10) : null
}

function isStandalone() {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

function hasTriggered(messages) {
  let sawUser = false
  for (const m of messages) {
    if (m.role === 'user') sawUser = true
    if (m.role === 'bot' && sawUser) return true
  }
  return false
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationPrompt({ messages }) {
  const [state, setState] = useState('idle')
  // idle | web-prompt | web-granted | web-denied | ios-pwa | ios-unsupported
  const triggered = useRef(false)
  const grantedTimer = useRef(null)

  useEffect(() => {
    if (triggered.current) return
    if (!hasTriggered(messages)) return
    triggered.current = true

    const os = getDeviceOS()

    if (os === 'ios') {
      const version = getIOSVersion()
      if (isStandalone()) {
        // PWA on iOS — can use Push API normally
        if ('Notification' in window && Notification.permission === 'default') {
          setState('web-prompt')
        }
      } else if (version !== null && version >= 16) {
        setState('ios-pwa')
      } else {
        setState('ios-unsupported')
      }
      return
    }

    // Android / Desktop
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    setState('web-prompt')
  }, [messages])

  useEffect(() => () => clearTimeout(grantedTimer.current), [])

  const handleActivate = async () => {
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setState('web-granted')
      grantedTimer.current = setTimeout(() => setState('idle'), 3500)
    } else {
      setState('web-denied')
    }
  }

  if (state === 'idle') return null

  return (
    <div style={wrapStyle}>
      <style>{`
        @keyframes np-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .np-card { animation: np-slide-up 220ms ease forwards; }
        .np-btn-primary {
          background: var(--cw-primary); color: #fff; border: none;
          border-radius: 10px; padding: 8px 14px; font-size: 12.5px;
          font-weight: 600; cursor: pointer; font-family: var(--cw-font-family);
          transition: opacity 120ms; white-space: nowrap; flex-shrink: 0;
        }
        .np-btn-primary:hover { opacity: 0.88; }
        .np-btn-dismiss {
          width: 26px; height: 26px; border-radius: 50%; border: none;
          background: transparent; cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; justify-content: center;
          transition: background 120ms, color 120ms; flex-shrink: 0;
        }
        .np-btn-dismiss:hover { background: rgba(0,0,0,0.06); color: #374151; }
        .np-step {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #374151; font-family: var(--cw-font-family);
        }
        .np-step-num {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          background: var(--cw-primary);
        }
      `}</style>

      {/* ── Desktop / Android: standard web push ── */}
      {state === 'web-prompt' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#bfdbfe', background: '#f0f7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconWrap('#dbeafe', '#2563eb')}><BellIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={titleStyle}>¿Querés recibir avisos?</div>
              <div style={descStyle}>
                {getDeviceOS() === 'android'
                  ? 'Te notificamos cuando te responden, incluso con Chrome en segundo plano.'
                  : 'Te notificamos cuando te responden, aunque cierres esta pestaña.'}
              </div>
            </div>
            <button className="np-btn-primary" onClick={handleActivate}>Activar</button>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar"><CloseIcon /></button>
          </div>
        </div>
      )}

      {/* ── Granted ── */}
      {state === 'web-granted' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconWrap('#dcfce7', '#16a34a')}><CheckIcon /></div>
            <div>
              <div style={{ ...titleStyle, color: '#15803d' }}>¡Notificaciones activadas!</div>
              <div style={{ ...descStyle, marginTop: 2 }}>Te avisaremos cuando tengas respuestas.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Denied ── */}
      {state === 'web-denied' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconWrap('#f3f4f6', '#6b7280')}><BlockedIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...titleStyle, color: '#374151' }}>Notificaciones bloqueadas</div>
              <div style={descStyle}>Habilitá los permisos desde el <strong>🔒 candado</strong> en la barra de URL.</div>
            </div>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar"><CloseIcon /></button>
          </div>
        </div>
      )}

      {/* ── iOS: add to home screen ── */}
      {state === 'ios-pwa' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#e9d5ff', background: '#faf5ff' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={iconWrap('#ede9fe', '#7c3aed')}><IOSIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...titleStyle, color: '#6d28d9' }}>Recibí avisos en tu iPhone</div>
              <div style={{ ...descStyle, marginBottom: 10 }}>Agregá esta página a tu pantalla de inicio:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="np-step">
                  <span className="np-step-num">1</span>
                  Tocá el ícono <ShareIcon /> en Safari
                </div>
                <div className="np-step">
                  <span className="np-step-num">2</span>
                  Seleccioná <strong>"Agregar a inicio"</strong>
                </div>
                <div className="np-step">
                  <span className="np-step-num">3</span>
                  Abrí la app desde tu pantalla de inicio
                </div>
              </div>
            </div>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar"><CloseIcon /></button>
          </div>
        </div>
      )}

      {/* ── iOS < 16.4: unsupported ── */}
      {state === 'ios-unsupported' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconWrap('#f3f4f6', '#9ca3af')}><BlockedIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...titleStyle, color: '#374151' }}>Notificaciones no disponibles</div>
              <div style={descStyle}>Tu versión de iOS no soporta notificaciones web. Actualizá a iOS 16.4 o superior.</div>
            </div>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar"><CloseIcon /></button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapStyle = { padding: '0 12px 8px', flexShrink: 0 }

const cardBase = { borderRadius: 14, border: '1px solid', padding: '12px 14px' }

const iconWrap = (bg, color) => ({
  width: 36, height: 36, borderRadius: 10,
  background: bg, color, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
})

const titleStyle = {
  fontWeight: 700, fontSize: 13, color: '#111827',
  fontFamily: 'var(--cw-font-family)', lineHeight: 1.3,
}

const descStyle = {
  fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.5,
  fontFamily: 'var(--cw-font-family)',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BlockedIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IOSIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
