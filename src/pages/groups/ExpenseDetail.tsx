import { useParams, useNavigate } from 'react-router-dom'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'
import { useGroupMembers } from '@/hooks/useGroups'
import { formatCurrency } from '@/lib/currency'
import MemberAvatar from '@/components/groups/MemberAvatar'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function ExpenseDetail() {
  const { id: groupId, eid: expenseId } = useParams<{ id: string; eid: string }>()
  const navigate = useNavigate()
  const { data: expenses, isLoading } = useExpenses(groupId!)
  const { data: members } = useGroupMembers(groupId!)
  const deleteExpense = useDeleteExpense()

  const expense = expenses?.find((e) => e.id === expenseId)

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
  if (!expense) return <div className="text-center py-20 text-gray-400">Expense not found</div>

  const memberNames: Record<string, string> = {}
  members?.forEach((m: { profile_id: string; profiles: { display_name: string } }) => {
    memberNames[m.profile_id] = m.profiles?.display_name || 'Unknown'
  })

  const handleDelete = async () => {
    if (!confirm('Delete this expense?')) return
    await deleteExpense.mutateAsync({ expenseId: expense.id, groupId: groupId! })
    navigate(-1)
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-3xl font-bold">{formatCurrency(expense.amount, expense.currency)}</p>
        <p className="text-gray-500 mt-1">{expense.description}</p>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(expense.created_at).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>
      </div>

      <div className="bg-surface-secondary rounded-2xl p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">Paid by</p>
        <div className="flex items-center gap-3">
          <MemberAvatar name={memberNames[expense.paid_by] || 'Unknown'} />
          <span className="font-medium">{memberNames[expense.paid_by] || 'Unknown'}</span>
        </div>
      </div>

      <div className="bg-surface-secondary rounded-2xl p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">Split breakdown</p>
        <div className="space-y-3">
          {expense.expense_splits?.map((split) => (
            <div key={split.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MemberAvatar name={memberNames[split.profile_id] || 'Unknown'} size="sm" />
                <span className="text-sm">{memberNames[split.profile_id] || 'Unknown'}</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(split.amount, expense.currency)}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleteExpense.isPending}
        className="w-full py-3 text-red-500 font-medium text-sm hover:bg-red-50 rounded-xl transition-colors"
      >
        {deleteExpense.isPending ? 'Deleting...' : 'Delete Expense'}
      </button>
    </div>
  )
}
