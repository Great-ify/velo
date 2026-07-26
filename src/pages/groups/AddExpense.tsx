import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGroupMembers } from '@/hooks/useGroups'
import { useAddExpense } from '@/hooks/useExpenses'
import { useWalletStore } from '@/stores/wallet'
import { useAppStore } from '@/stores/app'
import AmountInput from '@/components/payment/AmountInput'
import MemberAvatar from '@/components/groups/MemberAvatar'

export default function AddExpense() {
  const { id: groupId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profileId } = useWalletStore()
  const { defaultCurrency } = useAppStore()
  const addExpense = useAddExpense()
  const { data: members } = useGroupMembers(groupId!)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(profileId || '')
  const [splitMethod] = useState<'equal'>('equal')

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount)
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0 || !members?.length) return

    // Calculate equal splits
    const splitAmount = Math.round((numAmount / members.length) * 100) / 100
    const splits = members.map((m: { profile_id: string }) => ({
      profile_id: m.profile_id,
      amount: splitAmount,
    }))

    // Adjust rounding difference to the first member
    const totalSplit = splitAmount * members.length
    if (Math.abs(totalSplit - numAmount) > 0.001) {
      splits[0].amount += numAmount - totalSplit
      splits[0].amount = Math.round(splits[0].amount * 100) / 100
    }

    try {
      await addExpense.mutateAsync({
        group_id: groupId!,
        description: description.trim(),
        amount: numAmount,
        currency: defaultCurrency,
        paid_by: paidBy,
        split_method: splitMethod,
        splits,
      })
      navigate(-1)
    } catch (err) {
      console.error('Failed to add expense:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this for?"
          className="w-full py-3 px-4 bg-surface-secondary border border-border rounded-xl outline-none focus:border-nimiq-gold transition-colors"
          autoFocus
        />
      </div>

      {/* Amount */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Amount</label>
        <AmountInput value={amount} onChange={setAmount} currency={defaultCurrency} />
      </div>

      {/* Paid by */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Paid by</label>
        <div className="flex flex-wrap gap-2">
          {members?.map((m: { profile_id: string; profiles: { display_name: string } }) => (
            <button
              key={m.profile_id}
              onClick={() => setPaidBy(m.profile_id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                paidBy === m.profile_id
                  ? 'border-nimiq-gold bg-amber-50/50'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              <MemberAvatar name={m.profiles?.display_name || 'Unknown'} size="sm" />
              <span>{m.profiles?.display_name || 'Unknown'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Split info */}
      <div className="bg-surface-secondary rounded-xl p-4">
        <p className="text-sm text-gray-500">
          Split equally among{' '}
          <span className="font-semibold text-gray-700">{members?.length || 0} members</span>
        </p>
        {amount && members?.length && (
          <p className="text-sm text-gray-400 mt-1">
            ${(parseFloat(amount) / members.length).toFixed(2)} per person
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!description.trim() || !amount || addExpense.isPending}
        className="w-full py-4 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {addExpense.isPending ? 'Adding...' : 'Add Expense'}
      </button>
    </div>
  )
}
