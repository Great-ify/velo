import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGroupDetail, useGroupMembers } from '@/hooks/useGroups'
import { useExpenses } from '@/hooks/useExpenses'
import { useBalances } from '@/hooks/useBalances'
import { useWalletStore } from '@/stores/wallet'
import { formatCurrency } from '@/lib/currency'
import ExpenseRow from '@/components/groups/ExpenseRow'
import DebtList from '@/components/groups/DebtList'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'

type Tab = 'expenses' | 'balances' | 'settle'

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('expenses')
  const { profileId } = useWalletStore()

  const { data: group, isLoading: groupLoading } = useGroupDetail(id!)
  const { data: members } = useGroupMembers(id!)
  const { data: expenses, isLoading: expensesLoading } = useExpenses(id!)
  const { data: debts } = useBalances(id!)

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (!group) return null

  const memberNames: Record<string, string> = {}
  members?.forEach((m: { profile_id: string; profiles: { display_name: string } }) => {
    memberNames[m.profile_id] = m.profiles?.display_name || 'Unknown'
  })

  // Calculate net balance for current user
  let netBalance = 0
  debts?.forEach((d) => {
    if (d.to === profileId) netBalance += d.amount
    if (d.from === profileId) netBalance -= d.amount
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'expenses', label: 'Expenses' },
    { key: 'balances', label: 'Balances' },
    { key: 'settle', label: 'Settle' },
  ]

  return (
    <div className="-mx-4 -mt-4">
      {/* Group header */}
      <div className="bg-gradient-to-b from-nimiq-blue to-nimiq-blue/90 text-white px-5 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{group.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{group.name}</h2>
              <p className="text-white/50 text-xs">{members?.length || 0} members</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/groups/${id}/settings`)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Balance summary */}
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white/50 text-xs mb-1">Your balance</p>
          <p className={`text-2xl font-bold ${netBalance === 0 ? 'text-white/60' : netBalance > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {netBalance === 0
              ? 'Settled up'
              : netBalance > 0
                ? `+${formatCurrency(netBalance, group.default_currency)}`
                : formatCurrency(netBalance, group.default_currency)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative flex-1 py-3 text-sm font-medium text-center"
          >
            <span className={tab === t.key ? 'text-nimiq-blue' : 'text-gray-400'}>{t.label}</span>
            {tab === t.key && (
              <motion.div
                layoutId="group-tab"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-nimiq-gold rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4">
        {tab === 'expenses' && (
          <>
            {expensesLoading ? (
              <LoadingSpinner />
            ) : !expenses || expenses.length === 0 ? (
              <EmptyState
                title="No expenses yet"
                description="Add your first expense to start tracking."
                action={
                  <button
                    onClick={() => navigate(`/groups/${id}/expense/new`)}
                    className="px-5 py-2.5 bg-nimiq-blue text-white rounded-xl font-semibold text-sm"
                  >
                    Add Expense
                  </button>
                }
              />
            ) : (
              <div className="divide-y divide-border-light">
                {expenses.map((exp) => (
                  <ExpenseRow
                    key={exp.id}
                    description={exp.description}
                    amount={exp.amount}
                    currency={exp.currency}
                    paidByName={memberNames[exp.paid_by] || 'Unknown'}
                    date={exp.created_at}
                    onClick={() => navigate(`/groups/${id}/expense/${exp.id}`)}
                  />
                ))}
              </div>
            )}

            {expenses && expenses.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/groups/${id}/expense/new`)}
                className="fixed bottom-24 right-5 px-5 py-3 bg-nimiq-gold text-nimiq-blue rounded-full shadow-lg font-semibold text-sm flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Expense
              </motion.button>
            )}
          </>
        )}

        {tab === 'balances' && (
          <DebtList
            debts={debts || []}
            currency={group.default_currency}
            memberNames={memberNames}
          />
        )}

        {tab === 'settle' && (
          <DebtList
            debts={debts || []}
            currency={group.default_currency}
            memberNames={memberNames}
            onPay={(debt) => navigate(`/groups/${id}/settle`, { state: { debt } })}
          />
        )}
      </div>
    </div>
  )
}
