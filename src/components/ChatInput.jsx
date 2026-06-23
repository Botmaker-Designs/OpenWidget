import { useState, useRef, useEffect } from 'react'
import { BotmakerLogo } from './BotmakerLogo'
import { EmojiPicker } from './EmojiPicker'

const MAX_ATTACHMENTS = 3
const REC_BAR_COUNT = 28

export function ChatInput({ onSend, disabled, onVoice, voiceMode, wrapStyle, onSendAudio, isMobile = false }) {
  const [text, setText]               = useState('')
  const [attachments, setAttachments] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [isPaused, setIsPaused]       = useState(false)
  const [recBars, setRecBars]         = useState(() => Array(REC_BAR_COUNT).fill(4))
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const [emojiOpen, setEmojiOpen]     = useState(false)
  const [dragging, setDragging]       = useState(false)
  const textareaRef  = useRef(null)
  const fileRef      = useRef(null)
  const analyserRef  = useRef(null)
  const streamRef    = useRef(null)
  const rafRef       = useRef(null)
  const plusMenuRef  = useRef(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0 || disabled) return
    onSend(trimmed, attachments)
    setText('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current?.focus()
    }
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

  // Click-outside for plus menu
  useEffect(() => {
    if (!plusMenuOpen) return
    const close = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setPlusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [plusMenuOpen])

  const fmtRecTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const startRecording  = () => { setIsRecording(true); setRecordSeconds(0); setIsPaused(false) }
  const cancelRecording = () => { setIsRecording(false); setRecordSeconds(0); setIsPaused(false) }
  const sendAudio = () => {
    onSendAudio?.({ duration: Math.max(1, recordSeconds) })
    setIsRecording(false); setRecordSeconds(0); setIsPaused(false)
  }

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

  const handleMobileTextChange = (e) => {
    setText(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const PILL_MENU_ITEMS = [
    {
      label: 'Cámara',
      icon: <CameraMenuIcon />,
      action: () => { fileRef.current?.click(); setPlusMenuOpen(false) },
    },
    {
      label: 'Fotos',
      icon: <PhotosMenuIcon />,
      action: () => { fileRef.current?.click(); setPlusMenuOpen(false) },
    },
    {
      label: 'Archivos',
      icon: <FilesMenuIcon />,
      action: () => { fileRef.current?.click(); setPlusMenuOpen(false) },
    },
    {
      label: 'Emoji',
      icon: <EmojiMenuIcon />,
      action: () => { setEmojiOpen(o => !o); setPlusMenuOpen(false) },
    },
  ]

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
        .cw-textarea-pill {
          border: none; outline: none; resize: none;
          background: transparent;
          font-family: var(--cw-font-family);
          font-size: 16px; color: var(--cw-text);
          line-height: 1.45;
          padding: 0;
          flex: 1; overflow-y: hidden;
          width: 100%;
          max-height: 120px;
        }
        .cw-textarea-pill::placeholder { color: #9ca3af; }
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
        .cw-pill-menu-item {
          display: flex; align-items: center; gap: 14px;
          width: 100%; padding: 12px 16px;
          border: none; background: transparent;
          font-size: 16px; color: #111827;
          font-family: var(--cw-font-family);
          cursor: pointer; text-align: left;
          transition: background 100ms;
        }
        .cw-pill-menu-item:hover { background: #f3f4f6; }
        .cw-pill-menu-item:first-child { border-radius: 16px 16px 0 0; }
        .cw-pill-menu-item:last-child { border-radius: 0 0 16px 16px; }
        .cw-pill-blue-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: none; background: var(--cw-primary); color: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 80ms;
        }
        .cw-pill-blue-btn:active { transform: scale(0.92); }
        .cw-pill-blue-btn:disabled { opacity: 0.4; cursor: default; }
        .cw-pill-icon-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: none; background: transparent; color: #9ca3af;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cw-pill-icon-btn:disabled { opacity: 0.4; cursor: default; }
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

        {/* ── MOBILE PILL LAYOUT ── */}
        {isMobile ? (
          <div ref={plusMenuRef} style={{ padding: '8px 12px 14px', position: 'relative' }}>

            {/* Plus menu popover */}
            {plusMenuOpen && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 4px)', left: 12,
                background: '#fff', borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                minWidth: 200, zIndex: 20, overflow: 'hidden',
              }}>
                {PILL_MENU_ITEMS.map(item => (
                  <button key={item.label} className="cw-pill-menu-item" onClick={item.action}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji picker (mobile) */}
            {emojiOpen && (
              <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 12, zIndex: 20 }}>
                <EmojiPicker
                  onSelect={(emoji) => { setText(t => t + emoji); textareaRef.current?.focus() }}
                  onClose={() => setEmojiOpen(false)}
                />
              </div>
            )}

            {/* Recording pill */}
            {isRecording ? (
              <div style={{
                background: '#ebebeb', borderRadius: 24,
                display: 'flex', alignItems: 'center',
                padding: '6px 8px 6px 10px', gap: 8,
              }}>
                <button className="cw-rec-icon-btn" onClick={cancelRecording} title="Cancelar"><RecTrashIcon /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <span className="cw-reddot" style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', display: 'block', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums', color: '#374151', minWidth: 30 }}>{fmtRecTime(recordSeconds)}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, overflow: 'hidden' }}>
                  {recBars.map((h, i) => <div key={i} className="cw-rec-bar" style={{ height: h }} />)}
                </div>
                <button className="cw-rec-icon-btn" onClick={() => setIsPaused(p => !p)} title={isPaused ? 'Continuar' : 'Pausar'}>
                  {isPaused ? <RecPlayIcon /> : <RecPauseIcon />}
                </button>
                <button onClick={sendAudio} className="cw-pill-blue-btn" title="Enviar audio">
                  <RecSendArrowIcon />
                </button>
              </div>
            ) : (
              /* Normal pill */
              <div style={{
                background: '#ebebeb', borderRadius: 24,
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Attachment thumbnails */}
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, padding: '10px 14px 4px', flexWrap: 'wrap' }}>
                    {attachments.map(a => (
                      <div key={a.id} style={{ position: 'relative', width: 80, height: 70, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        {a.loading ? (
                          <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(90deg, #d1d5db 25%, #e5e7eb 50%, #d1d5db 75%)',
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

                {/* Input row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '7px 6px 7px 8px', gap: 2 }}>
                  {/* + button */}
                  <button
                    onClick={() => setPlusMenuOpen(o => !o)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: 'none', background: 'transparent',
                      color: '#374151', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-label="Adjuntar"
                  >
                    <PlusIcon />
                  </button>

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    className="cw-textarea-pill"
                    rows={1}
                    value={text}
                    onChange={handleMobileTextChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setPlusMenuOpen(false)}
                    placeholder="Mensaje"
                    disabled={disabled}
                  />

                  {/* Mic outline (only when no text) */}
                  {text.length === 0 && (
                    <button
                      className="cw-pill-icon-btn"
                      onClick={startRecording}
                      disabled={disabled}
                      title="Grabar audio"
                    >
                      <AudioMicIcon />
                    </button>
                  )}

                  {/* Blue circle: waveform when empty, send arrow when has content */}
                  <button
                    className="cw-pill-blue-btn"
                    onClick={canSend ? handleSend : onVoice}
                    disabled={!canSend && disabled}
                    aria-label={canSend ? 'Enviar' : 'Activar Voice Chat'}
                    style={{ marginRight: 2 }}
                  >
                    {canSend ? <SendIcon /> : <MicIcon />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (

          /* ── DESKTOP BOX LAYOUT ── */
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
                {dragging && (
                  <div className="cw-drop-overlay">
                    <DropIcon />
                    Soltá para adjuntar
                  </div>
                )}

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
        )}

      </div>
    </>
  )
}

/* ── Icons ── */

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

function CameraMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function PhotosMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FilesMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function EmojiMenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
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
