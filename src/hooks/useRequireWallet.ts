import { useWalletStore } from '@/stores/wallet'
import { useAppStore } from '@/stores/app'
import { useCallback } from 'react'

export function useRequireWallet() {
  const nimAddress = useWalletStore((s) => s.nimAddress)
  const setShowWalletModal = useAppStore((s) => s.setShowWalletModal)

  const requireWallet = useCallback(
    (action: () => void) => {
      if (!nimAddress) {
        setShowWalletModal(true)
        return
      }
      action()
    },
    [nimAddress, setShowWalletModal]
  )

  return { requireWallet, isConnected: !!nimAddress }
}
