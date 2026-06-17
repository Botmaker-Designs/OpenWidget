export function TypingIndicator({ mode = 'writing', agentName }) {
  const label = mode === 'thinking'
    ? 'Pensando...'
    : agentName
      ? `${agentName} está escribiendo...`
      : 'Escribiendo...'

  return (
    <>
      <style>{`
        @keyframes cw-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .cw-typing-text {
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
          animation: cw-shimmer 1.6s linear infinite;
        }
      `}</style>

      <div style={wrapStyle}>
        <span className="cw-typing-text">{label}</span>
      </div>
    </>
  )
}

function SpinnerDots() {
  return (
    <>
      <style>{`
        @keyframes cw-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .cw-sdot { animation: cw-dot-pulse 1.2s ease-in-out infinite; }
        .cw-sdot:nth-child(2) { animation-delay: 0.16s; }
        .cw-sdot:nth-child(3) { animation-delay: 0.32s; }
      `}</style>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <span key={i} className="cw-sdot" style={dotStyle} />
        ))}
      </div>
    </>
  )
}

const wrapStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
}

const dotStyle = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: 'var(--cw-text-muted)',
  display: 'inline-block',
}
