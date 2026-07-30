import { useEffect, useState } from 'react'
import { CLIENTS } from '../config/clients'

const STORAGE_KEY = 'oc_recent_clients'
const MAX_RECENT = 12

function readEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordRecentClient(clientId) {
  try {
    const entries = readEntries().filter(e => e.id !== clientId)
    entries.unshift({ id: clientId, ts: Date.now() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_RECENT)))
  } catch {
    // localStorage unavailable (private mode, etc.) — recently-viewed just won't persist
  }
}

export function timeAgo(ts) {
  const minutes = Math.floor((Date.now() - ts) / 60000)
  if (minutes < 1) return 'Justo ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  return `Hace ${Math.floor(days / 7)} sem`
}

export function useRecentClients() {
  const [entries, setEntries] = useState(readEntries)

  useEffect(() => {
    const refresh = () => setEntries(readEntries())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  return entries
    .map(e => {
      const client = CLIENTS.find(c => c.id === e.id)
      return client ? { ...client, lastChatAt: e.ts } : null
    })
    .filter(Boolean)
}
