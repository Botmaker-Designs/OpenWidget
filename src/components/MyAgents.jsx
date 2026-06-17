const AGENTS = [
  {
    id: 1,
    name: 'Camila Torres',
    role: 'Reclamos y disputas',
    avatar: 'https://i.pravatar.cc/160?img=47',
    status: 'online',
    specialty: ['Reembolsos', 'Devoluciones', 'Disputas de cobro'],
    rating: 4.9,
    cases: 312,
  },
  {
    id: 2,
    name: 'Martín Ruiz',
    role: 'Soporte técnico',
    avatar: 'https://i.pravatar.cc/160?img=11',
    status: 'online',
    specialty: ['Integraciones', 'Errores técnicos', 'APIs'],
    rating: 4.8,
    cases: 218,
  },
  {
    id: 3,
    name: 'Valentina Gómez',
    role: 'Facturación y pagos',
    avatar: 'https://i.pravatar.cc/160?img=44',
    status: 'busy',
    specialty: ['Cobros incorrectos', 'Planes', 'Facturas'],
    rating: 4.7,
    cases: 189,
  },
  {
    id: 4,
    name: 'Diego Fernández',
    role: 'Cuentas y accesos',
    avatar: 'https://i.pravatar.cc/160?img=15',
    status: 'offline',
    specialty: ['Recupero de cuenta', 'Permisos', 'Seguridad'],
    rating: 4.6,
    cases: 145,
  },
]

const STATUS_LABEL = { online: 'Disponible', busy: 'Ocupado', offline: 'Desconectado' }
const STATUS_COLOR = { online: '#22c55e', busy: '#f59e0b', offline: '#9ca3af' }

export function MyAgents({ onClose, isExpanded, onToggleExpand, onTabChange, onStartChat }) {
  return (
    <div style={containerStyle}>
      <style>{`
        .cw-agent-card:hover { background: #f9fafb !important; }
        .cw-agent-card:active { background: #f3f4f6 !important; }
        .cw-agent-btn:hover { background: var(--cw-primary) !important; color: #fff !important; }
      `}</style>

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <p style={headerTitleStyle}>Mis Agentes</p>
          <p style={headerSubStyle}>Tus representantes para reclamos</p>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button style={iconBtnStyle} onClick={onToggleExpand}>
            {isExpanded ? <ContractIcon /> : <ExpandIcon />}
          </button>
          <button style={iconBtnStyle} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={listStyle}>
        {AGENTS.map(agent => (
          <div key={agent.id} className="cw-agent-card" style={cardStyle}>
            <div style={cardTopStyle}>
              <div style={avatarWrapStyle}>
                <img src={agent.avatar} alt={agent.name} style={avatarStyle} />
                <span style={{ ...dotStyle, background: STATUS_COLOR[agent.status] }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={agentNameStyle}>{agent.name}</p>
                <p style={agentRoleStyle}>{agent.role}</p>
                <div style={statusRowStyle}>
                  <span style={{ ...statusDotStyle, background: STATUS_COLOR[agent.status] }} />
                  <span style={{ ...statusTextStyle, color: STATUS_COLOR[agent.status] }}>
                    {STATUS_LABEL[agent.status]}
                  </span>
                  <span style={separatorStyle}>·</span>
                  <span style={metaStyle}>⭐ {agent.rating}</span>
                  <span style={separatorStyle}>·</span>
                  <span style={metaStyle}>{agent.cases} casos</span>
                </div>
              </div>
            </div>

            <div style={tagsStyle}>
              {agent.specialty.map(s => (
                <span key={s} style={tagStyle}>{s}</span>
              ))}
            </div>

            <button
              className="cw-agent-btn"
              style={agentBtnStyle(agent.status === 'offline')}
              disabled={agent.status === 'offline'}
              onClick={() => onStartChat(agent)}
            >
              {agent.status === 'offline' ? 'No disponible' : 'Iniciar reclamo'}
            </button>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={tabBarStyle}>
        {TAB_ITEMS.map(t => (
          <button key={t.key} style={tabItemStyle(t.key === 'agents')} onClick={() => onTabChange(t.key)}>
            {t.icon}
            <span style={{ fontSize: 10, marginTop: 3, fontWeight: t.key === 'agents' ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Tab bar ──────────────────────────────────────────────────────────────────

const TAB_ITEMS = [
  { key: 'home',     label: 'Inicio',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'messages', label: 'Mensajes',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'help',     label: 'Ayuda',       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: 'agents',   label: 'Mis Agentes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

// ── Íconos ───────────────────────────────────────────────────────────────────

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
}
function ExpandIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function ContractIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const containerStyle = { display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 16px 12px',
  borderBottom: '1px solid #f3f4f6',
  flexShrink: 0,
}

const headerTitleStyle = { margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }
const headerSubStyle   = { margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }

const iconBtnStyle = {
  width: 30, height: 30, borderRadius: '50%',
  border: 'none', background: 'transparent',
  color: '#6b7280', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const listStyle = {
  flex: 1, overflowY: 'auto', padding: '12px 14px',
  display: 'flex', flexDirection: 'column', gap: 10,
  scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent',
}

const cardStyle = {
  background: '#fff',
  border: '1.5px solid #f0f1f3',
  borderRadius: 14,
  padding: '14px 14px 12px',
  transition: 'background 150ms',
}

const cardTopStyle = { display: 'flex', gap: 12, marginBottom: 10 }

const avatarWrapStyle = { position: 'relative', flexShrink: 0 }

const avatarStyle = {
  width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
}

const dotStyle = {
  position: 'absolute', bottom: 1, right: 1,
  width: 11, height: 11, borderRadius: '50%',
  border: '2px solid #fff',
}

const agentNameStyle  = { margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }
const agentRoleStyle  = { margin: '2px 0 6px', fontSize: 12, color: '#6b7280' }

const statusRowStyle  = { display: 'flex', alignItems: 'center', gap: 4 }
const statusDotStyle  = { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 }
const statusTextStyle = { fontSize: 11, fontWeight: 600 }
const separatorStyle  = { fontSize: 11, color: '#d1d5db' }
const metaStyle       = { fontSize: 11, color: '#9ca3af' }

const tagsStyle = { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }

const tagStyle = {
  fontSize: 11, color: '#374151',
  background: '#f3f4f6', borderRadius: 20,
  padding: '3px 9px',
}

const agentBtnStyle = (disabled) => ({
  width: '100%',
  padding: '9px 0',
  borderRadius: 10,
  border: '1.5px solid ' + (disabled ? '#e5e7eb' : 'var(--cw-primary)'),
  background: '#fff',
  color: disabled ? '#9ca3af' : 'var(--cw-primary)',
  fontSize: 13,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'var(--cw-font-family)',
  transition: 'background 150ms, color 150ms',
})

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
  padding: '4px 8px',
})
