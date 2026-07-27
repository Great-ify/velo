import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys } from '@/lib/supabase'
import { payWithNim } from '@/lib/nimiq'
import { fiatToNim, nimToLuna, getExchangeRates } from '@/lib/currency'

interface PaymentInput {
  groupId?: string
  fromProfileId: string
  toProfileId: string
  toNimAddress?: string
  amount: number
  currency: string
  method: 'NIM'
  chain?: string
}

export function usePayment() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>(
    'idle'
  )
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (input: PaymentInput) => {
      setStatus('pending')
      setError(null)

      if (!input.toNimAddress) throw new Error('Recipient NIM address required')
      const rates = await getExchangeRates()
      const nimAmount = fiatToNim(input.amount, rates.nim_usd)
      const lunaAmount = nimToLuna(nimAmount)

      const result = await payWithNim(input.toNimAddress, lunaAmount)
      if (!result) throw new Error('NIM payment cancelled or failed')
      const hash = result.hash

      setTxHash(hash)

      // Record settlement in database
      if (input.groupId) {
        const { error: dbError } = await supabase.from('settlements').insert({
          group_id: input.groupId,
          from_profile: input.fromProfileId,
          to_profile: input.toProfileId,
          amount: input.amount,
          currency: input.currency,
          payment_method: input.method,
          chain: null,
          tx_hash: hash,
          status: 'confirmed',
        })
        if (dbError) throw dbError
      }

      setStatus('success')
      return hash
    },
    onSuccess: (_hash, variables) => {
      if (variables.groupId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.groupId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.settlements(variables.groupId) })
      }
    },
    onError: (err) => {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Payment failed')
    },
  })

  const reset = () => {
    setStatus('idle')
    setTxHash(null)
    setError(null)
  }

  return {
    pay: mutation.mutate,
    payAsync: mutation.mutateAsync,
    status,
    txHash,
    error,
    isPending: mutation.isPending,
    reset,
  }
}
