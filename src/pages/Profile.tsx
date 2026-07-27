import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Share2, ExternalLink, ChevronRight } from 'lucide-react'
import { useWalletStore } from '@/stores/wallet'
import { useAppStore } from '@/stores/app'
import { useNimiqContext } from '@/providers/NimiqProvider'
import { formatNimAddress } from '@/lib/nimiq'
import { copyToClipboard } from '@/lib/share'

export default function Profile() {
  const { nimAddress } = useWalletStore()
  const { username } = useAppStore()
  const { connectNimiq, disconnect } = useNimiqContext()
  const [copied, setCopied] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const paymentLink = username ? `velo.app/@${username}` : null

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleShare = async () => {
    if (!paymentLink) return
    try {
      await navigator.share({
        title: 'Pay me on Velo',
        text: `Send me a payment on Velo`,
        url: `https://${paymentLink}`,
      })
    } catch {
      await handleCopy(`https://${paymentLink}`, 'link')
    }
  }

  const handleDisconnect = () => {
    setDisconnecting(true)
    disconnect()
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Profile</h1>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>

      {/* Avatar + Username */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-5 pt-4 pb-6"
      >
        <div className="relative mb-3">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">
              {username
                ? username.charAt(0).toUpperCase()
                : '?'}
            </span>
          </div>
        </div>

        <p className="text-lg font-bold text-black">
          @{username || 'not set'}
        </p>
      </motion.div>

      {/* Payment Link */}
      {paymentLink && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-5 mb-6"
        >
          <p className="text-sm font-semibold text-black mb-2">
            Your payment link
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
            <p className="text-sm text-gray-500 truncate flex-1">
              {paymentLink}
            </p>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => handleCopy(`https://${paymentLink}`, 'link')}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
              >
                {copied === 'link' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <Copy size={14} strokeWidth={1.8} className="text-gray-500" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
              >
                <Share2 size={14} strokeWidth={1.8} className="text-gray-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Wallet */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mb-6"
      >
        <p className="text-sm font-semibold text-black mb-3">Wallet</p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl">
          {/* NIM Wallet */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">N</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">NIM Wallet</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {nimAddress ? formatNimAddress(nimAddress) : 'Not connected'}
                  </p>
                </div>
              </div>
              {nimAddress && (
                <button
                  onClick={() => handleCopy(nimAddress, 'nim')}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
                >
                  {copied === 'nim' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <Copy size={14} strokeWidth={1.8} className="text-gray-500" />
                  )}
                </button>
              )}
            </div>
            {nimAddress ? (
              <>
                <div className="flex items-center justify-between mt-2 ml-[52px]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="text-emerald-600">Connected</span>
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    Nimiq Mainnet
                    <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  </span>
                </div>
                <div className="mt-3 ml-[52px]">
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-xs font-semibold text-red-500 active:text-red-700 transition-colors"
                  >
                    {disconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connectNimiq}
                className="ml-[52px] mt-2 text-xs font-semibold text-black underline"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-5 mb-8"
      >
        <p className="text-sm font-semibold text-black mb-3">About</p>
        <div className="bg-gray-50 border border-gray-100 rounded-xl divide-y divide-gray-100">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-gray-700">App version</span>
            <span className="text-sm text-gray-400">1.0.0</span>
          </div>
          <button
            onClick={() => window.open('https://nimiq.com', '_blank')}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-sm text-gray-700">About Nimiq</span>
            <ChevronRight size={16} strokeWidth={1.8} className="text-gray-300" />
          </button>
          <button
            onClick={() => window.open('https://nimiq.com', '_blank')}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-sm text-gray-700">Nimiq Website</span>
            <ExternalLink size={14} strokeWidth={1.8} className="text-gray-300" />
          </button>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-gray-700">License</span>
            <span className="flex items-center gap-1 text-sm text-gray-400">
              MIT
              <ChevronRight size={16} strokeWidth={1.8} className="text-gray-300" />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
