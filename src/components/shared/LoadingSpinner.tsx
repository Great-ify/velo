export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-spin text-nimiq-gold"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray="62.8"
          strokeDashoffset="20"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
