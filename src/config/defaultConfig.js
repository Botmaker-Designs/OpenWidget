/**
 * Schema completo de configuración del widget.
 * El cliente B2B sobreescribe solo lo que necesita.
 *
 * Uso: <ChatWidget config={{ primaryColor: '#e11d48', botName: 'Asistente' }} />
 */
export const defaultConfig = {
  // Identidad del bot
  botName: 'Asistente',
  botAvatar: null,
  botSubtitle: 'El equipo también puede ayudar',

  // Colores (mapean a CSS variables --cw-*)
  primaryColor: '#2563eb',
  borderRadius: '16px',
  fontFamily: null, // null = hereda del sistema

  // Contenido inicial
  welcomeMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
  quickReplies: [
    { label: 'Consultar mi pedido', value: 'order_status' },
    { label: 'Problemas con un pago', value: 'payment_issue' },
    { label: 'Hablar con un agente', value: 'human_handoff' },
  ],

  // Fallback
  fallbackMessage: 'No pude resolver esto. ¿Querés que te conecte con alguien?',

  // Horario de atención
  businessHours: {
    timezone: 'America/Argentina/Buenos_Aires',
    schedule: {
      monday:    { open: '09:00', close: '18:00' },
      tuesday:   { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday:  { open: '09:00', close: '18:00' },
      friday:    { open: '09:00', close: '18:00' },
      saturday:  null,
      sunday:    null,
    },
  },

  // Endpoints
  apiEndpoint: null,
  offHoursEndpoint: null,

  // Posición del botón flotante
  position: 'bottom-right', // 'bottom-right' | 'bottom-left'

  // Variante de la card de chat en HomeScreen
  chatCardVariant: 'team', // 'team' | 'hours'
}
