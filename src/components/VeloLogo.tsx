interface VeloLogoProps {
  size?: number
  color?: string
  className?: string
  showText?: boolean
  textClassName?: string
}

export default function VeloLogo({
  size = 24,
  color = 'currentColor',
  className = '',
  showText = false,
  textClassName = '',
}: VeloLogoProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <line x1="5" y1="18" x2="10" y2="6" />
        <line x1="14" y1="18" x2="19" y2="6" />
      </svg>
      {showText && (
        <span className={`font-bold text-xl tracking-tight ${textClassName}`}>
          Velo
        </span>
      )}
    </span>
  )
}

export function VeloAppIcon({
  size = 48,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const iconSize = size * 0.45
  return (
    <div
      className={`bg-black rounded-[22%] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <line x1="5" y1="18" x2="10" y2="6" />
        <line x1="14" y1="18" x2="19" y2="6" />
      </svg>
    </div>
  )
}
