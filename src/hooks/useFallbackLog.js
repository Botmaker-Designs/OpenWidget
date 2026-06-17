export function useFallbackLog(endpoint) {
  const logFallback = ({ messageId, userText, timestamp }) => {
    const event = { messageId, userText, timestamp, type: 'fallback' }
    console.warn('[ChatWidget] fallback detectado:', event)

    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {})
    }
  }

  return { logFallback }
}
