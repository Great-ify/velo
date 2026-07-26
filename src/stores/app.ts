import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  defaultCurrency: string
  activeGroupId: string | null
  onboardingComplete: boolean
  username: string | null
  showWalletModal: boolean
  showUsernameSetup: boolean
  setDefaultCurrency: (currency: string) => void
  setActiveGroupId: (id: string | null) => void
  setOnboardingComplete: (complete: boolean) => void
  setUsername: (name: string | null) => void
  setShowWalletModal: (show: boolean) => void
  setShowUsernameSetup: (show: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      defaultCurrency: 'USD',
      activeGroupId: null,
      onboardingComplete: false,
      username: null,
      showWalletModal: false,
      showUsernameSetup: false,

      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
      setActiveGroupId: (id) => set({ activeGroupId: id }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      setUsername: (name) => set({ username: name }),
      setShowWalletModal: (show) => set({ showWalletModal: show }),
      setShowUsernameSetup: (show) => set({ showUsernameSetup: show }),
    }),
    {
      name: 'velo-app',
      partialize: (state) => ({
        defaultCurrency: state.defaultCurrency,
        activeGroupId: state.activeGroupId,
        onboardingComplete: state.onboardingComplete,
        username: state.username,
      }),
    }
  )
)
