import { useState, useEffect, useRef } from 'react'

const AI_STATES = [
  'Analizando tu consulta...',
  'Buscando información...',
  'Procesando...',
  'Revisando contexto...',
  'Formulando respuesta...',
  'Verificando datos...',
  'Razonando...',
  'Consultando base de conocimiento...',
  'Pensando...',
  'Escribiendo...',
]

function pickSequence(states) {
  const pool = states ?? AI_STATES
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const count = states ? Math.min(states.length, 3) : (Math.random() < 0.5 ? 2 : 3)
  return shuffled.slice(0, count)
}

export function TypingIndicator({ agentName, states, isMobile = false }) {
  const sequence  = useRef(pickSequence(states))
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  // Reinicia la secuencia cuando cambian los estados contextuales
  useEffect(() => {
    sequence.current = pickSequence(states)
    setIdx(0)
    setVisible(true)
  }, [states])

  useEffect(() => {
    if (agentName) return

    const advance = (cur) => {
      if (cur >= sequence.current.length - 1) return
      timerRef.current = setTimeout(() => {
        setVisible(false)
        timerRef.current = setTimeout(() => {
          setIdx(cur + 1)
          setVisible(true)
          advance(cur + 1)
        }, 220)
      }, 1600 + Math.random() * 900)
    }

    advance(0)
    return () => clearTimeout(timerRef.current)
  }, [agentName, states])

  const label = agentName
    ? `${agentName} está escribiendo...`
    : sequence.current[idx]

  return (
    <>
      <style>{`
        @keyframes cw-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .cw-typing-text {
          font-size: ${isMobile ? 17 : 13}px;
          font-weight: 500;
          background: linear-gradient(
            90deg,
            var(--cw-text-muted) 25%,
            #111827 50%,
            var(--cw-text-muted) 75%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: cw-shimmer 1.6s linear infinite;
        }
      `}</style>

      <div style={wrapStyle}>
        <span
          className="cw-typing-text"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}
        >
          {label}
        </span>
      </div>
    </>
  )
}

const wrapStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
}
