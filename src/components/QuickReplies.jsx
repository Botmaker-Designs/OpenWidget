export function QuickReplies({ options, onSelect }) {
  return (
    <>
      <style>{`
        .cw-qr-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #111827;
          font-family: var(--cw-font-family);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 150ms, background 150ms;
          white-space: nowrap;
          text-align: left;
        }
        .cw-qr-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
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
  gap: 6,
  padding: '12px 0 14px',
}
