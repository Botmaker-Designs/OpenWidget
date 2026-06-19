import { useState, useEffect, useRef } from 'react'
import { BotmakerLogo } from './BotmakerLogo'

const styles = {
  wrap: (position) => ({
    position: 'fixed',
    bottom: 24,
    ...(position === 'bottom-left' ? { left: 24 } : { right: 24 }),
    width: 'var(--cw-button-size)',
    height: 'var(--cw-button-size)',
    zIndex: 'var(--cw-z-index)',
  }),
  button: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, var(--cw-primary) 0%, var(--cw-primary-dark) 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(0,0,0,0.14), 0 8px 32px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.22)',
    transition: 'transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms cubic-bezier(0.34,1.56,0.64,1)',
    animation: 'cw-pop-in 280ms cubic-bezier(0.34,1.56,0.64,1) forwards',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.32) 0%, transparent 62%)',
    pointerEvents: 'none',
  },
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

export function FloatingButton({ isOpen, unreadCount = 0, position = 'bottom-right', onClick, notification, onDismissNotification }) {
  const [mounted, setMounted]     = useState(false)
  const [visible, setVisible]     = useState(false)
  const [notifData, setNotifData] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!notification) {
      setVisible(false)
      return
    }
    setNotifData(notification)
    // pequeño delay para que el CSS transition arranque desde 0
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismissNotification?.(), 300)
    }, 5500)

    return () => clearTimeout(timerRef.current)
  }, [notification])

  if (!mounted) return null

  const isRight = position !== 'bottom-left'

  return (
    <>
      <style>{`
        @keyframes cw-pop-in {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cw-fab-pulse {
          0%   { transform: scale(1);    opacity: 0.55; }
          100% { transform: scale(1.75); opacity: 0; }
        }
        .cw-fab-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: var(--cw-primary);
          animation: cw-fab-pulse 2.4s cubic-bezier(0.2,0,0.6,1) infinite;
          pointer-events: none;
        }
        .cw-fab:hover        { transform: scale(1.1)  !important; box-shadow: 0 6px 20px rgba(0,0,0,0.16), 0 12px 40px rgba(37,99,235,0.38), inset 0 1px 0 rgba(255,255,255,0.28) !important; }
        .cw-fab:active       { transform: scale(0.94) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.22) !important; }
        .cw-notif {
          position: fixed;
          bottom: 92px;
          ${isRight ? 'right: 16px;' : 'left: 16px;'}
          max-width: 280px;
          background: #ffffff;
          color: #111827;
          border-radius: 16px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
          cursor: pointer;
          z-index: var(--cw-z-index);
          opacity: 0;
          transform: translateY(8px) scale(0.96);
          transition: opacity 250ms ease, transform 250ms ease;
          pointer-events: none;
        }
        .cw-notif.cw-notif--visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }
        .cw-notif-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #f3f4f6; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .cw-notif-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .cw-notif-body { flex: 1; min-width: 0; }
        .cw-notif-text {
          font-size: 13px; font-weight: 500; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          color: #111827;
        }
        .cw-notif-meta {
          font-size: 11px; color: #9ca3af; margin-top: 2px;
        }
      `}</style>

      {/* Notification bubble */}
      {notifData && (
        <div
          className={`cw-notif${visible ? ' cw-notif--visible' : ''}`}
          onClick={() => { onDismissNotification?.(); onClick?.() }}
        >
          <div className="cw-notif-avatar">
            {notifData.avatar
              ? <img src={notifData.avatar} alt={notifData.senderName} />
              : <BotmakerLogo size={22} />
            }
          </div>
          <div className="cw-notif-body">
            <div className="cw-notif-text">{notifData.text}</div>
            <div className="cw-notif-meta">{notifData.senderName} · Ahora</div>
          </div>
        </div>
      )}

      <div style={styles.wrap(position)}>
        {!isOpen && <span className="cw-fab-ring" />}
        <button
          className="cw-fab"
          style={styles.button}
          onClick={onClick}
          aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
        >
          <span style={styles.shine} />
          {isOpen ? <CloseIcon /> : <BotmakerLogo size={26} white />}
          {!isOpen && unreadCount > 0 && (
            <span style={styles.badge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  )
}

