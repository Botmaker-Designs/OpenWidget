import { useState } from 'react'
import { HELP_COLLECTIONS } from '../config/helpContent'

export function HelpCenter({ onClose, isExpanded, onToggleExpand, onTabChange }) {
  const [query, setQuery]         = useState('')
  const [collection, setCollection] = useState(null) // colección abierta
  const [article, setArticle]     = useState(null)   // artículo abierto

  const filtered = HELP_COLLECTIONS.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.items.some(a => a.title.toLowerCase().includes(query.toLowerCase()))
  )

  const title    = article ? article.title : collection ? collection.title : 'Ayuda'
  const onBack   = article ? () => setArticle(null) : collection ? () => setCollection(null) : null

  return (
    <HelpShell
      title={title}
      onBack={onBack}
      onClose={onClose}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      onTabChange={onTabChange}
    >
      {article ? (
        <ArticleView article={article} collection={collection} />
      ) : collection ? (
        <div style={{ padding: '8px 0', background: '#fff' }}>
          <p style={{ padding: '0 16px 12px', fontSize: 13, color: '#6b7280' }}>{collection.description}</p>
          {collection.items.map(item => (
            <ArticleRow key={item.id} article={item} onClick={() => setArticle(item)} />
          ))}
        </div>
      ) : (
        <>
          <div style={searchWrapStyle}>
            <SearchIcon />
            <input
              style={searchInputStyle}
              placeholder="Buscar ayuda"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={clearBtnStyle} onClick={() => setQuery('')}>×</button>}
          </div>
          <div style={{ padding: '4px 0', background: '#fff' }}>
            {!query && <div style={sectionLabelStyle}>{HELP_COLLECTIONS.length} colecciones</div>}
            {filtered.length === 0 ? (
              <div style={emptyStyle}>No se encontraron resultados para "{query}"</div>
            ) : query ? (
              filtered.flatMap(c => c.items.filter(a => a.title.toLowerCase().includes(query.toLowerCase())).map(a => (
                <ArticleRow key={a.id} article={a} onClick={() => { setCollection(c); setArticle(a) }} />
              )))
            ) : (
              filtered.map(c => <CollectionRow key={c.id} collection={c} onClick={() => setCollection(c)} />)
            )}
          </div>
        </>
      )}
    </HelpShell>
  )
}

// ── Shell reutilizable ──────────────────────────────────────────────────────

function HelpShell({ title, onBack, onClose, isExpanded, onToggleExpand, onTabChange, children }) {
  return (
    <div style={shellStyle}>
      <div style={headerStyle}>
        {onBack && (
          <button style={{ ...iconBtnStyle, position: 'absolute', left: 14 }} onClick={onBack} aria-label="Volver">
            <BackIcon />
          </button>
        )}
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</span>
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 2 }}>
          <button style={iconBtnStyle} onClick={onToggleExpand} aria-label={isExpanded ? 'Contraer' : 'Expandir'}>
            {isExpanded ? <ContractIcon /> : <ExpandIcon />}
          </button>
          <button style={iconBtnStyle} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
        {children}
      </div>

      <div style={tabBarStyle}>
        {TAB_ITEMS.map(t => (
          <button key={t.key} style={tabItemStyle(t.key === 'help')} onClick={() => onTabChange?.(t.key)}>
            {t.icon}
            <span style={{ fontSize: 10, marginTop: 3, fontWeight: t.key === 'help' ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const TAB_ITEMS = [
  { key: 'home',     label: 'Inicio',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'messages', label: 'Mensajes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'help',     label: 'Ayuda',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: 'agents',   label: 'Mis Agentes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

// ── Filas ────────────────────────────────────────────────────────────────────

function CollectionRow({ collection, onClick }) {
  return (
    <>
      <style>{`
        .cw-help-row:hover { background: #f9fafb !important; }
      `}</style>
      <button className="cw-help-row" style={rowStyle} onClick={onClick}>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 2 }}>{collection.title}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{collection.articles} artículos</div>
        </div>
        <ChevronIcon />
      </button>
    </>
  )
}

function ArticleRow({ article, onClick }) {
  return (
    <button className="cw-help-row" style={rowStyle} onClick={onClick}>
      <ArticleIcon />
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontSize: 14, color: '#111827', marginBottom: 1 }}>{article.title}</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{article.mins} min de lectura</div>
      </div>
      <ChevronIcon />
    </button>
  )
}

function ArticleView({ article, collection }) {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
        {collection?.title} · {article.mins} min de lectura
      </div>
      <div style={articlePlaceholderStyle}>
        <ArticleIcon size={32} />
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
          El contenido completo de este artículo estará disponible cuando se integre con el Help Center de Botmaker.
        </p>
      </div>
    </div>
  )
}

// ── Íconos ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#9ca3af' }}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#d1d5db', flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
function ArticleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color: '#d1d5db', flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const shellStyle = {
  display: 'flex', flexDirection: 'column', height: '100%',
}
const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '14px 16px',
  borderBottom: '1px solid #f3f4f6',
  position: 'relative',
  flexShrink: 0,
}
const iconBtnStyle = {
  width: 30, height: 30, borderRadius: '50%',
  border: 'none', background: 'transparent',
  color: '#6b7280', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 120ms',
}
const searchWrapStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  margin: '12px 12px 4px',
  padding: '9px 12px',
  background: '#f9fafb',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
}
const searchInputStyle = {
  flex: 1, border: 'none', outline: 'none',
  background: 'transparent',
  fontSize: 14, color: '#111827',
  fontFamily: 'var(--cw-font-family)',
}
const clearBtnStyle = {
  border: 'none', background: 'transparent',
  color: '#9ca3af', cursor: 'pointer',
  fontSize: 18, lineHeight: 1, padding: 0,
}
const sectionLabelStyle = {
  padding: '12px 16px 6px',
  fontSize: 12, fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.04em',
}
const rowStyle = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
  padding: '18px 16px',
  border: 'none', borderBottom: '1px solid #f3f4f6',
  cursor: 'pointer',
  background: '#ffffff',
}
const emptyStyle = {
  padding: '32px 16px', textAlign: 'center',
  fontSize: 13, color: '#9ca3af',
}
const tabBarStyle = {
  display: 'flex', justifyContent: 'space-around',
  padding: '8px 0 12px',
  borderTop: '1px solid #f3f4f6',
  flexShrink: 0,
}
const tabItemStyle = (active) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  border: 'none', background: 'transparent',
  color: active ? 'var(--cw-primary)' : '#9ca3af',
  cursor: 'pointer', fontFamily: 'var(--cw-font-family)',
  padding: '4px 12px',
})
const articlePlaceholderStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '40px 24px',
  background: '#f9fafb', borderRadius: 12,
}
