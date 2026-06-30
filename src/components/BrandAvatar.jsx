import { BotmakerLogo } from './BotmakerLogo'

function initials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * BrandAvatar — marca siempre en el centro, agente como pip opcional.
 *
 * Props:
 *   size        — diámetro del círculo principal (default 36)
 *   pipSize     — diámetro del pip (default 18)
 *   agentAvatar — URL de la foto del agente (pip con foto)
 *   agentName   — nombre del agente (pip con iniciales si no hay foto)
 *                 Si ambos son null/undefined → sin pip (Botsy AI)
 */
export function BrandAvatar({ size = 36, pipSize = 18, agentAvatar = null, agentName = null }) {
  const hasPip   = !!(agentAvatar || agentName)
  const logoSize = Math.round(size * 0.48)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Círculo principal — siempre la marca */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <BotmakerLogo size={logoSize} />
      </div>

      {/* Pip — foto real o iniciales como fallback */}
      {hasPip && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: pipSize, height: pipSize, borderRadius: '50%',
          border: '2px solid #fff',
          overflow: 'hidden',
          background: agentAvatar ? '#e5e7eb' : '#6b7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {agentAvatar
            ? <img src={agentAvatar} alt={agentName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: Math.round(pipSize * 0.38), fontWeight: 800, color: '#fff', userSelect: 'none', letterSpacing: '-0.01em' }}>
                {initials(agentName)}
              </span>
          }
        </div>
      )}
    </div>
  )
}
