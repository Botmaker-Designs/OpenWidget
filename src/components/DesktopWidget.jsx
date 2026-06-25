import { useState, useRef, useEffect } from 'react'
import '../styles/global.css'
import { useConfig } from '../hooks/useConfig'
import { useFallbackLog } from '../hooks/useFallbackLog'
import { MessageList, Lightbox } from './MessageList'
import { ChatInput } from './ChatInput'
import { VoiceChat } from './VoiceChat'
import { BotmakerLogo } from './BotmakerLogo'
import { HumanAvatar } from './HumanAvatar'
import { BrandAvatar } from './BrandAvatar'
import { IncomingCall } from './IncomingCall'
import { ActiveCall } from './ActiveCall'
import { ActiveVideoCall } from './ActiveVideoCall'

let nextDesktopId = 5000

function interpolate(text, variables = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '')
}

function simulateBotResponse(userText) {
  const fallbackTriggers = ['no sé', 'no entiendo', 'problema', 'error', 'falla']
  if (fallbackTriggers.some(t => userText.toLowerCase().includes(t))) return { type: 'fallback' }
  return { type: 'text', text: 'Entendido. Estoy procesando tu consulta y en breve te doy una respuesta completa.' }
}

function formatTime(date) {
  const diff = (new Date() - date) / 1000
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

const ARTICLE_RESPONSES = {
  'gs-1': 'Botmaker es una plataforma omnicanal de automatización conversacional que te permite crear bots con IA, gestionar conversaciones en WhatsApp, Instagram, Webchat y más canales desde un solo lugar.',
  'ai-1': 'Un Agente de IA en Botmaker es un asistente virtual potenciado por LLMs que puede entender preguntas complejas y mantener conversaciones naturales con tus clientes.',
  'ch-3': 'Para integrar el Webchat en tu sitio solo necesitás copiar un snippet de JavaScript generado desde tu cuenta de Botmaker y pegarlo antes del cierre del tag </body>.',
}

export function DesktopWidget({ onClose, config: configOverrides = {} }) {
  const config = useConfig(configOverrides)
  const { logFallback } = useFallbackLog(config.fallbackLogEndpoint)

  const [messages, setMessages]       = useState([])
  const [isTyping, setIsTyping]       = useState(false)
  const [typingMode, setTypingMode]   = useState('writing')
  const [typingStates, setTypingStates] = useState(null)
  const [agentSession, setAgentSession] = useState(null)
  const [voiceMode, setVoiceMode]     = useState(false)
  const [sessionsOpen, setSessionsOpen]   = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [infoOpen, setInfoOpen]           = useState(() => window.innerWidth >= 768)
  const [incomingCall, setIncomingCall]   = useState(null)
  const [activeCall, setActiveCall]       = useState(null)
  const [activeVideoCall, setActiveVideoCall] = useState(null)
  const [videoMinimized, setVideoMinimized]   = useState(false)
  const [videoSeconds, setVideoSeconds]       = useState(0)

  const streamingRef  = useRef(null)
  const shellRef      = useRef(null)

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Apply theme CSS variables (same as ChatWidget)
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--cw-primary', config.primaryColor)
    root.style.setProperty('--cw-primary-dark', darken(config.primaryColor))
    if (config.borderRadius) root.style.setProperty('--cw-border-radius', config.borderRadius)
    if (config.fontFamily)   root.style.setProperty('--cw-font-family', config.fontFamily)
  }, [config.primaryColor, config.borderRadius, config.fontFamily])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Visual viewport tracking — keeps the shell fitting the visible area when keyboard opens on mobile
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !isMobile) return
    const update = () => {
      if (!shellRef.current) return
      shellRef.current.style.height  = `${vv.height}px`
      shellRef.current.style.top     = `${vv.offsetTop}px`
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [isMobile])

  // Video call seconds counter (runs while active, resets on close)
  useEffect(() => {
    if (!activeVideoCall) { setVideoSeconds(0); return }
    const t = setInterval(() => setVideoSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [activeVideoCall])

  // Auto-start chat on mount
  useEffect(() => {
    const welcomeText = interpolate(config.welcomeMessage, config.user ?? {})
    setMessages([{
      id: nextDesktopId++,
      role: 'bot', type: 'text',
      text: welcomeText,
      createdAt: new Date(),
      senderName: config.botName,
      senderType: 'Asistente IA',
    }])
  }, [])

  const addMessage = (msg) => setMessages(prev => [...prev, msg])

  const updateLastMessage = (updater) =>
    setMessages(prev => {
      const msgs = [...prev]
      msgs[msgs.length - 1] = updater(msgs[msgs.length - 1])
      return msgs
    })

  const streamText = (fullText) => {
    const sender = agentSession
      ? { senderName: agentSession.name, senderType: 'Agente' }
      : { senderName: config.botName, senderType: 'Asistente IA' }
    addMessage({ id: nextDesktopId++, role: 'bot', type: 'streaming', text: '', createdAt: new Date(), ...sender })
    let i = 0
    streamingRef.current = setInterval(() => {
      i++
      updateLastMessage(msg => ({ ...msg, text: fullText.slice(0, i) }))
      if (i >= fullText.length) {
        clearInterval(streamingRef.current)
        updateLastMessage(msg => ({ ...msg, type: 'text' }))
      }
    }, 18)
  }

  const addUserMessage = (text, attachments = []) => {
    addMessage({ id: nextDesktopId++, role: 'user', type: attachments.length ? 'image' : 'text', text, attachments, createdAt: new Date() })

    if (attachments.length > 0) {
      const senderName = agentSession?.name ?? config.botName ?? 'Botsy AI'
      setIsTyping(true)
      setTypingMode('writing')
      setTimeout(() => {
        setIsTyping(false)
        addMessage({ id: nextDesktopId++, role: 'bot', type: 'file', text: 'Gracias por compartirlo. Te mando la documentación relacionada:', file: { name: 'Documentacion_caso.pdf', size: '248 KB' }, createdAt: new Date(), senderName, senderType: agentSession ? 'Agente' : 'Asistente IA' })
      }, 3200)
      return
    }

    if (agentSession && /^s[ií]$/i.test(text.trim())) {
      setTimeout(() => setIncomingCall(agentSession), 1200)
      return
    }
    if (agentSession && /video/i.test(text.trim())) {
      setTimeout(() => {
        addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: '¡Claro! Te inicio una videollamada ahora.', createdAt: new Date(), senderName: agentSession.name, senderType: 'Agente' })
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
        const botId = nextDesktopId++
        logFallback({ messageId: botId, userText: text, timestamp: new Date().toISOString() })
        addMessage({ id: botId, role: 'bot', type: 'fallback', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' })
      } else {
        streamText(response.text)
      }
    }, 5000)
  }

  const handleSendAudio = ({ duration }) => {
    addMessage({ id: nextDesktopId++, role: 'user', type: 'audio', duration, createdAt: new Date() })
    setIsTyping(true)
    setTypingMode('writing')
    const botAvatar = agentSession?.avatar ?? config.botAvatar ?? null
    const botName   = agentSession?.name   ?? config.botName   ?? 'Botsy AI'
    setTimeout(() => {
      setIsTyping(false)
      addMessage({
        id: nextDesktopId++,
        role: 'bot',
        type: 'audio',
        duration: 7,
        agentAvatar: botAvatar,
        senderName: botName,
        createdAt: new Date(),
      })
    }, 3500)
  }

  const markFallbackActed = () => {
    setMessages(prev => prev.map(m => m.type === 'fallback' ? { ...m, acted: true } : m))
  }

  const handleEscalate = () => {
    markFallbackActed()
    addMessage({ id: nextDesktopId++, role: 'system', type: 'transferring' })
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.type !== 'transferring'))
      const agent = { name: 'Camila', avatar: 'https://i.pravatar.cc/160?img=47', status: 'online' }
      addMessage({ id: nextDesktopId++, role: 'system', type: 'agent_join', agentName: agent.name, agentAvatar: agent.avatar, timestamp: formatTime(new Date()) })
      setAgentSession(agent)
      setTimeout(() => {
        setIsTyping(true)
        setTypingMode('writing')
        setTimeout(() => {
          setIsTyping(false)
          addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: '¡Hola! Soy Camila. Vi tu consulta y me gustaría ayudarte mejor. ¿Te parece bien si te llamo en los próximos minutos?', createdAt: new Date(), senderName: agent.name, senderType: 'Agente' })
        }, 6000)
      }, 2000)
    }, 6000)
  }

  const handleLeaveMessage = () => {
    markFallbackActed()
    addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: 'Dejá tu mensaje y te responderemos a la brevedad.', createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA' })
  }

  const isAgent   = !!agentSession
  const name      = isAgent ? agentSession.name    : (config.botName ?? 'Botsy AI')
  const avatar    = isAgent ? agentSession.avatar  : (config.botAvatar ?? null)
  const subtitle  = isAgent ? 'Tiempo aprox de respuesta < 3 mins' : (config.botSubtitle ?? 'El equipo también puede ayudar')

  const isHistoryView    = selectedSession !== null
  const displayName      = isHistoryView ? selectedSession.name    : name
  const displayAvatar    = isHistoryView ? selectedSession.avatar  : avatar
  const displayIsAgent   = isHistoryView ? selectedSession.isAgent : isAgent
  const displayMessages  = isHistoryView ? selectedSession.messages : messages
  const displaySubtitle  = isHistoryView ? 'Sesión cerrada' : subtitle
  const isTransferring   = !isAgent && !isHistoryView && messages.some(m => m.type === 'transferring')

  const unreadCount = (() => {
    const lastUserIdx = messages.reduce((acc, m, i) => m.role === 'user' ? i : acc, -1)
    return lastUserIdx === -1 ? 0 : messages.slice(lastUserIdx + 1).filter(m => m.role === 'bot').length
  })()

  const sessionsPanelProps = {
    activeName: name, activeAvatar: avatar, activeIsAgent: isAgent,
    activeTitle: deriveTitle(messages),
    activeLastMsg: messages.filter(m => m.role !== 'system').at(-1)?.text ?? '',
    activeUnread: unreadCount,
    selectedId: selectedSession?.id ?? 'active',
    onClose: () => setSessionsOpen(false),
    onSelectActive: () => { setSelectedSession(null); if (isMobile) setSessionsOpen(false) },
    onSelectPast: (s) => { setSelectedSession(s); if (isMobile) setSessionsOpen(false) },
  }

  const infoPanelProps = {
    onClose: () => setInfoOpen(false),
    name: displayName, avatar: displayAvatar, isAgent: displayIsAgent,
    subtitle: displaySubtitle, messages: displayMessages, config,
    isMobile,
  }

  return (
    <div ref={shellRef} style={{ ...shellStyle, padding: isMobile ? 0 : 12 }}>
      {isMobile && <style>{`
          .cw-textarea { font-size: 18px !important; }
          .cw-input-box { border-radius: 20px !important; }
          .cw-action-btn { width: 40px !important; height: 40px !important; }
          .cw-action-btn svg { width: 23px !important; height: 23px !important; }
          .cw-send-btn { width: 44px !important; height: 44px !important; }
          .cw-send-btn svg { width: 21px !important; height: 21px !important; }
      `}</style>}
      <div style={{ ...innerStyle, borderRadius: isMobile ? 0 : 20, border: isMobile ? 'none' : '1px solid #e5e7eb' }}>

        {/* ── Sessions panel ── */}
        <div style={isMobile ? {
          position: 'absolute', inset: 0, zIndex: 30,
          background: '#fff',
          transform: sessionsOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
        } : {
          width: sessionsOpen ? 320 : 0,
          flexShrink: 0, overflow: 'hidden',
          transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: '1px solid #f3f4f6',
        }}>
          <DWSessionsPanel {...sessionsPanelProps} isMobile={isMobile} />
        </div>

        {/* ── Chat column (flex: 1, shrinks when panels open) ── */}
        <div style={chatColStyle}>
          <style>{`
            .dw-hdr-btn {
              width: 32px; height: 32px; border-radius: 50%; border: none;
              background: transparent; color: #6b7280; cursor: pointer;
              display: flex; align-items: center; justify-content: center;
              transition: background 120ms, color 120ms;
            }
            .dw-hdr-btn:hover { background: #f3f4f6; color: #111827; }
          `}</style>

          {/* Header */}
          <div style={headerStyle}>
            <style>{`@keyframes dw-spin{to{transform:rotate(360deg)}}.dw-spin{animation:dw-spin 0.9s linear infinite}`}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="dw-hdr-btn" aria-label="Conversaciones" onClick={() => setSessionsOpen(o => !o)}>
                <ChatsListIcon />
              </button>

              {/* LEFT: brand avatar + name + status */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => setInfoOpen(o => !o)}
              >
                <PanelAvatar size={isMobile ? 54 : 40} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{config.botName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    {!isHistoryView && <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isTransferring ? '#f59e0b' : '#22c55e' }} />}
                    <span style={{ fontSize: 11, color: isHistoryView ? '#9ca3af' : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isHistoryView
                        ? 'Sesión cerrada'
                        : isTransferring
                          ? 'Conectando con un agente...'
                          : isAgent
                            ? 'Centro de atención · < 3 mins'
                            : subtitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: attended-by pill */}
              {!isHistoryView && <DWAttendedByPill isAgent={isAgent} agentSession={agentSession} isTransferring={isTransferring} />}

              <button className="dw-hdr-btn" aria-label="Cerrar" onClick={onClose}>
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...WA_BG_STYLE, position: 'relative' }}>
            <MessageList
              messages={displayMessages}
              isTyping={isHistoryView ? false : isTyping}
              typingMode={typingMode}
              typingStates={typingStates}
              quickReplies={isHistoryView ? [] : config.quickReplies}
              onQuickReply={(opt) => addUserMessage(opt.label)}
              onEscalate={handleEscalate}
              onLeaveMessage={handleLeaveMessage}
              fallbackText={config.fallbackMessage}
              agentName={isHistoryView ? selectedSession.name : agentSession?.name}
              isMobile={isMobile}
            />
            {/* Mini video widget flotante — absolutamente posicionado sobre los mensajes */}
            {activeVideoCall && videoMinimized && (
              <MiniVideoWidget
                agent={activeVideoCall}
                seconds={videoSeconds}
                isMobile={isMobile}
                onRestore={() => setVideoMinimized(false)}
                onHangUp={() => {
                  const a = activeVideoCall
                  const mins = Math.floor(videoSeconds / 60), secs = videoSeconds % 60
                  setActiveVideoCall(null)
                  setVideoMinimized(false)
                  addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: `Videollamada finalizada (${mins > 0 ? `${mins}m ` : ''}${secs}s). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: a.name, senderType: 'Agente' })
                }}
              />
            )}
          </div>

          {/* Input — solo en sesión activa */}
          {isHistoryView ? (
            <div style={closedBarStyle}>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>Esta conversación está cerrada</span>
              <button
                onClick={() => setSelectedSession(null)}
                style={{ fontSize: 13, color: 'var(--cw-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--cw-font-family)', padding: 0 }}
              >
                Ir a la activa →
              </button>
            </div>
          ) : voiceMode ? (
            <VoiceChat
              onAddMessage={(msg) => addMessage({ id: nextDesktopId++, createdAt: new Date(), senderName: config.botName, senderType: 'Asistente IA', ...msg })}
              onStreamBot={(text) => streamText(text)}
              onClose={() => setVoiceMode(false)}
            />
          ) : (
            <ChatInput
              onSend={addUserMessage}
              onSendAudio={handleSendAudio}
              disabled={isTyping}
              onVoice={() => setVoiceMode(true)}
              wrapStyle={inputWrapStyle}
              isMobile={isMobile}
            />
          )}

          {/* Call overlays (posicionados dentro de la columna del chat) */}
          {incomingCall && (
            <IncomingCall
              agent={incomingCall}
              isMobile={isMobile}
              onAccept={() => { const a = incomingCall; setIncomingCall(null); setActiveCall(a) }}
              onDecline={() => {
                const a = incomingCall; setIncomingCall(null)
                addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: 'Entendido, sin problema. Si necesitás algo más estoy por acá.', createdAt: new Date(), senderName: a.name, senderType: 'Agente' })
              }}
            />
          )}
          {activeCall && (
            <ActiveCall
              agent={activeCall}
              isMobile={isMobile}
              onHangUp={(duration) => {
                const a = activeCall
                const mins = Math.floor(duration / 60), secs = duration % 60
                setActiveCall(null)
                addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: `Llamada finalizada (${mins > 0 ? `${mins}m ` : ''}${secs}s). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: a.name, senderType: 'Agente' })
              }}
            />
          )}
          {activeVideoCall && (
            <div style={{ display: videoMinimized ? 'none' : 'contents' }}>
              <ActiveVideoCall
                agent={activeVideoCall}
                isMobile={isMobile}
                onMinimize={() => setVideoMinimized(true)}
                onHangUp={(duration) => {
                  const a = activeVideoCall
                  const mins = Math.floor(duration / 60), secs = duration % 60
                  setActiveVideoCall(null)
                  setVideoMinimized(false)
                  addMessage({ id: nextDesktopId++, role: 'bot', type: 'text', text: `Videollamada finalizada (${mins > 0 ? `${mins}m ` : ''}${secs}s). ¿Pudimos resolver tu consulta?`, createdAt: new Date(), senderName: a.name, senderType: 'Agente' })
                }}
              />
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div style={isMobile ? {
          position: 'absolute', inset: 0, zIndex: 30,
          background: '#fff',
          transform: infoOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
        } : {
          width: infoOpen ? 340 : 0,
          flexShrink: 0, overflow: 'hidden',
          transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderLeft: '1px solid #f3f4f6',
        }}>
          <DWInfoPanel {...infoPanelProps} />
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const PAST_SESSIONS = [
  {
    id: 'ps1', title: 'Estado de mi cuenta', name: 'Botsy AI', isAgent: false, avatar: null,
    lastMsg: 'Gracias por contactarnos. ¿Hay algo más en que pueda ayudarte?', time: 'Ayer',
    messages: [
      { id: 1, role: 'bot',  type: 'text', text: '¡Hola, Santiago! ¿En qué puedo ayudarte hoy?', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 2, role: 'user', type: 'text', text: 'Quería saber el estado de mi cuenta.', createdAt: new Date() },
      { id: 3, role: 'bot',  type: 'text', text: 'Tu cuenta está activa y al día. No tenés saldos pendientes ni alertas.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 4, role: 'user', type: 'text', text: '¿Y mis últimas transacciones?', createdAt: new Date() },
      { id: 5, role: 'bot',  type: 'text', text: 'Las últimas 3 transacciones fueron: $1.200 (supermercado), $350 (transporte), $4.500 (restaurante). ¿Querés más detalle de alguna?', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 6, role: 'user', type: 'text', text: 'No, está bien. Gracias.', createdAt: new Date() },
      { id: 7, role: 'bot',  type: 'text', text: 'Gracias por contactarnos. ¿Hay algo más en que pueda ayudarte?', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
    ],
  },
  {
    id: 'ps2', title: 'Cobro duplicado en servicio', name: 'Camila', isAgent: true, avatar: 'https://i.pravatar.cc/160?img=47',
    lastMsg: '¡Perfecto! Me alegra que hayas podido resolver tu consulta.', time: 'Lun',
    messages: [
      { id: 1, role: 'bot',  type: 'text', text: '¡Hola! Soy Botsy. Veo que tuviste un problema con un cobro duplicado.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 2, role: 'user', type: 'text', text: 'Sí, me cobraron dos veces el mismo servicio.', createdAt: new Date() },
      { id: 3, role: 'bot',  type: 'text', text: 'Entiendo, voy a transferirte con un agente que puede revisarlo directamente.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 4, role: 'system', type: 'agent_join', agentName: 'Camila', agentAvatar: 'https://i.pravatar.cc/160?img=47', timestamp: 'Lun' },
      { id: 5, role: 'bot',  type: 'text', text: '¡Hola! Soy Camila. Ya revisé tu caso — confirmamos el cobro duplicado y procesamos el reembolso. Verás el crédito en 24-48hs.', createdAt: new Date(), senderName: 'Camila', senderType: 'Agente' },
      { id: 6, role: 'user', type: 'text', text: 'Qué rápido, muchas gracias Camila!', createdAt: new Date() },
      { id: 7, role: 'bot',  type: 'text', text: '¡Perfecto! Me alegra que hayas podido resolver tu consulta. Cualquier cosa estamos acá.', createdAt: new Date(), senderName: 'Camila', senderType: 'Agente' },
    ],
  },
  {
    id: 'ps3', title: 'Seguimiento pedido #48291', name: 'Botsy AI', isAgent: false, avatar: null,
    lastMsg: 'Tu pedido #48291 está en camino. Llegará mañana entre 10 y 14hs.', time: '15 jun',
    messages: [
      { id: 1, role: 'bot',  type: 'text', text: '¡Hola, Santiago! ¿En qué puedo ayudarte?', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 2, role: 'user', type: 'text', text: '¿Cuándo llega mi pedido #48291?', createdAt: new Date() },
      { id: 3, role: 'bot',  type: 'text', text: 'Encontré tu pedido. Está en tránsito y llegará mañana 16 de junio entre las 10 y las 14hs.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 4, role: 'user', type: 'text', text: '¿Puedo cambiar la dirección de entrega?', createdAt: new Date() },
      { id: 5, role: 'bot',  type: 'text', text: 'El pedido ya está en camino, por lo que no es posible modificar la dirección. Si no podés recibirlo, el correo dejará un aviso para reprogramar.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
    ],
  },
  {
    id: 'ps4', title: 'Devolución producto dañado', name: 'Tomás', isAgent: true, avatar: 'https://i.pravatar.cc/160?img=11',
    lastMsg: 'Procesamos el reembolso. Verás el crédito en 3-5 días hábiles.', time: '12 jun',
    messages: [
      { id: 1, role: 'bot',  type: 'text', text: '¡Hola! Entiendo que querés hacer una devolución. Dame un momento para conectarte con el equipo.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 2, role: 'system', type: 'agent_join', agentName: 'Tomás', agentAvatar: 'https://i.pravatar.cc/160?img=11', timestamp: '12 jun' },
      { id: 3, role: 'bot',  type: 'text', text: 'Hola Santiago, soy Tomás. Vi tu solicitud de devolución del producto XR-200. ¿Podés contarme qué pasó?', createdAt: new Date(), senderName: 'Tomás', senderType: 'Agente' },
      { id: 4, role: 'user', type: 'text', text: 'Llegó dañado, la pantalla estaba rota desde el embalaje.', createdAt: new Date() },
      { id: 5, role: 'bot',  type: 'text', text: 'Lamento mucho eso. Voy a procesar el reembolso completo de inmediato. No necesitás devolver el producto.', createdAt: new Date(), senderName: 'Tomás', senderType: 'Agente' },
      { id: 6, role: 'user', type: 'text', text: 'Muchas gracias, no lo esperaba tan rápido.', createdAt: new Date() },
      { id: 7, role: 'bot',  type: 'text', text: 'Procesamos el reembolso. Verás el crédito en 3-5 días hábiles. Disculpá las molestias.', createdAt: new Date(), senderName: 'Tomás', senderType: 'Agente' },
    ],
  },
  {
    id: 'ps5', title: 'Activar autenticación 2FA', name: 'Botsy AI', isAgent: false, avatar: null,
    lastMsg: '¿Hay algo más en que pueda ayudarte?', time: '8 jun',
    messages: [
      { id: 1, role: 'bot',  type: 'text', text: '¡Hola, Santiago! Soy Botsy. ¿En qué puedo ayudarte hoy?', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 2, role: 'user', type: 'text', text: '¿Cómo activo la autenticación de dos factores?', createdAt: new Date() },
      { id: 3, role: 'bot',  type: 'text', text: 'Podés activarla desde Configuración → Seguridad → Autenticación en dos pasos. Necesitarás tu número de teléfono para recibir el código SMS.', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
      { id: 4, role: 'user', type: 'text', text: 'Perfecto, lo hago ahora.', createdAt: new Date() },
      { id: 5, role: 'bot',  type: 'text', text: '¡Genial! Una vez activada, tu cuenta estará mucho más protegida. ¿Hay algo más en que pueda ayudarte?', createdAt: new Date(), senderName: 'Botsy AI', senderType: 'Asistente IA' },
    ],
  },
]

function deriveTitle(messages) {
  const first = messages.find(m => m.role === 'user' && m.text)
  if (!first) return 'Nueva conversación'
  const t = first.text.trim()
  return t.length > 38 ? t.slice(0, 36) + '…' : t
}

function DWSessionsPanel({ activeName, activeTitle, activeAvatar, activeIsAgent, activeLastMsg, activeUnread, selectedId, onClose, onSelectActive, onSelectPast, isMobile }) {
  const [search, setSearch] = useState('')
  const filtered = PAST_SESSIONS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.lastMsg.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ width: isMobile ? '100%' : 320, height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
      <style>{`
        .dw-sess-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 10px; cursor: pointer;
          border-radius: 10px;
          margin: 0 6px 2px;
          transition: background 120ms;
        }
        .dw-sess-row:hover { background: #f3f4f6; }
        .dw-sess-row.active { background: #eff6ff; }
        .dw-sess-row.active:hover { background: #dbeafe; }
        .dw-sess-search {
          width: 100%; border: none; outline: none;
          background: #f3f4f6; border-radius: 20px;
          padding: 7px 14px; font-size: 13px;
          color: #111827; font-family: var(--cw-font-family);
        }
        .dw-sess-search::placeholder { color: #9ca3af; }
      `}</style>

      {/* Panel header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {isMobile && (
            <button onClick={onClose} style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', borderRadius: '50%', flexShrink: 0 }}>
              <BackIcon />
            </button>
          )}
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Conversaciones</div>
        </div>
        <input
          className="dw-sess-search"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Active session */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ padding: '8px 16px 4px' }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activa</span>
        </div>
        <div className={`dw-sess-row${selectedId === 'active' ? ' active' : ''}`} onClick={onSelectActive}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <BrandAvatar size={isMobile ? 56 : 42} />
            <span style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{activeTitle || activeName}</span>
              <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, flexShrink: 0 }}>Ahora</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeLastMsg || 'Conversación iniciada'}
            </div>
          </div>
          {activeUnread > 0 && (
            <span style={{
              minWidth: 20, height: 20, borderRadius: 10,
              background: '#22c55e', color: '#fff',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 5px', flexShrink: 0,
            }}>
              {activeUnread > 99 ? '99+' : activeUnread}
            </span>
          )}
        </div>
      </div>

      {/* Past sessions */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ padding: '8px 16px 4px' }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Historial</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '32px 20px' }}>Sin resultados</div>
        ) : (
          filtered.map(s => (
            <div key={s.id} className={`dw-sess-row${selectedId === s.id ? ' active' : ''}`} onClick={() => onSelectPast(s)}>
              <BrandAvatar size={isMobile ? 56 : 42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{s.title}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{s.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                  {s.isAgent && s.avatar && (
                    <img src={s.avatar} alt="" style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                  )}
                  <span style={{ fontSize: isMobile ? 16 : 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.lastMsg}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SessAvatar({ src, name, isAgent, size = 40 }) {
  return (
    <BrandAvatar
      size={size}
      agentAvatar={isAgent ? src : null}
      agentName={isAgent ? name : null}
    />
  )
}

function ChatsListIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DWInfoPanel({ onClose, name, avatar, isAgent, subtitle, messages, config, isMobile = false }) {
  const sharedImages = messages.filter(m => m.attachments?.length > 0).flatMap(m => m.attachments)
  const role         = isAgent ? 'Agente humano' : 'Asistente IA'
  const [lightboxSrc, setLightboxSrc] = useState(null)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
        <style>{`
          .dw-info-row {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 20px; cursor: pointer;
            border-bottom: 1px solid #f9fafb;
            transition: background 120ms;
          }
          .dw-info-row:hover { background: #f9fafb; }
          .dw-info-action {
            display: flex; flex-direction: column; align-items: center; gap: 6px;
            background: #f3f4f6; border: none; border-radius: 12px;
            padding: 12px 16px; cursor: pointer; color: #374151;
            font-family: var(--cw-font-family); font-size: 12px; font-weight: 500;
            transition: background 120ms;
          }
          .dw-info-action:hover { background: #e5e7eb; }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '16px 18px' : '14px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', borderRadius: '50%', flexShrink: 0 }}
          >
            <BackIcon />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Info. del contacto</span>
        </div>

        {/* Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '32px 20px 24px' : '28px 20px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <InfoAvatar src={avatar} name={name} isAgent={isAgent} size={80} />
          <div style={{ marginTop: 14, fontWeight: 700, fontSize: 20, color: '#111827' }}>{name}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{role}</div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>En línea</span>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <button className="dw-info-action">
            <BellIcon />
            Activar notificaciones
          </button>
        </div>

        {/* About / contact */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Sobre nosotros</div>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 14 }}>
            Plataforma líder de automatización conversacional con IA para empresas en Latinoamérica. Atención 24/7 en todos tus canales.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex' }}><GlobeIcon /></span>
              <span style={{ fontSize: 13, color: '#2563eb' }}>www.botmaker.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex' }}><PhoneIcon /></span>
              <span style={{ fontSize: 13, color: '#374151' }}>+54 11 5263-4000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex' }}><MailIcon /></span>
              <span style={{ fontSize: 13, color: '#2563eb' }}>hola@botmaker.com</span>
            </div>
          </div>
        </div>


        {/* Shared media */}
        {sharedImages.length > 0 && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: isMobile ? 13 : 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Archivos y multimedia</div>
              <span style={{ fontSize: isMobile ? 13 : 12, color: '#6b7280' }}>{sharedImages.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sharedImages.slice(0, 6).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxSrc(img.url)}
                  style={{ width: isMobile ? 90 : 72, height: isMobile ? 90 : 72, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, cursor: 'zoom-in' }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings rows */}
        <div style={{ flexShrink: 0 }}>
          <div className="dw-info-row">
            <div style={{ width: isMobile ? 50 : 36, height: isMobile ? 50 : 36, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#6b7280' }}>
              <BellIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: isMobile ? 18 : 14, color: '#111827', fontWeight: 500 }}>Notificaciones</div>
              <div style={{ fontSize: isMobile ? 16 : 12, color: '#9ca3af', marginTop: 1 }}>Activadas</div>
            </div>
            <ChevronIcon />
          </div>

          <div className="dw-info-row">
            <div style={{ width: isMobile ? 50 : 36, height: isMobile ? 50 : 36, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#6b7280' }}>
              <LockIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: isMobile ? 18 : 14, color: '#111827', fontWeight: 500 }}>Cifrado</div>
              <div style={{ fontSize: isMobile ? 16 : 12, color: '#9ca3af', marginTop: 1 }}>Los mensajes están protegidos</div>
            </div>
            <ChevronIcon />
          </div>

          <div className="dw-info-row" style={{ borderBottom: 'none' }}>
            <div style={{ width: isMobile ? 50 : 36, height: isMobile ? 50 : 36, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ef4444' }}>
              <CloseIconSmall />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: isMobile ? 18 : 14, color: '#ef4444', fontWeight: 500 }}>Cerrar conversación</div>
            </div>
          </div>
        </div>
    </div>
  )
}

function InfoAvatar({ src, name, isAgent, size = 80 }) {
  return (
    <BrandAvatar
      size={size}
      pipSize={22}
      agentAvatar={isAgent ? src : null}
      agentName={isAgent ? name : null}
    />
  )
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l1.68-1.68a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CloseIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PanelAvatar({ src, name, isAgent, size = 40 }) {
  return <BrandAvatar size={size} />
}

function DWAttendedByPill({ isAgent, agentSession, isTransferring }) {
  if (isAgent && agentSession) {
    const av  = agentSession.avatar || null
    const nm  = agentSession.name   || ''
    const ini = nm.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 10px 5px 5px', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: av ? '#e5e7eb' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {av ? <img src={av} alt={nm} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{ini}</span>}
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#15803d', fontWeight: 500, lineHeight: 1.1 }}>Atendido por</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', lineHeight: 1.2 }}>{nm}</div>
        </div>
      </div>
    )
  }
  if (isTransferring) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '5px 10px 5px 5px', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="dw-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#92400e', fontWeight: 500, lineHeight: 1.1 }}>Buscando</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', lineHeight: 1.2 }}>agente</div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '5px 10px 5px 5px', flexShrink: 0 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BotmakerLogo size={15} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 500, lineHeight: 1.1 }}>Asistente</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', lineHeight: 1.2 }}>IA</div>
      </div>
    </div>
  )
}

function OnlineBadge() {
  return (
    <span style={{
      position: 'absolute', bottom: 0, right: 0,
      width: 11, height: 11, borderRadius: '50%',
      background: '#22c55e', border: '2px solid #fff',
    }} />
  )
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function MiniVideoWidget({ agent, seconds, isMobile, onRestore, onHangUp }) {
  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 5 }}>
      <div
        onClick={onRestore}
        title="Maximizar videollamada"
        style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#111827', borderRadius: 14, padding: '7px 8px 7px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.22)', cursor: 'pointer', transition: 'background 120ms', userSelect: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
        onMouseLeave={e => e.currentTarget.style.background = '#111827'}
      >
        {/* Avatar + live dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={agent.avatar} alt={agent.name} style={{ width: isMobile ? 38 : 32, height: isMobile ? 38 : 32, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid #111827' }} />
        </div>
        {/* Name + timer */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 13 : 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{agent.name}</div>
          <div style={{ fontSize: isMobile ? 12 : 11, color: '#22c55e', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{fmt(seconds)}</div>
        </div>
        {/* Expand icon */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', flexShrink: 0, margin: '0 2px' }} />
        {/* Hang up */}
        <button
          onClick={e => { e.stopPropagation(); onHangUp() }}
          title="Colgar"
          style={{ width: isMobile ? 34 : 28, height: isMobile ? 34 : 28, borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 120ms' }}
          onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.background = '#dc2626' }}
          onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.background = '#ef4444' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white" style={{ transform: 'rotate(135deg)' }}>
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.25c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02L6.62 10.79z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  background: '#fff',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
  padding: 12,
  fontFamily: 'var(--cw-font-family)',
  fontSize: 'var(--cw-font-size)',
  color: 'var(--cw-text)',
  '--cw-bg-message-bot': '#ffffff',
  '--cw-bg-message-user': '#d9fdd3',
  '--cw-text-message-user': '#111827',
}

const innerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  background: '#fff',
  borderRadius: 20,
  overflow: 'hidden',
  width: '100%',
  border: '1px solid #e5e7eb',
  position: 'relative',
}

const chatColStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  position: 'relative',
  overflow: 'hidden',
}

const WA_BG_STYLE = {
  backgroundColor: '#f0ece4',
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url(/chat-bg.jpg)',
  backgroundSize: '380px',
  backgroundRepeat: 'repeat',
}
const WA_BG = WA_BG_STYLE.backgroundColor

const inputWrapStyle = {
  ...WA_BG_STYLE,
  flexShrink: 0,
  minHeight: 'unset',
}

const closedBarStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 20px', borderTop: '1px solid #f3f4f6',
  background: '#fafafa', flexShrink: 0,
}

const headerStyle = {
  background: '#ffffff',
  borderBottom: '1px solid #f3f4f6',
  padding: '12px 14px',
  flexShrink: 0,
}

function darken(hex) {
  const n = parseInt((hex ?? '#2563eb').replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - 20)
  const g = Math.max(0, ((n >> 8) & 0xff) - 20)
  const b = Math.max(0, (n & 0xff) - 20)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
