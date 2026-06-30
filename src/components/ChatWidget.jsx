import { useState, useEffect, useRef } from 'react'
import { useConfig } from '../hooks/useConfig'
import { useFallbackLog } from '../hooks/useFallbackLog'
import { FloatingButton } from './FloatingButton'
import { BotmakerLogo } from './BotmakerLogo'
import { BrandAvatar } from './BrandAvatar'
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
  const [sessions, setSessions]     = useState(INITIAL_DEMO_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isTyping, setIsTyping]         = useState(false)
  const [typingMode, setTypingMode]     = useState('writing')
  const [typingStates, setTypingStates] = useState(null)
  const [notification, setNotification] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loggedInUser, setLoggedInUser] = useState({ name: 'Santiago' })
  const [incomingCall, setIncomingCall]   = useState(null)
  const [activeCall, setActiveCall]       = useState(null)
  const [activeVideoCall, setActiveVideoCall] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sidebarQuery, setSidebarQuery] = useState('')

  // Agente activo de la sesión corriente
  const [agentSession, setAgentSession] = useState(null)

  const streamingRef  = useRef(null)
  const viewRef       = useRef(view)
  const activeSidRef  = useRef(activeSessionId)
  const isOpenRef     = useRef(isOpen)
  const shellRef      = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { activeSidRef.current = activeSessionId }, [activeSessionId])
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])
  useEffect(() => { if (view !== 'chat') setHistoryOpen(false) }, [view])
  useEffect(() => { if (!historyOpen) setSidebarQuery('') }, [historyOpen])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !isMobile || !isOpen) return
    const update = () => {
      if (!shellRef.current) return
      shellRef.current.style.height = `${vv.height}px`
      shellRef.current.style.top    = `${vv.offsetTop}px`
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [isMobile, isOpen])

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

    // Simula conexión con agente después de 6s
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
    }, 6000)
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
    if (tab === 'messages') {
      if (sessions.length > 0) openSession(sessions[0].id)
      else startNewChat()
    }
    if (tab === 'help')     setView('help')
    if (tab === 'agents')   setView('agents')
  }

  const handleClose = () => setIsOpen(false)
  const handleBack  = () => { setView('home'); setAgentSession(null) }
  const handleBackFromHelp = () => setView('home')

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
      {isOpen && isMobile && (
        <div ref={shellRef} style={mobileShellStyle}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
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
                agentSession={agentSession}
                sessions={sessions}
                onSelectSession={openSession}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(e => !e)}
                onAddVoiceMessage={(msg) => addMessage(activeSessionId, { id: nextId++, createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA', ...msg })}
                onStreamVoiceBot={(text) => streamText(activeSessionId, text)}
                onTabChange={handleTabChange}
                isMobile={isMobile}
                historyOpen={historyOpen}
                onToggleHistory={() => setHistoryOpen(h => !h)}
                isClosed={!!sessions.find(s => s.id === activeSessionId)?.closed}
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
          {view === 'chat' && historyOpen && (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 20 }} onClick={() => setHistoryOpen(false)} />
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 21, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '4px 0 20px rgba(0,0,0,0.15)', animation: 'cw-sidebar-mobile-in 250ms cubic-bezier(0.22,1,0.36,1)' }}>
                <SidebarPanel
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  sidebarQuery={sidebarQuery}
                  onQueryChange={setSidebarQuery}
                  openSession={(id) => { openSession(id); setHistoryOpen(false) }}
                />
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {isOpen && !isMobile && (
        <div style={outerWrapperStyle(config.position, isExpanded)}>
          {/* Sidebar — sibling del shell, nunca lo mueve */}
          {view === 'chat' && historyOpen && (
            <div style={sidebarCardStyle()}>
              <SidebarPanel
                sessions={sessions}
                activeSessionId={activeSessionId}
                sidebarQuery={sidebarQuery}
                onQueryChange={setSidebarQuery}
                openSession={openSession}
              />
            </div>
          )}

          {/* Chat shell — posición y tamaño fijos, nunca cambian */}
          <div ref={shellRef} style={desktopShellStyle(isExpanded)}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
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
                  agentSession={agentSession}
                  sessions={sessions}
                  onSelectSession={openSession}
                  isExpanded={isExpanded}
                  onToggleExpand={() => setIsExpanded(e => !e)}
                  onAddVoiceMessage={(msg) => addMessage(activeSessionId, { id: nextId++, createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA', ...msg })}
                  onStreamVoiceBot={(text) => streamText(activeSessionId, text)}
                  onTabChange={handleTabChange}
                  isMobile={false}
                  historyOpen={historyOpen}
                  onToggleHistory={() => setHistoryOpen(h => !h)}
                  isClosed={!!sessions.find(s => s.id === activeSessionId)?.closed}
                />
              )}
              {incomingCall && (
                <IncomingCall
                  agent={incomingCall}
                  onAccept={() => { const agent = incomingCall; setIncomingCall(null); setActiveCall(agent) }}
                  onDecline={() => { const agent = incomingCall; setIncomingCall(null); addMessage(activeSessionId, { id: nextId++, role: 'bot', type: 'text', text: 'Entendido, sin problema. Si necesitás algo más estoy por acá.', createdAt: new Date(), senderName: agent.name, senderType: 'Agente' }) }}
                />
              )}
              {activeCall && (
                <ActiveCall
                  agent={activeCall}
                  onHangUp={(duration) => { const agent = activeCall; const mins = Math.floor(duration / 60); const secs = duration % 60; const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`; setActiveCall(null); addMessage(activeSessionId, { id: nextId++, role: 'bot', type: 'text', text: `Llamada finalizada (${label}). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: agent.name, senderType: 'Agente' }) }}
                />
              )}
              {activeVideoCall && (
                <ActiveVideoCall
                  agent={activeVideoCall}
                  onHangUp={(duration) => { const agent = activeVideoCall; const mins = Math.floor(duration / 60); const secs = duration % 60; const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`; setActiveVideoCall(null); addMessage(activeSessionId, { id: nextId++, role: 'bot', type: 'text', text: `Videollamada finalizada (${label}). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: agent.name, senderType: 'Agente' }) }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {(!isOpen || !isMobile) && (
        <FloatingButton
          isOpen={isOpen}
          unreadCount={unreadCount}
          position={config.position}
          onClick={handleOpen}
          notification={!isOpen ? notification : null}
          onDismissNotification={() => setNotification(null)}
        />
      )}
    </div>
  )
}

// ── Demo historical sessions (pre-seeded, closed) ────────────────────────────
const INITIAL_DEMO_SESSIONS = [
  {
    id: 'dh1', title: 'Estado de mi cuenta', closed: true, timestamp: 'Ayer',
    startedAt: new Date('2026-06-23'),
    messages: [
      { id: 'dh1-1', role: 'bot',  type: 'text', text: '¡Hola, Santiago! ¿En qué puedo ayudarte hoy?', createdAt: new Date('2026-06-23T10:00:00'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh1-2', role: 'user', type: 'text', text: 'Quería consultar el estado de mi cuenta.', createdAt: new Date('2026-06-23T10:01:00') },
      { id: 'dh1-3', role: 'bot',  type: 'text', text: 'Tu cuenta está activa y al día. No tenés deudas pendientes ni pagos vencidos.', createdAt: new Date('2026-06-23T10:01:30'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh1-4', role: 'user', type: 'text', text: 'Perfecto, muchas gracias.', createdAt: new Date('2026-06-23T10:02:00') },
      { id: 'dh1-5', role: 'bot',  type: 'text', text: 'Gracias por contactarnos. ¿Hay algo más en que pueda ayudarte?', createdAt: new Date('2026-06-23T10:02:10'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
    ],
  },
  {
    id: 'dh2', title: 'Problema con una entrega', closed: true, timestamp: 'Lun',
    agent: { name: 'Camila', avatar: 'https://i.pravatar.cc/160?img=47', status: 'online' },
    startedAt: new Date('2026-06-22'),
    messages: [
      { id: 'dh2-1', role: 'bot',  type: 'text', text: '¡Hola! ¿En qué puedo ayudarte hoy?', createdAt: new Date('2026-06-22T14:00:00'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh2-2', role: 'user', type: 'text', text: 'Tuve un problema con una entrega.', createdAt: new Date('2026-06-22T14:01:00') },
      { id: 'dh2-3', role: 'bot',  type: 'text', text: 'Lamentamos eso. Te conecto con un agente ahora.', createdAt: new Date('2026-06-22T14:01:20'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh2-4', role: 'system', type: 'agent_join', agentName: 'Camila', agentAvatar: 'https://i.pravatar.cc/160?img=47', timestamp: '14:02' },
      { id: 'dh2-5', role: 'bot',  type: 'text', text: 'Hola, soy Camila. Vi tu caso — la entrega fue re-agendada para mañana en el turno mañana.', createdAt: new Date('2026-06-22T14:02:30'), senderName: 'Camila', senderType: 'Agente' },
      { id: 'dh2-6', role: 'user', type: 'text', text: 'Gracias Camila, perfecto.', createdAt: new Date('2026-06-22T14:03:00') },
      { id: 'dh2-7', role: 'bot',  type: 'text', text: '¡Perfecto! Me alegra que hayas podido resolver tu consulta. ¡Hasta pronto!', createdAt: new Date('2026-06-22T14:03:20'), senderName: 'Camila', senderType: 'Agente' },
    ],
  },
  {
    id: 'dh3', title: 'Pedido #48291 en camino', closed: true, timestamp: '15 jun',
    startedAt: new Date('2026-06-15'),
    messages: [
      { id: 'dh3-1', role: 'user', type: 'text', text: '¿Dónde está mi pedido #48291?', createdAt: new Date('2026-06-15T09:00:00') },
      { id: 'dh3-2', role: 'bot',  type: 'text', text: 'Tu pedido #48291 está en camino. Llegará entre el martes y el miércoles.', createdAt: new Date('2026-06-15T09:00:30'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh3-3', role: 'user', type: 'text', text: 'Gracias.', createdAt: new Date('2026-06-15T09:01:00') },
      { id: 'dh3-4', role: 'bot',  type: 'text', text: '¡De nada! ¿Necesitás algo más?', createdAt: new Date('2026-06-15T09:01:10'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh3-5', role: 'user', type: 'text', text: 'No, es todo.', createdAt: new Date('2026-06-15T09:01:30') },
      { id: 'dh3-6', role: 'bot',  type: 'text', text: '¡Hasta luego!', createdAt: new Date('2026-06-15T09:01:40'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
    ],
  },
  {
    id: 'dh4', title: 'Devolución de pedido', closed: true, timestamp: '12 jun',
    agent: { name: 'Tomás', avatar: 'https://i.pravatar.cc/160?img=32', status: 'online' },
    startedAt: new Date('2026-06-12'),
    messages: [
      { id: 'dh4-1', role: 'user', type: 'text', text: 'Quiero hacer una devolución de mi último pedido.', createdAt: new Date('2026-06-12T11:00:00') },
      { id: 'dh4-2', role: 'bot',  type: 'text', text: 'Claro, te conecto con un agente para gestionar la devolución.', createdAt: new Date('2026-06-12T11:00:20'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh4-3', role: 'system', type: 'agent_join', agentName: 'Tomás', agentAvatar: 'https://i.pravatar.cc/160?img=32', timestamp: '11:01' },
      { id: 'dh4-4', role: 'bot',  type: 'text', text: 'Hola, soy Tomás. Procesé la devolución de tu pedido. Verás el crédito reflejado en 3-5 días hábiles.', createdAt: new Date('2026-06-12T11:01:30'), senderName: 'Tomás', senderType: 'Agente' },
      { id: 'dh4-5', role: 'user', type: 'text', text: 'Perfecto, gracias.', createdAt: new Date('2026-06-12T11:02:00') },
      { id: 'dh4-6', role: 'bot',  type: 'text', text: '¡Con gusto! Que tengas un buen día.', createdAt: new Date('2026-06-12T11:02:10'), senderName: 'Tomás', senderType: 'Agente' },
    ],
  },
  {
    id: 'dh5', title: 'Horarios de atención', closed: true, timestamp: '8 jun',
    startedAt: new Date('2026-06-08'),
    messages: [
      { id: 'dh5-1', role: 'bot',  type: 'text', text: '¡Hola! ¿En qué puedo ayudarte?', createdAt: new Date('2026-06-08T16:00:00'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh5-2', role: 'user', type: 'text', text: '¿Cuáles son los horarios de atención?', createdAt: new Date('2026-06-08T16:01:00') },
      { id: 'dh5-3', role: 'bot',  type: 'text', text: 'Nuestros agentes están disponibles de lunes a viernes de 9:00 a 18:00 hs.', createdAt: new Date('2026-06-08T16:01:10'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh5-4', role: 'user', type: 'text', text: 'Gracias.', createdAt: new Date('2026-06-08T16:01:30') },
      { id: 'dh5-5', role: 'bot',  type: 'text', text: '¿Hay algo más en que pueda ayudarte?', createdAt: new Date('2026-06-08T16:01:40'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 'dh5-6', role: 'user', type: 'text', text: 'No, es todo. Gracias.', createdAt: new Date('2026-06-08T16:02:00') },
      { id: 'dh5-7', role: 'bot',  type: 'text', text: '¡Hasta pronto!', createdAt: new Date('2026-06-08T16:02:10'), senderName: 'Botsy AI', senderType: 'Asistente IA' },
    ],
  },
]

const sidebarSectionLabel = {
  padding: '10px 14px 4px',
  fontSize: 10,
  fontWeight: 700,
  color: '#9ca3af',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontFamily: 'var(--cw-font-family)',
}

// ── Mobile shell (position: fixed, inset 0) ────────────────────────────────
const mobileShellStyle = {
  position: 'fixed',
  inset: 0,
  background: 'var(--cw-bg)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 10000,
  animation: 'cw-slide-up 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
}

// ── Desktop: outer wrapper — contiene sidebar + shell en una sola caja ─────
const outerWrapperStyle = (position, isExpanded) => ({
  position: 'fixed',
  bottom: 96,
  ...(position === 'bottom-left' ? { left: 24 } : { right: 24 }),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  zIndex: 'var(--cw-z-index)',
  borderRadius: isExpanded ? 16 : 'var(--cw-border-radius)',
  boxShadow: 'var(--cw-shadow)',
  overflow: 'hidden',
  animation: 'cw-slide-up 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
})

// ── Desktop: chat shell — tamaño y posición inmutables ─────────────────────
const desktopShellStyle = (isExpanded) => ({
  background: 'var(--cw-bg)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  flexShrink: 0,
  transition: 'width 320ms ease, height 320ms ease',
  ...(isExpanded ? {
    width: 'min(540px, 94vw)',
    height: 'min(720px, calc(100vh - 120px))',
  } : {
    width: 'var(--cw-panel-width)',
    height: 'var(--cw-panel-height)',
  }),
})

// ── Sidebar — separado del shell por un borde fino ─────────────────────────
const sidebarCardStyle = () => ({
  width: 220,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  borderRight: '1px solid #f3f4f6',
  overflow: 'hidden',
  animation: 'cw-history-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
})

const sidebarHeaderStyle = {
  padding: '14px 14px 12px',
  borderBottom: '1px solid #f3f4f6',
  flexShrink: 0,
}

function SidebarPanel({ sessions, activeSessionId, sidebarQuery, onQueryChange, openSession }) {
  const q = sidebarQuery.toLowerCase()
  const matches = s => !q || (s.agent?.name ?? 'Botsy AI').toLowerCase().includes(q) || (s.messages?.at(-1)?.text ?? '').toLowerCase().includes(q)
  const active  = sessions.filter(s => !s.closed && matches(s))
  const history = sessions.filter(s =>  s.closed && matches(s))

  return (
    <>
      <style>{`.cw-sidebar-row:hover { background: #f3f4f6 !important; } .cw-sidebar-row:active { background: #e9eaec !important; }`}</style>
      <div style={sidebarHeaderStyle}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827', fontFamily: 'var(--cw-font-family)' }}>Conversaciones</span>
      </div>
      <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f4f6f8', borderRadius: 8, padding: '7px 10px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#111827', fontFamily: 'var(--cw-font-family)', flex: 1, width: 0 }}
            placeholder="Buscar..."
            value={sidebarQuery}
            onChange={e => onQueryChange(e.target.value)}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent', padding: '4px 6px' }}>
        {active.length > 0 && (
          <>
            <div style={sidebarSectionLabel}>EN CURSO</div>
            {active.map(s => <SidebarSessionRow key={s.id} session={s} isActive={s.id === activeSessionId} onSelect={() => openSession(s.id)} />)}
          </>
        )}
        {history.length > 0 && (
          <>
            <div style={sidebarSectionLabel}>HISTORIAL</div>
            {history.map(s => <SidebarSessionRow key={s.id} session={s} isActive={s.id === activeSessionId} onSelect={() => openSession(s.id)} />)}
          </>
        )}
        {active.length === 0 && history.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 32, fontFamily: 'var(--cw-font-family)' }}>Sin resultados</p>
        )}
      </div>
    </>
  )
}

function deriveTitle(messages) {
  const first = messages.find(m => m.role === 'user' && m.text)
  if (!first) return 'Nueva conversación'
  const t = first.text.trim()
  return t.length > 38 ? t.slice(0, 36) + '…' : t
}

function SidebarSessionRow({ session, isActive, onSelect }) {
  const lastMsg = session.messages.filter(m => m.text).at(-1)
  const preview = lastMsg?.text ?? '...'
  const name    = session.agent?.name ?? 'Botsy AI'
  const avatar  = session.agent?.avatar ?? null
  const date    = session.startedAt
    ? new Date(session.startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : session.timestamp

  return (
    <button
      className="cw-sidebar-row"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 10px',
        border: 'none',
        borderRadius: 10,
        background: isActive ? '#eff6ff' : 'transparent',
        cursor: 'pointer', textAlign: 'left',
        marginBottom: 5,
        fontFamily: 'var(--cw-font-family)',
        transition: 'background 120ms',
      }}
      onClick={onSelect}
    >
      <BrandAvatar
        size={38}
        pipSize={17}
        agentAvatar={avatar}
        agentName={avatar ? null : (name !== 'Botsy AI' ? name : null)}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{session.title || deriveTitle(session.messages)}</span>
          <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>{date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
          {session.agent?.avatar
            ? <img src={session.agent.avatar} alt="" style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
            : <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}><BotmakerLogo size={9} /></div>
          }
          <p style={{ margin: 0, fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</p>
        </div>
      </div>
    </button>
  )
}

function darken(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - 20)
  const g = Math.max(0, ((n >> 8) & 0xff) - 20)
  const b = Math.max(0, (n & 0xff) - 20)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
