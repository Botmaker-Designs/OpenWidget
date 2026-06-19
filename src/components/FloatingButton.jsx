import { useState, useEffect } from 'react'

const styles = {
  button: (position) => ({
    position: 'fixed',
    bottom: 24,
    ...(position === 'bottom-left' ? { left: 24 } : { right: 24 }),
    width: 'var(--cw-button-size)',
    height: 'var(--cw-button-size)',
    borderRadius: '50%',
    background: 'var(--cw-primary)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    zIndex: 'var(--cw-z-index)',
    transition: 'transform 120ms ease, background 120ms ease',
    animation: 'cw-pop-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  }),
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 4,
    border: '2px solid #fff',
    pointerEvents: 'none',
  },
}

// Ícono de chat
function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Ícono X para cerrar
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function FloatingButton({ isOpen, unreadCount = 0, position = 'bottom-right', onClick }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <>
      <style>{`
        @keyframes cw-pop-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        .cw-fab:hover  { transform: scale(1.08) !important; background: var(--cw-primary-dark) !important; }
        .cw-fab:active { transform: scale(0.96) !important; }
      `}</style>

      <button
        className="cw-fab"
        style={styles.button(position)}
        onClick={onClick}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
        {!isOpen && unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}
