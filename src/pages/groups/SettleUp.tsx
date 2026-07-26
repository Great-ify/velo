import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useGroupMembers } from '@/hooks/useGroups'
import { useWalletStore } from '@/stores/wallet'
import { usePayment } from '@/hooks/usePayment'
import { formatCurrency } from '@/lib/currency'
import PaymentButton from '@/components/payment/PaymentButton'
import ChainSelector from '@/components/payment/ChainSelector'
import TxConfirmation from '@/components/payment/TxConfirmation'
import type { Debt } from '@/hooks/useBalances'
import type { PaymentMethod } from '@/lib/constants'

export default function SettleUp() {
  const { id: groupId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const debt = (location.state as { debt?: Debt })?.debt

  const { profileId } = useWalletStore()
  const { data: members } = useGroupMembers(groupId!)
  const { pay, status, txHash, error, reset } = usePayment()
  const [chain, setChain] = useState('polygon')
  const [method, setMethod] = useState<PaymentMethod>('NIM')

  if (!debt) {
    navigate(`/groups/${groupId}`, { replace: true })
    return null
  }

  const memberNames: Record<string, string> = {}
  const memberNim: Record<string, string> = {}
  const memberEvm: Record<string, string> = {}
  members?.forEach((m: { profile_id: string; profiles: { display_name: string; nim_address: string | null; evm_address: string | null } }) => {
    memberNames[m.profile_id] = m.profiles?.display_name || 'Unknown'
    if (m.profiles?.nim_address) memberNim[m.profile_id] = m.profiles.nim_address
    if (m.profiles?.evm_address) memberEvm[m.profile_id] = m.profiles.evm_address
  })

  if (status === 'success' && txHash) {
    return (
      <TxConfirmation
        amount={debt.amount}
        currency="USD"
        txHash={txHash}
        method={method}
        chain={method === 'USDT' ? chain : undefined}
        onDone={() => {
          reset()
          navigate(`/groups/${groupId}`, { replace: true })
        }}
      />
    )
  }

  const isCurrentUserDebtor = debt.from === profileId

  const handlePay = () => {
    pay({
      groupId: groupId!,
      fromProfileId: debt.from,
      toProfileId: debt.to,
      toNimAddress: memberNim[debt.to],
      toEvmAddress: memberEvm[debt.to],
      amount: debt.amount,
      currency: 'USD',
      method,
      chain: method === 'USDT' ? chain : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-sm text-gray-400 mb-1">
          {memberNames[debt.from]} owes {memberNames[debt.to]}
        </p>
        <p className="text-3xl font-bold">{formatCurrency(debt.amount, 'USD')}</p>
      </div>

      {isCurrentUserDebtor && (
        <>
          {/* Method selector */}
          <div className="flex gap-2">
            {(['NIM', 'USDT'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                  method === m
                    ? 'border-nimiq-gold bg-amber-50/50 text-nimiq-blue'
                    : 'border-border text-gray-500'
                }`}
              >
                {m === 'NIM' ? 'Pay with NIM' : 'Pay with USDT'}
              </button>
            ))}
          </div>

          {method === 'USDT' && <ChainSelector selected={chain} onChange={setChain} />}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <PaymentButton
            method={method}
            onClick={handlePay}
            loading={status === 'pending' || status === 'confirming'}
          />

          {status === 'confirming' && (
            <p className="text-center text-sm text-gray-400">Waiting for confirmation...</p>
          )}
        </>
      )}

      {!isCurrentUserDebtor && (
        <div className="text-center text-gray-400 text-sm py-8">
          Waiting for {memberNames[debt.from]} to settle this debt.
        </div>
      )}
    </div>
  )
}
