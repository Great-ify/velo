import { useQuery } from '@tanstack/react-query'
import { supabase, queryKeys } from '@/lib/supabase'
import { simplifyDebts, type Debt, type Expense, type ExpenseSplit, type Settlement } from '@/lib/debts'

export function useBalances(groupId: string) {
  return useQuery({
    queryKey: queryKeys.balances(groupId),
    queryFn: async () => {
      // Fetch expenses with splits
      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)

      if (expError) throw expError

      const { data: splits, error: splitError } = await supabase
        .from('expense_splits')
        .select('*')
        .in(
          'expense_id',
          (expenses || []).map((e) => e.id)
        )

      if (splitError) throw splitError

      const { data: settlements, error: settleError } = await supabase
        .from('settlements')
        .select('*')
        .eq('group_id', groupId)

      if (settleError) throw settleError

      const debts = simplifyDebts(
        (expenses || []) as Expense[],
        (splits || []) as ExpenseSplit[],
        (settlements || []) as Settlement[]
      )

      return debts
    },
    enabled: !!groupId,
  })
}

export function useNetBalance(groupId: string, profileId: string) {
  const { data: debts } = useBalances(groupId)

  if (!debts) return 0

  let balance = 0
  for (const debt of debts) {
    if (debt.to === profileId) balance += debt.amount
    if (debt.from === profileId) balance -= debt.amount
  }
  return balance
}

export type { Debt }
