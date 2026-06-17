import { useState, useEffect } from 'react'

export function ActiveVideoCall({ agent, onHangUp }) {
  const [seconds, setSeconds]   = useState(0)
  const [muted, setMuted]       = useState(false)
  const [camOff, setCamOff]     = useState(false)
  const [pipDragging, setPipDragging] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    return `${m}:${(s % 60).toString().padStart(2, '0')}`
  }

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes cw-video-in {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
        .cw-vid-btn:hover  { background: rgba(255,255,255,0.25) !important; }
        .cw-vid-btn:active { background: rgba(255,255,255,0.35) !important; }
        .cw-hangup-v:hover { background: #dc2626 !important; }
      `}</style>

      {/* Fondo */}
      <div style={remoteCamBgStyle} />
      <div style={remoteCamOverlayStyle} />

      {/* Avatar de Camila centrado */}
      <div style={remoteCamAvatarWrapStyle}>
        <img src={agent.avatar} alt={agent.name} style={remoteCamAvatarStyle} />
      </div>

      {/* Info top-left */}
      <div style={topInfoStyle}>
        <span style={nameTagStyle}>{agent.name}</span>
        <span style={timerTagStyle}>{fmt(seconds)}</span>
      </div>

      {/* PiP — cámara del usuario (top-right) */}
      <div style={pipStyle}>
        {camOff ? (
          <div style={pipOffStyle}>
            <PersonIcon />
          </div>
        ) : (
          <div style={pipVideoStyle}>
            <div style={pipGradientStyle} />
            <span style={pipLabelStyle}>Tú</span>
          </div>
        )}
      </div>

      {/* Controles bottom */}
      <div style={controlsStyle}>
        {/* Micrófono */}
        <div style={ctrlWrapStyle}>
          <button className="cw-vid-btn" style={ctrlBtnStyle(muted)} onClick={() => setMuted(m => !m)}>
            {muted ? <MicOffIcon /> : <MicIcon />}
          </button>
          <span style={ctrlLabelStyle}>{muted ? 'Activar' : 'Silenciar'}</span>
        </div>

        {/* Cámara */}
        <div style={ctrlWrapStyle}>
          <button className="cw-vid-btn" style={ctrlBtnStyle(camOff)} onClick={() => setCamOff(c => !c)}>
            {camOff ? <CamOffIcon /> : <CamIcon />}
          </button>
          <span style={ctrlLabelStyle}>{camOff ? 'Activar' : 'Cámara'}</span>
        </div>

        {/* Colgar */}
        <div style={ctrlWrapStyle}>
          <button className="cw-hangup-v" style={hangUpStyle} onClick={() => onHangUp(seconds)}>
            <PhoneOffIcon />
          </button>
          <span style={ctrlLabelStyle}>Colgar</span>
        </div>

        {/* Girar cámara */}
        <div style={ctrlWrapStyle}>
          <button className="cw-vid-btn" style={ctrlBtnStyle(false)}>
            <FlipCamIcon />
          </button>
          <span style={ctrlLabelStyle}>Girar</span>
        </div>
      </div>
    </div>
  )
}

// ── Íconos ───────────────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CamIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M23 7l-7 5 7 5V7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CamOffIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function FlipCamIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M20 7h-3.5L15 5H9L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10v4M10 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PhoneOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67M6.34 6.34A19.79 19.79 0 0 0 3.06 12a19.79 19.79 0 0 0 3.07 8.63A2 2 0 0 0 8.31 22h3a2 2 0 0 0 1.72-2 13.4 13.4 0 0 0-.7-2.81 2 2 0 0 0-.45-2.11L10.68 13.31M23 1 1 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  background: '#000',
  zIndex: 10,
  overflow: 'hidden',
  animation: 'cw-video-in 320ms cubic-bezier(0.22,1,0.36,1) forwards',
}

const remoteCamBgStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(160deg, #1a2535 0%, #0f1520 100%)',
}

const remoteCamAvatarWrapStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}

const remoteCamAvatarStyle = {
  width: 100,
  height: 100,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid rgba(255,255,255,0.2)',
}

const remoteCamOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.7) 100%)',
  zIndex: 2,
}

const topInfoStyle = {
  position: 'absolute',
  top: 16,
  left: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  zIndex: 3,
}

const nameTagStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: '#fff',
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
}

const timerTagStyle = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.7)',
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '0.04em',
}

const pipStyle = {
  position: 'absolute',
  top: 14,
  right: 14,
  width: 80,
  height: 110,
  borderRadius: 12,
  overflow: 'hidden',
  border: '2px solid rgba(255,255,255,0.3)',
  zIndex: 4,
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
}

const pipVideoStyle = {
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #1a2535 0%, #2d3a4f 100%)',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
  position: 'relative',
}

const pipGradientStyle = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(ellipse at 50% 40%, rgba(80,120,200,0.18) 0%, transparent 70%)',
}

const pipLabelStyle = {
  fontSize: 10,
  color: 'rgba(255,255,255,0.7)',
  padding: '0 6px 5px',
  position: 'relative',
  zIndex: 1,
}

const pipOffStyle = {
  width: '100%',
  height: '100%',
  background: '#1a1f2e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const controlsStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  padding: '16px 20px 28px',
  zIndex: 5,
}

const ctrlWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
}

const ctrlBtnStyle = (active) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  border: 'none',
  background: active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(8px)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms',
})

const ctrlLabelStyle = {
  fontSize: 10,
  color: 'rgba(255,255,255,0.6)',
}

const hangUpStyle = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  border: 'none',
  background: '#ef4444',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms',
}
