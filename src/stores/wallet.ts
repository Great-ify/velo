import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { connectNimiqWallet } from '@/lib/nimiq'

interface WalletStore {
  nimAddress: string | null
  deviceId: string | null
  profileId: string | null
  isConnecting: boolean
  setDeviceId: (id: string) => void
  setProfileId: (id: string) => void
  connectNimiq: () => Promise<void>
  disconnect: () => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      nimAddress: null,
      deviceId: null,
      profileId: null,
      isConnecting: false,

      setDeviceId: (id) => set({ deviceId: id }),
      setProfileId: (id) => set({ profileId: id }),

      connectNimiq: async () => {
        set({ isConnecting: true })
        try {
          const address = await connectNimiqWallet()
          if (!address) throw new Error('No Nimiq accounts found')
          set({ nimAddress: address })
        } finally {
          set({ isConnecting: false })
        }
      },

      disconnect: () =>
        set({
          nimAddress: null,
          deviceId: null,
          profileId: null,
        }),
    }),
    {
      name: 'velo-wallet',
      partialize: (state) => ({
        nimAddress: state.nimAddress,
        deviceId: state.deviceId,
        profileId: state.profileId,
      }),
    }
  )
)
