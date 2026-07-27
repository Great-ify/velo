import { useQuery } from '@tanstack/react-query'
import { useWalletStore } from '@/stores/wallet'
import { useExchangeRates } from './useExchangeRates'
import { getNimBalance } from '@/lib/nimiq'

export function useWalletBalances() {
  const { nimAddress } = useWalletStore()
  const { data: rates } = useExchangeRates()

  const nimQuery = useQuery({
    queryKey: ['nim-balance', nimAddress],
    queryFn: () => getNimBalance(nimAddress!),
    enabled: !!nimAddress,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const nimBalance = nimQuery.data ?? 0
  const nimUsd = nimBalance * (rates?.nim_usd ?? 0)
  const totalUsd = nimUsd

  return {
    nimBalance,
    totalUsd,
    isLoading: nimQuery.isLoading,
    refetch: () => {
      nimQuery.refetch()
    },
  }
}
