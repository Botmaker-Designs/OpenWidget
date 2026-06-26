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

// ─── Phone illustrations ──────────────────────────────────────────────────────

// Shared phone frame — renders children as screen content
function PhoneFrame({ children }) {
  return (
    <svg width="160" height="300" viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="2" y="2" width="156" height="296" rx="24" fill="#1c1c1e" stroke="#3a3a3c" strokeWidth="1.5"/>
      {/* Screen */}
      <rect x="8" y="8" width="144" height="284" rx="18" fill="#f2f2f7"/>
      {/* Dynamic island */}
      <rect x="52" y="14" width="56" height="14" rx="7" fill="#1c1c1e"/>
      {/* Status bar: time */}
      <text x="22" y="24" fontSize="8" fontWeight="700" fill="#1c1c1e" fontFamily="-apple-system,sans-serif">9:41</text>
      {/* Status bar: battery */}
      <rect x="126" y="17" width="14" height="7" rx="2" fill="none" stroke="#1c1c1e" strokeWidth="1"/>
      <rect x="140" y="19.5" width="2" height="2" rx="0.5" fill="#1c1c1e"/>
      <rect x="127" y="18" width="10" height="5" rx="1" fill="#1c1c1e"/>
      {/* Signal dots */}
      <circle cx="118" cy="20.5" r="1.5" fill="#1c1c1e"/>
      <circle cx="113" cy="20.5" r="1.5" fill="#1c1c1e"/>
      <circle cx="108" cy="20.5" r="1.5" fill="#1c1c1e"/>
      {/* Screen content slot */}
      <foreignObject x="8" y="32" width="144" height="252">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: 144, height: 252, overflow: 'hidden', borderRadius: '0 0 14px 14px', background: '#f2f2f7', position: 'relative' }}>
          {children}
        </div>
      </foreignObject>
    </svg>
  )
}

