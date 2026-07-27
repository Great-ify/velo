import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, ChevronLeft, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useWalletStore } from '@/stores/wallet'
import { useRequireWallet } from '@/hooks/useRequireWallet'
import { payWithNim } from '@/lib/nimiq'
import { fiatToNim, nimToLuna, getExchangeRates } from '@/lib/currency'

interface Contact {
  id: string
  username: string
  nim_address: string | null
}

type Step =
  | 'recipient'
  | 'amount'
  | 'review'
  | 'processing'
  | 'success'
  | 'error'

type ErrorType = 'insufficient' | 'network' | 'user_not_found'

function NumPad({ onPress }: { onPress: (key: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']

  return (
    <div className="grid grid-cols-3 gap-y-0.5 px-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onPress(key)}
          className="h-[52px] flex items-center justify-center text-[22px] font-medium text-black active:bg-gray-100 rounded-full transition-colors"
        >
          {key === 'del' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const cls = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg' }

  return (
    <div className={`${cls[size]} bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-500 shrink-0`}>
      {initials}
    </div>
  )
}

export default function SendPayment() {
  const navigate = useNavigate()
  const { nimAddress } = useWalletStore()
  const { requireWallet } = useRequireWallet()

  const [step, setStep] = useState<Step>('recipient')
  const [recipient, setRecipient] = useState<Contact | null>(null)
  const [amountStr, setAmountStr] = useState('')
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [errorType, setErrorType] = useState<ErrorType>('network')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [searching, setSearching] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, nim_address')
          .not('username', 'is', null)
          .ilike('username', `%${searchQuery}%`)
          .limit(10)

        setSearchResults(
          (data || [])
            .filter((p: any) => p.nim_address !== nimAddress)
            .map((p: any) => ({
              id: p.id,
              username: p.username,
              nim_address: p.nim_address,
            }))
        )
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery, nimAddress])

  const displayAmount = useMemo(() => {
    if (!amountStr) return '$0.00'
    const val = amountStr.endsWith('.') ? amountStr + '0' : amountStr
    const num = parseFloat(val)
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`
  }, [amountStr])

  const numericAmount = parseFloat(amountStr || '0')

  const handleNumpad = (key: string) => {
    if (key === 'del') {
      setAmountStr((p) => p.slice(0, -1))
      return
    }
    if (key === '.') {
      if (amountStr.includes('.')) return
      setAmountStr((p) => (p || '0') + '.')
      return
    }
    if (amountStr.includes('.')) {
      const dec = amountStr.split('.')[1]
      if (dec && dec.length >= 2) return
    }
    if (amountStr === '0') {
      setAmountStr(key)
      return
    }
    setAmountStr((p) => p + key)
  }

  const handleClose = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/home')
  }

  const handleBack = () => {
    if (step === 'amount') setStep('recipient')
    else if (step === 'review') setStep('amount')
    else handleClose()
  }

  const handleSelectRecipient = (contact: Contact) => {
    setRecipient(contact)
    setStep('amount')
  }

  const handleConfirmPayment = async () => {
    if (!recipient) return

    requireWallet(async () => {
      setStep('processing')

      try {
        if (recipient.nim_address) {
          const rates = await getExchangeRates()
          const nim = fiatToNim(numericAmount, rates.nim_usd)
          const luna = nimToLuna(nim)
          const result = await payWithNim(recipient.nim_address, luna)
          if (!result) throw new Error('Payment failed')
          setTxHash(result.hash)
          setStep('success')
        } else {
          setErrorType('network')
          setStep('error')
        }
      } catch {
        setErrorType('network')
        setStep('error')
      }
    })
  }

  // ─── RECIPIENT ───
  if (step === 'recipient') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-dvh bg-white">
        <div className="px-5 pt-14 pb-4">
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center mb-5">
            <X size={20} strokeWidth={1.8} className="text-black" />
          </button>

          <h1 className="text-2xl font-bold text-black mb-5">Send to</h1>

          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
            <Search size={18} strokeWidth={1.8} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username"
              className="flex-1 bg-transparent outline-none text-sm text-black placeholder:text-gray-400"
              autoFocus
            />
            {searching && (
              <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            )}
          </div>

          {!searchQuery && searchResults.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Search size={22} strokeWidth={1.5} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Search for a user</p>
              <p className="text-xs text-gray-300">Type a username to find someone</p>
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-sm text-gray-400">No users found for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Results</p>
              <div className="space-y-0">
                {searchResults.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectRecipient(contact)}
                    className="w-full flex items-center gap-3 py-3 active:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Avatar name={contact.username} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-black">@{contact.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  // ─── PROCESSING ───
  if (step === 'processing') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-dvh bg-black flex flex-col">
        <div className="px-5 pt-14 pb-4">
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft size={22} strokeWidth={2} className="text-white" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center px-6">
          <Avatar name={recipient?.username || ''} size="lg" />
          <p className="text-white font-semibold mt-3">@{recipient?.username}</p>
          <p className="text-[2.5rem] font-bold text-white mt-4">{displayAmount}</p>
          <div className="px-6 py-2 rounded-full text-sm font-semibold bg-white text-black mt-4">NIM</div>
          {note && <p className="text-gray-400 text-sm mt-2">{note}</p>}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-gray-600 border-t-white rounded-full animate-spin mb-5" />
            <p className="text-white font-semibold text-base">Processing payment...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait a moment.</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── SUCCESS ───
  if (step === 'success') {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <h1 className="text-xl font-bold text-black mb-3">Payment sent!</h1>
          <p className="text-sm text-gray-400 mb-1">You sent</p>
          <p className="text-3xl font-bold text-black mb-1">{displayAmount}</p>
          <p className="text-sm text-gray-400 mb-2">to @{recipient?.username}</p>
          {note && <p className="text-sm text-gray-400 mb-6">{note}</p>}
          <button onClick={() => txHash && navigate(`/transactions/${txHash}`)} className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all mb-4">
            View Transaction
          </button>
          <button onClick={handleClose} className="text-sm text-gray-400 font-medium">Done</button>
        </motion.div>
      </div>
    )
  }

  // ─── ERROR ───
  if (step === 'error') {
    const configs: Record<ErrorType, { bgIcon: string; iconColor: string; title: string; desc: string; primary: string; secondary?: string }> = {
      insufficient: {
        bgIcon: 'bg-red-50', iconColor: 'text-red-400',
        title: 'Insufficient balance', desc: "You don't have enough NIM to complete this payment.",
        primary: 'Go Back', secondary: 'Cancel',
      },
      network: {
        bgIcon: 'bg-red-50', iconColor: 'text-red-400',
        title: 'Payment failed', desc: "We couldn't send your payment due to a network error.",
        primary: 'Try Again', secondary: 'Go Back',
      },
      user_not_found: {
        bgIcon: 'bg-amber-50', iconColor: 'text-amber-400',
        title: 'User not found', desc: "We couldn't find this user. Please check the username and try again.",
        primary: 'Go Back',
      },
    }
    const c = configs[errorType]

    return (
      <div className="min-h-dvh bg-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className={`w-20 h-20 ${c.bgIcon} rounded-full flex items-center justify-center mb-6`}>
            <span className={`text-4xl font-bold ${c.iconColor}`}>!</span>
          </motion.div>
          <h1 className="text-xl font-bold text-black mb-2">{c.title}</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{c.desc}</p>
          <button onClick={() => setStep('recipient')} className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all">{c.primary}</button>
          {c.secondary && <button onClick={handleClose} className="mt-4 text-sm text-gray-400 font-medium">{c.secondary}</button>}
        </motion.div>
      </div>
    )
  }

  // ─── REVIEW ───
  if (step === 'review') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="min-h-dvh bg-white flex flex-col">
        <div className="px-5 pt-14 pb-2">
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft size={22} strokeWidth={2} className="text-black" />
          </button>
        </div>
        <div className="flex items-center gap-3 px-5 pb-6">
          <Avatar name={recipient?.username || ''} size="sm" />
          <div>
            <p className="text-sm font-semibold text-black">{recipient?.username}</p>
            <p className="text-xs text-gray-400">@{recipient?.username}</p>
          </div>
        </div>
        <div className="flex-1 px-5">
          <div className="space-y-0">
            {[
              { label: 'You send', value: displayAmount },
              { label: 'Network', value: 'Nimiq' },
              { label: 'Note', value: note || '—' },
              { label: 'Fee', value: '$0.00' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3.5 border-b border-gray-100">
                <p className="text-sm text-gray-400">{row.label}</p>
                <p className="text-sm font-medium text-black text-right max-w-[60%] truncate">{row.value}</p>
              </div>
            ))}
            <div className="flex items-center justify-between py-3.5">
              <p className="text-sm font-semibold text-black">You will pay</p>
              <p className="text-sm font-bold text-black">{displayAmount}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 mt-8 mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-xs text-gray-400 leading-relaxed">Payments are secure and encrypted by Nimiq.</p>
          </div>
        </div>
        <div className="px-5 pb-8 safe-bottom">
          <button onClick={handleConfirmPayment} className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all">
            Confirm Payment
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── AMOUNT ENTRY ───
  return (
    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="min-h-dvh bg-white flex flex-col">
      <div className="px-5 pt-14 pb-2">
        <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={22} strokeWidth={2} className="text-black" />
        </button>
      </div>
      <div className="flex flex-col items-center px-5 pb-2">
        <Avatar name={recipient?.username || ''} size="lg" />
        <p className="text-sm font-semibold text-black mt-2">{recipient?.username}</p>
        <p className="text-xs text-gray-400">@{recipient?.username}</p>
      </div>
      <div className="text-center py-3">
        <p className="text-[2.5rem] font-bold text-black leading-tight">{displayAmount}</p>
      </div>
      <div className="flex justify-center mb-3 px-5">
        <div className="px-7 py-2 rounded-full text-sm font-semibold bg-black text-white">NIM</div>
      </div>
      <div className="px-5 mb-2">
        {noteOpen || note ? (
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter a note..."
            autoFocus
            className="w-full text-center text-sm text-gray-600 outline-none bg-transparent placeholder:text-gray-300 py-2"
            onBlur={() => !note && setNoteOpen(false)}
          />
        ) : (
          <button onClick={() => setNoteOpen(true)} className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Add a note (optional)
          </button>
        )}
      </div>
      <div className="flex-1" />
      <div className="pb-2">
        <NumPad onPress={handleNumpad} />
      </div>
      <div className="px-5 pb-8 safe-bottom">
        <button
          onClick={() => setStep('review')}
          disabled={numericAmount <= 0}
          className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </motion.div>
  )
}
