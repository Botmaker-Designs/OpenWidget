# Chatbot Widget — Context

## ¿Qué es esto?

Un widget de atención al cliente embebible en cualquier página web, construido en React y distribuido como solución B2B. Los clientes (bancos, fintechs, ecommerce, telefonía) lo integran en sus propios sitios para dar soporte a sus usuarios finales.

El widget vive como un floating button en la esquina inferior de la pantalla y se expande en un panel de chat.

---

## Problema que resuelve

La solución actual responde texto plano con una IA sin dinamismo. Los usuarios finales se encuentran con:

- Respuestas que no pueden resolver su problema y no tienen camino de salida claro
- Sin posibilidad de escalar a un humano de forma fluida
- Sin contexto: el bot no sabe quién sos ni en qué página estás
- Sin opciones interactivas: todo es texto, sin botones ni formularios
- Fuera de horario, la experiencia simplemente falla sin alternativa

El nuevo widget apunta a resolver cada uno de estos puntos.

---

## Usuarios

### Usuario final (end user)
El cliente del cliente B2B. Puede ser un consumidor intentando resolver un problema (compra, pago, cuenta) o un usuario ya registrado en la plataforma. Llega al widget bajo presión — algo no funciona o necesita ayuda — y espera una respuesta rápida y clara.

### Cliente B2B (operador)
El banco, fintech, ecommerce o empresa de telefonía que compra nuestra solución. Configura el widget, define el tono, conecta sus datos y gestiona los agentes humanos. No interactúa con el widget en tiempo real, pero es quien lo personaliza y mide.

---

## Stack técnico

- **Frontend:** React (widget embebible, puede vivir en un iframe o como web component)
- **Backend:** Propio (REST API o WebSocket para mensajería en tiempo real)
- **IA:** Integración con LLM propio o externo para generación de respuestas
- **Estado del chat:** Manejado en el frontend con contexto persistido por sesión

---

## Principios de diseño

**1. El widget no puede bloquear al usuario.**
Si la IA no sabe, debe haber siempre un camino de salida: escalar, dejar un mensaje, abrir un ticket. Nunca un callejón sin salida.

**2. El contexto no se pierde.**
Cuando hay un handoff a agente humano, el historial completo de la conversación viaja con el traspaso. El agente no puede pedirle al usuario que repita lo que ya dijo.

**3. Whitelabelable por defecto.**
Colores, logo, nombre del bot y tono son configurables por el cliente B2B sin tocar código. El widget no debe verse como "nuestro" sino como del cliente.

**4. Mobile-first.**
La mayoría de los usuarios finales llegan desde celular. Cada interacción — botones, formularios, adjuntos — debe funcionar bien en pantallas chicas.

**5. Progressive disclosure.**
No mostrar todo de golpe. El bot guía al usuario paso a paso. Los formularios se abren cuando son necesarios, no antes.

---

## Flujo principal

```
Usuario abre widget
  → Mensaje de bienvenida (personalizado si está logueado)
  → Usuario escribe o selecciona opción rápida
    → IA responde con texto + elementos dinámicos (botones, cards, etc.)
      → [Resuelto] → Flujo de cierre + feedback
      → [No resuelto] → Opciones de escalada
        → Chat con agente humano (handoff con contexto)
        → Dejar mensaje / abrir ticket
        → Artículo del help center relacionado
    → [Fuera de horario] → Formulario de mensaje o ticket
```

---

## Scope de esta iteración

Este documento cubre exclusivamente el **Chatbot Widget**. El Help Center (artículos, tickets, seguimiento) es un producto separado que se integra con este widget pero tiene su propio CONTEXT.md y Roadmap.

### Dentro del scope
- Las 8 dimensiones del análisis competitivo (ver Roadmap)
- Configuración básica por el cliente B2B (colores, nombre, bienvenida)
- Integración con backend propio vía API

### Fuera del scope (próxima iteración)
- Panel de administración del cliente B2B
- Analytics y métricas de uso
- Integración nativa con CRMs externos (Salesforce, HubSpot)
- SDK para mobile apps nativas (iOS/Android)

---

## Decisiones técnicas pendientes

| Decisión | Opciones | Estado |
|---|---|---|
| Método de embed | iframe vs. web component vs. script tag | Por definir |
| Persistencia de sesión | localStorage vs. cookie vs. backend session | Por definir |
| Protocolo de mensajería | REST polling vs. WebSocket vs. SSE | Por definir |
| Handoff a agente | Cola propia vs. integración con herramienta externa | Por definir |

---

## Setup técnico actual (implementación de referencia)

### Repositorios
- **Repo activo**: https://github.com/santiagogarbers/OpenWidget (redirige a Botmaker-Designs/OpenWidget)
- **Repo org**: https://github.com/Botmaker-Designs/OpenWidget
- **Git config**: `user.name = Santiago Garbers` / `user.email = santiago.garbers@botmaker.io`
- **Remote local**: `origin → https://github.com/santiagogarbers/OpenWidget.git`

### Deploy
- **Plataforma**: Vercel
- **URL producción**: https://open-widget.vercel.app
- **Proyecto Vercel**: `santiagogarbers-5160s-projects/open-widget`
- **Deploy manual**: `npx vercel --prod --yes` (desde el directorio del proyecto, con `gh` y `vercel` CLI instalados)
- **Deploy automático**: conectado al repo de GitHub — cada push a `main` triggerea un deploy
- **Nota Vercel**: el email del commit debe coincidir con un email verificado en la cuenta de GitHub; usar siempre `santiago.garbers@botmaker.io`

