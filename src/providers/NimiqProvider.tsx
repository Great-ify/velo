import { type ReactNode, createContext, useContext, useEffect } from 'react'
import { useWalletStore } from '@/stores/wallet'
import { supabase } from '@/lib/supabase'

interface NimiqContextType {
  nimAddress: string | null
  isConnecting: boolean
  connectNimiq: () => Promise<void>
  disconnect: () => void
}

const NimiqContext = createContext<NimiqContextType | null>(null)

export function NimiqProvider({ children }: { children: ReactNode }) {
  const { nimAddress, isConnecting, connectNimiq, disconnect, setDeviceId, setProfileId } =
    useWalletStore()

  useEffect(() => {
    async function initDevice() {
      try {
        let id = localStorage.getItem('velo-device-id')
        if (!id) {
          id = crypto.randomUUID()
          localStorage.setItem('velo-device-id', id)
        }

        // Ensure a profile row exists for this device BEFORE setting deviceId
        // so SupabaseProvider's query finds the row when it reacts to the change
        const { data: profile } = await supabase
          .from('profiles')
          .upsert(
            { device_id: id, updated_at: new Date().toISOString() },
            { onConflict: 'device_id' }
          )
          .select('id')
          .single()

        if (profile) {
          setProfileId(profile.id)
        }

        // Set deviceId after the row exists so downstream queries succeed
        setDeviceId(id)
      } catch (err) {
        // Fallback: still set deviceId so the app isn't broken
        const id = localStorage.getItem('velo-device-id')
        if (id) setDeviceId(id)
        console.error('Failed to init device:', err)
      }
    }
    initDevice()
  }, [setDeviceId, setProfileId])

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
      value={{ nimAddress, isConnecting, connectNimiq, disconnect }}
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
