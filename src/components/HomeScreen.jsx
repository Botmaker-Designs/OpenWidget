import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HELP_COLLECTIONS } from '../config/helpContent'
import { BotmakerLogo } from './BotmakerLogo'

function ClientSelectorDropdown({ clients, activeId, onChange }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const panelRef = useRef(null)
  const active = clients.find(c => c.id === activeId) ?? null

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        (!btnRef.current || !btnRef.current.contains(e.target)) &&
        (!panelRef.current || !panelRef.current.contains(e.target))
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 99, padding: '5px 10px 5px 6px',
          cursor: 'pointer', color: '#fff',
          fontSize: 12, fontWeight: 600,
          backdropFilter: 'blur(4px)',
          transition: 'background 140ms',
        }}
      >
        {active
          ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={active.logo} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
            </div>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        }
        <span>{active ? active.name : 'Empresa'}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && createPortal(
        <div ref={panelRef} style={{
          position: 'fixed', top: pos.top, left: pos.left,
          width: 220, maxHeight: 280, overflowY: 'auto',
          background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 99999, padding: '4px 0',
        }}>
          <style>{`
            .cw-sel-row { display:flex; align-items:center; gap:9px; padding:8px 12px; cursor:pointer; transition:background 100ms; }
            .cw-sel-row:hover { background:#f5f3ff; }
            .cw-sel-row.active { background:#ede9fe; }
          `}</style>
          {clients.map(c => (
            <div
              key={c.id}
              className={`cw-sel-row${c.id === activeId ? ' active' : ''}`}
              onClick={() => { onChange(c); setOpen(false) }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <img src={c.logo} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.category}</div>
              </div>
              {c.id === activeId && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
const DAY_LABELS = { monday:'Lun', tuesday:'Mar', wednesday:'Mié', thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom' }

function isWithinBusinessHours(businessHours) {
  if (!businessHours?.schedule) return false
  const now = new Date()
  const day = DAY_NAMES[now.getDay()]
  const slot = businessHours.schedule[day]
  if (!slot) return false
  const [oh, om] = slot.open.split(':').map(Number)
  const [ch, cm] = slot.close.split(':').map(Number)
  const mins = now.getHours() * 60 + now.getMinutes()
  return mins >= oh * 60 + om && mins < ch * 60 + cm
}

function formatTimeRange(businessHours) {
  if (!businessHours?.schedule) return null
  const activeDays = DAY_NAMES.filter(d => businessHours.schedule[d])
  if (!activeDays.length) return null
  const slot = businessHours.schedule[activeDays[0]]
  return `de ${slot.open} a ${slot.close}`
}

function formatScheduleSummary(businessHours) {
  if (!businessHours?.schedule) return null
  const schedule = businessHours.schedule
  const activeDays = DAY_NAMES.filter(d => schedule[d])
  if (!activeDays.length) return null
  const first = activeDays[0], last = activeDays[activeDays.length - 1]
  const slot = schedule[first]
  const rangeLabel = first === last
    ? DAY_LABELS[first]
    : `${DAY_LABELS[first]}–${DAY_LABELS[last]}`
  return `${rangeLabel} · ${slot.open}–${slot.close}`
}

const AGENT_AVATARS = [
  'https://i.pravatar.cc/40?img=47',
  'https://i.pravatar.cc/40?img=32',
  'https://i.pravatar.cc/40?img=15',
]

const TOP_ARTICLES = [
  { id: 'gs-1', title: '¿Qué es Botmaker?', mins: 2 },
  { id: 'ai-1', title: '¿Qué es un Agente de IA en Botmaker?', mins: 3 },
  { id: 'ch-3', title: 'Integrar el Webchat en tu sitio web', mins: 4 },
  { id: 'fl-1', title: 'Crear un flujo de conversación', mins: 5 },
  { id: 'ch-1', title: 'Conectar WhatsApp Business API', mins: 7 },
  { id: 'ai-7', title: 'Escalada automática a agente humano', mins: 3 },
  { id: 'in-1', title: 'Cómo funciona el Inbox unificado', mins: 3 },
  { id: 'gs-4', title: 'Agregar agentes humanos a tu cuenta', mins: 3 },
  { id: 'int-5', title: 'API REST de Botmaker', mins: 7 },
  { id: 'fl-5', title: 'Integraciones con APIs externas', mins: 6 },
]

export function HomeScreen({ onClose, isExpanded, onToggleExpand, onNewChat, onTabChange, userName, loggedInUser, onLoginClick, onAskArticle, chatCardVariant = 'team', businessHours, sessions = [], onSelectSession, animKey = 0, clientSelector = null, primaryColor = null, clientLogo = null, faqArticles = null }) {
  const [query, setQuery] = useState('')
  const available      = useMemo(() => isWithinBusinessHours(businessHours), [businessHours])
  const scheduleLabel  = useMemo(() => formatScheduleSummary(businessHours), [businessHours])
  const timeRange      = useMemo(() => formatTimeRange(businessHours), [businessHours])

  const articles = faqArticles ?? TOP_ARTICLES
  const filteredArticles = query.trim()
    ? articles.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
    : articles

  return (
    <div style={containerStyle}>
      <style>{`
        .cw-home-card:hover { background: #f0f4ff !important; border-color: var(--cw-primary) !important; }
        .cw-home-card:active { background: #e0ecff !important; }
        .cw-home-recent:hover { background: #f9fafb !important; border-color: #d1d5db !important; }
        .cw-home-recent:active { background: #f3f4f6 !important; }
        .cw-home-faq-row:hover { background: #f9fafb !important; }
        .cw-home-faq-row:active { background: #f3f4f6 !important; }
        .cw-login-btn:hover { background: rgba(255,255,255,0.12) !important; border-radius: 8px; }
        .cw-tab-item { transition: color 120ms ease; }
        .cw-tab-item:hover  { color: #374151 !important; }
        .cw-tab-item.active:hover { color: var(--cw-primary-dark) !important; }
      `}</style>

      {/* Hero con foto de fondo blureada */}
      <div key={`hero-${animKey}`} className="cw-anim-hero" style={heroStyle}>
        <div style={heroBgStyle} />
        <div style={primaryColor
          ? { ...heroOverlayStyle, background: `linear-gradient(160deg, ${primaryColor}e6 0%, ${primaryColor}b3 100%)` }
          : heroOverlayStyle
        } />
        <div style={topRowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {clientLogo
              ? <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={clientLogo} alt="" style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
                </div>
              : <BotmakerLogo size={42} white />
            }
            {clientSelector && (
              <ClientSelectorDropdown
                clients={clientSelector.clients}
                activeId={clientSelector.activeId}
                onChange={clientSelector.onChange}
              />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!loggedInUser && (
              <button className="cw-login-btn" style={loginBtnStyle} onClick={onLoginClick}>
                Ingresar
              </button>
            )}
            <button style={heroBtnStyle} onClick={onToggleExpand} aria-label={isExpanded ? 'Contraer' : 'Expandir'}>
              {isExpanded ? <ContractIcon /> : <ExpandIcon />}
            </button>
            <button style={heroBtnStyle} onClick={onClose} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div style={heroTextStyle}>
          {loggedInUser ? (
            <h1 style={headingStyle}>
              <span style={{ fontWeight: 300 }}>Hola {loggedInUser.name.split(' ')[0]},</span><br />¿cómo podemos ayudarte?
            </h1>
          ) : (
            <h1 style={headingStyle}>¿Cómo podemos<br />ayudarte?</h1>
          )}
        </div>

      </div>

      {/* Contenido blanco */}
      <div key={`body-${animKey}`} className="cw-anim-body" style={bodyStyle}>
        {/* Card de chat */}
        <div style={sectionStyle}>
          {(() => { const open = sessions.find(s => !s.closed); return open ? (
            <RecentMessage session={open} onSelect={() => onSelectSession?.(open.id)} clientLogo={clientLogo} />
          ) : null })()}
          {!sessions.find(s => !s.closed) && (chatCardVariant === 'hours' ? (
            <button className="cw-home-card" style={chatCardStyle} onClick={onNewChat}>
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ ...cardIconStyle, position: 'relative' }}>
                  {clientLogo ? <img src={clientLogo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /> : <BotmakerLogo size={22} />}
                  <span style={{ ...onlineBadgeStyle, background: available ? '#22c55e' : '#f59e0b' }} />
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: '#111827' }}>Chatear con el asistente</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                  {timeRange ? `Agentes disponibles ${timeRange}` : available ? 'Agentes disponibles ahora' : 'Fuera de horario'}
                </div>
              </div>
              <ChevronIcon color="#9ca3af" />
            </button>
          ) : (
            <button className="cw-home-card" style={{ ...chatCardStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 0 }} onClick={onNewChat}>
              {/* Fila superior: icono + título+subtítulo + chevron */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                <div style={{ ...cardIconStyle, flexShrink: 0 }}>
                  {clientLogo ? <img src={clientLogo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /> : <BotmakerLogo size={22} />}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    Iniciar nueva conversación
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>
                    Nuestro agente y equipo están disponibles
                  </div>
                </div>
                <ChevronIcon color="#9ca3af" />
              </div>
              {/* Separador */}
              <div style={{ width: '100%', height: 1, background: '#f3f4f6', margin: '12px 0' }} />
              {/* Fila de avatares */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {AGENT_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        border: '2px solid #fff',
                        objectFit: 'cover',
                        marginLeft: i === 0 ? 0 : -7,
                        position: 'relative',
                        zIndex: AGENT_AVATARS.length - i,
                        display: 'block',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Agentes disponibles para atención</span>
              </div>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div style={faqSectionStyle}>
          <p style={faqTitleStyle}>Preguntas frecuentes</p>
          <div style={faqUnifiedStyle}>
            {/* Buscador */}
            <div style={searchWrapStyle}>
              <input
                style={searchInputStyle}
                placeholder="Buscar ayuda"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query
                ? <button style={clearBtnStyle} onClick={() => setQuery('')}>×</button>
                : <SearchIcon />
              }
            </div>

            {/* Artículos */}
            <div style={articlesWrapStyle}>
              {filteredArticles.length === 0 ? (
                <p style={emptyStyle}>Sin resultados para "{query}"</p>
              ) : (
                filteredArticles.map(a => (
                  <button
                    key={a.id}
                    className="cw-home-faq-row"
                    style={faqRowStyle}
                    onClick={() => onAskArticle?.(a)}
                  >
                    <span style={{ flex: 1, fontSize: 13, color: '#374151', textAlign: 'left', lineHeight: 1.4 }}>
                      {a.title}
                    </span>
                    <ChevronIcon color="#c0c4cc" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div key={`footer-${animKey}`} className="cw-anim-footer" style={tabBarStyle}>
        {TAB_ITEMS.map(t => (
          <button key={t.key} className={`cw-tab-item${t.key === 'home' ? ' active' : ''}`} style={tabItemStyle(t.key === 'home')} onClick={() => onTabChange(t.key)}>
            {t.icon}
            <span style={{ fontSize: 10, marginTop: 3, fontWeight: t.key === 'home' ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Recent message card ───────────────────────────────────────────────────────

function RecentMessage({ session, onSelect, clientLogo = null }) {
  const lastMsg  = session.messages.filter(m => m.text).at(-1)
  const preview  = lastMsg?.text ?? '...'
  const name     = session.agent?.name ?? lastMsg?.senderName ?? 'Botsy AI'
  const avatar   = session.agent?.avatar ?? null
  const unread   = !!session.unread

  return (
    <button className="cw-home-recent" style={recentCardStyle} onClick={onSelect}>
      <p style={recentLabelStyle}>Sesión en curso</p>
      <div style={recentRowStyle}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={recentAvatarWrapStyle}>
            {avatar
              ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : clientLogo
                ? <img src={clientLogo} alt="" style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
                : <BotmakerLogo size={20} />
            }
          </div>
          <span style={{ position: 'absolute', bottom: -2, right: -2, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={recentNameStyle}>{name}</span>
            <span style={recentTimeStyle}>{session.timestamp}</span>
          </div>
          <div style={recentPreviewStyle}>{preview}</div>
        </div>
        <span style={recentDotStyle} />
      </div>
    </button>
  )
}

const recentCardStyle = {
  width: '100%',
  background: '#fff',
  border: '1.5px solid #e5e7eb',
  borderRadius: 12,
  padding: '12px 14px',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'var(--cw-font-family)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  transition: 'background 150ms, border-color 150ms',
}
const recentLabelStyle = {
  margin: '0 0 8px',
  fontSize: 11,
  fontWeight: 600,
  color: '#9ca3af',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}
const recentRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}
const recentAvatarWrapStyle = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: '#f3f4f6',
  border: '1.5px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
}
const recentNameStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#111827',
}
const recentTimeStyle = {
  fontSize: 11,
  color: '#9ca3af',
  flexShrink: 0,
  marginLeft: 8,
}
const recentPreviewStyle = {
  fontSize: 12,
  color: '#6b7280',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
const recentDotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#ef4444',
  flexShrink: 0,
  marginLeft: 6,
}

// ── Tab bar ──────────────────────────────────────────────────────────────────

const TAB_ITEMS = [
  { key: 'home',     label: 'Inicio',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'messages', label: 'Chats', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'help',     label: 'Ayuda',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: 'agents',   label: 'Mis Agentes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

// ── Íconos ───────────────────────────────────────────────────────────────────

function UserAvatarIcon({ initial }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: 'rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#9ca3af' }}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ArticleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#d1d5db', flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ChevronIcon({ color = '#9ca3af' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color, flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ContractIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: '#fff',
}

const heroStyle = {
  position: 'relative',
  padding: '16px 16px 40px',
  flexShrink: 0,
  overflow: 'hidden',
}

const heroBgStyle = {
  position: 'absolute',
  inset: '-10px',
  backgroundImage: 'url(/hero-bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(12px)',
  transform: 'scale(1.08)',
}

const heroOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(10, 20, 40, 0.55)',
}

const topRowStyle = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
}

const avatarsStyle = {
  display: 'flex',
  alignItems: 'center',
}

const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  objectFit: 'cover',
}

const heroBtnStyle = {
  width: 30,
  height: 30,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.12)',
  color: '#e5e7eb',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 120ms',
}

const loginBtnStyle = {
  height: 28,
  padding: '0 4px',
  border: 'none',
  background: 'transparent',
  color: '#fff',
  fontSize: 12, fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  whiteSpace: 'nowrap',
  transition: 'background 150ms',
}

const userChipStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  height: 28, padding: '0 10px 0 6px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.15)',
  border: '1.5px solid rgba(255,255,255,0.25)',
}

const userChipNameStyle = {
  fontSize: 12, fontWeight: 600,
  color: '#fff',
  fontFamily: 'var(--cw-font-family)',
}

const heroTextStyle = {
  position: 'relative',
  zIndex: 1,
  paddingTop: 4,
}

const greetingStyle = {
  margin: 0,
  fontSize: 14,
  color: 'rgba(255,255,255,0.6)',
  marginBottom: 4,
}

const headingStyle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  color: '#ffffff',
  lineHeight: 1.3,
}

const bodyStyle = {
  flex: 1,
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: '#e5e7eb transparent',
}

const sectionStyle = {
  padding: '16px 14px 0',
}

const chatCardStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  transition: 'background 150ms, border-color 150ms',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}

const onlineBadgeStyle = {
  position: 'absolute',
  bottom: 2, right: 0,
  width: 10, height: 10,
  borderRadius: '50%',
  background: '#22c55e',
  border: '2px solid #fff',
}

const cardIconStyle = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const faqSectionStyle = {
  margin: '12px 14px 0',
}

const faqTitleStyle = {
  margin: '0 0 8px',
  fontSize: 11,
  fontWeight: 600,
  color: '#9ca3af',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

const faqUnifiedStyle = {
  background: '#fff',
  borderRadius: 12,
  overflow: 'hidden',
  border: '1.5px solid #e5e7eb',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  padding: 8,
}

const searchWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  background: '#f4f6f8',
  borderRadius: 8,
  marginBottom: 4,
}

const searchInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 14,
  fontWeight: 600,
  color: '#111827',
  fontFamily: 'var(--cw-font-family)',
}

const clearBtnStyle = {
  border: 'none',
  background: 'transparent',
  color: '#9ca3af',
  cursor: 'pointer',
  fontSize: 18,
  lineHeight: 1,
  padding: 0,
}

const articlesWrapStyle = {
}

const emptyStyle = {
  padding: '16px 14px',
  fontSize: 13,
  color: '#9ca3af',
}

const faqRowStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 14px',
  border: 'none',
  borderRadius: 8,
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  transition: 'background 120ms',
}

const tabBarStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  padding: '8px 0 12px',
  borderTop: '1px solid #f3f4f6',
  flexShrink: 0,
}

const tabItemStyle = (active) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  border: 'none',
  background: 'transparent',
  color: active ? 'var(--cw-primary)' : '#9ca3af',
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  padding: '4px 12px',
})
