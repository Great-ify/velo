import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { formatNimAddress } from '@/lib/nimiq'
import { copyToClipboard } from '@/lib/share'
import { useState } from 'react'

export default function TransactionDetail() {
  const { hash } = useParams<{ hash: string }>()
  const navigate = useNavigate()
  const { data: transactions } = useTransactions()
  const [copied, setCopied] = useState<string | null>(null)

  const tx = transactions?.find((t) => t.hash === hash)

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!tx) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Transaction not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-black underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const isReceived = tx.type === 'received'
  const date = new Date(tx.timestamp)

  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={22} strokeWidth={2} className="text-black" />
        </button>
      </div>

      {/* Status icon + amount */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 pt-6 pb-8"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isReceived ? 'bg-emerald-50' : 'bg-gray-50'
          }`}
        >
          {isReceived ? (
            <ArrowDownLeft size={28} strokeWidth={1.8} className="text-emerald-600" />
          ) : (
            <ArrowUpRight size={28} strokeWidth={1.8} className="text-gray-600" />
          )}
        </div>

        <p className="text-sm text-gray-400 mb-1">
          {isReceived ? 'Received' : 'Sent'}
        </p>
        <p
          className={`text-3xl font-bold ${
            isReceived ? 'text-emerald-600' : 'text-black'
          }`}
        >
          {isReceived ? '+' : '-'}{tx.amountFormatted}
        </p>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-5 bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100"
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-gray-400">Type</span>
          <span className="text-sm font-medium text-black">
            {isReceived ? 'Received' : 'Sent'}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-gray-400">
            {isReceived ? 'From' : 'To'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-black font-mono">
              {formatNimAddress(tx.address)}
            </span>
            <button
              onClick={() => handleCopy(tx.address, 'addr')}
              className="text-gray-400"
            >
              {copied === 'addr' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <Copy size={14} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-gray-400">Network</span>
          <span className="text-sm font-medium text-black">Nimiq Mainnet</span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-gray-400">Fee</span>
          <span className="text-sm font-medium text-black">
            {tx.fee > 0 ? `${tx.fee.toFixed(5)} NIM` : 'Free'}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-gray-400">Date</span>
          <span className="text-sm font-medium text-black">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-gray-400">Hash</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-black font-mono max-w-[120px] truncate">
              {tx.hash}
            </span>
            <button
              onClick={() => handleCopy(tx.hash, 'hash')}
              className="text-gray-400"
            >
              {copied === 'hash' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <Copy size={14} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* View on explorer */}
      <div className="px-5 pt-6 pb-10">
        <button
          onClick={() =>
            window.open(`https://nimiq.watch/#${tx.hash}`, '_blank')
          }
          className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <ExternalLink size={16} strokeWidth={2} />
          View on Nimiq Explorer
        </button>
      </div>
    </div>
  )
}
