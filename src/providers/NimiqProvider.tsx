import { type ReactNode, createContext, useContext, useEffect } from 'react'
import { useWalletStore } from '@/stores/wallet'

interface NimiqContextType {
  nimAddress: string | null
  evmAddress: string | null
  isConnecting: boolean
  connectNimiq: () => Promise<void>
  connectEvm: () => Promise<void>
}

const NimiqContext = createContext<NimiqContextType | null>(null)

export function NimiqProvider({ children }: { children: ReactNode }) {
  const { nimAddress, evmAddress, isConnecting, connectNimiq, connectEvm, setDeviceId } =
    useWalletStore()

  useEffect(() => {
    // Try to get device identifier on mount
    async function initDevice() {
      try {
        // In Nimiq Pay, requestDeviceIdentifier provides a per-origin hash
        // For development, we generate a local ID
        const stored = localStorage.getItem('velo-device-id')
        if (stored) {
          setDeviceId(stored)
        } else {
          const id = crypto.randomUUID()
          localStorage.setItem('velo-device-id', id)
          setDeviceId(id)
        }
      } catch (err) {
        console.error('Failed to init device:', err)
      }
    }
    initDevice()
  }, [setDeviceId])

  return (
    <NimiqContext.Provider
      value={{ nimAddress, evmAddress, isConnecting, connectNimiq, connectEvm }}
    >
      {children}
    </NimiqContext.Provider>
  )
}

export function useNimiqContext() {
  const ctx = useContext(NimiqContext)
  if (!ctx) throw new Error('useNimiqContext must be used within NimiqProvider')
  return ctx
}
