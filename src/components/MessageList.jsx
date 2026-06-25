import { useEffect, useRef, useState } from 'react'
import { TypingIndicator } from './TypingIndicator'
import { QuickReplies } from './QuickReplies'
import { FallbackMessage } from './FallbackMessage'
import { TransferringMessage, AgentJoinMessage } from './SystemMessage'
import { BrandAvatar } from './BrandAvatar'

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

export function MessageList({ messages, isTyping, typingMode, typingStates, quickReplies, onQuickReply, onEscalate, onLeaveMessage, fallbackText, agentName, isMobile = false }) {
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

function FileMessage({ message, isMobile, onOpenLightbox }) {
  const isUser = message.role === 'user'
  const time   = msgTime(message.createdAt)
  const fs     = isMobile ? 15 : 13
  const openPreview = () => onOpenLightbox && onOpenLightbox({ type: 'file', name: message.file.name, size: message.file.size })
  return (
    <div style={bubbleWrap(message.role)}>
      <div style={{ maxWidth: '78%' }}>
        <div style={{ overflow: 'hidden', padding: '8px 12px 5px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isUser ? 'var(--cw-bg-message-user)' : 'var(--cw-bg-message-bot)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
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
        </div>
      </div>
    </div>
  )
}

const AUDIO_WAVEFORM = [4,8,14,20,16,24,10,18,22,12,20,16,8,24,14,18,10,22,16,12,20,8,16,22,14,18,10,20,16,8]

function AudioMessage({ message, isRead, isMobile }) {
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
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: '78%' }}>
        <div style={{
          overflow: 'hidden',
          padding: isMobile ? '10px 14px 8px' : '8px 12px 6px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? 'var(--cw-bg-message-user)' : 'var(--cw-bg-message-bot)',
          minWidth: 185,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}>
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
        </div>
      </div>
    </div>
  )
}

function Message({ message, isRead, onOpenLightbox, quickReplies, onQuickReply, onEscalate, onLeaveMessage, fallbackText, isMobile = false }) {
  const senderName = message.senderName
  const senderType = message.senderType
  if (message.type === 'transferring') return <TransferringMessage isMobile={isMobile} />

  if (message.type === 'audio') return <AudioMessage message={message} isRead={isRead} isMobile={isMobile} />
  if (message.type === 'file')  return <FileMessage  message={message} isMobile={isMobile} onOpenLightbox={onOpenLightbox} />

  if (message.type === 'agent_join') {
    return <AgentJoinMessage agentName={message.agentName} agentAvatar={message.agentAvatar} timestamp={message.timestamp} isMobile={isMobile} />
  }

  if (message.type === 'fallback') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <FallbackMessage text={fallbackText} onEscalate={onEscalate} onLeaveMessage={onLeaveMessage} acted={message.acted} isMobile={isMobile} />
        {senderName && <BubbleLabel name={senderName} type={senderType} />}
      </div>
    )
  }

  const isUser    = message.role === 'user'
  const time      = msgTime(message.createdAt)
  const streaming = message.type === 'streaming'

  return (
    <div>
      <div style={bubbleWrap(message.role)}>
        {!isUser && (
          <BrandAvatar
            agentAvatar={null}
            agentName={senderType !== 'Asistente IA' ? senderName : null}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4, maxWidth: '72%', marginLeft: isUser ? 0 : 8 }}>
          {message.attachments?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              {message.attachments.map((a, i) => <AttachmentImage key={i} src={a.url} onOpen={onOpenLightbox} />)}
            </div>
          )}
          {message.text && (
            <div style={bubbleStyle(isUser, isMobile)}>
              <span>{message.text}{streaming && <StreamingCursor />}</span>
              <span style={metaStyle(isUser, isMobile)}>
                {time}
                {isUser && <Ticks read={isRead} streaming={streaming} />}
              </span>
            </div>
          )}
          {!isUser && senderName && <BubbleLabel name={senderName} type={senderType} />}
        </div>
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
  overflow: 'hidden',
  padding: isMobile ? '9px 16px 5px' : '7px 13px 4px',
  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  background: isUser ? 'var(--cw-bg-message-user)' : 'var(--cw-bg-message-bot)',
  color: isUser ? 'var(--cw-text-message-user)' : 'var(--cw-text)',
  fontSize: 14,
  lineHeight: 1.5,
  wordBreak: 'break-word',
  width: 'fit-content',
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
})

// Invisible spacer that reserves width for the meta so short text doesn't let meta overflow
const metaStyle = (isUser, isMobile = false) => ({
  float: 'right',
  marginLeft: 6,
  marginTop: isMobile ? 5 : 3,
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  fontSize: 11,
  color: isUser ? 'rgba(0,0,0,0.45)' : '#9ca3af',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  lineHeight: 1,
})
