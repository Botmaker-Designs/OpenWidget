import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatWidget } from './components/ChatWidget'
import { DemoPanel } from './components/DemoPanel'
import { DesktopWidget } from './components/DesktopWidget'

const BASE_CONFIG = {
  botName: 'Botmaker',
  botSubtitle: 'Centro de atención',
  primaryColor: '#2563eb',
  welcomeMessage: '¡Hola, {{nombre}}! ¿En qué puedo ayudarte hoy?',
  user: { nombre: 'Santiago' },
  quickReplies: [
    { label: 'Consultar mi pedido', value: 'order_status' },
    { label: 'Problemas con un pago', value: 'payment_issue' },
    { label: 'Hablar con un agente', value: 'human_handoff' },
  ],
  chatCardVariant: 'team',
  businessHours: {
    schedule: {
      monday:    { open: '08:00', close: '18:00' },
      tuesday:   { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday:  { open: '08:00', close: '18:00' },
      friday:    { open: '08:00', close: '18:00' },
    },
  },
}

function App() {
  const [demoConfig, setDemoConfig] = useState({ chatCardVariant: 'team', demoActiveChat: 'none' })
  // 'closed' | 'loading' | 'transitioning' | 'open'
  const [desktopState, setDesktopState] = useState('closed')

  const handleChange = (patch) => setDemoConfig(prev => ({ ...prev, ...patch }))

  const openDesktop = () => {
    setDesktopState('loading')
    setTimeout(() => {
      setDesktopState('transitioning') // widget monta, spinner se desvanece encima
      setTimeout(() => setDesktopState('open'), 380) // spinner terminó
    }, 750)
  }

  const showSpinner = desktopState === 'loading' || desktopState === 'transitioning'
  const showWidget  = desktopState === 'transitioning' || desktopState === 'open'

  return (
    <>
      <DemoPanel config={demoConfig} onChange={handleChange} />
      <ChatWidget config={{ ...BASE_CONFIG, ...demoConfig }} />
      {showWidget && (
        <DesktopWidget
          config={{ ...BASE_CONFIG, ...demoConfig }}
          onClose={() => setDesktopState('closed')}
        />
      )}
      {showSpinner && <DesktopSpinner fading={desktopState === 'transitioning'} />}
      {desktopState === 'closed' && (
        <button style={desktopBtnStyle} onClick={openDesktop}>
          <MonitorIcon />
          Experiencia Desktop
        </button>
      )}
    </>
  )
}

function DesktopSpinner({ fading = false }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: fading ? 'dw-spinner-out 350ms ease forwards' : 'dw-spinner-in 150ms ease forwards' }}>
      <style>{`
        @keyframes dw-spin        { to   { transform: rotate(360deg); } }
        @keyframes dw-spinner-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dw-spinner-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#6b7280', animation: 'dw-spin 0.65s linear infinite' }} />
    </div>
  )
}

function MonitorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const desktopBtnStyle = {
  position: 'fixed',
  bottom: 24,
  left: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  padding: '10px 16px',
  background: '#111827',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  zIndex: 9997,
  transition: 'background 150ms, transform 150ms',
  letterSpacing: '-0.01em',
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