### Herramientas instaladas
- **GitHub CLI** (`gh`): instalado en `C:\Program Files\GitHub CLI`, autenticado como `santiagogarbers`
- **Vercel CLI**: disponible vía `npx vercel`, autenticado en `santiagogarbers-5160s-projects`

### Stack
- **Vite + React 19** (sin TypeScript), puerto dev: 5173
- **Estilos**: CSS-in-JS con inline styles + bloques `<style>` dentro de cada componente
- **Librerías**:
  - `orb-ui` — `<Orb state volume theme="circle" size className />` para el voice chat
  - Web Audio API — VAD con RMS threshold
  - SpeechRecognition API — `continuous: false`, `lang: 'es-AR'`
  - SpeechSynthesis API — TTS de respuestas del bot

### Estructura de archivos
```
src/components/
  ChatWidget.jsx       # Raíz: estado global, sesiones, routing de vistas
  ChatPanel.jsx        # Vista chat: header + MessageList + ChatInput o VoiceChat
  ChatInput.jsx        # Input de texto con adjuntos, emoji, GIF, waves button
  VoiceChat.jsx        # Panel de voz: orb + controles (reemplaza ChatInput)
  MessageList.jsx      # Burbujas de conversación
  HomeScreen.jsx       # Home con logo Botmaker, FAQ artículos, card de chat
  LoginScreen.jsx      # Login email/contraseña + Google/Facebook
  BotmakerLogo.jsx     # SVG del logo — prop `white` para versión blanca
  HumanAvatar.jsx      # Avatar generativo de agente humano
  FloatingButton.jsx   # Botón flotante abrir/cerrar widget
  SessionsList.jsx     # Lista de conversaciones anteriores
  HelpCenter.jsx       # Centro de ayuda / artículos
  MyAgents.jsx         # Lista de agentes disponibles
  IncomingCall.jsx     # UI llamada entrante
  ActiveCall.jsx       # UI llamada activa de voz
  ActiveVideoCall.jsx  # UI videollamada activa
  Aurora/              # Componente Aurora WebGL (ogl) — no usado actualmente
  GlassSurface/        # Efecto glass con SVG displacement — no usado actualmente
public/
  voice-bg.jpg         # Background del panel de voz (opacity 0.1)
```

### Estado global (ChatWidget)
```js
sessions          // [{ id, messages, timestamp, agent }]
activeSessionId
isTyping / typingMode   // 'writing' | 'reading'
isOpen / isExpanded     // expandido por defecto (true)
view              // 'home' | 'chat' | 'sessions' | 'help' | 'agents' | 'login'
loggedInUser      // null | { name, email, provider }
agentSession      // null | { name, avatar, status }
incomingCall / activeCall / activeVideoCall
```

### Estructura de mensaje
```js
{
  id: Number,
  role: 'user' | 'bot' | 'system',
  type: 'text' | 'streaming' | 'image' | 'fallback' | 'transferring',
  text: String,
  attachments: Array,
  createdAt: Date,
  senderName: String,
  senderType: 'Asistente IA' | 'Agente',
}
```

### Streaming bot response (char-by-char, 18ms/char)
```js
const streamText = (sessionId, fullText) => {
  addMessage(sessionId, { type: 'streaming', text: '' })
  let i = 0
  const interval = setInterval(() => {
    updateLastMessage(sessionId, msg => ({ ...msg, text: fullText.slice(0, ++i) }))
    if (i >= fullText.length) { clearInterval(interval); /* set type: 'text' */ }
  }, 18)
}
```

### Voice Chat — flujo completo
```
Usuario habla
  → VAD (RMS > 0.022 por 150ms) → orbState: 'listening'
  → SpeechRecognition acumula en accumulatedRef
  → Silencio 2000ms → processUtterance()
    → onAddMessage({ role: 'user', text })   → burbuja usuario en MessageList
    → onStreamBot(botResponse)               → burbuja bot streama char-by-char
    → speak(botResponse)                     → TTS en paralelo con el streaming
```

**Parámetros VAD**: `ACTIVATE=0.022`, `VOICE_HOLD_MS=150`, `SILENCE_MS=2000`

**CSS fix para quitar aura del orb**: `.cw-orb > span:first-child { box-shadow: none !important; }`

**Filtro orb cuando el bot habla**: `filter: 'none'` (por defecto del orb — el cyan era `hue-rotate(160deg)`, el azul era `hue-rotate(195deg)`)

### Patrón "latest function ref" (evita stale closures en RAF/timers)
```js
const goRef = useRef(null)
const go = (state) => { orbStateRef.current = state; setOrbState(state) }
goRef.current = go  // se actualiza en cada render; los callbacks leen goRef.current
```

### ChatInput
- `min-height: 188px` para igualar altura al panel de voz
- `flex: 1` en `.cw-input-box` y `.cw-textarea` para llenar el espacio
- Adjuntos: hasta 3 imágenes, drag & drop, skeleton loader 2s
- Waves button (5 barras simétricas SVG) activa voice mode

### HomeScreen — artículos FAQ
IDs con respuestas en `ARTICLE_RESPONSES` (ChatWidget): `gs-1`, `ai-1`, `ch-3`, `fl-1`, `ch-1`, `ai-7`, `in-1`, `gs-4`, `int-5`, `fl-5`

### Panel shell
```js
// isExpanded = true por defecto
width: 'min(680px, 94vw)', height: 'min(720px, calc(100vh - 120px))'
position: 'fixed', bottom: 96, overflow: 'hidden'
```

### CSS Variables globales
`--cw-primary`, `--cw-primary-dark`, `--cw-bg`, `--cw-border`, `--cw-text`,
`--cw-border-radius`, `--cw-font-family`, `--cw-panel-width`, `--cw-panel-height`,
`--cw-shadow`, `--cw-z-index`
