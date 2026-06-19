export function QuickReplies({ options, onSelect }) {
  return (
    <>
      <style>{`
        .cw-qr-btn {
          padding: 7px 14px;
          border-radius: 20px;
          border: 1.5px solid var(--cw-primary);
          background: transparent;
          color: var(--cw-primary);
          font-family: var(--cw-font-family);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 120ms, color 120ms;
          white-space: nowrap;
        }
        .cw-qr-btn:hover {
          background: var(--cw-primary);
          color: #fff;
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
  flexWrap: 'wrap',
  gap: 8,
  padding: '4px 14px 14px',
}
