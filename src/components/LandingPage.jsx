import { useState, useMemo } from 'react'
import { CLIENTS, CATEGORIES } from '../config/clients'

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function ClientLogo({ name, logo, color }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const [r, g, b] = hexToRgb(color)

  if (logo && !failed) {
    return (
      <div style={{
        height: 44, display: 'flex', alignItems: 'center',
      }}>
        <img
          src={logo}
          alt={name}
          onError={() => setFailed(true)}
          style={{ maxHeight: 36, maxWidth: 140, width: 'auto', objectFit: 'contain', display: 'block' }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: `rgba(${r},${g},${b},0.12)`,
      border: `1.5px solid rgba(${r},${g},${b},0.2)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{initials}</span>
    </div>
  )
}

function CategoryBadge({ category }) {
  const colors = {
    Telecom: { bg: '#ede9fe', text: '#6d28d9' },
    Fintech: { bg: '#dbeafe', text: '#1d4ed8' },
    Banca: { bg: '#dcfce7', text: '#15803d' },
    Ecommerce: { bg: '#fef9c3', text: '#854d0e' },
    Delivery: { bg: '#ffedd5', text: '#c2410c' },
  }
  const c = colors[category] || { bg: '#f3f4f6', text: '#374151' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 99, background: c.bg, color: c.text,
      letterSpacing: '0.01em',
    }}>
      {category}
    </span>
  )
}

function AgentDot({ count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
      <span style={{ fontSize: 12, color: '#6b7280' }}>{count} agentes disponibles</span>
    </div>
  )
}

function ClientCard({ client, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const [r, g, b] = hexToRgb(client.primaryColor)

  return (
    <div
      onClick={() => onSelect(client)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? client.primaryColor : '#e5e7eb'}`,
        borderRadius: 16,
        padding: '20px 20px 18px',
        cursor: 'pointer',
        transition: 'border-color 160ms, box-shadow 160ms, transform 160ms',
        boxShadow: hovered
          ? `0 8px 28px rgba(${r},${g},${b},0.14), 0 2px 8px rgba(0,0,0,0.06)`
          : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, minHeight: 44 }}>
        <ClientLogo name={client.name} logo={client.logo} color={client.primaryColor} />
        <CategoryBadge category={client.category} />
      </div>

      <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.45 }}>{client.tagline}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid #f3f4f6' }}>
        <AgentDot count={client.agentsAvailable} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 13, fontWeight: 600, color: client.primaryColor,
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 160ms',
        }}>
          Abrir chat
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export function LandingPage({ onSelectClient }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')

  const filtered = useMemo(() => {
    return CLIENTS.filter(c => {
      const matchesCategory = activeCategory === 'Todos' || c.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`
        .oc-cat-chip {
          padding: 7px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          color: #374151;
          transition: all 140ms ease;
          white-space: nowrap;
          font-family: inherit;
        }
        .oc-cat-chip:hover {
          border-color: #a5b4fc;
          background: #f5f3ff;
          color: #4338ca;
        }
        .oc-cat-chip.active {
          border-color: #4f46e5;
          background: #4f46e5;
          color: #fff;
        }
        .oc-search {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
          color: #111827;
          font-family: inherit;
        }
        .oc-search::placeholder { color: rgba(255,255,255,0.5); }
        .oc-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .oc-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '64px 24px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          {/* Logo / brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Open Central</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 16px',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}>
            Conectá con las mejores marcas
          </h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.62)',
            margin: '0 0 36px',
            lineHeight: 1.6,
            maxWidth: 440,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Accedé al chat de atención al cliente de los principales operadores que usan Open Widget.
          </p>

          {/* Search bar */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1.5px solid rgba(255,255,255,0.18)',
            borderRadius: 14,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 480,
            margin: '0 auto',
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'rgba(255,255,255,0.45)' }}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="oc-search"
              placeholder="Buscar empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '15px 0', color: '#fff' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', display: 'flex', padding: 0 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`oc-cat-chip${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
          {filtered.length} {filtered.length === 1 ? 'empresa' : 'empresas'}{activeCategory !== 'Todos' ? ` en ${activeCategory}` : ''}
          {search && ` para "${search}"`}
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="oc-cards-grid">
            {filtered.map(client => (
              <ClientCard key={client.id} client={client} onSelect={onSelectClient} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Sin resultados</div>
            <div style={{ fontSize: 13 }}>Probá con otro término o categoría</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>Powered by </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>Botmaker Open Widget</span>
      </div>
    </div>
  )
}
