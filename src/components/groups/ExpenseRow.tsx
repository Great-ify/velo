import { formatCurrency } from '@/lib/currency'
import MemberAvatar from './MemberAvatar'

interface ExpenseRowProps {
  description: string
  amount: number
  currency: string
  paidByName: string
  date: string
  onClick?: () => void
}

export default function ExpenseRow({ description, amount, currency, paidByName, date, onClick }: ExpenseRowProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-surface-secondary rounded-xl transition-colors -mx-1"
    >
      <MemberAvatar name={paidByName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{description}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {paidByName} paid &middot; {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
      <span className="text-sm font-semibold">{formatCurrency(amount, currency)}</span>
    </div>
  )
}
