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

// ─── iOS Bottom Sheet ─────────────────────────────────────────────────────────

function IOSBottomSheet({ onDismiss }) {
  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes np-sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes np-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes np-bounce-down {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%       { transform: translateY(10px); opacity: 0.5; }
        }
        .np-sheet {
          animation: np-sheet-up 380ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .np-backdrop {
          animation: np-fade-in 300ms ease forwards;
        }
        .np-arrow-bounce {
          animation: np-bounce-down 1.2s ease-in-out infinite;
        }
        .np-ios-btn {
          width: 100%; padding: 15px; border: none; border-radius: 14px;
          background: #007AFF; color: #fff; font-size: 17px; font-weight: 600;
          cursor: pointer; font-family: -apple-system, sans-serif;
          transition: opacity 120ms; -webkit-tap-highlight-color: transparent;
        }
        .np-ios-btn:active { opacity: 0.75; }
        .np-ios-step {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0;
        }
        .np-ios-step + .np-ios-step {
          border-top: 1px solid #f3f4f6;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="np-backdrop"
        onClick={onDismiss}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />

      {/* Sheet */}
      <div className="np-sheet" style={sheetStyle}>
        {/* Handle */}
        <div style={{ width: 36, height: 5, borderRadius: 3, background: '#d1d5db', margin: '0 auto 24px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellIcon color="#7c3aed" size={22} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#111827', fontFamily: '-apple-system, sans-serif', lineHeight: 1.2 }}>
              Recibí avisos en tu iPhone
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 3, fontFamily: '-apple-system, sans-serif', lineHeight: 1.4 }}>
              Seguí estos pasos en Safari:
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ margin: '20px 0' }}>
          <div className="np-ios-step">
            <StepNum n={1} />
            <div style={stepTextStyle}>
              Tocá el botón{' '}
              <SafariShareBadge />{' '}
              en la barra inferior de Safari
            </div>
          </div>
          <div className="np-ios-step">
            <StepNum n={2} />
            <div style={stepTextStyle}>
              Desplazate y seleccioná{' '}
              <span style={{ fontWeight: 600, color: '#111827' }}>"Agregar a pantalla de inicio"</span>
            </div>
          </div>
          <div className="np-ios-step">
            <StepNum n={3} />
            <div style={stepTextStyle}>
              Abrí la app desde tu inicio y activá los avisos
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="np-ios-btn" onClick={onDismiss}>Entendido</button>

        {/* Arrow pointing to Safari toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, paddingBottom: 'env(safe-area-inset-bottom, 16px)', gap: 4 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: '-apple-system, sans-serif' }}>
            El botón compartir está aquí abajo
          </div>
          <div className="np-arrow-bounce" style={{ color: '#007AFF' }}>
            <ArrowDownIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepNum({ n }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: '#007AFF', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700, fontFamily: '-apple-system, sans-serif',
    }}>{n}</div>
  )
}

function SafariShareBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: 7,
      background: '#007AFF', verticalAlign: 'middle', margin: '0 2px',
      flexShrink: 0,
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="16 6 12 2 8 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="2" x2="12" y2="15" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationPrompt({ messages }) {
  const [state, setState] = useState('idle')
  // idle | web-prompt | web-granted | web-denied | ios-pwa | ios-pwa-sheet | ios-unsupported
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

  // Bottom sheet is full-screen, rendered on top of everything
  if (state === 'ios-pwa-sheet') return <IOSBottomSheet onDismiss={() => setState('idle')} />

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
      `}</style>

      {/* ── Desktop / Android: standard web push ── */}
      {state === 'web-prompt' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#bfdbfe', background: '#f0f7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconWrap('#dbeafe', '#2563eb')}><BellIcon color="#2563eb" size={17} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={titleStyle}>¿Te avisamos cuando te respondan?</div>
              <div style={descStyle}>Te mandamos un aviso solo cuando el asistente o un agente te responda en este chat.</div>
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

      {/* ── iOS 16+: inline card → bottom sheet ── */}
      {state === 'ios-pwa' && (
        <div className="np-card" style={{ ...cardBase, borderColor: '#e9d5ff', background: '#faf5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconWrap('#ede9fe', '#7c3aed')}><BellIcon color="#7c3aed" size={17} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...titleStyle, color: '#6d28d9' }}>¿Te avisamos cuando te respondan?</div>
              <div style={descStyle}>Podés recibir avisos en tu iPhone agregando esta página al inicio.</div>
            </div>
            <button className="np-btn-primary" style={{ background: '#7c3aed' }} onClick={() => setState('ios-pwa-sheet')}>Ver cómo</button>
            <button className="np-btn-dismiss" onClick={() => setState('idle')} aria-label="Cerrar"><CloseIcon /></button>
          </div>
        </div>
      )}

      {/* ── iOS < 16: unsupported ── */}
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

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
}

const sheetStyle = {
  position: 'relative', background: '#fff',
  borderRadius: '20px 20px 0 0',
  padding: '16px 24px 0',
  boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
  maxHeight: '90vh', overflowY: 'auto',
}

const stepTextStyle = {
  fontSize: 15, color: '#374151',
  fontFamily: '-apple-system, sans-serif',
  lineHeight: 1.45, flex: 1,
}

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

function BellIcon({ color = 'currentColor', size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

function ArrowDownIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16M6 14l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
