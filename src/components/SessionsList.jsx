import { BotmakerLogo } from './BotmakerLogo'
import { BrandAvatar } from './BrandAvatar'

export function SessionsList({ sessions, botName, botAvatar, onSelectSession, onNewChat, onClose, isExpanded, onToggleExpand, typingSessionId, onTabChange }) {
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Chats</span>
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 2 }}>
          <button style={headerBtnStyle} onClick={onToggleExpand} aria-label={isExpanded ? 'Contraer' : 'Expandir'}>
            {isExpanded ? <ContractIcon /> : <ExpandIcon />}
          </button>
          <button style={headerBtnStyle} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Lista de sesiones */}
      <div style={listStyle}>
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          sessions.map(session => (
            <SessionRow
              key={session.id}
              session={session}
              botName={botName}
              botAvatar={botAvatar}
              onClick={() => onSelectSession(session.id)}
              isTyping={typingSessionId === session.id}
            />
          ))
        )}
      </div>

      {/* CTA + Tab bar */}
      <div style={footerStyle}>
        <button className="cw-cta-btn" style={ctaBtnStyle} onClick={onNewChat}>
          Hacer una pregunta
          <QuestionIcon />
        </button>
        <TabBar activeTab="messages" onTabChange={onTabChange} />
      </div>
    </div>
  )
}

function SessionRow({ session, botName, botAvatar, onClick, isTyping }) {
  const lastMsg  = session.messages.filter(m => m.text).at(-1)
  const preview  = lastMsg?.text ?? '...'
  const agent    = session.agent
  const name     = agent ? agent.name : botName
  const unread   = !!session.unread
  const typingLabel = agent ? `${agent.name} está escribiendo` : 'Escribiendo'

  return (
    <>
      <style>{`
        .cw-session-row {
          background: #ffffff;
          transition: background 150ms ease;
        }
        .cw-session-row:hover { background: #f5f5f5; }
        .cw-session-row:hover .cw-session-arrow { opacity: 1; transform: translateX(0); }
        .cw-session-arrow {
          opacity: 0; transform: translateX(-4px);
          transition: opacity 150ms ease, transform 150ms ease;
          color: #9ca3af; flex-shrink: 0;
        }
        .cw-session-row:active { background: #eeeeee; }
        .cw-cta-btn:hover { border-color: var(--cw-primary) !important; background: #f0f5ff !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
        .cw-cta-btn:active { background: #e0ecff !important; }
        .cw-tab-item { transition: color 120ms ease; }
        .cw-tab-item:hover { color: #374151 !important; }
        .cw-tab-item.active:hover { color: var(--cw-primary-dark) !important; }
      `}</style>
      <button className="cw-session-row" style={rowStyle} onClick={onClick}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <BrandAvatar
            size={42}
            agentAvatar={agent ? (agent.avatar ?? null) : null}
            agentName={agent ? (agent.name ?? null) : null}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="cw-session-name" style={{ fontWeight: 600, fontSize: 14, color: '#111827', transition: 'color 150ms' }}>
                {name}
              </span>
              {agent && <span style={agentBadgeStyle}>Agente</span>}
            </div>
            <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>{session.timestamp}</span>
          </div>
          {isTyping ? (
            <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TypingDots />
              {typingLabel}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: unread ? '#374151' : '#6b7280', fontWeight: unread ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {preview}
            </div>
          )}
        </div>
        {unread
          ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cw-primary)', flexShrink: 0 }} />
          : <span className="cw-session-arrow"><ChevronIcon /></span>
        }
      </button>
    </>
  )
}

function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { key: 'home',     label: 'Inicio',   icon: <HomeIcon /> },
    { key: 'messages', label: 'Chats', icon: <MessagesIcon /> },
    { key: 'help',     label: 'Ayuda',    icon: <HelpIcon /> },
    { key: 'agents',   label: 'Mis Agentes', icon: <AgentsIcon /> },
  ]
  return (
    <div style={tabBarStyle}>
      {tabs.map(t => (
        <button key={t.key} className={`cw-tab-item${activeTab === t.key ? ' active' : ''}`} style={tabItemStyle(activeTab === t.key)} onClick={() => onTabChange(t.key)}>
          {t.icon}
          <span style={{ fontSize: 10, marginTop: 3, fontWeight: activeTab === t.key ? 600 : 400 }}>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyIconWrapStyle}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={emptyTitleStyle}>No hay mensajes</p>
      <p style={emptySubtitleStyle}>Los mensajes del equipo se mostrarán aquí</p>
    </div>
  )
}

// Icons
function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function TypingDots() {
  return (
    <>
      <style>{`
        @keyframes cw-dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        .cw-list-dot { animation: cw-dot-pulse 1.2s ease-in-out infinite; display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: #9ca3af; }
        .cw-list-dot:nth-child(2) { animation-delay: 0.16s; }
        .cw-list-dot:nth-child(3) { animation-delay: 0.32s; }
      `}</style>
      <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <span className="cw-list-dot" />
        <span className="cw-list-dot" />
        <span className="cw-list-dot" />
      </span>
    </>
  )
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ContractIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MessagesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
function AgentsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: '#fff',
}
const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 16px',
  borderBottom: '1px solid #f3f4f6',
  position: 'relative',
  flexShrink: 0,
}
const headerBtnStyle = {
  width: 30, height: 30, borderRadius: '50%',
  border: 'none', background: 'transparent',
  color: '#6b7280', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 120ms, color 120ms',
}

const closeBtnStyle = {
  position: 'absolute',
  right: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 30,
  height: 30,
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: '#6b7280',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
const listStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '6px 0',
  scrollbarWidth: 'thin',
  scrollbarColor: '#e5e7eb transparent',
}
const rowStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
}
const agentBadgeStyle = {
  fontSize: 10,
  fontWeight: 600,
  color: '#22c55e',
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: 10,
  padding: '1px 6px',
}

const rowAvatarStyle = {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: '#fff',
  border: '1.5px solid #e5e7eb',
  flexShrink: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '0 32px',
  textAlign: 'center',
}
const emptyIconWrapStyle = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
}
const emptyTitleStyle = {
  margin: '0 0 8px',
  fontSize: 15,
  fontWeight: 600,
  color: '#111827',
}
const emptySubtitleStyle = {
  margin: 0,
  fontSize: 13,
  color: '#9ca3af',
  lineHeight: 1.5,
}
const footerStyle = {
  borderTop: '1px solid #f3f4f6',
  flexShrink: 0,
  padding: '12px 0 0',
}
const ctaBtnStyle = {
  width: 'calc(100% - 32px)',
  margin: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '11px 16px',
  borderRadius: 24,
  border: '1.5px solid #e5e7eb',
  background: '#fff',
  color: '#111827',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  transition: 'border-color 150ms, background 150ms, box-shadow 150ms',
  marginBottom: 8,
}
const tabBarStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  padding: '8px 0 12px',
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
