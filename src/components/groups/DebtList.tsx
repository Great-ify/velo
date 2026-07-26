import { formatCurrency } from '@/lib/currency'
import MemberAvatar from './MemberAvatar'
import type { Debt } from '@/hooks/useBalances'

interface DebtListProps {
  debts: Debt[]
  currency: string
  memberNames: Record<string, string>
  onPay?: (debt: Debt) => void
}

export default function DebtList({ debts, currency, memberNames, onPay }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        All settled up!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {debts.map((debt, i) => (
        <div key={i} className="flex items-center gap-3 bg-surface-secondary rounded-xl p-3">
          <MemberAvatar name={memberNames[debt.from] || 'Unknown'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{memberNames[debt.from] || 'Unknown'}</span>
              <span className="text-gray-400 mx-1">owes</span>
              <span className="font-medium">{memberNames[debt.to] || 'Unknown'}</span>
            </p>
            <p className="text-sm font-semibold text-red-500 mt-0.5">
              {formatCurrency(debt.amount, currency)}
            </p>
          </div>
          {onPay && (
            <button
              onClick={() => onPay(debt)}
              className="px-3 py-1.5 bg-nimiq-gold text-nimiq-blue rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Pay
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
