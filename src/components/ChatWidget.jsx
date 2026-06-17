import { useState, useEffect, useRef } from 'react'
import { useConfig } from '../hooks/useConfig'
import { useFallbackLog } from '../hooks/useFallbackLog'
import { FloatingButton } from './FloatingButton'
import { ChatPanel } from './ChatPanel'
import { SessionsList } from './SessionsList'
import { HelpCenter } from './HelpCenter'
import { HomeScreen } from './HomeScreen'
import { MyAgents } from './MyAgents'
import { IncomingCall } from './IncomingCall'
import { ActiveCall } from './ActiveCall'
import { ActiveVideoCall } from './ActiveVideoCall'
import '../styles/global.css'

let nextId = 1

function interpolate(text, variables = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '')
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [view, setView]             = useState('home')
  const [sessions, setSessions]     = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isTyping, setIsTyping]     = useState(false)
  const [typingMode, setTypingMode] = useState('writing')
  const [unreadCount, setUnreadCount] = useState(0)
  const [incomingCall, setIncomingCall]   = useState(null)
  const [activeCall, setActiveCall]       = useState(null)
  const [activeVideoCall, setActiveVideoCall] = useState(null)

  // Agente activo de la sesión corriente
  const [agentSession, setAgentSession] = useState(null)

  const streamingRef  = useRef(null)
  const viewRef       = useRef(view)
  const activeSidRef  = useRef(activeSessionId)

  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { activeSidRef.current = activeSessionId }, [activeSessionId])

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

      if (!isOpen) setUnreadCount(c => c + 1)
    }, 1800)
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
        }, 6000)
      }, 2000)
    }, 2500)
  }

  const handleLeaveMessage = () => {
    const sid = activeSessionId
    markFallbackActed(sid)
    addMessage(sid, { id: nextId++, role: 'bot', type: 'text', text: 'Dejá tu mensaje y te responderemos a la brevedad.', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' })
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
    setIsOpen(o => {
      if (!o) setView('home')
      return !o
    })
  }

  return (
    <div className="cw-widget">
      {isOpen && (
        <div style={panelShell(config.position, isExpanded)}>
          {view === 'agents' ? (
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
              onSend={addUserMessage}
              onQuickReply={(opt) => addUserMessage(opt.label)}
              onEscalate={handleEscalate}
              onLeaveMessage={handleLeaveMessage}
              onClose={handleClose}
              onBack={handleBack}
              agentSession={agentSession}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(e => !e)}
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
