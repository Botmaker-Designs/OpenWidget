import { useEffect, useRef } from 'react'

export function HeaderMenu({ isOpen, isExpanded, onToggleExpand, onDownloadTranscript, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <style>{`
        .cw-menu-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px;
          border: none; background: transparent;
          font-family: var(--cw-font-family); font-size: 14px; color: #111827;
          cursor: pointer; text-align: left;
          transition: background 100ms;
          white-space: nowrap;
        }
        .cw-menu-item:hover { background: #f3f4f6; }
        .cw-menu-item:first-child { border-radius: 10px 10px 0 0; }
        .cw-menu-item:last-child  { border-radius: 0 0 10px 10px; }
      `}</style>

      <div ref={ref} style={menuStyle}>
        <button className="cw-menu-item" onClick={() => { onToggleExpand(); onClose() }}>
          {isExpanded ? <ContractIcon /> : <ExpandIcon />}
          {isExpanded ? 'Contraer ventana' : 'Expandir ventana'}
        </button>
        <div style={dividerStyle} />
        <button className="cw-menu-item" onClick={() => { onDownloadTranscript(); onClose() }}>
          <TranscriptIcon />
          Descargar transcripción
        </button>
      </div>
    </>
  )
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ContractIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TranscriptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const menuStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
  zIndex: 10,
  minWidth: 210,
  overflow: 'hidden',
}
const dividerStyle = {
  height: 1,
  background: '#f3f4f6',
  margin: '0 10px',
}
