import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChatWidget } from './components/ChatWidget'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatWidget
      config={{
        botName: 'Asistente Dev',
        primaryColor: '#2563eb',
        welcomeMessage: '¡Hola, {{nombre}}! ¿En qué puedo ayudarte hoy?',
        user: { nombre: 'Santiago' },
        quickReplies: [
          { label: 'Consultar mi pedido', value: 'order_status' },
          { label: 'Problemas con un pago', value: 'payment_issue' },
          { label: 'Hablar con un agente', value: 'human_handoff' },
        ],
      }}
    />
  </StrictMode>
)
