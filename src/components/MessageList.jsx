import { useEffect, useRef, useState } from 'react'
import { TypingIndicator } from './TypingIndicator'
import { QuickReplies } from './QuickReplies'
import { FallbackMessage } from './FallbackMessage'
import { TransferringMessage, AgentJoinMessage } from './SystemMessage'
import { GifTile } from './GifPicker'
function msgTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function dayLabel(date) {
  if (!date) return 'Hoy'
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}

const BUBBLE_ANIM = `
  @keyframes cw-msg-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cw-msg-in { animation: cw-msg-in 0.35s cubic-bezier(0.25, 0.8, 0.4, 1) both; }
  .cw-msg-act-btn {
    width: 22px; height: 22px; border-radius: 50%;
    border: none; background: transparent; color: #b0b6c0;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 120ms, color 120ms; flex-shrink: 0;
  }
  .cw-msg-act-btn:hover { background: #f3f4f6; color: #6b7280; }
`

export function summarizeReply(message) {
  const label = message.role === 'user' ? 'Vos' : (message.senderName || 'Asistente')
  let snippet = ''
  if (message.type === 'gif') snippet = `${message.gif.emoji} GIF · ${message.gif.label}`
  else if (message.type === 'file') snippet = `📄 ${message.file.name}`
  else if (message.type === 'audio') snippet = '🎤 Nota de voz'
  else if (message.attachments?.length > 0) snippet = '📷 Imagen'
  else snippet = message.text || ''
  return { id: message.id, label, snippet: snippet.length > 80 ? snippet.slice(0, 80) + '…' : snippet }
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

function MessageActions({ message, onReply, onReact, isUser }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!pickerOpen) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setPickerOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [pickerOpen])

  if (!onReply && !onReact) return null

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, marginBottom: 4 }}>
      {onReact && (
        <button className="cw-msg-act-btn" title="Reaccionar" onClick={() => setPickerOpen(o => !o)}>
          <ReactIcon />
        </button>
      )}
      {onReply && (
        <button className="cw-msg-act-btn" title="Responder" onClick={() => onReply(message)}>
          <ReplyIcon />
        </button>
      )}
      {pickerOpen && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)',
          [isUser ? 'right' : 'left']: 0,
          display: 'flex', gap: 2, background: '#fff', borderRadius: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)',
          padding: 4, zIndex: 15,
        }}>
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onReact(message.id, emoji); setPickerOpen(false) }}
              style={{ border: 'none', background: message.reaction === emoji ? '#f3f4f6' : 'transparent', borderRadius: '50%', width: 30, height: 30, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ReactionBadge({ reaction, isUser }) {
  if (!reaction) return null
  return (
    <span style={{
      position: 'absolute', bottom: -9, [isUser ? 'left' : 'right']: 6,
      background: '#fff', borderRadius: '50%', width: 20, height: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.18)', zIndex: 2,
    }}>
      {reaction}
    </span>
  )
}

function ReplyQuote({ replyTo, isUser }) {
  if (!replyTo) return null
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 0,
      background: isUser ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.05)',
      borderLeft: `3px solid ${isUser ? 'rgba(255,255,255,0.6)' : 'var(--cw-primary)'}`,
      borderRadius: 6, padding: '4px 8px', marginBottom: 5,
      maxWidth: '100%', overflow: 'hidden',
    }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.9 }}>{replyTo.label}</span>
      <span style={{ fontSize: 12, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.snippet}</span>
    </div>
  )
}

