import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useWalletStore } from '@/stores/wallet'
import { useNimiqContext } from '@/providers/NimiqProvider'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function WalletConnectModal() {
  const { showWalletModal, setShowWalletModal, setShowUsernameSetup } = useAppStore()
  const { nimAddress } = useWalletStore()
  const { connectNimiq } = useNimiqContext()
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setError(null)
    setConnecting(true)
    try {
      await connectNimiq()

      // Sync the new address to Supabase profile
      const deviceId = useWalletStore.getState().deviceId
      const address = useWalletStore.getState().nimAddress
      if (deviceId && address) {
        await supabase.from('profiles').upsert(
          {
            device_id: deviceId,
            nim_address: address,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'device_id' }
        )
      }

      setShowWalletModal(false)

      // Prompt username setup if none exists
      const { username } = useAppStore.getState()
      if (!username) {
        setTimeout(() => setShowUsernameSetup(true), 300)
      }
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  if (nimAddress) return null

  return (
    <AnimatePresence>
      {showWalletModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWalletModal(false)}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-6 pb-10 safe-bottom"
          >
            <button
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
            >
              <X size={18} strokeWidth={2} className="text-gray-400" />
            </button>

            <div className="flex flex-col items-center text-center pt-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                <Wallet size={28} strokeWidth={1.5} className="text-gray-500" />
              </div>

              <h2 className="text-xl font-bold text-black mb-2">
                No wallet connected
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[260px]">
                Connect your Nimiq wallet to send, receive and manage payments.
              </p>

              {error && (
                <div className="w-full px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl mb-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect Nimiq Wallet'}
              </button>

              <button
                onClick={() => setShowWalletModal(false)}
                className="mt-4 text-sm text-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
