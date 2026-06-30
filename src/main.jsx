import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DesktopWidget } from './components/DesktopWidget'
import { ChatWidget } from './components/ChatWidget'
import { LandingPage } from './components/LandingPage'
import { CLIENTS } from './config/clients'

const BASE_USER = { nombre: 'Santiago' }

// 'landing' | 'loading' | 'transitioning' | 'desktop'
function App() {
  const [view, setView] = useState('landing')
  const [activeClient, setActiveClient] = useState(null)

  // Estado separado para el widget de la landing
  const [widgetClient, setWidgetClient] = useState(null)
  const [widgetKey, setWidgetKey] = useState(0)

  const handleSelectClient = (client) => {
    setActiveClient(client)
    setView('loading')
    setTimeout(() => {
      setView('transitioning')
      setTimeout(() => setView('desktop'), 380)
    }, 750)
  }

  const handleClose = () => {
    setView('landing')
    setActiveClient(null)
  }

  const handleWidgetClientChange = (client) => {
    setWidgetClient(client)
  }

  const showSpinner = view === 'loading' || view === 'transitioning'
  const showDesktop = view === 'transitioning' || view === 'desktop'

  const widgetConfig = widgetClient
    ? { ...widgetClient.config, user: BASE_USER }
    : {}

  const clientSelector = {
    clients: CLIENTS,
    activeId: widgetClient?.id ?? null,
    onChange: handleWidgetClientChange,
  }

  return (
    <>
      {view === 'landing' && (
        <>
          <LandingPage onSelectClient={handleSelectClient} />
          <ChatWidget
            key={widgetKey}
            config={widgetConfig}
            clientSelector={clientSelector}
          />
        </>
      )}
      {showDesktop && (
        <DesktopWidget
          config={{ ...activeClient.config, user: BASE_USER }}
          onClose={handleClose}
        />
      )}
      {showSpinner && <DesktopSpinner fading={view === 'transitioning'} />}
    </>
  )
}

function DesktopSpinner({ fading = false }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: fading ? 'dw-spinner-out 350ms ease forwards' : 'dw-spinner-in 150ms ease forwards',
    }}>
      <style>{`
        @keyframes dw-spin        { to   { transform: rotate(360deg); } }
        @keyframes dw-spinner-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dw-spinner-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#6b7280', animation: 'dw-spin 0.65s linear infinite' }} />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
