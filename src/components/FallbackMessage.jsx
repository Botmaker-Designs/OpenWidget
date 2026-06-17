export function FallbackMessage({ text, onEscalate, onLeaveMessage, acted }) {
  return (
    <>
      <style>{`
        .cw-fallback-action {
          padding: 7px 14px;
          border-radius: 20px;
          border: 1.5px solid var(--cw-border);
          background: #fff;
          color: var(--cw-text);
          font-family: var(--cw-font-family);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 120ms, background 120ms, color 120ms;
          white-space: nowrap;
        }
        .cw-fallback-action:hover {
          border-color: var(--cw-primary);
          color: var(--cw-primary);
          background: #f0f5ff;
        }
        .cw-fallback-action-stub {
          padding: 7px 14px;
          border-radius: 20px;
          border: 1.5px solid #e5e7eb;
          background: transparent;
          color: #d1d5db;
          font-family: var(--cw-font-family);
          font-size: 13px;
          cursor: not-allowed;
          white-space: nowrap;
        }
      `}</style>

      <div style={wrapStyle}>
        {/* Burbuja de texto normal */}
        <div style={bubbleStyle}>{text}</div>

        {!acted && (
          <div style={actionsStyle}>
            <button className="cw-fallback-action" onClick={onEscalate}>
              Hablar con un agente
            </button>
            <button className="cw-fallback-action" onClick={onLeaveMessage}>
              Dejar un mensaje
            </button>
            <button className="cw-fallback-action-stub" disabled>
              Ver artículos relacionados
            </button>
          </div>
        )}
      </div>
    </>
  )
}

const wrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  alignItems: 'flex-start',
  maxWidth: '88%',
}

const bubbleStyle = {
  padding: '9px 13px',
  borderRadius: '16px 16px 16px 4px',
  background: 'var(--cw-bg-message-bot)',
  color: 'var(--cw-text)',
  fontSize: 14,
  lineHeight: 1.5,
}

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  paddingLeft: 2,
}
