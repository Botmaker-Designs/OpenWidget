import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatWidget } from './components/ChatWidget'
import { DemoPanel } from './components/DemoPanel'

const BASE_CONFIG = {
  botName: 'Asistente Dev',
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

  const handleChange = (patch) => setDemoConfig(prev => ({ ...prev, ...patch }))

  return (
    <>
      <DemoPanel config={demoConfig} onChange={handleChange} />
      <ChatWidget config={{ ...BASE_CONFIG, ...demoConfig }} />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
