import { useState } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { VoiceChat } from './VoiceChat'
import { BotmakerLogo } from './BotmakerLogo'
import { HumanAvatar } from './HumanAvatar'

const TAB_ITEMS = [
  { key: 'home',     label: 'Inicio',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'messages', label: 'Chats',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'help',     label: 'Ayuda',        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: 'agents',   label: 'Mis Agentes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export function ChatPanel({ config, messages, isTyping, typingMode, typingStates, onSend, onQuickReply, onEscalate, onLeaveMessage, onClose, agentSession, isExpanded, onToggleExpand, onAddVoiceMessage, onStreamVoiceBot, onTabChange, sessions = [], onSelectSession }) {
  const [voiceMode, setVoiceMode] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

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
      `}</style>

      <PanelHeader
        config={config}
        agentSession={agentSession}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onClose={onClose}
        onOpenHistory={() => setHistoryOpen(true)}
      />
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

      {voiceMode ? (
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
        />
      )}

      <div style={tabBarStyle}>
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

      {/* History drawer */}
      <div style={drawerOverlayStyle(historyOpen)} onClick={() => setHistoryOpen(false)} />
      <div style={drawerStyle(historyOpen)}>
        <div style={drawerHeaderStyle}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Historial</span>
          <button className="cw-header-btn" onClick={() => setHistoryOpen(false)} aria-label="Cerrar historial">
            <CloseIcon />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 32 }}>Sin conversaciones anteriores</p>
          ) : (
            sessions.map(s => (
              <HistoryRow
                key={s.id}
                session={s}
                onSelect={() => { setHistoryOpen(false); onSelectSession?.(s.id) }}
              />
            ))
          )}
        </div>
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

function PanelHeader({ config, agentSession, isExpanded, onToggleExpand, onClose, onOpenHistory }) {
  const isAgent  = !!agentSession
  const name     = isAgent ? agentSession.name   : config.botName
  const avatar   = isAgent ? agentSession.avatar : config.botAvatar
  const subtitle = isAgent ? null : (config.botSubtitle ?? 'El equipo también puede ayudar')

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="cw-header-btn" aria-label="Historial" onClick={onOpenHistory}>
          <HistoryIcon />
        </button>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={avatar} name={name} isAgent={isAgent} />
          {isAgent && <OnlineBadge />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.2 }}>{name}</div>
          {subtitle && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </div>
          )}
          {isAgent && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontWeight: 400 }}>Tiempo aprox de respuesta &lt; 3 mins</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button className="cw-header-btn" aria-label={isExpanded ? 'Contraer' : 'Expandir'} onClick={onToggleExpand}>
            {isExpanded ? <ContractIcon /> : <ExpandIcon />}
          </button>
          <button className="cw-header-btn" aria-label="Cerrar" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
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
const drawerOverlayStyle = (open) => ({
  position: 'absolute', inset: 0,
  background: 'rgba(0,0,0,0.18)',
  zIndex: 10,
  opacity: open ? 1 : 0,
  pointerEvents: open ? 'auto' : 'none',
  transition: 'opacity 260ms ease',
})
const drawerStyle = (open) => ({
  position: 'absolute', top: 0, left: 0,
  width: '85%', height: '100%',
  background: '#fff',
  borderRight: '1px solid #e5e7eb',
  zIndex: 11,
  display: 'flex', flexDirection: 'column',
  transform: open ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
})
const drawerHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 14px 12px',
  borderBottom: '1px solid #f3f4f6',
  flexShrink: 0,
}
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
