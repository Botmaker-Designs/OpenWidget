import { useState, useEffect, useRef } from 'react'
import { useConfig } from '../hooks/useConfig'
import { useFallbackLog } from '../hooks/useFallbackLog'
import { FloatingButton } from './FloatingButton'
import { ChatPanel } from './ChatPanel'
import { SessionsList } from './SessionsList'
import { HelpCenter } from './HelpCenter'
import { HomeScreen } from './HomeScreen'
import { MyAgents } from './MyAgents'
import { LoginScreen } from './LoginScreen'
import { IncomingCall } from './IncomingCall'
import { ActiveCall } from './ActiveCall'
import { ActiveVideoCall } from './ActiveVideoCall'
import '../styles/global.css'

let nextId = 1

function interpolate(text, variables = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '')
}

const ARTICLE_RESPONSES = {
  'gs-1': 'Botmaker es una plataforma omnicanal de automatización conversacional que te permite crear bots con IA, gestionar conversaciones en WhatsApp, Instagram, Webchat y más canales desde un solo lugar. Con Botmaker podés combinar respuestas automáticas con atención humana, integrar tu CRM y analizar métricas en tiempo real.',
  'ai-1': 'Un Agente de IA en Botmaker es un asistente virtual potenciado por modelos de lenguaje (LLMs) que puede entender preguntas complejas, acceder a bases de conocimiento propias y mantener conversaciones naturales con tus clientes. A diferencia de los bots tradicionales por flujos, el Agente de IA responde de forma dinámica sin necesidad de programar cada camino posible.',
  'ch-3': 'Para integrar el Webchat en tu sitio web solo necesitás copiar un snippet de JavaScript generado desde tu cuenta de Botmaker y pegarlo antes del cierre del tag </body>. El widget se personaliza en color, posición e idioma desde el panel de configuración, sin tocar código. También podés usar nuestro SDK para una integración más avanzada.',
  'fl-1': 'Un flujo de conversación en Botmaker es una secuencia visual de pasos que define cómo responde tu bot según lo que escribe el usuario. Podés crear flujos desde el editor drag & drop: agregás nodos de mensaje, condiciones, variables y llamadas a APIs externas. Los flujos se activan por palabras clave, intenciones o eventos específicos.',
  'ch-1': 'Para conectar WhatsApp Business API necesitás tener una cuenta de Meta Business Manager verificada y un número de teléfono habilitado para la API. Desde Botmaker, el proceso de onboarding te guía paso a paso: verificás el negocio, asociás el número y configurás los templates de mensajes. El proceso tarda entre 1 y 3 días hábiles.',
  'ai-7': 'La escalada automática transfiere la conversación de un bot a un agente humano cuando se detectan ciertas condiciones: el usuario pide hablar con una persona, el bot no puede resolver la consulta después de N intentos, o se activa una palabra clave específica. Desde Botmaker podés configurar las reglas de escalada y la cola de agentes que recibirán el chat.',
  'in-1': 'El Inbox unificado de Botmaker centraliza todos los chats de todos tus canales (WhatsApp, Instagram, Webchat, etc.) en una sola bandeja de entrada. Los agentes pueden ver el historial completo, transferir conversaciones entre equipos, usar respuestas rápidas y ver el contexto del usuario en tiempo real. También soporta etiquetas y filtros para organizar la gestión.',
  'gs-4': 'Para agregar agentes humanos a tu cuenta de Botmaker entrás a Configuración → Equipo → Invitar agente. Ingresás el email del agente, asignás su rol (Agente, Supervisor o Administrador) y el equipo al que pertenece. El agente recibe un mail de invitación para crear su contraseña y ya puede acceder al Inbox para gestionar conversaciones.',
  'int-5': 'La API REST de Botmaker te permite enviar y recibir mensajes de forma programática, gestionar contactos, consultar historial de conversaciones y disparar flujos desde sistemas externos. Usa autenticación por API Key. La documentación completa con ejemplos en cURL, Python y Node.js está disponible en developers.botmaker.com.',
  'fl-5': 'Botmaker permite integrar APIs externas dentro de los flujos usando el nodo "Llamar a API". Podés hacer requests GET/POST a cualquier endpoint, mapear la respuesta a variables del bot y usarlas en mensajes posteriores. También soporta webhooks entrantes para que sistemas externos disparen acciones dentro de una conversación activa.',
}