export function MessageList({ messages, isTyping, typingMode, typingStates, quickReplies, onQuickReply, onEscalate, onLeaveMessage, fallbackText, agentName, isMobile = false, onReply, onReact }) {
  const bottomRef = useRef(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const showQuickReplies = quickReplies?.length > 0 && !messages.some(m => m.role === 'user')

  // Pre-compute read status: a user message is "read" if any bot message follows it
  const readSet = new Set()
  let seenBot = false
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === 'bot' || m.role === 'system') seenBot = true
    if (m.role === 'user' && seenBot) readSet.add(m.id)
  }

  // Build render list with date separators
  const items = []
  let lastDay = null
  messages.forEach((msg, i) => {
    const day = msg.createdAt ? dayLabel(msg.createdAt) : null
    if (day && day !== lastDay) {
      items.push({ kind: 'separator', day, key: `sep-${i}` })
      lastDay = day
    }
    items.push({ kind: 'message', msg, i })
  })

  return (
    <div style={listStyle}>
      <style>{BUBBLE_ANIM}</style>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      {items.map(item =>
        item.kind === 'separator'
          ? <DateSeparator key={item.key} label={item.day} />
          : (
            <Message
              key={item.msg.id}
              message={item.msg}
              isRead={readSet.has(item.msg.id)}
              onOpenLightbox={setLightboxSrc}
              isMobile={isMobile}
              quickReplies={showQuickReplies && item.i === messages.length - 1 ? quickReplies : null}
              onQuickReply={onQuickReply}
              onEscalate={onEscalate}
              onLeaveMessage={onLeaveMessage}
              fallbackText={fallbackText}
              onReply={onReply}
              onReact={onReact}
            />
          )
      )}

      {isTyping && (
        <div style={botBubbleWrap}>
          <TypingIndicator mode={typingMode} agentName={agentName} states={typingStates} isMobile={isMobile} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function DateSeparator({ label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
      <span style={{
        fontSize: 12, color: '#6b7280', background: 'rgba(255,255,255,0.82)',
        padding: '3px 10px', borderRadius: 8, fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
  )
}

function FileMessage({ message, isMobile, onOpenLightbox, onReply, onReact }) {
  const isUser = message.role === 'user'
  const time   = msgTime(message.createdAt)
  const fs     = isMobile ? 15 : 13
  const openPreview = () => onOpenLightbox && onOpenLightbox({ type: 'file', name: message.file.name, size: message.file.size })
  return (
    <div className="cw-msg-in" style={bubbleWrap(message.role)}>
      {isUser && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
      <div style={{ maxWidth: '78%' }}>
        <div style={{ position: 'relative', overflow: 'hidden', padding: '8px 12px 5px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isUser ? 'var(--cw-bg-message-user)' : 'var(--cw-bg-message-bot)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
          <ReplyQuote replyTo={message.replyTo} isUser={isUser} />
          {message.text && (
            <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 8, color: isUser ? 'var(--cw-text-message-user)' : 'var(--cw-text)' }}>
              {message.text}
            </div>
          )}
          <div
            onClick={openPreview}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: isUser ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = isUser ? 'rgba(0,0,0,0.11)' : 'rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = isUser ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)'}
          >
            <div style={{ width: isMobile ? 42 : 36, height: isMobile ? 42 : 36, borderRadius: 8, background: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, gap: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 6, fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>PDF</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: fs, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message.file.name}</div>
              <div style={{ fontSize: fs - 2, color: '#6b7280', marginTop: 2 }}>{message.file.size} · PDF</div>
            </div>
            <div style={{ color: '#9ca3af', display: 'flex', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ float: 'right', marginTop: 5, fontSize: isMobile ? 11 : 10, color: isUser ? 'rgba(0,0,0,0.45)' : '#9ca3af', whiteSpace: 'nowrap' }}>{time}</div>
          <ReactionBadge reaction={message.reaction} isUser={isUser} />
        </div>
      </div>
      {!isUser && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
    </div>
  )
}

function GifMessage({ message, isRead, isMobile, onReply, onReact }) {
  const isUser = message.role === 'user'
  const time   = msgTime(message.createdAt)
  return (
    <div className="cw-msg-in" style={bubbleWrap(message.role)}>
      {isUser && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
        {message.replyTo && (
          <div style={{ position: 'absolute', top: 6, left: 6, right: 6, zIndex: 3 }}>
            <ReplyQuote replyTo={message.replyTo} isUser={isUser} />
          </div>
        )}
        <GifTile gif={message.gif} size={isMobile ? 200 : 180} />
        <span style={{
          position: 'absolute', right: 6, bottom: 6,
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 10, color: '#fff', background: 'rgba(0,0,0,0.45)',
          borderRadius: 8, padding: '2px 6px',
        }}>
          {time}
          {isUser && <Ticks read={isRead} streaming={false} />}
        </span>
        <ReactionBadge reaction={message.reaction} isUser={isUser} />
      </div>
      {!isUser && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
    </div>
  )
}

const AUDIO_WAVEFORM = [4,8,14,20,16,24,10,18,22,12,20,16,8,24,14,18,10,22,16,12,20,8,16,22,14,18,10,20,16,8]

function AudioMessage({ message, isRead, isMobile, onReply, onReact }) {
  const isUser = message.role === 'user'
  const time   = msgTime(message.createdAt)
  const dur    = message.duration || 4
  const [playing, setPlaying]   = useState(false)
  const [elapsed, setElapsed]   = useState(0)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setElapsed(s => {
        const next = s + 0.1
        if (next >= dur) { setPlaying(false); return 0 }
        return next
      })
    }, 100)
    return () => clearInterval(t)
  }, [playing, dur])

  const progress  = elapsed / dur
  const fmtDur    = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  const btnSize   = 34
  const iconSize  = 12
  const fontSize  = 11

  return (
    <div style={bubbleWrap(message.role)}>
      {isUser && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: '78%' }}>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          padding: isMobile ? '10px 14px 8px' : '8px 12px 6px',
          borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
          background: isUser ? 'var(--cw-bg-message-user)' : 'var(--cw-bg-message-bot)',
          minWidth: 185,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}>
          <ReplyQuote replyTo={message.replyTo} isUser={isUser} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPlaying(p => !p)}
              style={{ width: btnSize, height: btnSize, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isUser ? 'rgba(255,255,255,0.88)' : 'var(--cw-primary)', color: isUser ? 'var(--cw-primary)' : '#fff' }}
            >
              {playing
                ? <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                : <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 22 }}>
              {AUDIO_WAVEFORM.map((h, i) => {
                const barPct = i / AUDIO_WAVEFORM.length
                const played = barPct < progress
                return (
                  <div key={i} style={{ width: 3, height: Math.max(3, h * 0.7), borderRadius: 2, flexShrink: 0, transition: 'background 60ms', background: isUser ? (played ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.22)') : (played ? 'var(--cw-primary)' : '#d1d5db') }} />
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
            <span style={{ fontSize, color: isUser ? 'rgba(0,0,0,0.6)' : '#6b7280', fontVariantNumeric: 'tabular-nums' }}>
              {fmtDur(playing ? elapsed : dur)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize, color: isUser ? 'rgba(0,0,0,0.5)' : '#9ca3af', whiteSpace: 'nowrap' }}>
              {time}
              {isUser && <Ticks read={isRead} streaming={false} />}
            </span>
          </div>
          <ReactionBadge reaction={message.reaction} isUser={isUser} />
        </div>
      </div>
      {!isUser && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
    </div>
  )
}

function Message({ message, isRead, onOpenLightbox, quickReplies, onQuickReply, onEscalate, onLeaveMessage, fallbackText, isMobile = false, onReply, onReact }) {
  const senderName = message.senderName
  const senderType = message.senderType
  if (message.type === 'transferring') return <TransferringMessage isMobile={isMobile} />

  if (message.type === 'audio') return <AudioMessage message={message} isRead={isRead} isMobile={isMobile} onReply={onReply} onReact={onReact} />
  if (message.type === 'file')  return <FileMessage  message={message} isMobile={isMobile} onOpenLightbox={onOpenLightbox} onReply={onReply} onReact={onReact} />
  if (message.type === 'gif')   return <GifMessage   message={message} isRead={isRead} isMobile={isMobile} onReply={onReply} onReact={onReact} />
  if (message.type === 'location') return <LocationMessage message={message} isMobile={isMobile} />
  if (message.type === 'contact')  return <ContactMessage  message={message} isMobile={isMobile} />

  if (message.type === 'agent_join') {
    return <AgentJoinMessage agentName={message.agentName} agentAvatar={message.agentAvatar} timestamp={message.timestamp} isMobile={isMobile} />
  }

  if (message.type === 'menu') {
    return <MenuMessage message={message} onSelect={onQuickReply} isMobile={isMobile} />
  }

  if (message.type === 'card')      return <CardMessage      message={message} onSelect={onQuickReply} isMobile={isMobile} />
  if (message.type === 'carousel')  return <CarouselMessage  message={message} onSelect={onQuickReply} isMobile={isMobile} />
  if (message.type === 'form')      return <FormMessage      message={message} onSelect={onQuickReply} isMobile={isMobile} />
  if (message.type === 'csat')      return <CsatMessage      message={message} onSelect={onQuickReply} isMobile={isMobile} />
  if (message.type === 'callback')  return <CallbackMessage  message={message} onSelect={onQuickReply} isMobile={isMobile} />

  if (message.type === 'fallback') {
    return (
      <div className="cw-msg-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <FallbackMessage text={fallbackText} onEscalate={onEscalate} onLeaveMessage={onLeaveMessage} acted={message.acted} isMobile={isMobile} senderName={senderName} senderType={senderType} />
      </div>
    )
  }

  const isUser    = message.role === 'user'
  const time      = msgTime(message.createdAt)
  const streaming = message.type === 'streaming'

  return (
    <div className="cw-msg-in">
      <div style={bubbleWrap(message.role)}>
        {isUser && !streaming && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4, maxWidth: '72%' }}>
          {message.attachments?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              {message.attachments.map((a, i) => <AttachmentImage key={i} src={a.url} onOpen={onOpenLightbox} />)}
            </div>
          )}
          {message.text && (
            <div style={bubbleStyle(isUser, isMobile)}>
              <ReplyQuote replyTo={message.replyTo} isUser={isUser} />
              <span>{message.text}{streaming && <StreamingCursor />}</span>
              <span style={metaStyle(isUser, isMobile)}>
                {time}
                {isUser && <Ticks read={isRead} streaming={streaming} />}
              </span>
              <ReactionBadge reaction={message.reaction} isUser={isUser} />
            </div>
          )}
          {!isUser && senderName && <BubbleLabel name={senderName} type={senderType} />}
        </div>
        {!isUser && !streaming && <MessageActions message={message} onReply={onReply} onReact={onReact} isUser={isUser} />}
      </div>
      {quickReplies && (
        <QuickReplies options={quickReplies} onSelect={onQuickReply} />
      )}
    </div>
  )
}

function Ticks({ read, streaming }) {
  if (streaming) {
    // single gray tick — sending
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ flexShrink: 0 }}>
        <path d="M1 5l3.5 3.5L12 1" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  // double tick — gray (delivered) or blue (read)
  const color = read ? '#53b9ea' : '#9ca3af'
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 5l3.5 3.5L12 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 5l3.5 3.5L16 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const MENU_ICONS = {
  lightning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#6366f1"/></svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  target: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6366f1" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="#6366f1"/></svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round"/></svg>
  ),
  star: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#6366f1"/></svg>
  ),
}

function MenuMessage({ message, onSelect, isMobile = false }) {
  return (
    <div className="cw-msg-in" style={{ maxWidth: isMobile ? '100%' : '42%', width: isMobile ? '100%' : undefined, paddingBottom: 8 }}>
      {message.title && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 10, paddingLeft: 2 }}>
          {message.title}
        </div>
      )}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {message.items.map((item, i) => (
          <button
            key={item.id ?? i}
            onClick={() => onSelect?.({ value: item.id ?? item.label, label: item.label })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '9px 12px',
              background: '#fff', border: 'none',
              borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--cw-font-family)',
              transition: 'background 120ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {MENU_ICONS[item.icon] ?? MENU_ICONS.arrow}
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#9ca3af' }}>
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

function CardBody({ card, onSelect }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {card.icon && (
        <div style={{ width: '100%', height: 84, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, background: card.color || 'linear-gradient(135deg, var(--cw-primary), var(--cw-primary-dark))' }}>
          {card.icon}
        </div>
      )}
      <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{card.title}</div>
        {card.subtitle && (
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, flex: 1 }}>{card.subtitle}</div>
        )}
        {card.ctaLabel && (
          <button
            onClick={() => onSelect?.({ value: card.ctaValue ?? card.ctaLabel, label: card.ctaLabel })}
            style={{
              marginTop: 'auto', border: '1.5px solid var(--cw-primary)', background: 'transparent',
              color: 'var(--cw-primary)', borderRadius: 8, padding: '7px 10px', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--cw-font-family)', transition: 'background 120ms, color 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--cw-primary)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cw-primary)' }}
          >
            {card.ctaLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function CardMessage({ message, onSelect, isMobile = false }) {
  return (
    <div className="cw-msg-in" style={{ maxWidth: isMobile ? '82%' : '56%', marginBottom: 4 }}>
      <CardBody card={message.card} onSelect={onSelect} />
    </div>
  )
}

function CarouselMessage({ message, onSelect, isMobile = false }) {
  return (
    <div className="cw-msg-in" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 4, maxWidth: '100%', scrollbarWidth: 'thin' }}>
      {message.cards.map((card, i) => (
        <div key={i} style={{ flex: '0 0 auto', width: isMobile ? 190 : 168 }}>
          <CardBody card={card} onSelect={onSelect} />
        </div>
      ))}
    </div>
  )
}

function FormMessage({ message, onSelect, isMobile = false }) {
  const { form } = message
  const [values, setValues] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const canSubmit = form.fields.every(f => !f.required || (values[f.id] ?? '').trim())

  const handleSubmit = () => {
    const summary = form.fields.map(f => `${f.label}: ${values[f.id] || '—'}`).join(' · ')
    onSelect?.({ value: summary, label: summary })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="cw-msg-in" style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: isMobile ? '92%' : '60%', border: '1px solid #d1fae5', background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', marginBottom: 4 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>Formulario enviado, ¡gracias!</span>
      </div>
    )
  }

  return (
    <div className="cw-msg-in" style={{ maxWidth: isMobile ? '92%' : '62%', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 4 }}>
      {form.title && <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{form.title}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {form.fields.map(f => (
          <div key={f.id}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              {f.label}{f.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={values[f.id] || ''}
              onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
              style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 13.5, fontFamily: 'var(--cw-font-family)', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
              onFocus={e => e.target.style.borderColor = 'var(--cw-primary)'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        ))}
      </div>
      <button
        disabled={!canSubmit}
        onClick={handleSubmit}
        style={{
          marginTop: 12, width: '100%', border: 'none', borderRadius: 9, padding: '9px',
          background: canSubmit ? 'var(--cw-primary)' : '#e5e7eb', color: canSubmit ? '#fff' : '#9ca3af',
          fontSize: 13.5, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default',
          fontFamily: 'var(--cw-font-family)', transition: 'background 150ms',
        }}
      >
        {form.submitLabel || 'Enviar'}
      </button>
    </div>
  )
}

function CsatMessage({ message, onSelect, isMobile = false }) {
  const [submitted, setSubmitted] = useState(0)
  const [hovered, setHovered] = useState(0)

  const handleRate = (n) => {
    setSubmitted(n)
    onSelect?.({ value: `csat_${n}`, label: `${'⭐'.repeat(n)} (${n}/5)` })
  }

  return (
    <div className="cw-msg-in" style={{ maxWidth: isMobile ? '88%' : '58%', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 4, textAlign: 'center' }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
        {submitted ? '¡Gracias por tu calificación!' : (message.question || '¿Cómo calificarías la atención?')}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            disabled={!!submitted}
            onClick={() => handleRate(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            style={{ border: 'none', background: 'none', padding: 2, cursor: submitted ? 'default' : 'pointer', fontSize: 26, lineHeight: 1, filter: (submitted ? n <= submitted : n <= hovered) ? 'none' : 'grayscale(1) opacity(0.35)', transition: 'filter 100ms' }}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  )
}

const CALLBACK_SLOTS = ['Hoy 15:00', 'Hoy 18:00', 'Mañana 10:00']

function CallbackMessage({ message, onSelect, isMobile = false }) {
  const [chosen, setChosen] = useState(null)
  const slots = message.slots || CALLBACK_SLOTS

  const handlePick = (slot) => {
    setChosen(slot)
    onSelect?.({ value: `callback_${slot}`, label: `📅 Prefiero que me llamen: ${slot}` })
  }

  return (
    <div className="cw-msg-in" style={{ maxWidth: isMobile ? '88%' : '58%', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 4 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
        {chosen ? 'Listo, te vamos a llamar en ese horario.' : (message.question || '¿Cuándo preferís que te llamemos?')}
      </div>
      {!chosen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slots.map(slot => (
            <button
              key={slot}
              onClick={() => handlePick(slot)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: 9, padding: '9px 12px',
                fontSize: 13, fontWeight: 600, color: '#111827', cursor: 'pointer',
                fontFamily: 'var(--cw-font-family)', transition: 'border-color 120ms, background 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cw-primary)'; e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
            >
              <ClockGlyph />
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ClockGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--cw-primary)' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LocationMessage({ message, isMobile = false }) {
  const isUser = message.role === 'user'
  const time = msgTime(message.createdAt)
  return (
    <div className="cw-msg-in" style={bubbleWrap(message.role)}>
      <div style={{ maxWidth: isMobile ? '78%' : '62%', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
        <div style={{
          height: 100, position: 'relative', overflow: 'hidden',
          background: 'repeating-linear-gradient(0deg, #e5f0ea, #e5f0ea 18px, #d9ebe1 18px, #d9ebe1 19px), repeating-linear-gradient(90deg, #e5f0ea, #e5f0ea 18px, #d9ebe1 18px, #d9ebe1 19px)',
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-100%)' }}>
            <PinGlyph />
          </div>
        </div>
        <div style={{ padding: '9px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{message.location?.label || 'Mi ubicación actual'}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 11.5, color: '#6b7280' }}>{message.location?.address || 'Buenos Aires, Argentina'}</span>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>{time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PinGlyph() {
  return (
    <svg width="30" height="38" viewBox="0 0 24 30" fill="none">
      <path d="M12 0C6 0 1 5 1 11c0 8 11 19 11 19s11-11 11-19c0-6-5-11-11-11z" fill="#ef4444"/>
      <circle cx="12" cy="11" r="4.5" fill="#fff"/>
    </svg>
  )
}

function ContactMessage({ message, isMobile = false }) {
  const isUser = message.role === 'user'
  const time = msgTime(message.createdAt)
  const c = message.contact || {}
  const initials = (c.name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="cw-msg-in" style={bubbleWrap(message.role)}>
      <div style={{ maxWidth: isMobile ? '78%' : '62%', border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cw-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
          <div style={{ fontSize: 11.5, color: '#6b7280' }}>{c.phone}</div>
        </div>
        <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>{time}</span>
      </div>
    </div>
  )
}

function AttachmentImage({ src, onOpen }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      onClick={() => loaded && onOpen?.(src)}
      style={{ position: 'relative', width: 110, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0, cursor: loaded ? 'zoom-in' : 'default' }}
    >
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
          width: '100%', height: '100%', objectFit: 'cover',
          borderRadius: 10, display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 200ms ease',
        }}
      />
    </div>
  )
}

export function Lightbox({ src, onClose }) {
  const isFile = src && typeof src === 'object'

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDownload = () => {
    if (isFile) return
    const a = document.createElement('a')
    a.href = src
    a.download = 'imagen.jpg'
    a.click()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* toolbar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8 }}
      >
        {!isFile && (
          <button onClick={handleDownload} style={lbBtnStyle} title="Descargar">
            <DownloadIcon />
          </button>
        )}
        <button onClick={onClose} style={lbBtnStyle} title="Cerrar">
          <LbCloseIcon />
        </button>
      </div>

      {isFile ? (
        <FilePdfPreview file={src} onClose={onClose} />
      ) : (
        <img
          src={src}
          alt="vista previa"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '90vw', maxHeight: '90vh',
            borderRadius: 10, objectFit: 'contain',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}
        />
      )}
    </div>
  )
}

function FilePdfPreview({ file, onClose }) {
  const mockLines = [92, 86, 78, 95, 70, 88, 60]
  const tableRows = [[60,80,40],[75,90,35],[55,70,45]]
  const handleDownload = (e) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = 'data:application/pdf;base64,JVBERi0xLjQ='
    a.download = file.name
    a.click()
  }
  return (
    <div onClick={e => e.stopPropagation()} style={{ width: Math.min(520, window.innerWidth * 0.92), maxHeight: '88vh', display: 'flex', flexDirection: 'column', borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}>
      {/* header */}
      <div style={{ background: '#1e2736', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 7, background: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 6, fontWeight: 800, color: 'white', letterSpacing: '0.03em' }}>PDF</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{file.size} · PDF</div>
        </div>
        <button onClick={handleDownload} style={{ ...lbBtnStyle, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} title="Descargar"><DownloadIcon /></button>
        <button onClick={onClose} style={{ ...lbBtnStyle, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} title="Cerrar"><LbCloseIcon /></button>
      </div>
      {/* PDF page */}
      <div style={{ background: '#e5e7eb', padding: 20, overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: 4, padding: '36px 40px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* title block */}
          <div style={{ height: 20, background: '#1e293b', borderRadius: 3, width: '60%' }} />
          <div style={{ height: 11, background: '#94a3b8', borderRadius: 2, width: '38%', marginBottom: 6 }} />
          {/* paragraph lines */}
          {mockLines.map((w, i) => (
            <div key={i} style={{ height: 10, background: '#e2e8f0', borderRadius: 2, width: `${w}%` }} />
          ))}
          {/* table */}
          <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '9px 14px', display: 'flex', gap: 16, borderBottom: '1px solid #e5e7eb' }}>
              {['Ítem','Descripción','Importe'].map((_, i) => (
                <div key={i} style={{ flex: i === 1 ? 2 : 1, height: 10, background: '#cbd5e1', borderRadius: 2 }} />
              ))}
            </div>
            {tableRows.map((cols, r) => (
              <div key={r} style={{ padding: '8px 14px', display: 'flex', gap: 16, borderBottom: r < tableRows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                {cols.map((w, i) => (
                  <div key={i} style={{ flex: i === 1 ? 2 : 1, height: 9, background: '#e2e8f0', borderRadius: 2, maxWidth: `${w}%` }} />
                ))}
              </div>
            ))}
          </div>
          {/* more lines */}
          {[78, 90, 65, 82].map((w, i) => (
            <div key={i} style={{ height: 10, background: '#e2e8f0', borderRadius: 2, width: `${w}%` }} />
          ))}
          {/* footer */}
          <div style={{ marginTop: 10, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: 9, background: '#e2e8f0', borderRadius: 2, width: 80 }} />
            <div style={{ height: 9, background: '#e2e8f0', borderRadius: 2, width: 110 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const lbBtnStyle = {
  width: 40, height: 40, borderRadius: '50%',
  background: 'rgba(255,255,255,0.12)', border: 'none',
  color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 150ms',
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LbCloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ReplyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M9 17l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11h11a6 6 0 0 1 6 6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ReactIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M8.5 14s1.3 1.7 3.5 1.7 3.5-1.7 3.5-1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="9.5" x2="9.01" y2="9.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/>
      <line x1="15" y1="9.5" x2="15.01" y2="9.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/>
    </svg>
  )
}


function BubbleLabel({ name, type }) {
  const isAgent = !!type && type !== 'Asistente IA'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      background: isAgent ? '#f0fdf4' : '#eff6ff',
      fontSize: 11, fontWeight: 600,
      color: isAgent ? '#15803d' : '#2563eb',
      userSelect: 'none', whiteSpace: 'nowrap',
    }}>
      {isAgent ? `${name} · Agente` : 'Asistente IA'}
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
  alignItems: 'flex-end',
})

const bubbleStyle = (isUser, isMobile = false) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: isMobile ? '9px 16px 22px' : '7px 13px 20px',
  borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
  background: isUser ? 'var(--cw-bg-message-user)' : 'var(--cw-bg-message-bot)',
  color: isUser ? 'var(--cw-text-message-user)' : 'var(--cw-text)',
  fontSize: 14,
  lineHeight: 1.5,
  wordBreak: 'break-word',
  width: 'fit-content',
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
})

const metaStyle = (isUser, isMobile = false) => ({
  position: 'absolute',
  bottom: 4,
  right: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  fontSize: 10,
  color: isUser ? 'rgba(255,255,255,0.75)' : '#9ca3af',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  lineHeight: 1,
})
