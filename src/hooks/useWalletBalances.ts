import { useQuery } from '@tanstack/react-query'
import { useWalletStore } from '@/stores/wallet'
import { useExchangeRates } from './useExchangeRates'
import { getNimBalance } from '@/lib/nimiq'
import { getUsdtBalance } from '@/lib/evm'

export function useWalletBalances() {
  const { nimAddress, evmAddress } = useWalletStore()
  const { data: rates } = useExchangeRates()

  const nimQuery = useQuery({
    queryKey: ['nim-balance', nimAddress],
    queryFn: () => getNimBalance(nimAddress!),
    enabled: !!nimAddress,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const usdtQuery = useQuery({
    queryKey: ['usdt-balance', evmAddress],
    queryFn: () => getUsdtBalance(evmAddress!),
    enabled: !!evmAddress,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const nimBalance = nimQuery.data ?? 0
  const usdtBalance = usdtQuery.data ?? 0

  const nimUsd = nimBalance * (rates?.nim_usd ?? 0)
  const usdtUsd = usdtBalance * (rates?.usdt_usd ?? 1)
  const totalUsd = nimUsd + usdtUsd

  return {
    nimBalance,
    usdtBalance,
    totalUsd,
    isLoading: nimQuery.isLoading || usdtQuery.isLoading,
    refetch: () => {
      nimQuery.refetch()
      usdtQuery.refetch()
    },
  }
}
