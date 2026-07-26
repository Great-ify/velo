import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// React Query keys for consistent cache management
export const queryKeys = {
  profile: (deviceId: string) => ['profile', deviceId] as const,
  groups: (profileId: string) => ['groups', profileId] as const,
  groupDetail: (groupId: string) => ['group', groupId] as const,
  groupMembers: (groupId: string) => ['group-members', groupId] as const,
  expenses: (groupId: string) => ['expenses', groupId] as const,
  balances: (groupId: string) => ['balances', groupId] as const,
  settlements: (groupId: string) => ['settlements', groupId] as const,
  invoices: (profileId: string) => ['invoices', profileId] as const,
  invoiceDetail: (invoiceId: string) => ['invoice', invoiceId] as const,
  paymentRequests: (profileId: string) => ['requests', profileId] as const,
  exchangeRates: ['exchange-rates'] as const,
}
