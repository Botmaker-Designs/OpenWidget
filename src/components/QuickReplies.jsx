export function QuickReplies({ options, onSelect }) {
  return (
    <>
      <style>{`
        .cw-qr-btn {
          padding: 10px 18px;
          border-radius: 20px;
          border: 1.5px solid var(--cw-border);
          background: #fff;
          color: var(--cw-text);
          font-family: var(--cw-font-family);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 120ms, background 120ms, color 120ms;
          white-space: nowrap;
        }
        .cw-qr-btn:hover {
          border-color: var(--cw-primary);
          color: var(--cw-primary);
          background: #f0f5ff;
        }
      `}</style>
      <div style={wrapStyle}>
        {options.map((opt) => (
          <button
            key={opt.value}
            className="cw-qr-btn"
            onClick={() => onSelect(opt)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  )
}

const wrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
  padding: '4px 0 14px',
}
