import { formatCurrency } from '@/lib/currency'
import { motion } from 'framer-motion'

interface BalanceCardProps {
  groupName: string
  emoji: string
  balance: number
  currency: string
  onClick?: () => void
}

export default function BalanceCard({ groupName, emoji, balance, currency, onClick }: BalanceCardProps) {
  const isPositive = balance > 0
  const isZero = Math.abs(balance) < 0.01

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white border border-border rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-surface-secondary rounded-xl flex items-center justify-center text-xl">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{groupName}</h3>
          <p
            className={`text-sm font-medium mt-0.5 ${
              isZero ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {isZero
              ? 'Settled up'
              : isPositive
                ? `You are owed ${formatCurrency(balance, currency)}`
                : `You owe ${formatCurrency(Math.abs(balance), currency)}`}
          </p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.div>
  )
}
