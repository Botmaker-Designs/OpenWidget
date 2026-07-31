import { useState } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { VoiceChat } from './VoiceChat'
import { BotmakerLogo } from './BotmakerLogo'
import { HumanAvatar } from './HumanAvatar'
import { BrandAvatar } from './BrandAvatar'
import { NotificationPrompt } from './NotificationPrompt'

const TAB_ITEMS = [
  { key: 'home',     label: 'Inicio',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'messages', label: 'Chats',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'help',     label: 'Ayuda',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: 'agents',   label: 'Mis Agentes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

const WA_BG_MOBILE = {
  backgroundColor: '#f0ece4',
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url(/chat-bg.jpg)',
  backgroundSize: '380px',
  backgroundRepeat: 'repeat',
}

export function ChatPanel({ config, messages, isTyping, typingMode, typingStates, onSend, onQuickReply, onEscalate, onLeaveMessage, onClose, agentSession, isExpanded, onToggleExpand, onAddVoiceMessage, onStreamVoiceBot, onSendGif, onSendFile, onSendLocation, onSendContact, onReact, onTabChange, sessions = [], onSelectSession, isMobile = false, historyOpen = false, onToggleHistory, isClosed = false }) {
  const [voiceMode, setVoiceMode] = useState(false)
  const [showAppStrip, setShowAppStrip] = useState(true)
  const [replyDraft, setReplyDraft] = useState(null)
  const isTransferring = !agentSession && !isClosed && messages.some(m => m.type === 'transferring')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .cw-header-btn {
          width: 32px; height: 32px;
          border-radius: 50%; border: none;
          background: transparent; color: #6b7280;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: background 120ms, color 120ms; flex-shrink: 0;
        }
        .cw-header-btn:hover  { background: #f3f4f6; color: #111827; }
        .cw-header-btn.active { background: #e5e7eb; color: #111827; }
        .cw-tab-item { transition: color 120ms ease; }
        .cw-tab-item:hover { color: #374151 !important; }
        .cw-tab-item.active:hover { color: var(--cw-primary-dark) !important; }
        .cw-history-row:hover { background: #f9fafb !important; }
        .cw-history-row:active { background: #f3f4f6 !important; }
        @keyframes cw-spin { to { transform: rotate(360deg); } }
        .cw-spin { animation: cw-spin 0.9s linear infinite; }
      `}</style>

      {isMobile && showAppStrip && (
        <AppDownloadStrip onDismiss={() => setShowAppStrip(false)} />
      )}

      <PanelHeader
        config={config}
        agentSession={agentSession}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onClose={onClose}
        historyOpen={historyOpen}
        onToggleHistory={onToggleHistory}
        isMobile={isMobile}
        isClosed={isClosed}
        isTransferring={isTransferring}
      />

      {isMobile ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...WA_BG_MOBILE }}>
          <MessageList
            messages={messages}
            isTyping={isTyping}
            typingMode={typingMode}
            typingStates={typingStates}
            quickReplies={config.quickReplies}
            onQuickReply={onQuickReply}
            onEscalate={onEscalate}
            onLeaveMessage={onLeaveMessage}
            fallbackText={config.fallbackMessage}
            agentName={agentSession?.name}
            onReply={setReplyDraft}
            onReact={onReact}
          />
          {!isClosed && <NotificationPrompt messages={messages} />}
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isTyping={isTyping}
            typingMode={typingMode}
            typingStates={typingStates}
            quickReplies={config.quickReplies}
            onQuickReply={onQuickReply}
            onEscalate={onEscalate}
            onLeaveMessage={onLeaveMessage}
            fallbackText={config.fallbackMessage}
            agentName={agentSession?.name}
            onReply={setReplyDraft}
            onReact={onReact}
          />
          {!isClosed && <NotificationPrompt messages={messages} />}
        </>
      )}

      {isClosed ? (
        <div style={closedBannerStyle}>
          <LockIcon />
          <span>Esta conversación está cerrada</span>
        </div>
      ) : voiceMode ? (
        <VoiceChat
          onAddMessage={onAddVoiceMessage}
          onStreamBot={onStreamVoiceBot}
          onClose={() => setVoiceMode(false)}
        />
      ) : (
        <ChatInput
          onSend={onSend}
          disabled={isTyping}
          onVoice={() => setVoiceMode(true)}
          onSendGif={onSendGif}
          onSendFile={onSendFile}
          onSendLocation={onSendLocation}
          onSendContact={onSendContact}
          replyTo={replyDraft}
          onCancelReply={() => setReplyDraft(null)}
          isMobile={isMobile}
          wrapStyle={isMobile ? { ...WA_BG_MOBILE, flexShrink: 0, minHeight: 'unset' } : undefined}
        />
      )}

      <div style={{ ...tabBarStyle, ...(isMobile && { paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }) }}>
        {TAB_ITEMS.map(t => (
          <button
            key={t.key}
            className={`cw-tab-item${t.key === 'messages' ? ' active' : ''}`}
            style={tabItemStyle(t.key === 'messages')}
            onClick={() => onTabChange?.(t.key)}
          >
            {t.icon}
            <span style={{ fontSize: 10, marginTop: 3, fontWeight: t.key === 'messages' ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}

function HistoryRow({ session, onSelect }) {
  const lastMsg = session.messages.filter(m => m.text).at(-1)
  const preview = lastMsg?.text ?? '...'
  const name    = session.agent?.name ?? 'Botsy AI'
  const avatar  = session.agent?.avatar ?? null
  const date    = session.startedAt
    ? new Date(session.startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : session.timestamp

  return (
    <button className="cw-history-row" style={historyRowStyle} onClick={onSelect}>
      <div style={historyAvatarStyle}>
        {avatar
          ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : <BotmakerLogo size={18} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</span>
          <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{date}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</p>
      </div>
    </button>
  )
}

function AppDownloadStrip({ onDismiss }) {
  return (
    <div style={appStripStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <AppleGlyph />
          <PlayGlyph />
        </span>
        <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--cw-font-family)' }}>
          Seguí este chat desde la app
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          style={appStripLinkStyle}
        >
          Abrir app
        </a>
        <button className="cw-header-btn" aria-label="Cerrar aviso" onClick={onDismiss} style={{ width: 22, height: 22 }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function AppleGlyph() {
  return (
    <svg width="12" height="14" viewBox="0 0 20 24" fill="none">
      <path d="M16.462 12.748c-.028-3.22 2.634-4.773 2.754-4.847-1.503-2.195-3.836-2.494-4.662-2.524-1.977-.2-3.872 1.17-4.875 1.17-1.003 0-2.544-1.143-4.189-1.113-2.148.033-4.14 1.254-5.244 3.17C-1.93 12.57.532 18.39 2.9 21.56c1.176 1.683 2.573 3.57 4.404 3.503 1.78-.072 2.447-1.142 4.593-1.142 2.147 0 2.764 1.142 4.642 1.107 1.907-.033 3.114-1.703 4.273-3.398 1.369-1.942 1.921-3.854 1.946-3.953-.043-.017-3.715-1.427-3.75-5.67l-.546.74z" fill="#64748b"/>
      <path d="M13.178 3.967C14.13 2.81 14.78 1.22 14.597 0c-1.533.063-3.42 1.026-4.406 2.154-.956 1.097-1.8 2.882-1.575 4.553 1.716.132 3.48-.876 4.562-2.74z" fill="#64748b"/>
    </svg>
  )
}

function PlayGlyph() {
  return (
    <svg width="12" height="13" viewBox="0 0 20 22" fill="none">
      <path d="M1.215.366C.898.7.71 1.21.71 1.87v18.26c0 .66.188 1.17.505 1.504l.08.077 10.23-10.23v-.24L1.295.289l-.08.077z" fill="url(#cw-gp1)"/>
      <path d="M14.94 14.82l-3.41-3.41v-.24l3.41-3.41.077.044 4.04 2.295c1.154.655 1.154 1.727 0 2.382l-4.04 2.295-.077.044z" fill="url(#cw-gp2)"/>
      <path d="M15.017 14.776L11.53 11.29.71 22.11c.38.402.998.452 1.698.05l12.609-7.384z" fill="url(#cw-gp3)"/>
      <path d="M15.017 7.804L2.408.42C1.708.018 1.09.068.71.47l10.82 10.82 3.487-3.487z" fill="url(#cw-gp4)"/>
      <defs>
        <linearGradient id="cw-gp1" x1="10.83" y1="1.57" x2="-3.9" y2="16.3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A0FF"/><stop offset="1" stopColor="#00AEFF"/>
        </linearGradient>
        <linearGradient id="cw-gp2" x1="20.3" y1="11.29" x2="10.26" y2="11.29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD800"/><stop offset="1" stopColor="#FF8A00"/>
        </linearGradient>
        <linearGradient id="cw-gp3" x1="12.86" y1="13.59" x2="-1.34" y2="27.79" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/>
        </linearGradient>
        <linearGradient id="cw-gp4" x1="-1.69" y1="-2.54" x2="5.41" y2="4.56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#32A071"/><stop offset="1" stopColor="#2DA771"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function PanelHeader({ config, agentSession, isExpanded, onToggleExpand, onClose, historyOpen, onToggleHistory, isMobile = false, isClosed = false, isTransferring = false }) {
  const isAgent = !!agentSession

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* history toggle */}
        <button className={`cw-header-btn${historyOpen ? ' active' : ''}`} aria-label="Historial" onClick={onToggleHistory}>
          <HistoryIcon />
        </button>

        {/* LEFT: brand avatar + name + attended-by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <BrandAvatar size={38} logoUrl={config.clientLogo ?? null} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(config.botName ?? '').replace(/^Asistente\s+/i, '') || config.botName}
              </span>
              <img src="/verified.png" alt="Verificado" style={{ width: 14, height: 14, flexShrink: 0 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              {!isClosed && !isTransferring && isAgent && agentSession.avatar
                ? <img src={agentSession.avatar} alt={agentSession.name} style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #e5e7eb' }} />
                : !isClosed && !isTransferring && !isAgent
                  ? <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#7c3aed"/>
                      </svg>
                    </span>
                  : <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isClosed ? '#d1d5db' : '#f59e0b', marginLeft: 1 }} />
              }
              <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isClosed
                  ? 'Sesión cerrada'
                  : isTransferring
                    ? 'Conectando con un agente...'
                    : isAgent
                      ? `Atendido por ${agentSession.name}`
                      : 'Atendido por Asistente IA'}
              </span>
            </div>
          </div>
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {!isMobile && (
            <button className="cw-header-btn" aria-label={isExpanded ? 'Contraer' : 'Expandir'} onClick={onToggleExpand}>
              {isExpanded ? <ContractIcon /> : <ExpandIcon />}
            </button>
          )}
          <button className="cw-header-btn" aria-label="Cerrar" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function AttendedByPill({ isAgent, agentSession, isTransferring, clientLogo = null }) {
  if (isAgent && agentSession) {
    const av  = agentSession.avatar || null
    const nm  = agentSession.name   || ''
    const ini = nm.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 10px 5px 5px', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: av ? '#e5e7eb' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {av
            ? <img src={av} alt={nm} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{ini}</span>
          }
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#15803d', fontWeight: 500, lineHeight: 1.1 }}>Atendido por</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', lineHeight: 1.2 }}>{nm}</div>
        </div>
      </div>
    )
  }
  if (isTransferring) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '5px 10px 5px 5px', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="cw-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#92400e', fontWeight: 500, lineHeight: 1.1 }}>Buscando</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', lineHeight: 1.2 }}>agente</div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '5px 10px 5px 5px', flexShrink: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {clientLogo
          ? <img src={clientLogo} alt="" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
          : <BotmakerLogo size={14} />}
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 500, lineHeight: 1.1 }}>Asistente</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', lineHeight: 1.2 }}>IA</div>
      </div>
    </div>
  )
}

function OnlineBadge() {
  return (
    <span style={{
      position: 'absolute', bottom: 0, right: 0,
      width: 11, height: 11, borderRadius: '50%',
      background: '#22c55e', border: '2px solid #fff',
    }} />
  )
}

function Avatar({ src, name, isAgent }) {
  if (src) return <img src={src} alt={name} style={{ ...avatarStyle, objectFit: 'cover' }} />
  if (isAgent) {
    return (
      <div style={{ ...avatarStyle, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
        <HumanAvatar name={name} size={40} />
      </div>
    )
  }
  return (
    <div style={{ ...avatarStyle, background: '#fff', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <BotmakerLogo size={26} />
    </div>
  )
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ContractIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="12 7 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const appStripStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 14px',
  background: '#f8fafc',
  borderBottom: '1px solid #f1f5f9',
  flexShrink: 0,
}
const appStripLinkStyle = {
  fontSize: 11.5,
  fontWeight: 700,
  color: 'var(--cw-primary)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--cw-font-family)',
}
const headerStyle = {
  background: '#ffffff',
  borderBottom: '1px solid #f3f4f6',
  padding: '12px 14px',
  flexShrink: 0,
}
const avatarStyle = {
  width: 40, height: 40,
  borderRadius: '50%',
  objectFit: 'cover', flexShrink: 0,
}
const tabBarStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  padding: '8px 0 12px',
  borderTop: '1px solid #f3f4f6',
  flexShrink: 0,
}
const tabItemStyle = (active) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  border: 'none',
  background: 'transparent',
  color: active ? 'var(--cw-primary)' : '#9ca3af',
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  padding: '4px 12px',
})
const historyRowStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  width: '100%', padding: '12px 16px',
  border: 'none', background: 'transparent',
  cursor: 'pointer', textAlign: 'left',
  borderBottom: '1px solid #f9fafb',
  fontFamily: 'var(--cw-font-family)',
}
const historyAvatarStyle = {
  width: 36, height: 36, borderRadius: '50%',
  background: '#f3f4f6', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden',
}
const closedBannerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 8, padding: '14px 16px',
  borderTop: '1px solid #f3f4f6',
  background: '#fafafa',
  color: '#9ca3af', fontSize: 13,
  fontFamily: 'var(--cw-font-family)',
  flexShrink: 0,
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
