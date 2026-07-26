import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Send } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useWalletStore } from '@/stores/wallet'
import { formatNimAddress } from '@/lib/nimiq'

export default function TransactionList() {
  const navigate = useNavigate()
  const { nimAddress } = useWalletStore()
  const { data: transactions, isLoading } = useTransactions()

  return (
    <div className="min-h-dvh bg-white">
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center mb-4"
        >
          <ChevronLeft size={22} strokeWidth={2} className="text-black" />
        </button>
        <h1 className="text-2xl font-bold text-black">Transactions</h1>
      </div>

      <div className="px-5">
        {/* Loading */}
        {isLoading && nimAddress && (
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3.5 py-4">
                <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-100 rounded animate-pulse mb-1.5" />
                  <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!transactions || transactions.length === 0) && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Send size={24} strokeWidth={1.5} className="text-gray-300" />
            </div>
            <p className="text-base font-semibold text-gray-400 mb-1">
              No transactions yet
            </p>
            <p className="text-sm text-gray-300 max-w-[240px]">
              {nimAddress
                ? 'Your NIM transactions will appear here'
                : 'Connect your wallet to see transactions'}
            </p>
          </div>
        )}

        {/* List */}
        {transactions && transactions.length > 0 && (
          <div className="space-y-0">
            {transactions.map((tx, i) => (
              <motion.button
                key={tx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/transactions/${tx.hash}`)}
                className="w-full flex items-center gap-3.5 py-4 border-b border-gray-100 last:border-b-0 text-left"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'received' ? 'bg-emerald-50' : 'bg-gray-50'
                  }`}
                >
                  {tx.type === 'received' ? (
                    <ArrowDownLeft size={18} strokeWidth={1.8} className="text-emerald-600" />
                  ) : (
                    <ArrowUpRight size={18} strokeWidth={1.8} className="text-gray-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-black truncate">
                    {tx.type === 'received' ? 'Received' : 'Sent'}
                  </p>
                  <p className="text-[12px] text-gray-400 truncate font-mono">
                    {formatNimAddress(tx.address)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-[14px] font-semibold ${
                      tx.type === 'received' ? 'text-emerald-600' : 'text-black'
                    }`}
                  >
                    {tx.type === 'received' ? '+' : '-'}
                    {tx.amountFormatted}
                  </p>
                  <p className="text-[11px] text-gray-400">{tx.timeAgo}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
