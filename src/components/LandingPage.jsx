import { useState, useMemo, useRef, useEffect } from 'react'
import { CLIENTS, CATEGORIES } from '../config/clients'
import { BotmakerLogo } from './BotmakerLogo'
import { useRecentClients, timeAgo } from '../hooks/useRecentClients'

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function interpolate(text, variables = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '')
}

function ClientLogo({ name, logo, color }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const [r, g, b] = hexToRgb(color)

  if (logo && !failed) {
    return (
      <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
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
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 99, background: '#f3f4f6', color: '#111827',
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
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

function ClientCard({ client, onSelect, animStyle }) {
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
        display: 'flex', flexDirection: 'column', gap: 12,
        ...animStyle,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, minHeight: 44 }}>
        <ClientLogo name={client.name} logo={client.logo} color={client.primaryColor} />
        <CategoryBadge category={client.category} />
      </div>

      <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.45, flex: 1 }}>{client.tagline}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginTop: 'auto', borderTop: '1px solid #f3f4f6' }}>
        <AgentDot count={client.agentsAvailable} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 13, fontWeight: 600, color: client.primaryColor,
          opacity: hovered ? 1 : 0.7, transition: 'opacity 160ms',
        }}>
          Abrir chat
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

function MiniAvatar({ name, logo, color, size = 30 }) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setFailed(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'contain', background: '#fff',
          border: '1px solid #f1f5f9', padding: 3, boxSizing: 'border-box',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.38, fontWeight: 800, color: '#fff' }}>{initials}</span>
    </div>
  )
}

