import { type ReactNode, createContext, useContext, useEffect } from 'react'
import { useWalletStore } from '@/stores/wallet'
import { supabase } from '@/lib/supabase'

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
    async function initDevice() {
      try {
        let id = localStorage.getItem('velo-device-id')
        if (!id) {
          id = crypto.randomUUID()
          localStorage.setItem('velo-device-id', id)
        }
        setDeviceId(id)

        // Ensure a profile row exists for this device
        await supabase.from('profiles').upsert(
          { device_id: id, updated_at: new Date().toISOString() },
          { onConflict: 'device_id', ignoreDuplicates: true }
        )
      } catch (err) {
        console.error('Failed to init device:', err)
      }
    }
    initDevice()
  }, [setDeviceId])

  // When wallet connects, update the profile row with the address
  useEffect(() => {
    if (!nimAddress) return
    const deviceId = localStorage.getItem('velo-device-id')
    if (!deviceId) return

    supabase
      .from('profiles')
      .upsert(
        {
          device_id: deviceId,
          nim_address: nimAddress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id' }
      )
      .then(({ error }) => {
        if (error) console.error('Failed to sync wallet address:', error)
      })
  }, [nimAddress])

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
