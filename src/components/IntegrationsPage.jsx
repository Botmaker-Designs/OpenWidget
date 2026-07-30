import { useState } from 'react'

const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
const EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

const PLATFORMS = [
  { name: 'Zendesk', color: '#03363d', letter: 'Z' },
  { name: 'Salesforce', color: '#00a1e0', letter: 'S' },
  { name: 'Genesys', color: '#ff4f1f', letter: 'G' },
  { name: 'Freshdesk', color: '#28a745', letter: 'F' },
  { name: 'Intercom', color: '#1f8ded', letter: 'I' },
  { name: 'Clientgo', color: '#7c3aed', letter: 'C' },
]

const STEPS = [
  {
    n: '1',
    title: 'Configurás OpenCentral',
    desc: 'Creás tu cuenta, subís el logo y personalizás el widget para tu marca. Todo desde un panel sin código.',
  },
  {
    n: '2',
    title: 'Conectás tu plataforma',
    desc: 'Si usás Botmaker, la integración es nativa en 2 clicks. Para otros CRM, conectamos vía API o webhook.',
  },
  {
    n: '3',
    title: 'Recibís consultas',
    desc: 'Tus clientes te escriben desde OpenWidget y las conversaciones llegan directo a tu plataforma habitual.',
  },
]

export function IntegrationsPage({ onBack }) {
  const [whitelistOpen, setWhitelistOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', platform: '' })
  const [submitted, setSubmitted] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: FONT }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(248,250,252,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: 60,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#64748b',
            fontFamily: FONT, padding: '6px 10px 6px 6px',
            borderRadius: 8, transition: 'background 120ms, color 120ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>
        <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
        <img src="/opencentral-logo.png" alt="OpenCentral" style={{ height: 22, width: 'auto' }} />
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '64px 32px 96px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 64, animation: `integ-up 0.5s ${EASING} both` }}>
          <style>{`
            @keyframes integ-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '4px 12px', marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Integración disponible</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Integrá OpenCentral con<br />tu plataforma actual
          </h1>
          <p style={{ fontSize: 17, color: '#64748b', margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
            Conectamos con las principales soluciones de CRM y atención al cliente del mercado. Sin reemplazar lo que ya usás.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 72 }}>

          {/* Botmaker */}
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', border: '1.5px solid #bfdbfe', borderRadius: 24, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20, animation: `integ-up 0.5s ${EASING} 0.1s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 10, boxShadow: '0 2px 12px rgba(59,130,246,0.14)', flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#3b82f6" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '4px 12px', borderRadius: 999 }}>Integración nativa · 2 clicks</span>
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Soy cliente de Botmaker</h2>
              <p style={{ fontSize: 15, color: '#475569', margin: 0, lineHeight: 1.65 }}>
                OpenCentral ya está disponible como integración nativa dentro de la plataforma Botmaker. Activalo desde tu cuenta en segundos, sin tocar código y sin configuración manual.
              </p>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Sin código ni configuración manual', 'Conversaciones en tu inbox de Botmaker', 'Widget personalizado por empresa'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" fill="#dbeafe"/>
                    <path d="M8 12l3 3 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="https://botmaker.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 'auto',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#2563eb', color: '#fff',
                borderRadius: 12, padding: '12px 22px',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                width: 'fit-content', transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
            >
              Ir a Botmaker
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>

          {/* Other platforms */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 24, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20, animation: `integ-up 0.5s ${EASING} 0.2s both` }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <div key={p.name} title={p.name} style={{ width: 36, height: 36, borderRadius: 10, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{p.letter}</span>
                </div>
              ))}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Uso otra plataforma</h2>
              <p style={{ fontSize: 15, color: '#475569', margin: '0 0 16px', lineHeight: 1.65 }}>
                Compatible con Zendesk, Genesys, Salesforce, Freshdesk, Intercom, Clientgo y más. Conectamos vía API y te acompañamos en el setup.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Zendesk', 'Genesys', 'Clientgo', 'Salesforce', 'Freshdesk', 'Intercom', '+más'].map(tag => (
                  <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Integración vía API o webhook', 'Setup asistido por nuestro equipo', 'Soporte técnico durante el proceso'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" fill="#f1f5f9"/>
                    <path d="M8 12l3 3 5-5" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setWhitelistOpen(true)}
              style={{
                marginTop: 'auto',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#0f172a', color: '#fff',
                borderRadius: 12, padding: '12px 22px',
                fontSize: 14, fontWeight: 700, border: 'none',
                cursor: 'pointer', fontFamily: FONT,
                width: 'fit-content', transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
            >
              Unirme a la whitelist
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* How it works */}
        <div style={{ animation: `integ-up 0.5s ${EASING} 0.3s both` }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Cómo funciona</h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>Del setup a tu primer conversación en minutos.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', animation: `integ-up 0.5s ${EASING} ${0.35 + i * 0.08}s both` }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{step.n}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Whitelist modal */}
      {whitelistOpen && (
        <div
          onClick={() => setWhitelistOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: FONT }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {!submitted ? (
              <div style={{ padding: '32px 28px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Unirme a la whitelist</h2>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>Te contactamos para coordinar la integración con tu plataforma.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'name', label: 'Tu nombre', type: 'text', placeholder: 'Juan García' },
                    { key: 'email', label: 'Email', type: 'email', placeholder: 'juan@empresa.com' },
                    { key: 'company', label: 'Empresa', type: 'text', placeholder: 'Empresa S.A.' },
                    { key: 'platform', label: 'Plataforma que usás', type: 'text', placeholder: 'Zendesk, Genesys, otra...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  ))}
                  <button
                    disabled={!form.name || !form.email || !form.company}
                    onClick={() => setSubmitted(true)}
                    style={{
                      marginTop: 4,
                      background: form.name && form.email && form.company ? '#0f172a' : '#e2e8f0',
                      color: form.name && form.email && form.company ? '#fff' : '#94a3b8',
                      border: 'none', borderRadius: 10, padding: '12px',
                      fontSize: 14, fontWeight: 700, cursor: form.name && form.email && form.company ? 'pointer' : 'default',
                      fontFamily: FONT, width: '100%',
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '48px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>¡Estás en la lista!</h3>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>Te vamos a contactar a <strong>{form.email}</strong> en las próximas 48hs.</p>
                <button
                  onClick={() => { setWhitelistOpen(false); setSubmitted(false) }}
                  style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
