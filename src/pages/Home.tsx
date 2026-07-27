import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  Eye,
  EyeOff,
  Users,
  Download,
  Send,
  ScanLine,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useWalletStore } from '@/stores/wallet'
import { useWalletBalances } from '@/hooks/useWalletBalances'
import { useTransactions } from '@/hooks/useTransactions'
import { useRequireWallet } from '@/hooks/useRequireWallet'
import { formatCurrency, formatCrypto } from '@/lib/currency'
import { formatNimAddress } from '@/lib/nimiq'
import QuickRequest from '@/pages/request/QuickRequest'
import VeloLogo from '@/components/VeloLogo'

const QUICK_ACTIONS = [
  { icon: Users, label: 'Split', path: '/split' },
  { icon: Download, label: 'Request', path: '/request' },
  { icon: ScanLine, label: 'Scan', path: '/coming-soon' },
]

export default function Home() {
  const navigate = useNavigate()
  const { username: storedUsername } = useAppStore()
  const { nimAddress } = useWalletStore()
  const { nimBalance, totalUsd, isLoading } = useWalletBalances()
  const { data: transactions, isLoading: txLoading } = useTransactions()
  const { requireWallet } = useRequireWallet()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [requestOpen, setRequestOpen] = useState(false)

  const displayUsername = storedUsername || (nimAddress ? nimAddress.slice(0, 8) : 'user')
  const recentTx = (transactions || []).slice(0, 5)

  return (
    <div className="pb-4">
      {/* ─── Custom header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 pt-14 pb-4"
      >
        <VeloLogo size={28} color="black" />
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
          <Bell size={18} strokeWidth={1.8} className="text-gray-700" />
        </button>
      </motion.div>

      {/* ─── Greeting ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="px-5 pb-5"
      >
        <h1 className="text-[1.5rem] font-bold text-black tracking-tight">
          Hi, @{displayUsername} 👋
        </h1>
      </motion.div>

      {/* ─── Balance Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mx-5 mb-6"
      >
        <div className="relative overflow-hidden rounded-3xl p-5 pb-4"
          style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 25%, #e8eaf6 50%, #f3e5f5 75%, #e0f7fa 100%)',
          }}
        >
          <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, #c5cae9 0%, transparent 70%)', transform: 'translate(20%, -50%)' }}
          />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #b39ddb 0%, transparent 70%)', transform: 'translate(0, 30%)' }}
          />
          <div className="absolute top-0 left-1/3 w-24 h-24 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #80cbc4 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[13px] text-gray-600 font-medium">Total balance</p>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 flex items-center justify-center"
              >
                {balanceVisible ? (
                  <Eye size={16} strokeWidth={1.8} className="text-gray-600" />
                ) : (
                  <EyeOff size={16} strokeWidth={1.8} className="text-gray-600" />
                )}
              </button>
            </div>

            <p className="text-[2.5rem] font-bold text-black leading-none tracking-tight mb-5">
              {balanceVisible ? (
                isLoading ? (
                  <span className="inline-block w-48 h-10 bg-black/5 rounded-xl animate-pulse" />
                ) : nimAddress ? (
                  formatCurrency(totalUsd)
                ) : (
                  '$0.00'
                )
              ) : (
                '••••••'
              )}
            </p>

            <div className="flex items-center gap-3 border-t border-black/5 pt-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 leading-tight">NIM balance</p>
                <p className="text-sm font-bold text-black leading-tight">
                  {balanceVisible
                    ? isLoading
                      ? '...'
                      : nimAddress
                        ? formatCrypto(nimBalance, 'NIM')
                        : '0 NIM'
                    : '•••'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Quick Actions ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="flex items-start justify-between px-5 mb-8"
      >
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={action.label}
            onClick={() => {
              if (action.label === 'Request') {
                requireWallet(() => setRequestOpen(true))
              } else if (action.path) {
                navigate(action.path)
              }
            }}
            className="flex flex-col items-center gap-2 w-[60px]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="w-[52px] h-[52px] rounded-full border border-gray-200 bg-white flex items-center justify-center"
            >
              <action.icon size={22} strokeWidth={1.6} className="text-gray-800" />
            </motion.div>
            <span className="text-xs text-gray-600 font-medium">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* ─── Activity Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="px-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Activity</h2>
          {recentTx.length > 0 && (
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 text-sm text-gray-500 font-medium"
            >
              See all <ArrowRight size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Loading state */}
        {txLoading && nimAddress && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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

        {/* Empty state — no wallet */}
        {!nimAddress && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Send size={22} strokeWidth={1.5} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400 mb-1">No activity yet</p>
            <p className="text-xs text-gray-300">Connect your wallet to see transactions</p>
          </div>
        )}

        {/* Empty state — wallet connected but no transactions */}
        {nimAddress && !txLoading && recentTx.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Send size={22} strokeWidth={1.5} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400 mb-1">No transactions yet</p>
            <p className="text-xs text-gray-300">Your NIM transactions will appear here</p>
          </div>
        )}

        {/* Real transaction list */}
        {recentTx.length > 0 && (
          <div className="space-y-0">
            {recentTx.map((tx, i) => (
              <motion.button
                key={tx.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => navigate(`/transactions/${tx.hash}`)}
                className="w-full flex items-center gap-3.5 py-4 border-b border-gray-100 last:border-b-0 text-left"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'received' ? 'bg-emerald-50' : 'bg-gray-50'
                }`}>
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
                  <p className={`text-[14px] font-semibold ${
                    tx.type === 'received' ? 'text-emerald-600' : 'text-black'
                  }`}>
                    {tx.type === 'received' ? '+' : '-'}{tx.amountFormatted}
                  </p>
                  <p className="text-[11px] text-gray-400">{tx.timeAgo}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      <QuickRequest
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </div>
  )
}
