import { useState, useEffect, useRef } from 'react'

const CATEGORIES = [
  {
    label: '😀', name: 'Caritas',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲','😳','🥺','🫣','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿'],
  },
  {
    label: '👋', name: 'Gestos',
    emojis: ['👋','🤚','🖐','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁','👅','👄','🫦'],
  },
  {
    label: '❤️', name: 'Corazones',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉','✡️','🔯','🪯','☯️','✨','💫','⭐','🌟','💥','🔥','🌈','☀️','🌤','⛅','🌦','🌧','⛈','🌩','🌨','❄️','⛄','🌬','💨','🌊','💧','☔'],
  },
  {
    label: '🐶', name: 'Animales',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔'],
  },
  {
    label: '🍕', name: 'Comida',
    emojis: ['🍕','🍔','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥗','🍿','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍷','🍸','🍹','🧉','🍺','🥂','☕','🍵','🧋','🥤','🧃','🥛','🫖'],
  },
  {
    label: '⚽', name: 'Actividades',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷','🏂','🪂','🏋️','🤸','🤺','🤼','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖','🎗','🎫','🎟','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟','🎯','🎳','🎮','🎰','🧩'],
  },
]

export function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <>
      <style>{`
        .cw-emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          max-height: 180px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
        .cw-emoji-btn {
          font-size: 18px;
          line-height: 1;
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 100ms;
          text-align: center;
        }
        .cw-emoji-btn:hover { background: #f3f4f6; }
        .cw-emoji-cat-btn {
          font-size: 16px;
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          transition: background 100ms;
          opacity: 0.6;
        }
        .cw-emoji-cat-btn:hover { background: #f3f4f6; opacity: 1; }
        .cw-emoji-cat-btn.active { background: #f3f4f6; opacity: 1; }
      `}</style>

      <div ref={ref} style={pickerStyle}>
        {/* Categorías */}
        <div style={catRowStyle}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              className={`cw-emoji-cat-btn${activeCategory === i ? ' active' : ''}`}
              onClick={() => setActiveCategory(i)}
              title={cat.name}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '4px 8px 2px', fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
          {CATEGORIES[activeCategory].name}
        </div>

        {/* Grid de emojis */}
        <div className="cw-emoji-grid" style={{ padding: '4px 8px 8px' }}>
          {CATEGORIES[activeCategory].emojis.map((emoji, i) => (
            <button
              key={i}
              className="cw-emoji-btn"
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

const pickerStyle = {
  position: 'absolute',
  bottom: 'calc(100% + 8px)',
  left: 0,
  width: 280,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
  zIndex: 20,
  overflow: 'hidden',
}

const catRowStyle = {
  display: 'flex',
  gap: 2,
  padding: '8px 8px 4px',
  borderBottom: '1px solid #f3f4f6',
  overflowX: 'auto',
  scrollbarWidth: 'none',
}