const ARTICLE_TYPING_STATES = {
  'gs-1':  ['Buscando información sobre Botmaker...', 'Analizando datos del producto...', 'Preparando respuesta...'],
  'ai-1':  ['Consultando documentación de IA...', 'Analizando arquitectura de agentes...', 'Procesando conceptos de LLMs...'],
  'ch-3':  ['Buscando guía de integración...', 'Analizando snippet de embed...', 'Revisando pasos de configuración...'],
  'fl-1':  ['Cargando editor de flujos...', 'Analizando mejores prácticas...', 'Revisando ejemplos de flujos...'],
  'ch-1':  ['Revisando documentos de Meta...', 'Analizando requisitos de WhatsApp Business...', 'Consultando documentación oficial...'],
  'ai-7':  ['Revisando reglas de escalada...', 'Analizando configuración de handoff...', 'Procesando flujo de transferencia...'],
  'in-1':  ['Revisando módulo de Inbox...', 'Analizando integraciones de canales...', 'Cargando guía del Inbox...'],
  'gs-4':  ['Consultando configuración de equipo...', 'Revisando permisos y roles...', 'Procesando guía de agentes...'],
  'int-5': ['Cargando referencia de API...', 'Analizando endpoints disponibles...', 'Revisando documentación técnica...'],
  'fl-5':  ['Buscando conectores disponibles...', 'Analizando ejemplos de integración...', 'Revisando webhooks y callbacks...'],
}

function simulateBotResponse(userText) {
  const fallbackTriggers = ['no sé', 'no entiendo', 'problema', 'error', 'falla']
  if (fallbackTriggers.some(t => userText.toLowerCase().includes(t))) {
    return { type: 'fallback' }
  }
  return { type: 'text', text: 'Entendido. Estoy procesando tu consulta y en breve te doy una respuesta completa.' }
}

