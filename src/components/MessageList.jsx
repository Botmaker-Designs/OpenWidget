import { useEffect, useRef, useState } from 'react'
import { TypingIndicator } from './TypingIndicator'
import { QuickReplies } from './QuickReplies'
import { FallbackMessage } from './FallbackMessage'
import { TransferringMessage, AgentJoinMessage } from './SystemMessage'

function msgTime(date) {
  if (!date) return 'Ahora'
  const diff = (new Date() - new Date(date)) / 1000
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

export function MessageList({ messages, isTyping, typingMode, quickReplies, onQuickReply, onEscalate, onLeaveMessage, fallbackText, agentName }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const showQuickReplies = quickReplies?.length > 0 && !messages.some(m => m.role === 'user')

  return (
    <div style={listStyle}>
      {messages.map((msg, i) => (
        <Message
          key={msg.id}
          message={msg}
          quickReplies={showQuickReplies && i === messages.length - 1 ? quickReplies : null}
          onQuickReply={onQuickReply}
          onEscalate={onEscalate}
          onLeaveMessage={onLeaveMessage}
          fallbackText={fallbackText}
        />
      ))}

      {isTyping && (
        <div style={botBubbleWrap}>
          <TypingIndicator mode={typingMode} agentName={agentName} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function Message({ message, quickReplies, onQuickReply, onEscalate, onLeaveMessage, fallbackText }) {
  const senderName = message.senderName
  const senderType = message.senderType
  if (message.type === 'transferring') return <TransferringMessage />

  if (message.type === 'agent_join') {
    return <AgentJoinMessage agentName={message.agentName} agentAvatar={message.agentAvatar} timestamp={message.timestamp} />
  }

  if (message.type === 'fallback') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <FallbackMessage text={fallbackText} onEscalate={onEscalate} onLeaveMessage={onLeaveMessage} acted={message.acted} />
        {senderName && <BubbleLabel name={senderName} type={senderType} date={message.createdAt} />}
      </div>
    )
  }

  const isUser = message.role === 'user'

  return (
    <div>
      <div style={bubbleWrap(message.role)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4, maxWidth: '78%' }}>
          {message.attachments?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              {message.attachments.map((a, i) => <AttachmentImage key={i} src={a.url} />)}
            </div>
          )}
          {message.text && (
            <div style={bubbleStyle(isUser)}>
              {message.text}
              {message.type === 'streaming' && <StreamingCursor />}
            </div>
          )}
          {!isUser && message.text && senderName && <BubbleLabel name={senderName} type={senderType} date={message.createdAt} />}
        </div>
      </div>
      {quickReplies && (
        <QuickReplies options={quickReplies} onSelect={onQuickReply} />
      )}
    </div>
  )
}

function AttachmentImage({ src }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ position: 'relative', width: 110, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
          backgroundSize: '200% 100%',
          animation: 'cw-skeleton 1.2s ease-in-out infinite',
        }} />
      )}
      <img
        src={src}
        alt="adjunto"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          borderRadius: 10,
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
      />
    </div>
  )
}

function BubbleLabel({ name, type, date }) {
  return (
    <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', paddingLeft: 2 }}>
      {name} · {type} · {msgTime(date)}
    </div>
  )
}

function StreamingCursor() {
  return (
    <>
      <style>{`
        @keyframes cw-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .cw-cursor { animation: cw-blink 0.8s step-end infinite; }
      `}</style>
      <span className="cw-cursor" style={{ marginLeft: 1, fontWeight: 300, color: 'inherit' }}>▍</span>
    </>
  )
}

const listStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 14px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--cw-border) transparent',
}

const botBubbleWrap = { display: 'flex', justifyContent: 'flex-start' }

const bubbleWrap = (role) => ({
  display: 'flex',
  justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
})

const bubbleStyle = (isUser) => ({
  padding: '9px 13px',
  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  background: isUser ? 'var(--cw-primary)' : 'var(--cw-bg-message-bot)',
  color: isUser ? 'var(--cw-text-message-user)' : 'var(--cw-text)',
  fontSize: 14,
  lineHeight: 1.5,
  wordBreak: 'break-word',
  width: 'fit-content',
})
