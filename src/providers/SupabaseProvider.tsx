import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWalletStore } from '@/stores/wallet'
import { useAppStore } from '@/stores/app'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
})

interface SupabaseContextType {
  isReady: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({ isReady: false })

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const { deviceId, nimAddress, setProfileId } = useWalletStore()
  const { setUsername, setShowUsernameSetup, username } = useAppStore()

  useEffect(() => {
    async function initProfile() {
      if (!deviceId) {
        setIsReady(true)
        return
      }

      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('device_id', deviceId)
          .single()

        if (existing) {
          setProfileId(existing.id)
          if (existing.username) {
            setUsername(existing.username)
          }
        } else if (nimAddress) {
          // Try to find profile by nim_address (returning user on new device)
          const { data: byAddress } = await supabase
            .from('profiles')
            .select('id, username, device_id')
            .eq('nim_address', nimAddress)
            .single()

          if (byAddress) {
            setProfileId(byAddress.id)
            if (byAddress.username) setUsername(byAddress.username)
            // Update device_id if different
            if (byAddress.device_id !== deviceId) {
              await supabase
                .from('profiles')
                .update({ device_id: deviceId })
                .eq('id', byAddress.id)
            }
          }
        }
      } catch {
        // Profile doesn't exist yet
      } finally {
        setIsReady(true)
      }
    }

    initProfile()
  }, [deviceId, nimAddress, setProfileId, setUsername])

  // Prompt username setup after wallet connect if no username
  useEffect(() => {
    if (nimAddress && !username && isReady) {
      const timer = setTimeout(() => {
        setShowUsernameSetup(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [nimAddress, username, isReady, setShowUsernameSetup])

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseContext.Provider value={{ isReady }}>
        {children}
      </SupabaseContext.Provider>
    </QueryClientProvider>
  )
}

export function useSupabaseContext() {
  return useContext(SupabaseContext)
}

export { queryClient }