function formatTime(date) {
  const diff = (new Date() - date) / 1000
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function ChatWidget({ config: configOverrides = {} }) {
  const config = useConfig(configOverrides)
  const { logFallback } = useFallbackLog(config.fallbackLogEndpoint)

  const [isOpen, setIsOpen]         = useState(false)
  const [animKey, setAnimKey]       = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  const [view, setView]             = useState('home')
  const [sessions, setSessions]     = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isTyping, setIsTyping]         = useState(false)
  const [typingMode, setTypingMode]     = useState('writing')
  const [typingStates, setTypingStates] = useState(null)
  const [notification, setNotification] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [incomingCall, setIncomingCall]   = useState(null)
  const [activeCall, setActiveCall]       = useState(null)
  const [activeVideoCall, setActiveVideoCall] = useState(null)

  // Agente activo de la sesión corriente
  const [agentSession, setAgentSession] = useState(null)

  const streamingRef  = useRef(null)
  const viewRef       = useRef(view)
  const activeSidRef  = useRef(activeSessionId)
  const isOpenRef     = useRef(isOpen)

  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { activeSidRef.current = activeSessionId }, [activeSessionId])
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--cw-primary', config.primaryColor)
    root.style.setProperty('--cw-primary-dark', darken(config.primaryColor))
    if (config.borderRadius) root.style.setProperty('--cw-border-radius', config.borderRadius)
    if (config.fontFamily)   root.style.setProperty('--cw-font-family', config.fontFamily)
  }, [config.primaryColor, config.borderRadius, config.fontFamily])

  useEffect(() => {
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  const DEMO_SESSION_ID = -1
  useEffect(() => {
    if (config.demoActiveChat === 'active') {
      setSessions(prev => prev.some(s => s.id === DEMO_SESSION_ID) ? prev : [{
        id: DEMO_SESSION_ID,
        messages: [{ id: -2, role: 'bot', type: 'text', text: 'Hola, parece que tu mensaje no llegó correctamente. ¿Podemos ayudarte con algo?', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' }],
        timestamp: 'Ahora',
        startedAt: new Date(),
        unread: true,
      }, ...prev.filter(s => s.id !== DEMO_SESSION_ID)])
    } else {
      setSessions(prev => prev.filter(s => s.id !== DEMO_SESSION_ID))
    }
  }, [config.demoActiveChat])

  const activeMessages = sessions.find(s => s.id === activeSessionId)?.messages ?? []

  const updateSession = (id, updater) =>
    setSessions(prev => prev.map(s => s.id === id ? updater(s) : s))

  const addMessage = (sessionId, msg) =>
    updateSession(sessionId, s => ({ ...s, messages: [...s.messages, msg], timestamp: formatTime(new Date()) }))

  const updateLastMessage = (sessionId, updater) =>
    updateSession(sessionId, s => {
      const msgs = [...s.messages]
      msgs[msgs.length - 1] = updater(msgs[msgs.length - 1])
      return { ...s, messages: msgs }
    })

  // Efecto streaming: agrega caracteres uno por uno al último mensaje
  const streamText = (sessionId, fullText) => {
    const msgId = nextId++
    const currentSender = agentSession
      ? { senderName: agentSession.name, senderType: 'Agente' }
      : { senderName: config.botName, senderType: 'Asistente IA' }
    addMessage(sessionId, { id: msgId, role: 'bot', type: 'streaming', text: '', createdAt: new Date(), ...currentSender })

    let i = 0
    streamingRef.current = setInterval(() => {
      i++
      updateLastMessage(sessionId, msg => ({ ...msg, text: fullText.slice(0, i) }))
      if (i >= fullText.length) {
        clearInterval(streamingRef.current)
        updateLastMessage(sessionId, msg => ({ ...msg, type: 'text' }))
      }
    }, 18)
  }

  const startNewChat = () => {
    const sessionId = nextId++
    const welcomeText = interpolate(config.welcomeMessage, config.user ?? {})
    const welcomeMsg  = { id: nextId++, role: 'bot', type: 'text', text: welcomeText, createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' }
    setSessions(prev => [{ id: sessionId, messages: [welcomeMsg], timestamp: 'Ahora', startedAt: new Date() }, ...prev])
    setActiveSessionId(sessionId)
    setAgentSession(null)
    setView('chat')
  }

  const openSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    setActiveSessionId(sessionId)
    setAgentSession(session?.agent ?? null)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unread: false } : s))
    setView('chat')
  }

  const addUserMessage = (text, attachments = []) => {
    const sid = activeSessionId
    addMessage(sid, { id: nextId++, role: 'user', type: attachments.length ? 'image' : 'text', text, attachments, createdAt: new Date() })

    // Si Camila preguntó por una llamada y el usuario responde "si"
    if (agentSession && /^s[ií]$/i.test(text.trim())) {
      setTimeout(() => setIncomingCall(agentSession), 1200)
      return
    }

    // Si el usuario pide una videollamada
    if (agentSession && /video/i.test(text.trim())) {
      setTimeout(() => {
        addMessage(sid, { id: nextId++, role: 'bot', type: 'text', text: '¡Claro! Te inicio una videollamada ahora.', createdAt: new Date(), senderName: agentSession.name, senderType: 'Agente' })
        setTimeout(() => setActiveVideoCall(agentSession), 1000)
      }, 800)
      return
    }

    setIsTyping(true)
    setTypingMode('writing')
    setTypingStates(null)

    setTimeout(() => {
      const response = simulateBotResponse(text)
      setIsTyping(false)

      if (response.type === 'fallback') {
        const botId = nextId++
        logFallback({ messageId: botId, userText: text, timestamp: new Date().toISOString() })
        addMessage(sid, { id: botId, role: 'bot', type: 'fallback', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' })
      } else {
        streamText(sid, response.text)
      }

      if (!isOpenRef.current) {
        setUnreadCount(c => c + 1)
        const preview = response.type === 'fallback'
          ? (config.fallbackMessage ?? 'No pude procesar tu consulta.')
          : response.text
        setNotification({ text: preview, senderName: config.botName, avatar: config.botAvatar ?? null })
      }
    }, 5000)
  }

  const markFallbackActed = (sid) => {
    setSessions(prev => prev.map(s =>
      s.id === sid
        ? { ...s, messages: s.messages.map(m => m.type === 'fallback' ? { ...m, acted: true } : m) }
        : s
    ))
  }

  const handleEscalate = () => {
    const sid = activeSessionId
    markFallbackActed(sid)
    addMessage(sid, { id: nextId++, role: 'system', type: 'transferring' })

    // Simula conexión con agente después de 2.5s
    setTimeout(() => {
      const now = formatTime(new Date())
      // Elimina el mensaje de transferencia antes de mostrar el ingreso del agente
      setSessions(prev => prev.map(s =>
        s.id === sid
          ? { ...s, messages: s.messages.filter(m => m.type !== 'transferring') }
          : s
      ))
      const agent = { name: 'Camila', avatar: 'https://i.pravatar.cc/160?img=47', status: 'online' }
      addMessage(sid, { id: nextId++, role: 'system', type: 'agent_join', agentName: agent.name, agentAvatar: agent.avatar, timestamp: now })
      setAgentSession(agent)
      setSessions(prev => prev.map(s => s.id === sid ? { ...s, agent } : s))

      // Camila escribe 2s después de unirse
      setTimeout(() => {
        setIsTyping(true)
        setTypingMode('writing')
        setTimeout(() => {
          setIsTyping(false)
          const camilaMsg = {
            id: nextId++, role: 'bot', type: 'text',
            text: '¡Hola! Soy Camila. Vi tu consulta y me gustaría ayudarte mejor de forma personalizada. ¿Te parece bien si te llamo en los próximos minutos?',
            createdAt: new Date(),
            senderName: agent.name,
            senderType: 'Agente',
          }
          const isViewingThisChat = viewRef.current === 'chat' && activeSidRef.current === sid
          setSessions(prev => prev.map(s =>
            s.id === sid
              ? { ...s, messages: [...s.messages, camilaMsg], timestamp: 'Ahora', unread: !isViewingThisChat }
              : s
          ))
          if (!isOpenRef.current) {
            setUnreadCount(c => c + 1)
            setNotification({ text: camilaMsg.text, senderName: agent.name, avatar: agent.avatar })
          }
        }, 6000)
      }, 2000)
    }, 2500)
  }

  const handleLeaveMessage = () => {
    const sid = activeSessionId
    markFallbackActed(sid)
    addMessage(sid, { id: nextId++, role: 'bot', type: 'text', text: 'Dejá tu mensaje y te responderemos a la brevedad.', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' })
  }

  const handleAskArticle = (article) => {
    const sessionId = nextId++
    const userMsg = { id: nextId++, role: 'user', type: 'text', text: article.title, createdAt: new Date() }
    setSessions(prev => [{ id: sessionId, messages: [userMsg], timestamp: 'Ahora', startedAt: new Date() }, ...prev])
    setActiveSessionId(sessionId)
    setAgentSession(null)
    setView('chat')
    setIsTyping(true)
    setTypingMode('writing')
    setTypingStates(ARTICLE_TYPING_STATES[article.id] ?? null)
    setTimeout(() => {
      setIsTyping(false)
      setTypingStates(null)
      const responseText = ARTICLE_RESPONSES[article.id] ?? 'Entendido. Estoy procesando tu consulta y en breve te doy una respuesta completa.'
      const sid = sessionId
      const msgId = nextId++
      setSessions(prev => prev.map(s => s.id === sid
        ? { ...s, messages: [...s.messages, { id: msgId, role: 'bot', type: 'streaming', text: '', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' }] }
        : s
      ))
      let i = 0
      streamingRef.current = setInterval(() => {
        i++
        updateLastMessage(sid, msg => ({ ...msg, text: responseText.slice(0, i) }))
        if (i >= responseText.length) {
          clearInterval(streamingRef.current)
          updateLastMessage(sid, msg => ({ ...msg, type: 'text' }))
        }
      }, 18)
      if (!isOpenRef.current) {
        setUnreadCount(c => c + 1)
        setNotification({ text: responseText, senderName: config.botName, avatar: config.botAvatar ?? null })
      }
    }, 5000)
  }

  const handleTabChange = (tab) => {
    if (tab === 'home')     setView('home')
    if (tab === 'messages') setView('sessions')
    if (tab === 'help')     setView('help')
    if (tab === 'agents')   setView('agents')
  }

  const handleClose = () => setIsOpen(false)
  const handleBack  = () => { setView('sessions'); setAgentSession(null) }
  const handleBackFromHelp = () => setView('sessions')

  const handleOpen = () => {
    setNotification(null)
    setIsOpen(o => {
      if (!o) {
        setAnimKey(k => k + 1)
        setView('home')
      }
      return !o
    })
  }

  return (
    <div className="cw-widget">
      {isOpen && (
        <div style={panelShell(config.position, isExpanded)}>
          {view === 'login' ? (
            <LoginScreen
              onLogin={(user) => { setLoggedInUser(user); setView('home') }}
              onBack={() => setView('home')}
            />
          ) : view === 'agents' ? (
            <MyAgents
              onClose={handleClose}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(e => !e)}
              onTabChange={handleTabChange}
              onStartChat={(agent) => {
                const sessionId = nextId++
                const welcomeMsg = { id: nextId++, role: 'bot', type: 'text', text: `Hola, soy ${agent.name} y voy a ayudarte con tu reclamo. Contame qué pasó.`, createdAt: new Date(), senderName: agent.name, senderType: 'Agente' }
                setSessions(prev => [{ id: sessionId, messages: [welcomeMsg], timestamp: 'Ahora', startedAt: new Date(), agent: { name: agent.name, avatar: agent.avatar, status: agent.status } }, ...prev])
                setActiveSessionId(sessionId)
                setAgentSession({ name: agent.name, avatar: agent.avatar, status: agent.status })
                setView('chat')
              }}
            />
          ) : view === 'home' ? (
            <HomeScreen
              onClose={handleClose}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(e => !e)}
              onNewChat={startNewChat}
              onTabChange={handleTabChange}
              userName={config.user?.name}
              loggedInUser={loggedInUser}
              onLoginClick={() => setView('login')}
              onAskArticle={handleAskArticle}
              chatCardVariant={config.chatCardVariant}
              businessHours={config.businessHours}
              sessions={sessions}
              onSelectSession={openSession}
              animKey={animKey}
            />
          ) : view === 'help' ? (
            <HelpCenter
              onClose={handleClose}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(e => !e)}
              onTabChange={handleTabChange}
            />
          ) : view === 'sessions' ? (
            <SessionsList
              sessions={sessions}
              botName={config.botName}
              botAvatar={config.botAvatar}
              onSelectSession={openSession}
              onNewChat={startNewChat}
              onClose={handleClose}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(e => !e)}
              typingSessionId={isTyping ? activeSessionId : null}
              onTabChange={handleTabChange}
            />
          ) : (
            <ChatPanel
              config={config}
              messages={activeMessages}
              isTyping={isTyping}
              typingMode={typingMode}
              typingStates={typingStates}
              onSend={addUserMessage}
              onQuickReply={(opt) => addUserMessage(opt.label)}
              onEscalate={handleEscalate}
              onLeaveMessage={handleLeaveMessage}
              onClose={handleClose}
              onBack={handleBack}
              agentSession={agentSession}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(e => !e)}
              onAddVoiceMessage={(msg) => addMessage(activeSessionId, { id: nextId++, createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA', ...msg })}
              onStreamVoiceBot={(text) => streamText(activeSessionId, text)}
            />
          )}

          {incomingCall && (
            <IncomingCall
              agent={incomingCall}
              onAccept={() => {
                const agent = incomingCall
                setIncomingCall(null)
                setActiveCall(agent)
              }}
              onDecline={() => {
                const agent = incomingCall
                setIncomingCall(null)
                addMessage(activeSessionId, { id: nextId++, role: 'bot', type: 'text', text: 'Entendido, sin problema. Si necesitás algo más estoy por acá.', createdAt: new Date(), senderName: agent.name, senderType: 'Agente' })
              }}
            />
          )}

          {activeCall && (
            <ActiveCall
              agent={activeCall}
              onHangUp={(duration) => {
                const agent = activeCall
                const mins = Math.floor(duration / 60)
                const secs = duration % 60
                const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
                setActiveCall(null)
                addMessage(activeSessionId, { id: nextId++, role: 'bot', type: 'text', text: `Llamada finalizada (${label}). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: agent.name, senderType: 'Agente' })
              }}
            />
          )}

          {activeVideoCall && (
            <ActiveVideoCall
              agent={activeVideoCall}
              onHangUp={(duration) => {
                const agent = activeVideoCall
                const mins = Math.floor(duration / 60)
                const secs = duration % 60
                const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
                setActiveVideoCall(null)
                addMessage(activeSessionId, { id: nextId++, role: 'bot', type: 'text', text: `Videollamada finalizada (${label}). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: agent.name, senderType: 'Agente' })
              }}
            />
          )}
        </div>
      )}
      <FloatingButton
        isOpen={isOpen}
        unreadCount={unreadCount}
        position={config.position}
        onClick={handleOpen}
        notification={!isOpen ? notification : null}
        onDismissNotification={() => setNotification(null)}
      />
    </div>
  )
}

const panelShell = (position, isExpanded) => ({
  position: 'fixed',
  background: 'var(--cw-bg)',
  borderRadius: isExpanded ? 16 : 'var(--cw-border-radius)',
  boxShadow: 'var(--cw-shadow)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 'var(--cw-z-index)',
  transition: 'width 320ms ease, height 320ms ease, border-radius 320ms ease',
  bottom: 96,
  ...(position === 'bottom-left' ? { left: 24 } : { right: 24 }),
  animation: 'cw-slide-up 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
  ...(isExpanded ? {
    width: 'min(680px, 94vw)',
    height: 'min(720px, calc(100vh - 120px))',
  } : {
    width: 'var(--cw-panel-width)',
    height: 'var(--cw-panel-height)',
  }),
})

function darken(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - 20)
  const g = Math.max(0, ((n >> 8) & 0xff) - 20)
  const b = Math.max(0, (n & 0xff) - 20)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
