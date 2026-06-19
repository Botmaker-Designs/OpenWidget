export function HumanAvatar({ name, size = 40 }) {
  const colors = [
    ['#fde68a', '#92400e'],
    ['#bbf7d0', '#065f46'],
    ['#bfdbfe', '#1e40af'],
    ['#fecaca', '#991b1b'],
    ['#e9d5ff', '#6b21a8'],
    ['#fed7aa', '#92400e'],
  ]
  const index = name ? name.charCodeAt(0) % colors.length : 0
  const [bg, fg] = colors[index]
  const initials = name ? name.slice(0, 2).toUpperCase() : 'AG'
  const radius = size * 0.28

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx={radius} fill={bg} />
      {/* Cabeza */}
      <circle cx="20" cy="16" r="7" fill={fg} opacity="0.9" />
      {/* Cuerpo */}
      <path d="M6 36c0-7.732 6.268-12 14-12s14 4.268 14 12" fill={fg} opacity="0.9" />
    </svg>
  )
}
