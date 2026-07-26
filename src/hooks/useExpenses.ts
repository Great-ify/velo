import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys } from '@/lib/supabase'
import type { Expense, ExpenseSplit } from '@/lib/debts'

export type { Expense, ExpenseSplit }

export interface AddExpenseInput {
  group_id: string
  description: string
  amount: number
  currency: string
  paid_by: string
  split_method: 'equal' | 'exact' | 'percentage'
  splits: { profile_id: string; amount: number }[]
}

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: queryKeys.expenses(groupId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, expense_splits(*)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Expense & { expense_splits: ExpenseSplit[] })[]
    },
    enabled: !!groupId,
  })
}

export function useAddExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddExpenseInput) => {
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: input.group_id,
          description: input.description,
          amount: input.amount,
          currency: input.currency,
          paid_by: input.paid_by,
          split_method: input.split_method,
        })
        .select()
        .single()

      if (expenseError) throw expenseError

      // Insert splits
      const splits = input.splits.map((s) => ({
        expense_id: expense.id,
        profile_id: s.profile_id,
        amount: s.amount,
      }))

      const { error: splitError } = await supabase.from('expense_splits').insert(splits)
      if (splitError) throw splitError

      return expense
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(variables.group_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.group_id) })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ expenseId, groupId }: { expenseId: string; groupId: string }) => {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
      if (error) throw error
      return groupId
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.balances(groupId) })
    },
  })
}