// Step 1: Safari bottom bar with "..." highlighted
function Step1Phone() {
  return (
    <PhoneFrame>
      {/* Fake webpage */}
      <div style={{ background: '#fff', height: 190, margin: '0 0 0 0', padding: 10 }}>
        <div style={{ height: 8, borderRadius: 4, background: '#e5e7eb', marginBottom: 6, width: '80%' }}/>
        <div style={{ height: 6, borderRadius: 3, background: '#f3f4f6', marginBottom: 4, width: '60%' }}/>
        <div style={{ height: 6, borderRadius: 3, background: '#f3f4f6', marginBottom: 4, width: '90%' }}/>
        <div style={{ height: 6, borderRadius: 3, background: '#f3f4f6', marginBottom: 12, width: '70%' }}/>
        <div style={{ height: 50, borderRadius: 8, background: '#e0f2fe', marginBottom: 8 }}/>
        <div style={{ height: 6, borderRadius: 3, background: '#f3f4f6', marginBottom: 4, width: '85%' }}/>
        <div style={{ height: 6, borderRadius: 3, background: '#f3f4f6', width: '55%' }}/>
      </div>
      {/* Safari URL bar */}
      <div style={{ background: '#f2f2f7', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '0.5px solid #d1d5db' }}>
        <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 8, height: 22, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: '#9ca3af' }}/>
        </div>
      </div>
      {/* Safari bottom toolbar */}
      <div style={{ background: '#f2f2f7', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid #d1d5db' }}>
        {/* Back */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
        {/* Forward */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/></svg>
        {/* Share */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16 6 12 2 8 6" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="2" x2="12" y2="14" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/></svg>
        {/* Bookmark */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {/* Three dots — highlighted */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(0,122,255,0.25)' }}>
            <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
              <circle cx="2" cy="2" r="1.8" fill="#fff"/>
              <circle cx="7" cy="2" r="1.8" fill="#fff"/>
              <circle cx="12" cy="2" r="1.8" fill="#fff"/>
            </svg>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

// Step 2: Action sheet with "Compartir" highlighted
function Step2Phone() {
  const items = ['AirDrop', 'Mensajes', 'Mail', 'Notas']
  return (
    <PhoneFrame>
      {/* Dimmed bg */}
      <div style={{ background: 'rgba(0,0,0,0.35)', height: '100%', position: 'relative' }}>
        {/* Action sheet */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f2f2f7', borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
          {/* App icon row */}
          <div style={{ display: 'flex', gap: 12, padding: '14px 12px 10px', overflowX: 'hidden', justifyContent: 'center' }}>
            {['📱','💬','📷','📋'].map((e, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{e}</div>
                <div style={{ width: 24, height: 4, borderRadius: 2, background: '#d1d5db' }}/>
              </div>
            ))}
          </div>
          {/* Divider */}
          <div style={{ height: 0.5, background: '#d1d5db', margin: '0 12px' }}/>
          {/* "Compartir" row — highlighted */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,122,255,0.08)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><polyline points="16 6 12 2 8 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="2" x2="12" y2="14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#007AFF', fontFamily: '-apple-system,sans-serif' }}>Compartir</span>
          </div>
          {/* Other options */}
          {['Copiar', 'Agregar marcador'].map((t, i) => (
            <div key={i}>
              <div style={{ height: 0.5, background: '#d1d5db', margin: '0 12px' }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#e5e7eb' }}/>
                <span style={{ fontSize: 11, color: '#374151', fontFamily: '-apple-system,sans-serif' }}>{t}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}

// Step 3: Share sheet with "Agregar a pantalla de inicio" highlighted
function Step3Phone() {
  return (
    <PhoneFrame>
      <div style={{ background: 'rgba(0,0,0,0.35)', height: '100%', position: 'relative' }}>
        {/* Share sheet */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f2f2f7', borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
          {/* Drag handle */}
          <div style={{ width: 28, height: 3, borderRadius: 2, background: '#c7c7cc', margin: '8px auto 10px' }}/>
          {/* URL preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px 10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#e5e7eb' }}/>
            <div>
              <div style={{ width: 70, height: 5, borderRadius: 3, background: '#374151', marginBottom: 3 }}/>
              <div style={{ width: 90, height: 4, borderRadius: 2, background: '#9ca3af' }}/>
            </div>
          </div>
          <div style={{ height: 0.5, background: '#d1d5db' }}/>
          {/* Scrollable app icons */}
          <div style={{ display: 'flex', gap: 10, padding: '10px 12px', overflowX: 'hidden' }}>
            {['✉️','📨','💬','📝'].map((e, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{e}</div>
                <div style={{ width: 28, height: 4, borderRadius: 2, background: '#d1d5db' }}/>
              </div>
            ))}
          </div>
          <div style={{ height: 0.5, background: '#d1d5db' }}/>
          {/* "Agregar a pantalla de inicio" — highlighted */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,122,255,0.08)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#fff" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#007AFF', fontFamily: '-apple-system,sans-serif', lineHeight: 1.2 }}>Agregar a pantalla<br/>de inicio</span>
          </div>
          {/* Another option */}
          <div style={{ height: 0.5, background: '#d1d5db', margin: '0 12px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#e5e7eb' }}/>
            <span style={{ fontSize: 11, color: '#374151', fontFamily: '-apple-system,sans-serif' }}>Copiar enlace</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

const IOS_STEPS = [
  {
    label: 'Paso 1',
    text: 'Tocá el botón ··· en la barra inferior de Safari',
    illustration: <Step1Phone />,
  },
  {
    label: 'Paso 2',
    text: 'Tocá "Compartir" en el menú que aparece',
    illustration: <Step2Phone />,
  },
  {
    label: 'Paso 3',
    text: 'Seleccioná "Agregar a pantalla de inicio"',
    illustration: <Step3Phone />,
  },
]

// ─── iOS Bottom Sheet ─────────────────────────────────────────────────────────

function IOSBottomSheet({ onDismiss }) {
  const [step, setStep] = useState(0)
  const isLast = step === IOS_STEPS.length - 1

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
        @keyframes np-phone-in {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .np-sheet { animation: np-sheet-up 380ms cubic-bezier(0.32,0.72,0,1) forwards; }
        .np-backdrop { animation: np-fade-in 300ms ease forwards; }
        .np-phone { animation: np-phone-in 220ms ease forwards; }
        .np-ios-btn {
          flex: 1; padding: 14px; border: none; border-radius: 14px;
          background: #007AFF; color: #fff; font-size: 16px; font-weight: 600;
          cursor: pointer; font-family: -apple-system,sans-serif;
          transition: opacity 120ms; -webkit-tap-highlight-color: transparent;
        }
        .np-ios-btn:active { opacity: 0.75; }
        .np-ios-btn-ghost {
          flex: 1; padding: 14px; border: 1.5px solid #e5e7eb; border-radius: 14px;
          background: transparent; color: #374151; font-size: 16px; font-weight: 600;
          cursor: pointer; font-family: -apple-system,sans-serif;
          transition: background 120ms; -webkit-tap-highlight-color: transparent;
        }
        .np-ios-btn-ghost:active { background: #f3f4f6; }
        .np-nav-arrow {
          width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #e5e7eb;
          background: #fff; cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: #374151; transition: background 120ms;
          flex-shrink: 0;
        }
        .np-nav-arrow:active { background: #f3f4f6; }
        .np-nav-arrow:disabled { opacity: 0.3; cursor: default; }
      `}</style>

      {/* Backdrop */}
      <div className="np-backdrop" onClick={onDismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />

      {/* Sheet */}
      <div className="np-sheet" style={sheetStyle}>
        {/* Handle + close */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 36, height: 5, borderRadius: 3, background: '#d1d5db' }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onDismiss} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#007AFF', fontFamily: '-apple-system,sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {IOS_STEPS[step].label}
          </span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 600, color: '#111827', fontFamily: '-apple-system,sans-serif', lineHeight: 1.35, marginBottom: 24, padding: '0 8px' }}>
          {IOS_STEPS[step].text}
        </div>

        {/* Phone illustration + nav arrows */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <button className="np-nav-arrow" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div key={step} className="np-phone">
            {IOS_STEPS[step].illustration}
          </div>

          <button className="np-nav-arrow" onClick={() => setStep(s => s + 1)} disabled={isLast}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Dots indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {IOS_STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i === step ? '#007AFF' : '#d1d5db', transition: 'all 250ms', cursor: 'pointer' }} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, paddingBottom: 'max(env(safe-area-inset-bottom,0px), 16px)' }}>
          {isLast
            ? <button className="np-ios-btn" onClick={onDismiss}>¡Listo!</button>
            : <>
                <button className="np-ios-btn-ghost" onClick={onDismiss}>Ahora no</button>
                <button className="np-ios-btn" onClick={() => setStep(s => s + 1)}>Siguiente →</button>
              </>
          }
        </div>
      </div>
    </div>
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

      {/* ── Desktop / Android ── */}
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

      {/* ── iOS < 16 ── */}
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
  maxHeight: '92vh', overflowY: 'auto',
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

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
