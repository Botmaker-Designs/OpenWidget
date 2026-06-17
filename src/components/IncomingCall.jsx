export function IncomingCall({ agent, onAccept, onDecline }) {
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
        <p style={subtitleStyle}>Llamada entrante</p>

        <div style={avatarWrapStyle}>
          <img src={agent.avatar} alt={agent.name} style={avatarStyle} />
          <span style={onlineDotStyle} />
        </div>

        <p style={nameStyle}>{agent.name}</p>
        <p style={roleStyle}>Agente de soporte</p>

        <div style={actionsStyle}>
          <button className="cw-call-decline" style={declineBtnStyle} onClick={onDecline}>
            <PhoneOffIcon />
          </button>
          <button className="cw-call-accept" style={acceptBtnStyle} onClick={onAccept}>
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67M6.34 6.34A19.79 19.79 0 0 0 3.06 12a19.79 19.79 0 0 0 3.07 8.63A2 2 0 0 0 8.31 22h3a2 2 0 0 0 1.72-2 13.4 13.4 0 0 0-.7-2.81 2 2 0 0 0-.45-2.11L10.68 13.31M23 1 1 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
