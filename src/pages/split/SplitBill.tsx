import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  X,
  Search,
  Plus,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useWalletStore } from '@/stores/wallet'
import { useCreateGroup } from '@/hooks/useGroups'
import { useAddExpense } from '@/hooks/useExpenses'
import { supabase } from '@/lib/supabase'
import MemberAvatar from '@/components/groups/MemberAvatar'

type Step = 'amount' | 'confirm' | 'loading' | 'success' | 'error'
type ErrorType = 'balance' | 'no-contacts' | null

interface SplitMember {
  id: string
  name: string
  percentage: number
  isYou?: boolean
}

interface SearchResult {
  id: string
  display_name: string
  wallet_address: string
}

export default function SplitBill() {
  const navigate = useNavigate()
  const { username, defaultCurrency } = useAppStore()
  const { profileId } = useWalletStore()
  const createGroup = useCreateGroup()
  const addExpense = useAddExpense()

  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [members, setMembers] = useState<SplitMember[]>([
    { id: profileId || 'you', name: username || 'You', percentage: 100, isYou: true },
  ])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [errorType, setErrorType] = useState<ErrorType>(null)
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const parsedAmount = parseFloat(amount) || 0

  // Redistribute percentages equally when members change
  useEffect(() => {
    if (members.length > 0) {
      const equal = Math.floor(100 / members.length)
      const remainder = 100 - equal * members.length
      setMembers((prev) =>
        prev.map((m, i) => ({
          ...m,
          percentage: equal + (i === prev.length - 1 ? remainder : 0),
        }))
      )
    }
  }, [members.length])

  // Search profiles
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, wallet_address')
        .ilike('display_name', `%${searchQuery}%`)
        .limit(10)
      setSearchResults(
        (data || []).filter(
          (r: SearchResult) => r.id !== profileId && !members.some((m) => m.id === r.id)
        )
      )
      setSearchLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, profileId, members])

  const addMember = (result: SearchResult) => {
    setMembers((prev) => [...prev, { id: result.id, name: result.display_name, percentage: 0 }])
    setSearchQuery('')
    setSearchResults([])
  }

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const updatePercentage = (id: string, value: number) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, percentage: value } : m)))
  }

  const totalPercentage = members.reduce((sum, m) => sum + m.percentage, 0)

  const handleConfirmSplit = () => {
    if (members.length <= 1) {
      setErrorType('no-contacts')
      setStep('error')
      return
    }
    if (!parsedAmount || parsedAmount <= 0) return
    setShowConfirmModal(true)
  }

  const handleExecuteSplit = async () => {
    setShowConfirmModal(false)
    setStep('loading')

    try {
      const group = await createGroup.mutateAsync({
        name: `Split $${parsedAmount.toFixed(2)}`,
        emoji: '💸',
        default_currency: defaultCurrency,
      })

      // Add other members to the group
      const otherMembers = members.filter((m) => !m.isYou)
      if (otherMembers.length > 0) {
        await supabase.from('group_members').insert(
          otherMembers.map((m) => ({
            group_id: group.id,
            profile_id: m.id,
            role: 'member',
          }))
        )
      }

      // Create the expense with percentage-based splits
      const splits = members.map((m) => ({
        profile_id: m.id,
        amount: Math.round((parsedAmount * m.percentage) / 100 * 100) / 100,
      }))

      // Adjust rounding so splits sum to total
      const splitSum = splits.reduce((s, sp) => s + sp.amount, 0)
      if (Math.abs(splitSum - parsedAmount) > 0.001 && splits.length > 0) {
        splits[0].amount += parsedAmount - splitSum
        splits[0].amount = Math.round(splits[0].amount * 100) / 100
      }

      await addExpense.mutateAsync({
        group_id: group.id,
        description: `Split $${parsedAmount.toFixed(2)}`,
        amount: parsedAmount,
        currency: defaultCurrency,
        paid_by: profileId || '',
        split_method: 'percentage',
        splits,
      })

      setCreatedGroupId(group.id)
      setStep('success')
    } catch (err) {
      console.error('Split creation failed:', err)
      setErrorType('balance')
      setStep('error')
    }
  }

  const getMemberAmount = (m: SplitMember) =>
    Math.round((parsedAmount * m.percentage) / 100 * 100) / 100

  // ─── SEARCH OVERLAY ───
  if (searchOpen) {
    return (
      <div className="min-h-dvh bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <button onClick={() => setSearchOpen(false)} className="w-9 h-9 flex items-center justify-center">
            <ChevronLeft size={22} strokeWidth={2} className="text-black" />
          </button>
          <h1 className="text-lg font-bold text-black">Split Bill</h1>
          <button onClick={() => { setSearchOpen(false); navigate('/home') }} className="w-9 h-9 flex items-center justify-center">
            <X size={20} strokeWidth={2} className="text-black" />
          </button>
        </div>

        {/* Amount display */}
        <div className="text-center px-5 pb-4">
          <p className="text-[11px] text-gray-400 mb-1">Enter total amount</p>
          <p className="text-[2rem] font-bold text-black">${amount || '0.00'}</p>
        </div>

        {/* Search section */}
        <div className="px-5 pb-3">
          <p className="text-[13px] font-semibold text-black mb-2">Split with</p>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 px-5 overflow-y-auto">
          {searchLoading && (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          )}
          {searchResults.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-3 border-b border-gray-100">
              <MemberAvatar name={r.display_name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{r.display_name}</p>
                <p className="text-xs text-gray-400 truncate">@{r.display_name.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              <button
                onClick={() => { addMember(r); setSearchOpen(false) }}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"
              >
                <Plus size={16} strokeWidth={2} className="text-black" />
              </button>
            </div>
          ))}
          {!searchLoading && searchQuery && searchResults.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">No results found</p>
          )}
        </div>
      </div>
    )
  }

  // ─── SUCCESS STATE ───
  if (step === 'success') {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5"
        >
          <Check size={32} strokeWidth={2.5} className="text-emerald-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl font-bold text-black mb-2"
        >
          Split created!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400 text-center mb-10"
        >
          Payment requests have been sent to {members.length - 1} people.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-8 mb-10"
        >
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Total amount</p>
            <p className="text-lg font-bold text-black">${parsedAmount.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Split with</p>
            <p className="text-lg font-bold text-black">{members.length - 1} people</p>
          </div>
        </motion.div>

        {/* Summary avatars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-12"
        >
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <MemberAvatar name={m.name} size="sm" />
              <span className="text-[10px] text-emerald-600 font-semibold">{m.percentage}%</span>
              <span className="text-[10px] text-gray-400">${getMemberAmount(m).toFixed(2)}</span>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => createdGroupId && navigate(`/groups/${createdGroupId}`)}
            className="w-full py-[15px] bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            View Group
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full py-[15px] text-gray-500 text-[15px] font-medium active:scale-[0.98] transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // ─── ERROR STATE ───
  if (step === 'error') {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5"
        >
          <AlertTriangle size={32} strokeWidth={2} className="text-amber-600" />
        </motion.div>
        <h2 className="text-xl font-bold text-black mb-2">
          {errorType === 'balance' ? 'Insufficient Balance' : 'No one selected'}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-10 max-w-[260px]">
          {errorType === 'balance'
            ? "You don't have enough balance to create this split."
            : 'Please select at least one person to split the bill with.'}
        </p>

        {errorType === 'balance' && (
          <div className="flex items-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Required</p>
              <p className="text-lg font-bold text-black">${parsedAmount.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Available</p>
              <p className="text-lg font-bold text-black">$85.40</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => {
              if (errorType === 'no-contacts') {
                setStep('amount')
                setSearchOpen(true)
              } else {
                navigate('/home')
              }
            }}
            className="w-full py-[15px] bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            {errorType === 'balance' ? 'Add Funds' : 'Add People'}
          </button>
          <button
            onClick={() => errorType === 'no-contacts' ? setStep('amount') : navigate('/home')}
            className="w-full py-[15px] text-gray-500 text-[15px] font-medium active:scale-[0.98] transition-transform"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ─── LOADING STATE ───
  if (step === 'loading') {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5"
        >
          <Loader2 size={32} strokeWidth={2} className="text-emerald-600 animate-spin" />
        </motion.div>
        <h2 className="text-xl font-bold text-black mb-2">Creating your split...</h2>
        <p className="text-sm text-gray-400">Please wait a moment.</p>
      </div>
    )
  }

  // ─── MAIN AMOUNT ENTRY ───
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center">
          <ChevronLeft size={22} strokeWidth={2} className="text-black" />
        </button>
        <h1 className="text-lg font-bold text-black">Split Bill</h1>
        <button onClick={() => navigate('/home')} className="w-9 h-9 flex items-center justify-center">
          <X size={20} strokeWidth={2} className="text-black" />
        </button>
      </div>

      {/* Amount input */}
      <div className="text-center px-5 pt-2 pb-6">
        <p className="text-[11px] text-gray-400 mb-2">Enter total amount</p>
        <div className="flex items-center justify-center">
          <span className="text-[2.5rem] font-bold text-black">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, '')
              if (v.split('.').length <= 2) setAmount(v)
            }}
            placeholder="0.00"
            className="text-[2.5rem] font-bold text-black bg-transparent outline-none w-40 text-left placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Split with section */}
      <div className="flex-1 px-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-black">Split with</p>
          <button onClick={() => setSearchOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center">
            <Search size={18} strokeWidth={2} className="text-gray-500" />
          </button>
        </div>

        {/* Member list */}
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 py-2.5"
            >
              <MemberAvatar name={m.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">
                  {m.name}
                  {m.isYou && <span className="text-gray-400 font-normal ml-1">You</span>}
                </p>
              </div>

              {/* Percentage badge */}
              {editingId === m.id ? (
                <input
                  type="number"
                  value={m.percentage}
                  onChange={(e) => updatePercentage(m.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  className="w-16 h-8 text-center text-sm font-semibold bg-gray-100 border border-gray-200 rounded-lg outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setEditingId(m.id)}
                  className={`h-8 px-3 rounded-lg text-sm font-semibold ${
                    m.isYou
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {m.percentage}%
                </button>
              )}

              {/* Remove button (not for You) */}
              {!m.isYou && (
                <button
                  onClick={() => removeMember(m.id)}
                  className="w-6 h-6 flex items-center justify-center"
                >
                  <X size={14} className="text-gray-300" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {members.length > 1 && parsedAmount > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-medium mb-3">Summary</p>
            <div className="flex items-end gap-3 overflow-x-auto no-scrollbar pb-2">
              {members.map((m) => (
                <div key={m.id} className="flex flex-col items-center gap-1 min-w-[56px]">
                  <MemberAvatar name={m.name} size="sm" />
                  <span className={`text-[10px] font-semibold ${
                    m.isYou ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {m.percentage}%
                  </span>
                  <span className="text-[10px] text-gray-400">
                    ${getMemberAmount(m).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPercentage !== 100 && members.length > 1 && (
          <p className="text-xs text-amber-600 mt-3">
            Percentages must total 100% (currently {totalPercentage}%)
          </p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-10 pt-4">
        <button
          onClick={handleConfirmSplit}
          disabled={!parsedAmount || parsedAmount <= 0 || (members.length > 1 && totalPercentage !== 100)}
          className="w-full py-[15px] bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          Confirm Split
        </button>
      </div>

      {/* ─── CONFIRM MODAL ─── */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check size={28} strokeWidth={2.5} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-black mb-1">Confirm Split</h3>
              <p className="text-sm text-gray-400 mb-1">You are about to split</p>
              <p className="text-2xl font-bold text-black mb-1">${parsedAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mb-1">among {members.length} people.</p>
              <p className="text-xs text-gray-400 mb-6">
                This will create a group and send payment requests.
              </p>

              <button
                onClick={handleExecuteSplit}
                className="w-full py-[15px] bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform mb-3"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-[15px] border border-gray-200 text-black rounded-full text-[15px] font-medium active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
