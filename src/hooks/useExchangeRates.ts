import { useQuery } from '@tanstack/react-query'
import { getExchangeRates, type ExchangeRates } from '@/lib/currency'
import { queryKeys } from '@/lib/supabase'

export function useExchangeRates() {
  return useQuery<ExchangeRates>({
    queryKey: queryKeys.exchangeRates,
    queryFn: getExchangeRates,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
