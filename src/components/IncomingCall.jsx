export function IncomingCall({ agent, onAccept, onDecline, isMobile = false }) {
  const btnSize = isMobile ? 86 : 60
  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes cw-call-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
        }
        @keyframes cw-call-slide {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cw-call-accept:hover  { background: #16a34a !important; }
        .cw-call-decline:hover { background: #dc2626 !important; }
      `}</style>

      <div style={cardStyle}>
        <p style={{ ...subtitleStyle, fontSize: isMobile ? 17 : 13 }}>Llamada entrante</p>

        <div style={avatarWrapStyle}>
          <img src={agent.avatar} alt={agent.name} style={{ ...avatarStyle, width: isMobile ? 112 : 72, height: isMobile ? 112 : 72 }} />
          <span style={onlineDotStyle} />
        </div>

        <p style={{ ...nameStyle, fontSize: isMobile ? 28 : 18 }}>{agent.name}</p>
        <p style={{ ...roleStyle, fontSize: isMobile ? 17 : 13 }}>Agente de soporte</p>

        <div style={actionsStyle}>
          <button className="cw-call-decline" style={{ ...declineBtnStyle, width: btnSize, height: btnSize }} onClick={onDecline}>
            <PhoneOffIcon />
          </button>
          <button className="cw-call-accept" style={{ ...acceptBtnStyle, width: btnSize, height: btnSize }} onClick={onAccept}>
            <PhoneIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l1.68-1.68a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PhoneOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ transform: 'rotate(135deg)' }}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.25c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02L6.62 10.79z"/>
    </svg>
  )
}

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15, 20, 35, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  animation: 'cw-call-slide 280ms cubic-bezier(0.22,1,0.36,1) forwards',
}

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const subtitleStyle = {
  margin: '0 0 20px',
  fontSize: 13,
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.04em',
}

const avatarWrapStyle = {
  position: 'relative',
  marginBottom: 14,
}

const avatarStyle = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  objectFit: 'cover',
  animation: 'cw-call-pulse 1.8s ease-in-out infinite',
}

const onlineDotStyle = {
  position: 'absolute',
  bottom: 3,
  right: 3,
  width: 14,
  height: 14,
  borderRadius: '50%',
  background: '#22c55e',
  border: '2.5px solid #1a1f2e',
}

const nameStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: '#fff',
}

const roleStyle = {
  margin: '4px 0 28px',
  fontSize: 13,
  color: 'rgba(255,255,255,0.45)',
}

const actionsStyle = {
  display: 'flex',
  gap: 32,
  alignItems: 'center',
}

const acceptBtnStyle = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  border: 'none',
  background: '#22c55e',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms',
}

const declineBtnStyle = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  border: 'none',
  background: '#ef4444',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 150ms',
}
