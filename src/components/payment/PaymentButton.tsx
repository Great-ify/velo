import { motion } from 'framer-motion'
import type { PaymentMethod } from '@/lib/constants'

interface PaymentButtonProps {
  method: PaymentMethod
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export default function PaymentButton({ method, onClick, disabled, loading }: PaymentButtonProps) {
  const isNim = method === 'NIM'

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all disabled:opacity-50 ${
        isNim
          ? 'bg-nimiq-blue text-white hover:bg-nimiq-blue/90'
          : 'bg-emerald-500 text-white hover:bg-emerald-600'
      }`}
    >
      {loading ? (
        <svg width="20" height="20" viewBox="0 0 24 24" className="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"
            strokeDasharray="62.8" strokeDashoffset="20" strokeLinecap="round" />
        </svg>
      ) : (
        <>
          {isNim ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h20L12 2zm0 4l6.5 11.5h-13L12 6z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          )}
          Pay with {isNim ? 'NIM' : 'USDT'}
        </>
      )}
    </motion.button>
  )
}
