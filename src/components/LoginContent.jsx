import { useState, useRef, useEffect } from 'react'

const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'

export function BackButton({ onClick, label = 'Volver' }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748b', fontFamily: FONT, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {label}
    </button>
  )
}

const CODE_LENGTH = 6

export function OtpInput({ onComplete }) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
  const refs = useRef([])

  const focus = (i) => refs.current[i]?.focus()

  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < CODE_LENGTH - 1) focus(i + 1)
    if (next.every(d => d !== '')) onComplete(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; setDigits(next)
      } else if (i > 0) {
        focus(i - 1)
      }
    } else if (e.key === 'ArrowLeft' && i > 0) focus(i - 1)
    else if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) focus(i + 1)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    const next = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    focus(Math.min(pasted.length, CODE_LENGTH - 1))
    if (pasted.length === CODE_LENGTH) onComplete(pasted)
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          autoFocus={i === 0}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: 44, height: 52, textAlign: 'center',
            fontSize: 22, fontWeight: 700, fontFamily: FONT,
            border: `2px solid ${d ? '#0f172a' : '#e2e8f0'}`,
            borderRadius: 12, outline: 'none', color: '#0f172a',
            background: d ? '#f8fafc' : '#fff',
            transition: 'border-color 120ms, background 120ms',
            caretColor: 'transparent',
          }}
          onFocusCapture={e => { e.target.style.borderColor = '#3b82f6' }}
          onBlurCapture={e => { e.target.style.borderColor = d ? '#0f172a' : '#e2e8f0' }}
        />
      ))}
    </div>
  )
}

export function ResendButton({ onResend }) {
  const [seconds, setSeconds] = useState(30)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const handleResend = () => {
    setSeconds(30)
    onResend()
  }

  if (seconds > 0) {
    return (
      <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
        Reenviar código en <span style={{ fontWeight: 600, color: '#64748b' }}>{seconds}s</span>
      </p>
    )
  }

  return (
    <button
      onClick={handleResend}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: FONT, padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}
    >
      Reenviar SMS
    </button>
  )
}

export function PrimaryButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      style={{ background: disabled ? '#e2e8f0' : '#0f172a', color: disabled ? '#94a3b8' : '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', fontFamily: FONT, transition: 'background 150ms', width: '100%' }}
    >
      {children}
    </button>
  )
}

function QrGlyph({ size = 140 }) {
  const N = 21
  const cell = size / N
  let seed = 1337
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7)
  const modules = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isFinder(r, c)) continue
      if (rand() > 0.58) modules.push([r, c])
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="#fff" />
      {modules.map(([r, c], i) => (
        <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill="#0f172a" />
      ))}
      {[[0, 0], [0, N - 7], [N - 7, 0]].map(([fr, fc], i) => (
        <g key={i}>
          <rect x={fc * cell} y={fr * cell} width={7 * cell} height={7 * cell} fill="#0f172a" />
          <rect x={(fc + 1) * cell} y={(fr + 1) * cell} width={5 * cell} height={5 * cell} fill="#fff" />
          <rect x={(fc + 2) * cell} y={(fr + 2) * cell} width={3 * cell} height={3 * cell} fill="#0f172a" />
        </g>
      ))}
    </svg>
  )
}

function QrLoginPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        position: 'relative', width: 172, height: 172, borderRadius: 18,
        border: '1.5px solid #e2e8f0', padding: 10, background: '#fff', boxSizing: 'border-box',
      }}>
        <QrGlyph size={150} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 3px' }}>
          Escaneá con la App de Central
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
          Utilizá la cámara de tu celular para ingresar
        </p>
      </div>
    </div>
  )
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  )
}

export function LoginContent({ client, onLogin }) {
  const { name, logo, primaryColor = '#6366f1' } = client ?? { name: 'OpenWidget' }
  const [step, setStep] = useState('login')
  const [phone, setPhone] = useState('')
  const [otpKey, setOtpKey] = useState(0)

  const sendSms = () => setStep('phone-verify')
  const resendSms = () => setOtpKey(k => k + 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: FONT }}>
      {/* Brand header */}
      <div style={{ padding: '32px 24px 20px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
        {logo
          ? <img src={logo} alt={name} style={{ height: 36, width: 'auto', objectFit: 'contain', marginBottom: 16 }} />
          : <div style={{ width: 48, height: 48, borderRadius: 14, background: primaryColor, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{name[0]}</span>
            </div>
        }
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {step === 'phone-verify' ? 'Ingresá el código' : `Bienvenido a la atención al cliente de ${name}`}
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          {step === 'phone-verify'
            ? <>Te enviamos un SMS al <strong style={{ color: '#0f172a' }}>+54 {phone}</strong></>
            : <>Escaneá el código QR desde la app o ingresá con tu número.</>
          }
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: '24px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        {step === 'login' ? (
          <>
            <QrLoginPanel />

            <Divider label="o ingresá con tu número" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#475569', background: '#f8fafc', whiteSpace: 'nowrap' }}>🇦🇷 +54</div>
                <input
                  type="tel" placeholder="11 1234-5678"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && phone && sendSms()}
                  style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <PrimaryButton disabled={!phone} onClick={() => phone && sendSms()}>
                Continuar
              </PrimaryButton>
            </div>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5 }}>
              Al continuar aceptás los <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Términos de uso</span> y la <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Política de privacidad</span>.
            </p>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <BackButton onClick={() => setStep('login')} label="Cambiar número" />
            <OtpInput key={otpKey} onComplete={code => onLogin({ provider: 'phone', name: `+54 ${phone}`, phone, code })} />
            <div style={{ textAlign: 'center' }}>
              <ResendButton onResend={resendSms} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
