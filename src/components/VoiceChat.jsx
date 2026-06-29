import { useState, useEffect, useRef } from 'react'
import { Orb } from 'orb-ui'

const SR = window.SpeechRecognition || window.webkitSpeechRecognition

const BOT_RESPONSES = [
  'Entendido. Estoy procesando tu consulta y en breve te doy una respuesta.',
  'Perfecto, voy a ayudarte con eso ahora mismo.',
  'Gracias por contarme. ¿Podés darme más detalles?',
  'Recibí tu mensaje. Voy a revisar tu caso enseguida.',
  'Claro que sí, déjame verificar eso para vos.',
]

const STATE_LABEL = {
  connecting: 'Procesando...',
  idle:       'Escuchando...',
  listening:  'Te escucho...',
  speaking:   'Respondiendo...',
  error:      'Sin acceso al micrófono',
}

const ACTIVATE      = 0.022
const VOICE_HOLD_MS = 150
const SILENCE_MS    = 2000

export function VoiceChat({ onAddMessage, onStreamBot, onClose }) {
  const [orbState, setOrbState] = useState('connecting')
  const [volume, setVolume]     = useState(0)

  const orbStateRef          = useRef('connecting')
  const loopRef              = useRef(true)
  const processingRef        = useRef(false)
  const audioCtxRef          = useRef(null)
  const rafRef               = useRef(null)
  const recogRef             = useRef(null)
  const accumulatedRef       = useRef('')
  const onAddMessageRef      = useRef(onAddMessage)
  const onStreamBotRef       = useRef(onStreamBot)
  const goRef                = useRef(null)
  const processUtteranceRef  = useRef(null)
  const startRecognitionRef  = useRef(null)

  useEffect(() => { onAddMessageRef.current = onAddMessage }, [onAddMessage])
  useEffect(() => { onStreamBotRef.current = onStreamBot }, [onStreamBot])

  const go = (state) => {
    orbStateRef.current = state
    setOrbState(state)
  }
  goRef.current = go

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = (text, onDone) => {
    go('speaking')
    window.speechSynthesis.cancel()
    const utt     = new SpeechSynthesisUtterance(text)
    utt.lang      = 'es-AR'
    utt.rate      = 0.95
    const esVoice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('es'))
    if (esVoice) utt.voice = esVoice
    // Stream the bot text into MessageList character-by-character as TTS plays
    onStreamBotRef.current?.(text)
    utt.onend = () => onDone?.()
    window.speechSynthesis.speak(utt)
  }

  // ── Process utterance ─────────────────────────────────────────────────────
  const processUtterance = () => {
    if (processingRef.current) return
    const said = accumulatedRef.current.trim() || '(mensaje de voz)'
    processingRef.current  = true
    accumulatedRef.current = ''
    recogRef.current?.abort()
    go('connecting')

    if (said !== '(mensaje de voz)') {
      onAddMessageRef.current?.({ role: 'user', type: 'text', text: said })
    }

    setTimeout(() => {
      if (!loopRef.current) return
      const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)]
      speak(response, () => {
        if (!loopRef.current) return
        processingRef.current = false
        go('idle')
        startRecognitionRef.current?.()
      })
    }, 600)
  }
  processUtteranceRef.current = processUtterance

  // ── Speech Recognition ────────────────────────────────────────────────────
  const startRecognition = () => {
    if (!SR || !loopRef.current || processingRef.current) return

    const recog          = new SR()
    recog.lang           = 'es-AR'
    recog.continuous     = false
    recog.interimResults = true
    recogRef.current     = recog

    let sessionText = ''

    recog.onresult = (e) => {
      sessionText = ''
      for (let i = 0; i < e.results.length; i++) {
        sessionText += e.results[i][0].transcript
      }
    }

    recog.onerror = (e) => {
      if (e.error === 'not-allowed') goRef.current?.('error')
    }

    recog.onend = () => {
      if (!loopRef.current || processingRef.current) return
      if (sessionText.trim()) {
        accumulatedRef.current = [accumulatedRef.current, sessionText.trim()]
          .filter(Boolean).join(' ')
      }
      setTimeout(() => startRecognitionRef.current?.(), 100)
    }

    try { recog.start() } catch (_) {}
  }
  startRecognitionRef.current = startRecognition

  // ── VAD ──────────────────────────────────────────────────────────────────
  const startVAD = (stream) => {
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const source   = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize               = 2048
    analyser.smoothingTimeConstant = 0.3
    source.connect(analyser)

    const buf            = new Uint8Array(analyser.fftSize)
    let voiceActive      = false
    let hasSpoken        = false
    let silenceStartedAt = null
    let voiceRisingAt    = null

    const poll = () => {
      if (!loopRef.current) return
      analyser.getByteTimeDomainData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / buf.length)
      setVolume(Math.min(rms * 8, 1))

      const cur = orbStateRef.current
      if (cur === 'idle' || cur === 'listening') {
        if (rms > ACTIVATE) {
          if (voiceRisingAt === null) voiceRisingAt = Date.now()
          if (!voiceActive && Date.now() - voiceRisingAt >= VOICE_HOLD_MS) {
            voiceActive      = true
            hasSpoken        = true
            silenceStartedAt = null
            goRef.current?.('listening')
          }
        } else {
          voiceRisingAt = null
          if (voiceActive) {
            voiceActive      = false
            silenceStartedAt = Date.now()
            goRef.current?.('idle')
          }
          if (hasSpoken && silenceStartedAt !== null) {
            if (Date.now() - silenceStartedAt >= SILENCE_MS) {
              hasSpoken        = false
              silenceStartedAt = null
              processUtteranceRef.current?.()
            }
          }
        }
      } else {
        voiceActive = false; hasSpoken = false
        silenceStartedAt = null; voiceRisingAt = null
      }
      rafRef.current = requestAnimationFrame(poll)
    }
    poll()
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loopRef.current        = true
    processingRef.current  = false
    accumulatedRef.current = ''

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        startVAD(stream)
        setTimeout(() => {
          if (!loopRef.current) return
          go('idle')
          startRecognition()
        }, 1300)
      } catch (_) {
        go('error')
      }
    }
    init()

    return () => {
      loopRef.current = false
      cancelAnimationFrame(rafRef.current)
      recogRef.current?.abort()
      window.speechSynthesis.cancel()
      audioCtxRef.current?.close()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────
  const orbVolume =
    orbState === 'listening' ? volume :
    orbState === 'speaking'  ? 0.75   : 0

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes cw-voice-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cw-orb > span:first-child { box-shadow: none !important; }
        .cw-voice-close-btn {
          width: 44px; height: 44px; border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          background: #fff; color: #6b7280;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 120ms, color 120ms, border-color 120ms;
        }
        .cw-voice-close-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
      `}</style>

      <div style={bgStyle} />

      {orbState === 'error' && (
        <p style={errorStyle}>Permití el acceso al micrófono para usar Voice Chat.</p>
      )}

      {/* Orb + label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={orbWrapStyle(orbState)}>
          <Orb state={orbState} volume={orbVolume} theme="circle" size={120} className="cw-orb" />
        </div>
        <p style={stateLabelStyle}>{STATE_LABEL[orbState] ?? ''}</p>
      </div>

      <button className="cw-voice-close-btn" onClick={onClose} aria-label="Cerrar Voice Chat" style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
        <CloseIcon />
      </button>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

const orbWrapStyle = (state) => ({
  filter: 'none',
  transition: 'filter 300ms',
})

const containerStyle = {
  flexShrink: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8f9ff',
  borderTop: '1px solid #f3f4f6',
  borderRadius: 16,
  margin: 8,
  position: 'relative',
  overflow: 'hidden',
  padding: '20px 24px 18px',
  gap: 6,
  animation: 'cw-voice-in 220ms ease forwards',
}
const bgStyle = {
  position: 'absolute', inset: 0,
  pointerEvents: 'none',
  opacity: 0.1,
  backgroundImage: 'url(/voice-bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}
const errorStyle = {
  position: 'relative', zIndex: 1,
  margin: 0, fontSize: 13,
  color: '#ef4444', textAlign: 'center',
}
const stateLabelStyle = {
  position: 'relative', zIndex: 1,
  margin: 0, fontSize: 13,
  color: '#9ca3af',
  fontWeight: 500, letterSpacing: '0.01em',
}
const actionRowStyle = {
  position: 'relative', zIndex: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 16,
  marginTop: 10,
}
