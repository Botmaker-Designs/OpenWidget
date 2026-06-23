import { useState, useRef, useEffect } from 'react'
import { BotmakerLogo } from './BotmakerLogo'
import { EmojiPicker } from './EmojiPicker'

const MAX_ATTACHMENTS = 3
const REC_BAR_COUNT = 28

export function ChatInput({ onSend, disabled, onVoice, voiceMode, wrapStyle, onSendAudio }) {
  const [text, setText]               = useState('')
  const [attachments, setAttachments] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [isPaused, setIsPaused]       = useState(false)
  const [recBars, setRecBars]         = useState(() => Array(REC_BAR_COUNT).fill(4))
  const textareaRef  = useRef(null)
  const fileRef      = useRef(null)
  const analyserRef  = useRef(null)
  const streamRef    = useRef(null)
  const rafRef       = useRef(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0 || disabled) return
    onSend(trimmed, attachments)
    setText('')
    setAttachments([])
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const slots = MAX_ATTACHMENTS - attachments.length
    const toAdd = files.slice(0, slots).map(file => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(file),
      name: file.name,
      loading: true,
    }))
    setAttachments(prev => [...prev, ...toAdd])
    e.target.value = ''
  }

  // Cada imagen nueva arranca su propio timer de 2s
  useEffect(() => {
    const loading = attachments.filter(a => a.loading)
    if (!loading.length) return
    const timers = loading.map(a =>
      setTimeout(() => {
        setAttachments(prev => prev.map(x => x.id === a.id ? { ...x, loading: false } : x))
      }, 2000)
    )
    return () => timers.forEach(clearTimeout)
  }, [attachments.length])

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  // Recording timer
  useEffect(() => {
    if (!isRecording || isPaused) return
    const t = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isRecording, isPaused])

  // Mic access
  useEffect(() => {
    if (!isRecording) {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      analyserRef.current?.audioCtx.close().catch(() => {})
      analyserRef.current = null
      setRecBars(Array(REC_BAR_COUNT).fill(4))
      return
    }
    navigator.mediaDevices?.getUserMedia({ audio: true, video: false })
      .then(stream => {
        streamRef.current = stream
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyserRef.current = { audioCtx, analyser, dataArray: new Uint8Array(analyser.frequencyBinCount) }
      })
      .catch(() => {})
  }, [isRecording])

  // Scrolling waveform animation loop
  useEffect(() => {
    if (!isRecording || isPaused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      return
    }
    let lastTs = 0
    const tick = (ts) => {
      if (ts - lastTs >= 75) {
        lastTs = ts
        let h
        const ar = analyserRef.current
        if (ar) {
          ar.analyser.getByteFrequencyData(ar.dataArray)
          const slice = ar.dataArray.slice(1, 18)
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length
          h = Math.max(3, Math.round((avg / 255) * 26))
        } else {
          h = Math.round(3 + Math.random() * 23)
        }
        setRecBars(prev => [...prev.slice(1), h])
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [isRecording, isPaused])

  const fmtRecTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const startRecording  = () => { setIsRecording(true); setRecordSeconds(0); setIsPaused(false) }
  const cancelRecording = () => { setIsRecording(false); setRecordSeconds(0); setIsPaused(false) }
  const sendAudio = () => {
    onSendAudio?.({ duration: Math.max(1, recordSeconds) })
    setIsRecording(false); setRecordSeconds(0); setIsPaused(false)
  }

  const [dragging, setDragging]     = useState(false)
  const [emojiOpen, setEmojiOpen]   = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    if (attachments.length < MAX_ATTACHMENTS) setDragging(true)
  }
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const slots = MAX_ATTACHMENTS - attachments.length
    const toAdd = files.slice(0, slots).map(file => ({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(file),
      name: file.name,
      loading: true,
    }))
    setAttachments(prev => [...prev, ...toAdd])
  }

  const canAdd  = attachments.length < MAX_ATTACHMENTS && !disabled
  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled
  const hasContent = attachments.length > 0 || text.length > 0

  return (
    <>
      <style>{`
        @keyframes cw-skeleton {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .cw-input-wrap {
          background: var(--cw-bg);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          min-height: 188px;
        }
        .cw-input-box {
          flex: 1;
          margin: 12px;
          border: 1.5px solid var(--cw-border);
          border-radius: 14px;
          background: #fff;
          transition: border-color 150ms;
          display: flex;
          flex-direction: column;
        }
        .cw-input-box:hover:not(.has-content):not(:focus-within) { border-color: #d1d5db; }
        .cw-input-box.has-content,
        .cw-input-box:focus-within { border-color: var(--cw-primary); }
        .cw-input-box.dragging {
          border-color: var(--cw-primary);
          background: #f0f5ff;
        }
        .cw-drop-overlay {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 18px 14px;
          color: var(--cw-primary); font-size: 13px; font-weight: 500;
          pointer-events: none;
        }
        .cw-textarea {
          border: none; outline: none; resize: none;
          background: transparent;
          font-family: var(--cw-font-family);
          font-size: 14px; color: var(--cw-text);
          line-height: 1.5;
          padding: 12px 14px 6px;
          flex: 1; overflow-y: auto; width: 100%;
        }
        .cw-textarea::placeholder { color: #9ca3af; }
        .cw-action-row {
          display: flex; align-items: center;
          padding: 6px 10px 8px; gap: 2px;
        }
        .cw-action-btn {
          width: 30px; height: 30px; border-radius: 50%;
          border: none; background: transparent; color: #9ca3af;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 120ms, color 120ms; flex-shrink: 0;
        }
        .cw-action-btn:hover:not(:disabled) { background: #f3f4f6; color: #6b7280; }
        .cw-action-btn:disabled { opacity: 0.4; cursor: default; }
        .cw-send-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: none; background: var(--cw-primary); color: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 120ms, transform 80ms, opacity 150ms;
          flex-shrink: 0; margin-left: auto;
        }
        .cw-send-btn:hover:not(:disabled) { background: var(--cw-primary-dark); }
        .cw-send-btn:active:not(:disabled) { transform: scale(0.92); }
        .cw-send-btn:disabled { opacity: 0.35; cursor: default; }
        @keyframes cw-reddot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .cw-rec-bar {
          width: 3px; border-radius: 2px;
          background: var(--cw-primary);
          flex-shrink: 0;
          transition: height 70ms ease-out;
          min-height: 3px;
        }
        .cw-reddot { animation: cw-reddot 1s ease-in-out infinite; }
        .cw-rec-icon-btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: none; background: transparent; color: #6b7280;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 120ms; flex-shrink: 0;
        }
        .cw-rec-icon-btn:hover { background: #f3f4f6; }
        .cw-thumb-remove {
          position: absolute; top: 4px; right: 4px;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(0,0,0,0.55); border: none;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 120ms;
        }
        .cw-thumb-remove:hover { background: rgba(0,0,0,0.8); }
        .cw-powered {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; padding: 6px 0 10px;
          font-size: 11px; color: #9ca3af;
          font-family: var(--cw-font-family);
        }
      `}</style>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="cw-input-wrap" style={wrapStyle}>
        <div
          className={`cw-input-box${!isRecording && hasContent ? ' has-content' : ''}${!isRecording && dragging ? ' dragging' : ''}`}
          onDragOver={!isRecording ? handleDragOver : undefined}
          onDragLeave={!isRecording ? handleDragLeave : undefined}
          onDrop={!isRecording ? handleDrop : undefined}
        >
          {isRecording ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
              <button className="cw-rec-icon-btn" onClick={cancelRecording} title="Cancelar"><RecTrashIcon /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <span className="cw-reddot" style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', display: 'block', flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums', color: '#374151', minWidth: 30 }}>{fmtRecTime(recordSeconds)}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: 32, overflow: 'hidden' }}>
                {recBars.map((h, i) => (
                  <div key={i} className="cw-rec-bar" style={{ height: h }} />
                ))}
              </div>
              <button className="cw-rec-icon-btn" onClick={() => setIsPaused(p => !p)} title={isPaused ? 'Continuar' : 'Pausar'}>
                {isPaused ? <RecPlayIcon /> : <RecPauseIcon />}
              </button>
              <button onClick={sendAudio} title="Enviar audio" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cw-primary)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RecSendArrowIcon />
              </button>
            </div>
          ) : (
            <>
              {/* Drag overlay */}
              {dragging && (
                <div className="cw-drop-overlay">
                  <DropIcon />
                  Soltá para adjuntar
                </div>
              )}

              {/* Thumbnails */}
              {attachments.length > 0 && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 12px 4px', flexWrap: 'wrap' }}>
                  {attachments.map(a => (
                    <div key={a.id} style={{ position: 'relative', width: 80, height: 70, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      {a.loading ? (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'cw-skeleton 1.2s ease-in-out infinite',
                        }} />
                      ) : (
                        <img src={a.url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button className="cw-thumb-remove" onClick={() => removeAttachment(a.id)} aria-label="Quitar">
                        <RemoveIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={textareaRef}
                className="cw-textarea"
                rows={1}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu mensaje..."
                disabled={disabled}
              />

              <div className="cw-action-row">
                <button className="cw-action-btn" title={canAdd ? 'Adjuntar imagen' : `Máximo ${MAX_ATTACHMENTS} imágenes`} disabled={!canAdd} onClick={() => fileRef.current?.click()}>
                  <AttachIcon />
                </button>
                <div style={{ position: 'relative' }}>
                  <button className="cw-action-btn" title="Emoji" disabled={disabled} onClick={() => setEmojiOpen(o => !o)}>
                    <EmojiIcon />
                  </button>
                  {emojiOpen && (
                    <EmojiPicker
                      onSelect={(emoji) => { setText(t => t + emoji); textareaRef.current?.focus() }}
                      onClose={() => setEmojiOpen(false)}
                    />
                  )}
                </div>
                <button className="cw-action-btn" title="GIF" disabled={disabled}><GifIcon /></button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button className="cw-action-btn" title="Grabar audio" disabled={disabled} onClick={startRecording}><AudioMicIcon /></button>
                  {canSend
                    ? <button className="cw-send-btn" style={{ marginLeft: 0 }} onClick={handleSend} aria-label="Enviar"><SendIcon /></button>
                    : <button
                        className="cw-send-btn"
                        onClick={onVoice}
                        disabled={disabled}
                        aria-label="Activar Voice Chat"
                        style={{ marginLeft: 0, background: '#dbeafe', color: '#2563eb' }}
                      >
                        <MicIcon />
                      </button>
                  }
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function DropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function RemoveIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
function AttachIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function EmojiIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
function GifIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
      <text x="5.5" y="16" fontSize="7.5" fontWeight="700" fill="currentColor" fontFamily="sans-serif">GIF</text>
    </svg>
  )
}
function AudioMicIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function MicIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <rect x="1"  y="9"  width="3" height="6"  rx="1.5"/>
      <rect x="6"  y="5"  width="3" height="14" rx="1.5"/>
      <rect x="11" y="2"  width="3" height="20" rx="1.5"/>
      <rect x="16" y="5"  width="3" height="14" rx="1.5"/>
      <rect x="21" y="9"  width="3" height="6"  rx="1.5"/>
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function RecTrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function RecPauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
  )
}
function RecPlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  )
}
function RecSendArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
