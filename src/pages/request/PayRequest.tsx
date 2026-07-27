import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { usePayment } from '@/hooks/usePayment'
import { formatCurrency } from '@/lib/currency'
import { copyToClipboard } from '@/lib/share'

interface PaymentRequest {
  id: string
  created_by: string
  amount: number
  currency: string
  description: string | null
  payment_code: string
  status: string
}

type PageState =
  | 'loading'
  | 'not_found'
  | 'ready'
  | 'processing'
  | 'success'
  | 'error'
  | 'fallback'

export default function PayRequest() {
  const { id: paymentCode } = useParams<{ id: string }>()
  const [request, setRequest] = useState<PaymentRequest | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [creatorProfile, setCreatorProfile] = useState<{
    username: string | null
    nim_address: string | null
  } | null>(null)
  const { pay, status, txHash, error, reset } = usePayment()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchRequest() {
      const { data } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('payment_code', paymentCode!)
        .single()

      if (!data || data.status !== 'pending') {
        setPageState('not_found')
        return
      }

      setRequest(data as PaymentRequest)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, nim_address')
        .eq('id', data.created_by)
        .single()

      setCreatorProfile(profile)
      setPageState('ready')
    }
    fetchRequest()
  }, [paymentCode])

  useEffect(() => {
    if (status === 'pending' || status === 'confirming') {
      setPageState('processing')
    } else if (status === 'success') {
      setPageState('success')
    } else if (status === 'error') {
      setPageState('error')
    }
  }, [status])

  const creatorName = creatorProfile?.username || 'Someone'
  const formattedAmount = request
    ? formatCurrency(request.amount, request.currency)
    : '$0.00'

  const handlePay = () => {
    if (!request) return

    pay({
      fromProfileId: 'payer',
      toProfileId: request.created_by,
      toNimAddress: creatorProfile?.nim_address || undefined,
      amount: request.amount,
      currency: request.currency,
      method: 'NIM',
    })
  }

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewTransaction = () => {
    if (!txHash) return
    window.open(`https://nimiq.watch/#${txHash}`, '_blank')
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (pageState === 'not_found') {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-black mb-1">Request Not Found</h1>
        <p className="text-sm text-gray-400">This payment link is no longer valid.</p>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <h1 className="text-xl font-bold text-black mb-2">Payment successful!</h1>
          <p className="text-sm text-gray-400 mb-8">
            You paid <span className="font-semibold text-black">{formattedAmount}</span> to <span className="font-semibold text-black">@{creatorName}</span>
          </p>
          <button onClick={handleViewTransaction} className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all">
            View Transaction
          </button>
          <a href="/" className="mt-5 text-sm text-gray-400 font-medium">Back to Velo</a>
        </motion.div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-amber-400">!</span>
          </motion.div>
          <h1 className="text-xl font-bold text-black mb-2">Payment failed</h1>
          <p className="text-sm text-gray-400 mb-8">{error || 'Insufficient balance to complete this payment.'}</p>
          <button onClick={() => { reset(); setPageState('ready') }} className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all">
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  if (pageState === 'fallback') {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center w-full max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-black mb-2">Open in your wallet</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-xs">To complete this payment, please open this link in the Nimiq Wallet.</p>
          <button onClick={() => window.open(`nimiq://pay?url=${encodeURIComponent(window.location.href)}`, '_blank')} className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            Open in Nimiq Wallet
          </button>
          <button onClick={handleCopyLink} className="mt-5 text-sm text-gray-400 font-medium">{copied ? 'Copied!' : 'Copy Link'}</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-sm mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
            EN
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 border-2 border-gray-100">
            <span className="text-xl font-bold text-gray-500">{creatorName.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">@{creatorName} requests</p>
          <p className="text-[2.5rem] font-bold text-black leading-tight">{formattedAmount}</p>
          {request?.description && <p className="text-sm text-gray-500 mt-1.5">{request.description}</p>}
        </div>

        {pageState === 'processing' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-5" />
            <p className="text-base font-semibold text-black mb-1">Processing payment...</p>
            <p className="text-sm text-gray-400">Please wait a moment.</p>
          </motion.div>
        ) : (
          <>
            <button
              onClick={handlePay}
              className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Pay {formattedAmount} with NIM
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-xs text-gray-400">Secured by Nimiq</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
