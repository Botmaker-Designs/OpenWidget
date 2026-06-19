export function TransferringMessage() {
  return (
    <>
      <style>{`
        @keyframes cw-transfer-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .cw-transfer-text {
          font-size: 13px;
          font-weight: 500;
          background: linear-gradient(
            90deg,
            var(--cw-text-muted) 25%,
            #111827 50%,
            var(--cw-text-muted) 75%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: cw-transfer-shimmer 1.6s linear infinite;
        }
      `}</style>
      <div style={{ padding: '4px 0' }}>
        <span className="cw-transfer-text">Conectando con un agente...</span>
      </div>
    </>
  )
}

// Mensaje de sistema — "Camila se unió al chat."
export function AgentJoinMessage({ agentName, agentAvatar, timestamp }) {
  return (
    <div style={joinWrapStyle}>
      <div style={joinLineStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {agentAvatar && (
          <img
            src={agentAvatar}
            alt={agentName}
            style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <span style={joinTextStyle}>
          <strong style={{ fontWeight: 600, color: '#374151' }}>{agentName}</strong>
          {' se unió al chat'}
          {timestamp && <span style={{ color: '#d1d5db', marginLeft: 6 }}>· {timestamp}</span>}
        </span>
      </div>
      <div style={joinLineStyle} />
    </div>
  )
}


const joinWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  margin: '8px 0',
  padding: '0 4px',
}

const joinLineStyle = {
  flex: 1,
  height: 1,
  background: '#e5e7eb',
}

const joinTextStyle = {
  fontSize: 12,
  color: '#9ca3af',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}
