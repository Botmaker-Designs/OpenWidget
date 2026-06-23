export function TransferringMessage({ isMobile = false }) {
  return (
    <>
      <style>{`
        @keyframes cw-spin { to { transform: rotate(360deg); } }
        @keyframes cw-pulse-avatar {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div style={{ ...transferCardStyle, padding: isMobile ? '14px 16px' : '12px 14px', gap: isMobile ? 14 : 10 }}>
        <div style={{ ...transferAvatarStyle, width: isMobile ? 48 : 36, height: isMobile ? 48 : 36 }}>
          <svg width={isMobile ? 26 : 20} height={isMobile ? 26 : 20} viewBox="0 0 24 24" fill="none" style={{ color: '#6b7280' }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...transferTitleStyle, fontSize: isMobile ? 17 : 13 }}>Transfiriendo a un agente humano</div>
          <div style={{ ...transferSubStyle, fontSize: isMobile ? 15 : 12 }}>Tiempo aprox. 2 min</div>
        </div>
        <svg
          width={isMobile ? 22 : 16} height={isMobile ? 22 : 16} viewBox="0 0 24 24" fill="none"
          style={{ color: 'var(--cw-primary)', flexShrink: 0, animation: 'cw-spin 1s linear infinite' }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </>
  )
}

const transferCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  background: '#f8faff',
  border: '1.5px solid #dbeafe',
  borderRadius: 12,
  margin: '4px 0',
}

const transferAvatarStyle = {
  width: 36, height: 36,
  borderRadius: '50%',
  background: '#e5e7eb',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
  animation: 'cw-pulse-avatar 1.8s ease-in-out infinite',
}

const transferTitleStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#111827',
  marginBottom: 2,
}

const transferSubStyle = {
  fontSize: 12,
  color: '#6b7280',
}

// Mensaje de sistema — "Camila se unió al chat."
export function AgentJoinMessage({ agentName, agentAvatar, timestamp, isMobile = false }) {
  return (
    <div style={joinWrapStyle}>
      <div style={joinLineStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {agentAvatar && (
          <img
            src={agentAvatar}
            alt={agentName}
            style={{ width: isMobile ? 28 : 20, height: isMobile ? 28 : 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <span style={{ ...joinTextStyle, fontSize: isMobile ? 16 : 12 }}>
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
