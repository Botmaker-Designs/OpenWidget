import { useState } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { VoiceChat } from './VoiceChat'
import { BotmakerLogo } from './BotmakerLogo'
import { HumanAvatar } from './HumanAvatar'

export function ChatPanel({ config, messages, isTyping, typingMode, typingStates, onSend, onQuickReply, onEscalate, onLeaveMessage, onClose, onBack, agentSession, isExpanded, onToggleExpand, onAddVoiceMessage, onStreamVoiceBot }) {
  const [voiceMode, setVoiceMode] = useState(false)

  return (
    <>
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
      `}</style>

      <PanelHeader
        config={config}
        agentSession={agentSession}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onClose={onClose}
        onBack={onBack}
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
    </>
  )
}

function PanelHeader({ config, agentSession, isExpanded, onToggleExpand, onClose, onBack }) {
  const isAgent  = !!agentSession
  const name     = isAgent ? agentSession.name   : config.botName
  const avatar   = isAgent ? agentSession.avatar : config.botAvatar
  const subtitle = isAgent ? null : (config.botSubtitle ?? 'El equipo también puede ayudar')

  return (
    <div style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onBack && (
          <button className="cw-header-btn" aria-label="Volver" onClick={onBack}>
            <BackIcon />
          </button>
        )}

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
          {isAgent && <div style={{ fontSize: 12, color: '#22c55e', marginTop: 2, fontWeight: 500 }}>Online</div>}
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
function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
