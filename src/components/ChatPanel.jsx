import { useState } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { VoiceChat } from './VoiceChat'
import { BotmakerLogo } from './BotmakerLogo'
import { HumanAvatar } from './HumanAvatar'
import { BrandAvatar } from './BrandAvatar'

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

export function ChatPanel({ config, messages, isTyping, typingMode, typingStates, onSend, onQuickReply, onEscalate, onLeaveMessage, onClose, agentSession, isExpanded, onToggleExpand, onAddVoiceMessage, onStreamVoiceBot, onTabChange, sessions = [], onSelectSession, isMobile = false, historyOpen = false, onToggleHistory, isClosed = false }) {
  const [voiceMode, setVoiceMode] = useState(false)
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
          />
        </div>
      ) : (
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
        />
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

function PanelHeader({ config, agentSession, isExpanded, onToggleExpand, onClose, historyOpen, onToggleHistory, isMobile = false, isClosed = false, isTransferring = false }) {
  const isAgent = !!agentSession

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* history toggle */}
        <button className={`cw-header-btn${historyOpen ? ' active' : ''}`} aria-label="Historial" onClick={onToggleHistory}>
          <HistoryIcon />
        </button>

        {/* LEFT: brand avatar + name + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <BrandAvatar size={38} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {config.botName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {!isClosed && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isTransferring ? '#f59e0b' : '#22c55e' }} />
              )}
              <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isClosed
                  ? 'Sesión cerrada'
                  : isTransferring
                    ? 'Conectando con un agente...'
                    : isAgent
                      ? 'Centro de atención · < 3 mins'
                      : (config.botSubtitle ?? 'Centro de atención')}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: attended-by pill */}
        {!isClosed && <AttendedByPill isAgent={isAgent} agentSession={agentSession} isTransferring={isTransferring} />}

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

function AttendedByPill({ isAgent, agentSession, isTransferring }) {
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
      <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--cw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.95)"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
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
