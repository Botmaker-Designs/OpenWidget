import { useState, useEffect } from 'react'

export function ActiveCall({ agent, onHangUp }) {
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted]     = useState(false)
  const [speaker, setSpeaker] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes cw-active-call-in {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cw-sound-ring {
          0%   { box-shadow: 0 0 0 0px rgba(34,197,94,0.6), 0 0 0 8px rgba(34,197,94,0.3); }
          50%  { box-shadow: 0 0 0 8px rgba(34,197,94,0.3), 0 0 0 18px rgba(34,197,94,0.1); }
          100% { box-shadow: 0 0 0 0px rgba(34,197,94,0.6), 0 0 0 8px rgba(34,197,94,0.3); }
        }
        .cw-speaking { animation: cw-sound-ring 1.4s ease-in-out infinite; }
        .cw-hangup-btn:hover  { background: #dc2626 !important; transform: scale(1.06); }
        .cw-call-action:hover { background: rgba(255,255,255,0.18) !important; }
      `}</style>

      <div style={contentStyle}>

        {/* Avatar + identidad */}
        <div style={avatarWrapStyle}>
          <img src={agent.avatar} alt={agent.name} className="cw-speaking" style={avatarStyle} />
          <span style={dotStyle} />
        </div>

        <p style={nameStyle}>{agent.name}</p>
        <p style={roleStyle}>Agente de soporte</p>

        {/* Timer + estado */}
        <p style={timerStyle}>{fmt(seconds)}</p>
        <p style={statusStyle}>En llamada</p>

        {/* Botones */}
        <div style={actionsRowStyle}>
          <div style={actionWrapStyle}>
            <button className="cw-call-action" style={actionBtnStyle(muted)} onClick={() => setMuted(m => !m)}>
              {muted ? <MicOffIcon /> : <MicIcon />}
            </button>
            <span style={actionLabelStyle}>{muted ? 'Activar mic' : 'Silenciar'}</span>
          </div>

          <button className="cw-hangup-btn" style={hangUpStyle} onClick={() => onHangUp(seconds)}>
            <PhoneOffIcon />
          </button>

          <div style={actionWrapStyle}>
            <button className="cw-call-action" style={actionBtnStyle(!speaker)} onClick={() => setSpeaker(s => !s)}>
              {speaker ? <SpeakerIcon /> : <SpeakerOffIcon />}
            </button>
            <span style={actionLabelStyle}>{speaker ? 'Altavoz' : 'Auricular'}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Íconos ───────────────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SpeakerOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PhoneOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67M6.34 6.34A19.79 19.79 0 0 0 3.06 12a19.79 19.79 0 0 0 3.07 8.63A2 2 0 0 0 8.31 22h3a2 2 0 0 0 1.72-2 13.4 13.4 0 0 0-.7-2.81 2 2 0 0 0-.45-2.11L10.68 13.31M23 1 1 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 20, 35, 0.82)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  animation: 'cw-active-call-in 300ms cubic-bezier(0.22,1,0.36,1) forwards',
}

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '0 32px',
  gap: 0,
}

const avatarWrapStyle = {
  position: 'relative',
  marginBottom: 18,
}

const avatarStyle = {
  width: 96,
  height: 96,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid #22c55e',
}

const dotStyle = {
  position: 'absolute',
  bottom: 4,
  right: 4,
  width: 14,
  height: 14,
  borderRadius: '50%',
  background: '#22c55e',
  border: '2.5px solid rgba(15,20,35,0.82)',
}

const nameStyle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  color: '#fff',
}

const roleStyle = {
  margin: '4px 0 0',
  fontSize: 13,
  color: 'rgba(255,255,255,0.4)',
}

const timerStyle = {
  margin: '16px 0 4px',
  fontSize: 18,
  fontWeight: 400,
  color: '#fff',
  letterSpacing: '0.06em',
  fontVariantNumeric: 'tabular-nums',
}

const statusStyle = {
  margin: '0 0 32px',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#22c55e',
}

const actionsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 28,
}

const actionWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
}

const actionBtnStyle = (active) => ({
  width: 52,
  height: 52,
  borderRadius: '50%',
  border: 'none',
  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms, transform 150ms',
})

const actionLabelStyle = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.4)',
}

const hangUpStyle = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  border: 'none',
  background: '#ef4444',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms, transform 150ms',
  marginBottom: 26,
}
