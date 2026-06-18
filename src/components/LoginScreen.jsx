import { useState } from 'react'

export function LoginScreen({ onLogin, onBack }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Ingresá un email válido.'); return }
    if (!password.trim()) { setError('Ingresá tu contraseña.'); return }
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    onLogin({ name, email: email.trim() })
  }

  const handleSocial = (provider) => {
    const names = { google: 'Usuario Google', facebook: 'Usuario Facebook' }
    const emails = { google: 'usuario@gmail.com', facebook: 'usuario@facebook.com' }
    onLogin({ name: names[provider], email: emails[provider], provider })
  }

  return (
    <div style={containerStyle}>
      <style>{`
        .cw-login-input:focus { border-color: var(--cw-primary) !important; outline: none; box-shadow: 0 0 0 3px rgba(var(--cw-primary-rgb, 37,99,235),0.10); }
        .cw-login-back:hover { background: rgba(255,255,255,0.22) !important; }
        .cw-social-btn:hover { background: #f3f4f6 !important; border-color: #d1d5db !important; }
        .cw-login-submit:hover { opacity: 0.88; }
        .cw-login-link:hover { text-decoration: underline; }
      `}</style>

      {/* Hero */}
      <div style={heroStyle}>
        <div style={heroBgStyle} />
        <div style={heroOverlayStyle} />
        <div style={heroTopStyle}>
          <button className="cw-login-back" style={backBtnStyle} onClick={onBack} aria-label="Volver">
            <BackIcon />
          </button>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={heroSubStyle}>Bienvenido</p>
          <h1 style={heroTitleStyle}>Iniciá sesión</h1>
        </div>
      </div>

      {/* Body */}
      <div style={bodyStyle}>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email</label>
            <input
              className="cw-login-input"
              style={inputStyle}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Contraseña</label>
              <button type="button" className="cw-login-link" style={forgotStyle}>¿Olvidaste tu contraseña?</button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="cw-login-input"
                style={{ ...inputStyle, width: '100%', paddingRight: 38, boxSizing: 'border-box' }}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={eyeBtnStyle}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <button className="cw-login-submit" type="submit" style={submitBtnStyle}>
            Ingresar
          </button>

          <p style={registerStyle}>
            ¿No tenés cuenta?{' '}
            <button type="button" className="cw-login-link" style={registerLinkStyle}>Registrate</button>
          </p>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>o continuá con</span>
          <div style={dividerLineStyle} />
        </div>

        {/* Social buttons */}
        <div style={socialGroupStyle}>
          <button className="cw-social-btn" style={socialBtnStyle} onClick={() => handleSocial('google')}>
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button className="cw-social-btn" style={socialBtnStyle} onClick={() => handleSocial('facebook')}>
            <FacebookIcon />
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  display: 'flex', flexDirection: 'column',
  height: '100%', background: '#fff',
}

const heroStyle = {
  position: 'relative',
  padding: '16px 16px 32px',
  flexShrink: 0, overflow: 'hidden',
}

const heroBgStyle = {
  position: 'absolute', inset: '-10px',
  backgroundImage: 'url(/hero-bg.jpg)',
  backgroundSize: 'cover', backgroundPosition: 'center',
  filter: 'blur(12px)', transform: 'scale(1.08)',
}

const heroOverlayStyle = {
  position: 'absolute', inset: 0,
  background: 'rgba(10, 20, 40, 0.55)',
}

const heroTopStyle = {
  position: 'relative', zIndex: 1, marginBottom: 14,
}

const backBtnStyle = {
  width: 30, height: 30, borderRadius: '50%',
  border: 'none', background: 'rgba(255,255,255,0.12)',
  color: '#e5e7eb', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 120ms',
}

const heroSubStyle = {
  margin: '0 0 4px', fontSize: 13,
  color: 'rgba(255,255,255,0.6)',
}

const heroTitleStyle = {
  margin: 0, fontSize: 22,
  fontWeight: 700, color: '#fff', lineHeight: 1.3,
}

const bodyStyle = {
  flex: 1, padding: '20px 18px 16px',
  overflowY: 'auto',
  display: 'flex', flexDirection: 'column', gap: 0,
}

const socialGroupStyle = {
  display: 'flex', flexDirection: 'row', gap: 10,
}

const socialBtnStyle = {
  flex: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 12px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10,
  background: '#fff',
  fontSize: 13, fontWeight: 600, color: '#111827',
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  transition: 'background 120ms, border-color 120ms',
}

const dividerStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  margin: '18px 0',
}

const dividerLineStyle = {
  flex: 1, height: 1, background: '#f3f4f6',
}

const dividerTextStyle = {
  fontSize: 11, color: '#9ca3af', fontWeight: 500,
  whiteSpace: 'nowrap',
  fontFamily: 'var(--cw-font-family)',
}

const formStyle = {
  display: 'flex', flexDirection: 'column', gap: 14,
}

const fieldStyle = {
  display: 'flex', flexDirection: 'column', gap: 5,
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: '#374151',
  fontFamily: 'var(--cw-font-family)',
}

const inputStyle = {
  padding: '9px 12px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 9,
  fontSize: 13, color: '#111827',
  background: '#fff',
  fontFamily: 'var(--cw-font-family)',
  transition: 'border-color 150ms, box-shadow 150ms',
}

const eyeBtnStyle = {
  position: 'absolute', right: 10, top: '50%',
  transform: 'translateY(-50%)',
  background: 'none', border: 'none',
  color: '#9ca3af', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 2,
}

const forgotStyle = {
  fontSize: 11, color: '#6b7280',
  background: 'none', border: 'none',
  cursor: 'pointer', padding: 0,
  fontFamily: 'var(--cw-font-family)',
}

const errorStyle = {
  margin: '0', fontSize: 12, color: '#ef4444',
  fontFamily: 'var(--cw-font-family)',
}

const submitBtnStyle = {
  padding: '11px',
  background: 'var(--cw-primary)',
  color: '#fff', border: 'none',
  borderRadius: 10,
  fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--cw-font-family)',
  transition: 'opacity 150ms',
}

const registerStyle = {
  margin: '4px 0 0', fontSize: 12,
  color: '#6b7280', textAlign: 'center',
  fontFamily: 'var(--cw-font-family)',
}

const registerLinkStyle = {
  background: 'none', border: 'none',
  color: 'var(--cw-primary)', fontWeight: 600,
  cursor: 'pointer', padding: 0, fontSize: 12,
  fontFamily: 'var(--cw-font-family)',
}