function RecentClientCard({ client, onSelect, userName }) {
  const [hovered, setHovered] = useState(false)
  const rawMessage = interpolate(client.config?.welcomeMessage || client.tagline || '', { nombre: userName })
  const lastMessage = rawMessage.length > 30 ? `${rawMessage.slice(0, 30).trimEnd()}…` : rawMessage

  return (
    <div
      onClick={() => onSelect(client)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '0 0 240px', scrollSnapAlign: 'start',
        background: '#fff',
        border: `1.5px solid ${hovered ? client.primaryColor : '#e5e7eb'}`,
        borderRadius: 12, padding: '10px 12px',
        cursor: 'pointer',
        transition: 'border-color 160ms, box-shadow 160ms, transform 160ms',
        boxShadow: hovered ? '0 6px 18px rgba(15,23,42,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <MiniAvatar name={client.name} logo={client.logo} color={client.primaryColor} size={38} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {client.name}
          </span>
          <span style={{ fontSize: 10.5, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {timeAgo(client.lastChatAt)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#94a3b8' }}>
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 12.5, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lastMessage}
          </span>
        </div>
      </div>
    </div>
  )
}

function WidgetPreview() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 22,
      boxShadow: '0 40px 100px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)',
      width: 340,
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.06)',
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#F59E0B',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>🛒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Mercado Libre</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>Soporte de compras</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 0 2px rgba(74,222,128,0.3)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Online</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        padding: '16px 14px 12px',
        background: '#f8fafc',
        minHeight: 260,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Bot bubble */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#F59E0B', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>🤖</div>
          <div style={{
            background: '#fff', borderRadius: '14px 14px 14px 2px',
            padding: '9px 12px', fontSize: 12.5, color: '#1f2937',
            maxWidth: 200, lineHeight: 1.5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
          }}>
            ¡Hola! Soy el asistente de Mercado Libre. ¿Con qué puedo ayudarte hoy?
          </div>
        </div>

        {/* Quick replies */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 34 }}>
          {['Rastrear compra', 'Devolución', 'Problema con pago'].map(label => (
            <button key={label} style={{
              padding: '5px 10px', borderRadius: 99,
              border: '1.5px solid #F59E0B',
              background: '#fff', color: '#92400e',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}>{label}</button>
          ))}
        </div>

        {/* User bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            background: '#F59E0B', borderRadius: '14px 14px 2px 14px',
            padding: '9px 12px', fontSize: 12.5, color: '#fff',
            maxWidth: 180, lineHeight: 1.5,
          }}>
            Mi pedido no llegó todavía 😟
          </div>
        </div>

        {/* Typing indicator */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#F59E0B', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>🤖</div>
          <div style={{
            background: '#fff', borderRadius: '14px 14px 14px 2px',
            padding: '11px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
            display: 'flex', gap: 4, alignItems: 'center',
          }}>
            {[0, 0.18, 0.36].map((delay, i) => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#d1d5db',
                display: 'inline-block',
                animation: `lp-bounce 1.2s ${delay}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #e5e7eb',
        background: '#fff',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 12.5, color: '#9ca3af', flex: 1 }}>Escribí tu consulta...</span>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: '#F59E0B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Powered by */}
      <div style={{ padding: '5px 12px 8px', textAlign: 'center', background: '#fff' }}>
        <span style={{ fontSize: 10, color: '#d1d5db' }}>Powered by </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.01em' }}>Botmaker</span>
      </div>
    </div>
  )
}

const OTHER_PLATFORMS = ['Zendesk', 'Genesys', 'Clientgo', 'Salesforce', 'Freshdesk', 'Intercom', 'Otra']

function IntegrationModal({ onClose }) {
  const [tab, setTab] = useState(null) // null | 'botmaker' | 'other'
  const [form, setForm] = useState({ name: '', email: '', company: '', platform: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          width: '100%', maxWidth: 640,
          boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* Modal header */}
        {tab !== 'other' && (
          <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Integrá OpenCentral
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                Elegí cómo querés empezar según tu plataforma actual.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, lineHeight: 1 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        <div style={{ padding: 28 }}>
          {/* Option cards */}
          {!tab && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Botmaker */}
              <button
                onClick={() => setTab('botmaker')}
                style={{
                  background: '#f0f7ff', border: '2px solid #bfdbfe',
                  borderRadius: 14, padding: '24px 20px',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: 'border-color 150ms, background 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#e0f0ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.background = '#f0f7ff' }}
              >
                <div style={{ marginBottom: 12 }}><BotmakerLogo size={36} /></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Soy cliente de Botmaker</div>
                <div style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, marginBottom: 8 }}>Integración en 2 clicks</div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                  OpenCentral ya está disponible como integración nativa dentro de la plataforma. Activalo desde tu cuenta sin tocar código.
                </div>
                <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#2563eb' }}>
                  Ir a Botmaker
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {/* Other platforms */}
              <button
                onClick={() => setTab('other')}
                style={{
                  background: '#f8fafc', border: '2px solid #e2e8f0',
                  borderRadius: 14, padding: '24px 20px',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: 'border-color 150ms, background 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f1f5f9' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
              >
                {/* Stacked platform logos */}
                <div style={{ display: 'flex', marginBottom: 14 }}>
                  {[
                    {
                      bg: '#03363D',
                      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12.914 2.904V16.29L24 2.905H12.914zM0 2.906C0 5.966 2.483 8.45 5.543 8.45s5.542-2.484 5.543-5.544H0zm11.086 4.807L0 21.096h11.086V7.713zm7.37 7.84c-3.063 0-5.542 2.48-5.542 5.543H24c0-3.06-2.48-5.543-5.543-5.543z"/></svg>
                    },
                    {
                      bg: '#1F8DED',
                      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.658 1.343 3 3 3h18c1.658 0 3-1.342 3-3V3c0-1.657-1.342-3-3-3zm-5.801 4.399c0-.44.36-.8.802-.8.44 0 .8.36.8.8v10.688c0 .442-.36.801-.8.801-.443 0-.802-.359-.802-.801V4.399zM11.2 3.994c0-.44.357-.799.8-.799s.8.359.8.799v11.602c0 .44-.357.8-.8.8s-.8-.36-.8-.8V3.994zm-4 .405c0-.44.359-.8.799-.8.443 0 .802.36.802.8v10.688c0 .442-.36.801-.802.801-.44 0-.799-.359-.799-.801V4.399zM3.199 6c0-.442.36-.8.802-.8.44 0 .799.358.799.8v7.195c0 .441-.359.8-.799.8-.443 0-.802-.36-.802-.8V6zM20.52 18.202c-.123.105-3.086 2.593-8.52 2.593-5.433 0-8.397-2.486-8.521-2.593-.335-.288-.375-.792-.086-1.128.285-.334.79-.375 1.125-.09.047.041 2.693 2.211 7.481 2.211 4.848 0 7.456-2.186 7.479-2.207.334-.289.839-.25 1.128.086.289.336.25.84-.086 1.128zm.281-5.007c0 .441-.36.8-.801.8-.441 0-.801-.36-.801-.8V6c0-.442.361-.8.801-.8.441 0 .801.357.801.8v7.195z"/></svg>
                    },
                    {
                      bg: '#FF7A59',
                      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z"/></svg>
                    },
                    {
                      bg: '#FF5100',
                      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.849 14.91c-.24 2.94-2.73 5.22-5.7 5.19h-3.15l-6 3.9v-3.9l6-3.9h3.15c.93.03 1.71-.66 1.83-1.59.18-3 .18-6-.06-9-.06-.84-.75-1.47-1.56-1.53-2.04-.09-4.2-.18-6.36-.18s-4.32.06-6.36.21c-.84.06-1.5.69-1.56 1.53-.21 3-.24 6-.06 9 .09.93.9 1.59 1.83 1.56h3.15v3.9h-3.15a5.644 5.644 0 01-5.7-5.19c-.21-3.21-.18-6.39.06-9.6a5.57 5.57 0 015.19-5.1c2.1-.15 4.35-.21 6.6-.21s4.5.06 6.63.24a5.57 5.57 0 015.19 5.1c.21 3.18.24 6.39.03 9.57z"/></svg>
                    },
                    {
                      bg: '#FF4F1F',
                      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 13H9v-2h4V9h-4V7h6v8z"/></svg>
                    },
                  ].map((p, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: p.bg,
                      border: '2.5px solid #f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: i,
                      flexShrink: 0,
                    }}>
                      {p.svg}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Uso otra plataforma</div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginBottom: 10 }}>
                  Compatible con Zendesk, Genesys, Clientgo, Salesforce y más. Anotate en la whitelist y te contactamos.
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Zendesk', 'Genesys', 'Clientgo', 'Freshdesk', 'Intercom', '+más'].map(p => (
                    <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#e2e8f0', color: '#475569' }}>{p}</span>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Unirme a la whitelist
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Botmaker flow */}
          {tab === 'botmaker' && (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Integración nativa en Botmaker</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
                Desde tu cuenta de Botmaker, andá a <strong>Integraciones → OpenCentral</strong> y activalo en dos clicks. Sin código, sin configuración manual.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => setTab(null)}
                  style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}
                >
                  Volver
                </button>
                <button
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Ir a Botmaker →
                </button>
              </div>
            </div>
          )}

          {/* Other platforms form */}
          {tab === 'other' && !submitted && (
            <div>
              <button
                onClick={() => setTab(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748b', fontFamily: 'inherit', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Volver
              </button>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Unirme a la whitelist</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Te contactamos para coordinar la integración con tu plataforma.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Nombre</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tu nombre"
                      style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
                    <input
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="tu@empresa.com"
                      type="email"
                      style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Empresa</label>
                  <input
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nombre de tu empresa"
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>¿Qué plataforma usás?</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {OTHER_PLATFORMS.map(p => (
                      <button
                        key={p}
                        onClick={() => setForm(f => ({ ...f, platform: p }))}
                        style={{
                          padding: '6px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                          border: `1.5px solid ${form.platform === p ? '#3b82f6' : '#e2e8f0'}`,
                          background: form.platform === p ? '#eff6ff' : '#fff',
                          color: form.platform === p ? '#2563eb' : '#374151',
                          transition: 'all 120ms',
                        }}
                      >{p}</button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { if (form.name && form.email && form.company) setSubmitted(true) }}
                  style={{
                    marginTop: 4,
                    background: form.name && form.email && form.company ? '#0f172a' : '#e2e8f0',
                    color: form.name && form.email && form.company ? '#fff' : '#94a3b8',
                    border: 'none', borderRadius: 10,
                    padding: '12px', fontSize: 14, fontWeight: 700,
                    cursor: form.name && form.email && form.company ? 'pointer' : 'default',
                    fontFamily: 'inherit', transition: 'background 150ms',
                  }}
                >
                  Unirme a la whitelist
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {tab === 'other' && submitted && (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>¡Estás en la lista!</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
                Te vamos a contactar a <strong>{form.email}</strong> en las próximas 48hs para coordinar la integración.
              </p>
              <button
                onClick={onClose}
                style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return inView
}

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'

const FEATURE_CHIPS = ['Agente IA', 'Chat en vivo', 'Voice Chat', 'Help Center', 'Handoff humano', 'Fuera de horario', 'Quick Replies', 'Adjuntos']

const LOGO_SHOWCASE = ['movistar', 'mercadolibre', 'sicredi', 'carrefour', 'toyota', 'despegar', 'naranjax', 'nestle']

const PROVIDER_COLORS = {
  google: '#4285F4',
  facebook: '#1877F2',
  email: '#6366f1',
  phone: '#0f172a',
}

function UserPill({ user, onLogout, onOpenProfile, isMobile }) {
  const [open, setOpen] = useState(false)
  const FONT_PILL = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'

  return (
    <div style={{ position: 'relative', animation: 'lp-fade-up-sm 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#f8fafc', border: '1.5px solid #e2e8f0',
          borderRadius: 999,
          padding: isMobile ? '2px 2px' : '3px 10px 3px 3px',
          cursor: 'pointer', fontFamily: FONT_PILL,
          transition: 'border-color 150ms, background 150ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
      >
        <img src="/avatar-santiago.jpg" alt="Santiago" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        {!isMobile && <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Santiago</span>}
        {!isMobile && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2, color: '#94a3b8', transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 199, background: isMobile ? 'rgba(0,0,0,0.3)' : 'transparent' }}
        />
      )}

      {open && (
        <div style={{
          ...(isMobile
            ? { position: 'fixed', left: 0, right: 0, bottom: 0, borderRadius: '20px 20px 0 0', animation: 'pill-sheet 0.3s cubic-bezier(0.16,1,0.3,1) both' }
            : { position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, borderRadius: 14, animation: 'lp-fade-up-sm 0.2s cubic-bezier(0.16,1,0.3,1) both' }
          ),
          background: '#fff',
          boxShadow: isMobile ? '0 -8px 40px rgba(0,0,0,0.15)' : '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 200, overflow: 'hidden',
          fontFamily: FONT_PILL,
        }}>
          <style>{`@keyframes pill-sheet { from { transform:translateY(100%) } to { transform:translateY(0) } }`}</style>

          {/* Drag handle — mobile only */}
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb' }} />
            </div>
          )}

          {/* User info */}
          <div style={{ padding: isMobile ? '12px 20px 14px' : '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/avatar-santiago.jpg" alt="Santiago" style={{ width: isMobile ? 44 : 36, height: isMobile ? 44 : 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: isMobile ? 15 : 14, fontWeight: 700, color: '#0f172a' }}>Santiago</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>santiago.garbers@botmaker.io</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: isMobile ? '8px 12px 32px' : '6px' }}>
            <button
              onClick={() => { setOpen(false); onOpenProfile?.() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '14px 10px' : '9px 12px', border: 'none', background: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? 15 : 13, color: '#374151', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Datos del perfil
            </button>
            <div style={{ height: 1, background: '#f1f5f9', margin: isMobile ? '4px 0' : '4px 6px' }} />
            <button
              onClick={() => { setOpen(false); onLogout?.() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '14px 10px' : '9px 12px', border: 'none', background: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: isMobile ? 15 : 13, color: '#ef4444', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function LandingPage({ onSelectClient, onNavigate, loggedInUser, onLogout, onOpenProfile, onOpenLogin }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const companiesRef = useRef(null)
  const cardsInView = useInView(companiesRef)
  const recentClients = useRecentClients()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const filtered = useMemo(() => {
    return CLIENTS.filter(c => {
      const matchesCategory = activeCategory === 'Todos' || c.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  const showcaseClients = CLIENTS.filter(c => LOGO_SHOWCASE.includes(c.id))

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes lp-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes lp-slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-fade-up-sm {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-image-in {
          from { opacity: 0; transform: scale(0.975); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes lp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-delay: 0ms !important; }
        }
        .oc-cat-chip {
          padding: 7px 16px; border-radius: 99px; font-size: 13px;
          font-weight: 600; cursor: pointer; border: 1.5px solid #e5e7eb;
          background: #fff; color: #374151;
          transition: all 140ms ease; white-space: nowrap; font-family: inherit;
        }
        .oc-cat-chip:hover { border-color: #a5b4fc; background: #f5f3ff; color: #4338ca; }
        .oc-cat-chip.active { border-color: #4f46e5; background: #4f46e5; color: #fff; }
        .oc-search {
          width: 100%; border: none; outline: none;
          background: transparent; font-size: 15px; color: #111827; font-family: inherit;
        }
        .oc-search::placeholder { color: #9ca3af; }
        .oc-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .lp-recent-row { scrollbar-width: none; }
        .lp-recent-row::-webkit-scrollbar { display: none; }
        .lp-chip {
          padding: 6px 14px; border-radius: 99px; font-size: 12.5px;
          font-weight: 500; border: 1.5px solid #e2e8f0;
          background: #fff; color: #475569; cursor: default;
          white-space: nowrap;
        }
        .lp-chip.featured {
          background: #0f172a; color: #fff; border-color: #0f172a;
          font-weight: 600;
        }
        .lp-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #f59e0b; color: #0f172a;
          border: none; border-radius: 12px;
          padding: 11px 20px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: background 150ms, transform 150ms;
        }
        .lp-cta:hover { background: #d97706; transform: translateY(-1px); }
        @media (max-width: 860px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-preview-col { overflow: visible !important; margin-left: -80px !important; margin-right: -80px !important; }
          .lp-preview-col > div { max-width: none !important; width: calc(100vw + 160px) !important; }
          .oc-cards-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .lp-hero-section { padding: 48px 20px 40px !important; }
          .lp-preview-col { margin-left: 0 !important; margin-right: 0 !important; justify-content: center !important; order: -1; }
          .lp-preview-col > div { width: auto !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: (!isMobile && scrolled) ? '10px 24px' : '0',
        background: isMobile ? 'rgba(248,250,252,0.92)' : (scrolled ? 'transparent' : 'rgba(248,250,252,0.97)'),
        transition: `background 0.4s, padding 0.45s ${EASING}`,
        animation: `lp-slide-down 0.5s ${EASING} both`,
        pointerEvents: 'none',
      }}>
        <div style={{
          maxWidth: (!isMobile && scrolled) ? 1380 : 1480,
          margin: '0 auto',
          height: isMobile ? 56 : (scrolled ? 56 : 64),
          display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 40,
          padding: isMobile ? '0 16px' : (scrolled ? '0 20px' : '0 32px'),
          borderRadius: (!isMobile && scrolled) ? 999 : 0,
          background: isMobile ? 'transparent' : (scrolled ? 'rgba(248,250,252,0.88)' : 'transparent'),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: (!isMobile && scrolled)
            ? '0 2px 24px rgba(0,0,0,0.07), 0 0 0 1.5px rgba(0,0,0,0.05)'
            : 'none',
          transition: `max-width 0.45s ${EASING}, height 0.45s ${EASING}, border-radius 0.45s ${EASING}, background 0.35s, box-shadow 0.45s ${EASING}, padding 0.45s ${EASING}`,
          pointerEvents: 'all',
        }}>
          {/* Logo */}
          <img src="/opencentral-logo.png" alt="OpenCentral" style={{ height: isMobile ? 24 : 28, width: 'auto', flexShrink: 0 }} />

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>
            {loggedInUser ? (
              <UserPill user={loggedInUser} onLogout={onLogout} onOpenProfile={onOpenProfile} isMobile={isMobile} />
            ) : (
              <button onClick={onOpenLogin} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: isMobile ? 13 : 14, fontWeight: 500, color: '#374151',
                padding: isMobile ? '5px 10px' : '6px 14px', borderRadius: 8, fontFamily: 'inherit',
                transition: 'background 120ms', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >Iniciar sesión</button>
            )}
            {!isMobile && (
              <button style={{
                background: '#f59e0b', color: '#0f172a',
                border: 'none', borderRadius: scrolled ? 999 : 8,
                padding: scrolled ? '7px 18px' : '8px 18px',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: `background 120ms, border-radius 0.45s ${EASING}`,
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
                onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
                onClick={() => onNavigate?.('open-central')}
              >Quiero ser parte</button>
            )}
            {isMobile && (
              <button onClick={() => onNavigate?.('open-central')} style={{
                background: '#f59e0b', color: '#0f172a',
                border: 'none', borderRadius: 10,
                padding: '7px 14px',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>Unirse</button>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero-section" style={{ background: '#f8fafc', padding: isMobile ? '48px 0 0' : '80px 32px 72px', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div
          className="lp-hero-grid"
          style={{
            maxWidth: 1440, margin: '0 auto',
            display: 'grid', gridTemplateColumns: '1fr 1.7fr',
            gap: 48, alignItems: 'center',
          }}
        >
          {/* Left: text */}
          <div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(26px, 3.5vw, 42px)',
              fontWeight: 600,
              color: '#0f172a',
              margin: '0 0 16px',
              lineHeight: 1.1,
              maxWidth: isMobile ? '80%' : 'none',
              letterSpacing: '-0.035em',
              animation: `lp-fade-up 0.6s ${EASING} 0.18s both`,
            }}>
              Central de atención a clientes
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 15,
              color: '#64748b',
              margin: '0 0 28px',
              lineHeight: 1.65,
              maxWidth: 400,
              animation: `lp-fade-up 0.55s ${EASING} 0.29s both`,
            }}>
              Buscá la empresa, iniciá una conversación y hacé el seguimiento de tus consultas y reclamos.
            </p>

            {/* CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap', animation: `lp-fade-up-sm 0.5s ${EASING} 0.38s both` }}>
              <button
                className="lp-cta"
                onClick={() => companiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver empresas
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => onNavigate?.('integrations')}
                style={{
                background: '#fff', color: '#0f172a',
                border: '1.5px solid #e2e8f0', borderRadius: 12,
                padding: '11px 20px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 150ms, background 150ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
              >
                Cómo funciona
              </button>
            </div>

            {/* Store badges */}
            <div style={{ animation: `lp-fade-in 0.5s ${EASING} 0.48s both` }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 12 }}>
                DISPONIBLE EN STORES DE ANDROID Y IOS
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {/* App Store */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', borderRadius: 8,
                  padding: '7px 14px', cursor: 'pointer',
                  border: '1.5px solid #e2e8f0',
                }}>
                  <svg width="16" height="19" viewBox="0 0 20 24" fill="none">
                    <path d="M16.462 12.748c-.028-3.22 2.634-4.773 2.754-4.847-1.503-2.195-3.836-2.494-4.662-2.524-1.977-.2-3.872 1.17-4.875 1.17-1.003 0-2.544-1.143-4.189-1.113-2.148.033-4.14 1.254-5.244 3.17C-1.93 12.57.532 18.39 2.9 21.56c1.176 1.683 2.573 3.57 4.404 3.503 1.78-.072 2.447-1.142 4.593-1.142 2.147 0 2.764 1.142 4.642 1.107 1.907-.033 3.114-1.703 4.273-3.398 1.369-1.942 1.921-3.854 1.946-3.953-.043-.017-3.715-1.427-3.75-5.67l-.546.74z" fill="#0f172a"/>
                    <path d="M13.178 3.967C14.13 2.81 14.78 1.22 14.597 0c-1.533.063-3.42 1.026-4.406 2.154-.956 1.097-1.8 2.882-1.575 4.553 1.716.132 3.48-.876 4.562-2.74z" fill="#0f172a"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: 8, color: '#64748b', lineHeight: 1 }}>Disponible en</div>
                    <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>App Store</div>
                  </div>
                </div>

                {/* Google Play */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', borderRadius: 8,
                  padding: '7px 14px', cursor: 'pointer',
                  border: '1.5px solid #e2e8f0',
                }}>
                  <svg width="16" height="18" viewBox="0 0 20 22" fill="none">
                    <path d="M1.215.366C.898.7.71 1.21.71 1.87v18.26c0 .66.188 1.17.505 1.504l.08.077 10.23-10.23v-.24L1.295.289l-.08.077z" fill="url(#gp1)"/>
                    <path d="M14.94 14.82l-3.41-3.41v-.24l3.41-3.41.077.044 4.04 2.295c1.154.655 1.154 1.727 0 2.382l-4.04 2.295-.077.044z" fill="url(#gp2)"/>
                    <path d="M15.017 14.776L11.53 11.29.71 22.11c.38.402.998.452 1.698.05l12.609-7.384z" fill="url(#gp3)"/>
                    <path d="M15.017 7.804L2.408.42C1.708.018 1.09.068.71.47l10.82 10.82 3.487-3.487z" fill="url(#gp4)"/>
                    <defs>
                      <linearGradient id="gp1" x1="10.83" y1="1.57" x2="-3.9" y2="16.3" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00A0FF"/><stop offset="1" stopColor="#00AEFF"/>
                      </linearGradient>
                      <linearGradient id="gp2" x1="20.3" y1="11.29" x2="10.26" y2="11.29" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFD800"/><stop offset="1" stopColor="#FF8A00"/>
                      </linearGradient>
                      <linearGradient id="gp3" x1="12.86" y1="13.59" x2="-1.34" y2="27.79" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/>
                      </linearGradient>
                      <linearGradient id="gp4" x1="-1.69" y1="-2.54" x2="5.41" y2="4.56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#32A071"/><stop offset="1" stopColor="#2DA771"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <div style={{ fontSize: 8, color: '#64748b', lineHeight: 1 }}>Disponible en</div>
                    <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: multi-device mockup */}
          <div
            className="lp-preview-col"
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              position: 'relative', overflow: 'visible',
            }}
          >
            {isMobile ? (
              /* ── MOBILE: solo el phone mockup centrado ── */
              <div style={{
                position: 'relative',
                height: 340,
                overflow: 'hidden',
                animation: `lp-image-in 0.7s ${EASING} 0.15s both`,
              }}>
                <img
                  src="/openmobile.png"
                  alt="OpenWidget mobile"
                  style={{ height: 620, width: 'auto', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                  background: 'linear-gradient(to bottom, transparent, #f8fafc)',
                  pointerEvents: 'none',
                }} />
              </div>
            ) : (
              /* ── DESKTOP: phone izq + desktop sangra derecha ── */
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                animation: `lp-image-in 0.7s ${EASING} 0.15s both`,
              }}>
                <img
                  src="/openmobile.png"
                  alt="OpenWidget mobile"
                  style={{
                    height: 380, width: 'auto', flexShrink: 0, display: 'block',
                    animation: `lp-image-in 0.85s ${EASING} 0.3s both`,
                  }}
                />
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src="/opendesk.png"
                    alt="OpenWidget desktop"
                    style={{ height: 380, width: 'auto', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: '22%',
                    background: 'linear-gradient(to right, transparent, #f8fafc)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
                    background: 'linear-gradient(to bottom, transparent, #f8fafc)',
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── LOGOS STRIP ── */}
      <section style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: isMobile ? '16px 0' : '20px 32px',
        animation: `lp-fade-in 0.6s ${EASING} 0.62s both`,
        overflow: 'hidden',
      }}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', paddingLeft: 20 }}>USADO POR</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, overflowX: 'auto', paddingLeft: 20, paddingRight: 20, scrollbarWidth: 'none' }}>
              {showcaseClients.map(client => (
                <LogoItem key={client.id} client={client} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, padding: '0 32px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', whiteSpace: 'nowrap', flexShrink: 0 }}>
              USADO POR
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1, flexWrap: 'wrap' }}>
              {showcaseClients.map(client => (
                <LogoItem key={client.id} client={client} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── RECENTLY VIEWED ── */}
      {loggedInUser && recentClients.length > 0 && (
        <section style={{ padding: isMobile ? '28px 20px 0' : '36px 32px 0', animation: `lp-fade-up 0.55s ${EASING} both` }}>
          <div style={{
            maxWidth: 1440, margin: '0 auto',
            background: '#f1f5f9', borderRadius: 20,
            padding: isMobile ? '20px 16px' : '26px 28px',
          }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Sesiones recientes
              </h2>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
                Retomá la conversación donde la dejaste.
              </p>
            </div>
            <div className="lp-recent-row" style={{
              display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6,
              scrollSnapType: 'x proximity',
            }}>
              {recentClients.map(client => (
                <RecentClientCard key={client.id} client={client} onSelect={onSelectClient} userName={(loggedInUser?.name || '').split(' ')[0] || 'Santiago'} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COMPANIES SECTION ── */}
      <div ref={companiesRef} style={{ maxWidth: 1440, margin: '0 auto', padding: '52px 32px 80px' }}>
        {/* Section header */}
        <div style={{ marginBottom: 32, ...(cardsInView ? { animation: `lp-fade-up 0.55s ${EASING} both` } : { opacity: 0 }) }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Elegí una empresa y chateá
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Cada chat es una demo real del widget configurado para esa marca.
          </p>
        </div>

        {/* Search + filters row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', border: '1.5px solid #e2e8f0',
            borderRadius: 10, padding: '0 14px',
            flex: '1 1 220px', minWidth: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#94a3b8' }}>
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              className="oc-search"
              placeholder="Buscar empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '12px 0' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0, flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
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
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>
          {filtered.length} {filtered.length === 1 ? 'empresa' : 'empresas'}
          {activeCategory !== 'Todos' ? ` en ${activeCategory}` : ''}
          {search && ` para "${search}"`}
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <div className="oc-cards-grid">
            {filtered.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                onSelect={onSelectClient}
                animStyle={cardsInView
                  ? { animation: `lp-fade-up 0.5s ${EASING} ${Math.min(i * 48, 360)}ms both` }
                  : { opacity: 0 }
                }
              />
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

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 32px', textAlign: 'center', background: '#f8fafc' }}>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>Powered by </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>Botmaker Open Widget</span>
      </div>
    </div>
  )
}

function LogoItem({ client }) {
  const [failed, setFailed] = useState(false)
  if (!client.logo || failed) return null
  return (
    <img
      src={client.logo}
      alt={client.name}
      onError={() => setFailed(true)}
      style={{ height: 22, width: 'auto', maxWidth: 90, objectFit: 'contain', opacity: 0.55, filter: 'grayscale(1)' }}
    />
  )
}
