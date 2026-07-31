import { useEffect, useRef } from 'react'

export const GIFS = [
  { id: 'thumbsup',  emoji: '👍', label: 'Genial',    color: '#dbeafe', anim: 'cw-gif-bounce' },
  { id: 'party',     emoji: '🎉', label: 'Fiesta',    color: '#fef3c7', anim: 'cw-gif-pop' },
  { id: 'heart',     emoji: '❤️', label: 'Te amo',    color: '#fee2e2', anim: 'cw-gif-heartbeat' },
  { id: 'clap',      emoji: '👏', label: 'Aplausos',  color: '#fef9c3', anim: 'cw-gif-shake' },
  { id: 'lol',       emoji: '😂', label: 'Jaja',      color: '#ffedd5', anim: 'cw-gif-wiggle' },
  { id: 'fire',      emoji: '🔥', label: 'Fuego',     color: '#ffe4e6', anim: 'cw-gif-flicker' },
  { id: 'yeah',      emoji: '🙌', label: 'Yeah!',     color: '#dcfce7', anim: 'cw-gif-bounce' },
  { id: 'wow',       emoji: '😮', label: 'Wow',       color: '#e0e7ff', anim: 'cw-gif-pop' },
  { id: 'hundred',   emoji: '💯', label: '100',       color: '#fce7f3', anim: 'cw-gif-shake' },
  { id: 'dance',     emoji: '🕺', label: 'Bailando',  color: '#ede9fe', anim: 'cw-gif-wiggle' },
]

const GIF_KEYFRAMES = `
  @keyframes cw-gif-bounce {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-10%); }
  }
  @keyframes cw-gif-pop {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.18); }
  }
  @keyframes cw-gif-heartbeat {
    0%, 100% { transform: scale(1); }
    25%      { transform: scale(1.15); }
    45%      { transform: scale(0.95); }
    65%      { transform: scale(1.12); }
  }
  @keyframes cw-gif-shake {
    0%, 100% { transform: rotate(0deg); }
    25%      { transform: rotate(-12deg); }
    75%      { transform: rotate(12deg); }
  }
  @keyframes cw-gif-wiggle {
    0%, 100% { transform: rotate(-8deg) scale(1); }
    50%      { transform: rotate(8deg) scale(1.08); }
  }
  @keyframes cw-gif-flicker {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.06); opacity: 0.75; }
  }
`

export function GifTile({ gif, size = 96 }) {
  return (
    <div style={{
      position: 'relative', width: size, height: size,
      borderRadius: size >= 150 ? 14 : 10, overflow: 'hidden',
      background: gif.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <style>{GIF_KEYFRAMES}</style>
      <span style={{
        fontSize: size * 0.52, lineHeight: 1,
        display: 'inline-block',
        animation: `${gif.anim} 1.1s ease-in-out infinite`,
      }}>
        {gif.emoji}
      </span>
      <span style={{
        position: 'absolute', left: 6, bottom: 6,
        fontSize: size >= 150 ? 11 : 9, fontWeight: 700, color: '#fff',
        background: 'rgba(0,0,0,0.45)', borderRadius: 6,
        padding: size >= 150 ? '3px 7px' : '2px 5px',
        letterSpacing: '0.02em',
      }}>
        {gif.label}
      </span>
    </div>
  )
}

export function GifPicker({ onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} style={pickerStyle}>
      <div style={{ padding: '10px 10px 2px', fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        GIFs
      </div>
      <div style={gridStyle}>
        {GIFS.map(gif => (
          <button
            key={gif.id}
            onClick={() => onSelect(gif)}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
            title={gif.label}
          >
            <GifTile gif={gif} size={96} />
          </button>
        ))}
      </div>
    </div>
  )
}

const pickerStyle = {
  position: 'absolute',
  bottom: 'calc(100% + 8px)',
  left: 0,
  width: 300,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
  zIndex: 20,
  overflow: 'hidden',
  paddingBottom: 8,
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
  padding: '8px 10px 2px',
  maxHeight: 260,
  overflowY: 'auto',
}
