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

const ACTIVATE      = 0.022  // RMS threshold to consider voice
const VOICE_HOLD_MS = 150    // voice must stay above threshold this long to "count"
const SILENCE_MS    = 2000   // ms of silence after speech → process

export function VoiceChat({ onClose, onMessage }) {
  const [orbState, setOrbState]     = useState('connecting')
  const [volume, setVolume]         = useState(0)
  const [transcript, setTranscript] = useState('')
  const [botText, setBotText]       = useState('')

  // Stable refs
  const orbStateRef    = useRef('connecting')
  const loopRef        = useRef(true)
  const processingRef  = useRef(false)
  const streamRef      = useRef(null)
  const audioCtxRef    = useRef(null)
  const rafRef         = useRef(null)
  const recogRef       = useRef(null)
  const accumulatedRef = useRef('')  // transcript built across SR restarts

  // "Latest function" refs — VAD closures read these instead of stale captures
  const goRef                 = useRef(null)
  const processUtteranceRef   = useRef(null)
  const startRecognitionRef   = useRef(null)

  // ── go: update both ref + React state ────────────────────────────────────
  const go = (state) => {
    orbStateRef.current = state
    setOrbState(state)
  }
  goRef.current = go

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = (text, onDone) => {
    setBotText(text)
    go('speaking')
    window.speechSynthesis.cancel()
    const utt     = new SpeechSynthesisUtterance(text)
    utt.lang      = 'es-AR'
    utt.rate      = 0.95
    const esVoice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('es'))
    if (esVoice) utt.voice = esVoice
    utt.onend = () => { setBotText(''); onDone?.() }
    window.speechSynthesis.speak(utt)
  }

  // ── Process utterance ─────────────────────────────────────────────────────
  const processUtterance = () => {
    if (processingRef.current) return
    const said = accumulatedRef.current.trim() || '(mensaje de voz)'
    processingRef.current  = true
    accumulatedRef.current = ''
    setTranscript('')
    recogRef.current?.abort()
    go('connecting')
    if (said !== '(mensaje de voz)') onMessage?.(said)

    setTimeout(() => {
      if (!loopRef.current) return
      const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)]
      speak(response, () => {
        if (!loopRef.current) return
        setBotText('')
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
    recog.continuous     = false   // let Chrome stop on silence, we restart
    recog.interimResults = true
    recogRef.current     = recog

    let sessionText = ''

    recog.onresult = (e) => {
      sessionText = ''
      for (let i = 0; i < e.results.length; i++) {
        sessionText += e.results[i][0].transcript
      }
      const full = [accumulatedRef.current, sessionText].filter(Boolean).join(' ').trim()
      setTranscript(full)
    }

    recog.onerror = (e) => {
      if (e.error === 'not-allowed') goRef.current?.('error')
      // no-speech / aborted → onend handles restart
    }

    recog.onend = () => {
      if (!loopRef.current || processingRef.current) return
      // Commit this session's text to the accumulated buffer
      if (sessionText.trim()) {
        accumulatedRef.current = [accumulatedRef.current, sessionText.trim()]
          .filter(Boolean).join(' ')
      }
      // Restart immediately to keep capturing
      setTimeout(() => startRecognitionRef.current?.(), 100)
    }

    try { recog.start() } catch (_) {}
  }
  startRecognitionRef.current = startRecognition

  // ── VAD: RMS silence timer ────────────────────────────────────────────────
  const startVAD = (stream) => {
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const source   = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize               = 2048
    analyser.smoothingTimeConstant = 0.3
    source.connect(analyser)

    const buf            = new Uint8Array(analyser.fftSize)
    let voiceActive      = false   // currently in "voice on" state
    let hasSpoken        = false   // spoke at least once this turn
    let silenceStartedAt = null    // when silence began (after speech)
    let voiceRisingAt    = null    // when RMS first crossed ACTIVATE (debounce start)

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
          // ── Above threshold ─────────────────────────────────────────────
          if (voiceRisingAt === null) voiceRisingAt = Date.now()

          // Only flip to "voice active" after VOICE_HOLD_MS of sustained sound
          // This filters out brief noise spikes that would reset the silence timer
          if (!voiceActive && Date.now() - voiceRisingAt >= VOICE_HOLD_MS) {
            voiceActive      = true
            hasSpoken        = true
            silenceStartedAt = null    // cancel any running silence timer
            goRef.current?.('listening')
          }
        } else {
          // ── Below threshold ─────────────────────────────────────────────
          voiceRisingAt = null   // reset the debounce counter

          if (voiceActive) {
            voiceActive      = false
            silenceStartedAt = Date.now()
            goRef.current?.('idle')
          }

          // Count silence; fire when 2 s elapsed
          if (hasSpoken && silenceStartedAt !== null) {
            if (Date.now() - silenceStartedAt >= SILENCE_MS) {
              hasSpoken        = false
              silenceStartedAt = null
              processUtteranceRef.current?.()
            }
          }
        }
      } else {
        // connecting / speaking → full reset
        voiceActive      = false
        hasSpoken        = false
        silenceStartedAt = null
        voiceRisingAt    = null
      }

      rafRef.current = requestAnimationFrame(poll)
    }
    poll()
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loopRef.current       = true
    processingRef.current = false
    accumulatedRef.current = ''

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
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
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    loopRef.current = false
    cancelAnimationFrame(rafRef.current)
    recogRef.current?.abort()
    window.speechSynthesis.cancel()
    audioCtxRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    onClose?.()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const orbVolume =
    orbState === 'listening' ? volume :
    orbState === 'speaking'  ? 0.75   : 0

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes cw-voice-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cw-bubble-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cw-voice-close:hover { background: rgba(0,0,0,0.06) !important; }
        /* The first child span of orb-ui's circle theme is the glow layer —
           override its box-shadow so the aura never shows */
        .cw-orb > span:first-child { box-shadow: none !important; }
      `}</style>

      <button className="cw-voice-close" style={closeStyle} onClick={handleClose} aria-label="Cerrar">
        <CloseIcon />
      </button>

      <div style={orbZoneStyle}>
        <div style={orbColorStyle(orbState)}>
          <Orb state={orbState} volume={orbVolume} theme="circle" size={170} className="cw-orb" />
        </div>
        <p style={stateLabelStyle}>{STATE_LABEL[orbState] ?? ''}</p>
      </div>

      <div style={textZoneStyle}>
        {transcript && (orbState === 'listening' || orbState === 'idle') && (
          <div style={userBubbleStyle}>{transcript}</div>
        )}
        {botText && (
          <div style={botBubbleStyle}>{botText}</div>
        )}
        {orbState === 'error' && (
          <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', margin: 0 }}>
            Permití el acceso al micrófono para usar Voice Chat.
          </p>
        )}
      </div>
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

// hue-rotate shifts the orb's base blue:
//   0deg   → blue   (idle / listening)
//   145deg → green  (speaking / responding)
//   220deg → purple (connecting)
const orbColorStyle = (state) => ({
  filter: state === 'speaking' ? 'sepia(1) saturate(6) hue-rotate(160deg)' : 'none',
})

const containerStyle = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  background: '#ffffff', zIndex: 5,
  animation: 'cw-voice-in 280ms cubic-bezier(0.22,1,0.36,1) forwards',
}
const closeStyle = {
  position: 'absolute', top: 14, right: 14,
  width: 36, height: 36, borderRadius: '50%',
  border: '1.5px solid #e5e7eb', background: '#fff',
  color: '#6b7280', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 120ms',
}
const orbZoneStyle = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 18, marginBottom: 20,
}
const stateLabelStyle = {
  margin: 0, fontSize: 14, color: '#6b7280',
  fontWeight: 500, letterSpacing: '0.01em', minHeight: 20,
}
const textZoneStyle = {
  width: '100%', maxWidth: 290,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 10,
  minHeight: 56, padding: '0 20px',
}
const userBubbleStyle = {
  background: '#f3f4f6', color: '#111827',
  borderRadius: 16, padding: '9px 14px',
  fontSize: 14, lineHeight: 1.45,
  textAlign: 'center', maxWidth: '100%',
  animation: 'cw-bubble-in 180ms ease forwards',
}
const botBubbleStyle = {
  background: 'var(--cw-primary)', color: '#fff',
  borderRadius: 16, padding: '9px 14px',
  fontSize: 14, lineHeight: 1.45,
  textAlign: 'center', maxWidth: '100%',
  animation: 'cw-bubble-in 180ms ease forwards',
}
