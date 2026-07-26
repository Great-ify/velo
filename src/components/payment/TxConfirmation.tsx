import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/currency'

interface TxConfirmationProps {
  amount: number
  currency: string
  txHash: string
  method: string
  chain?: string
  onDone: () => void
}

export default function TxConfirmation({ amount, currency, txHash, method, chain, onDone }: TxConfirmationProps) {
  const explorerUrl =
    method === 'NIM'
      ? `https://nimiq.watch/#${txHash}`
      : chain === 'polygon'
        ? `https://polygonscan.com/tx/${txHash}`
        : chain === 'base'
          ? `https://basescan.org/tx/${txHash}`
          : chain === 'arbitrum'
            ? `https://arbiscan.io/tx/${txHash}`
            : `https://etherscan.io/tx/${txHash}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-8 px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </motion.div>

      <h2 className="text-xl font-bold mb-1">Payment Sent!</h2>
      <p className="text-2xl font-bold text-emerald-600 mb-2">
        {formatCurrency(amount, currency)}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        via {method}{chain ? ` on ${chain}` : ''}
      </p>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-nimiq-gold font-medium hover:underline mb-8"
      >
        View on Explorer &rarr;
      </a>

      <button
        onClick={onDone}
        className="w-full py-3 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </motion.div>
  )
}
