import { motion } from 'framer-motion'

interface PaymentButtonProps {
  method: 'NIM'
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export default function PaymentButton({ onClick, disabled, loading }: PaymentButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all disabled:opacity-50 bg-nimiq-blue text-white hover:bg-nimiq-blue/90"
    >
      {loading ? (
        <svg width="20" height="20" viewBox="0 0 24 24" className="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"
            strokeDasharray="62.8" strokeDashoffset="20" strokeLinecap="round" />
        </svg>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19.5h20L12 2zm0 4l6.5 11.5h-13L12 6z" />
          </svg>
          Pay with NIM
        </>
      )}
    </motion.button>
  )
}
