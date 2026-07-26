import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWalletStore } from '@/stores/wallet'
import { useAppStore } from '@/stores/app'
import { generatePaymentUrl, shareLink, copyToClipboard } from '@/lib/share'

type Step = 1 | 2 | 3
type FlowState = 'form' | 'success' | 'error'

interface QuickRequestProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function QuickRequest({ isOpen = true, onClose }: QuickRequestProps) {
  const navigate = useNavigate()
  const handleClose = onClose || (() => navigate('/home', { replace: true }))

  const { profileId } = useWalletStore()
  const { defaultCurrency } = useAppStore()
  const [step, setStep] = useState<Step>(1)
  const [flowState, setFlowState] = useState<FlowState>('form')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1)
        setFlowState('form')
        setAmount('')
        setNote('')
        setPaymentUrl(null)
        setCopied(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && step === 1) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, step])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const createRequest = useMutation({
    mutationFn: async () => {
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount')

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          created_by: profileId,
          amount: numAmount,
          currency: defaultCurrency,
          description: note.trim() || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      const url = generatePaymentUrl(`/request/${data.payment_code}`)
      setPaymentUrl(url)
      setFlowState('success')
    },
    onError: () => {
      setFlowState('error')
    },
  })

  const handleShare = async () => {
    if (!paymentUrl) return
    await shareLink(paymentUrl, 'Payment Request', `Pay $${amount} via Velo`)
  }

  const handleCopy = async () => {
    if (!paymentUrl) return
    await copyToClipboard(paymentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setStep(1)
    setFlowState('form')
    setAmount('')
    setNote('')
    setPaymentUrl(null)
    setCopied(false)
  }

  const displayAmount =
    amount && parseFloat(amount) > 0
      ? `$${parseFloat(amount).toFixed(2)}`
      : '$0.00'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pt-4 pb-8 safe-bottom">
              {/* ─── Form Steps ─── */}
              {flowState === 'form' && (
                <>
                  {/* Header */}
                  <div className="relative text-center mb-8">
                    <h2 className="text-lg font-bold text-black">Request Payment</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Step {step} of 3</p>
                    <button
                      onClick={handleClose}
                      className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center"
                    >
                      <X size={20} strokeWidth={1.8} className="text-gray-400" />
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* ── Step 1: Enter Amount ── */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col items-center py-10">
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-[2rem] text-gray-300 font-light mr-0.5">$</span>
                            <input
                              ref={inputRef}
                              type="number"
                              inputMode="decimal"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="text-[2.5rem] font-bold text-black w-40 text-center outline-none placeholder:text-gray-200 bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <p className="text-sm text-gray-400">Enter amount</p>
                        </div>

                        <button
                          onClick={() => setStep(2)}
                          disabled={!amount || parseFloat(amount) <= 0}
                          className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] disabled:opacity-30 active:scale-[0.98] transition-all"
                        >
                          Next
                        </button>
                      </motion.div>
                    )}

                    {/* ── Step 2: Add Note ── */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col items-center mb-8">
                          <p className="text-[2.5rem] font-bold text-black leading-tight mb-8">
                            {displayAmount}
                          </p>

                          <p className="text-sm text-gray-400 mb-3 self-start">
                            Add a note (optional)
                          </p>
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Dinner at Lagos Kitchen"
                            className="w-full py-3.5 px-4 border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-sm text-gray-700 placeholder:text-gray-300"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 border border-gray-200 rounded-full font-semibold text-[15px] text-black active:scale-[0.98] transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setStep(3)}
                            className="flex-1 py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Step 3: Review & Generate ── */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col items-center mb-8">
                          {/* Chain link icon with sparkles */}
                          <div className="relative mb-5">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#374151"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </div>
                            {/* Sparkle stars */}
                            <svg
                              className="absolute -top-1 -left-2"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                                fill="#d1d5db"
                              />
                            </svg>
                            <svg
                              className="absolute -top-2 right-0"
                              width="8"
                              height="8"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                                fill="#d1d5db"
                              />
                            </svg>
                            <svg
                              className="absolute top-2 -right-3"
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                                fill="#d1d5db"
                              />
                            </svg>
                          </div>

                          <h3 className="text-lg font-bold text-black mb-1">
                            Review and generate
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            You are about to request
                          </p>
                          <p className="text-[1.75rem] font-bold text-black mb-3">
                            {displayAmount}
                          </p>
                          {note && (
                            <span className="px-4 py-1.5 border border-gray-200 rounded-full text-sm text-gray-500">
                              {note}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep(2)}
                            className="flex-1 py-4 border border-gray-200 rounded-full font-semibold text-[15px] text-black active:scale-[0.98] transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => createRequest.mutate()}
                            disabled={createRequest.isPending}
                            className="flex-1 py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {createRequest.isPending ? 'Creating...' : 'Generate Link'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* ─── Success State ─── */}
              {flowState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center pt-8 pb-4"
                >
                  {/* Green checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.div>

                  <h2 className="text-xl font-bold text-black mb-1">
                    Payment link created!
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Share this link to receive payment
                  </p>

                  {/* Link display with copy */}
                  <div className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5 mb-6">
                    <p className="flex-1 text-sm text-gray-600 break-all text-left">
                      {paymentUrl}
                    </p>
                    <button onClick={handleCopy} className="shrink-0 p-1">
                      {copied ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Share Link
                  </button>

                  <button
                    onClick={handleReset}
                    className="mt-5 text-sm text-gray-400 font-medium"
                  >
                    Create Another
                  </button>
                </motion.div>
              )}

              {/* ─── Error State ─── */}
              {flowState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center pt-8 pb-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6"
                  >
                    <span className="text-4xl font-bold text-red-400">!</span>
                  </motion.div>

                  <h2 className="text-xl font-bold text-black mb-1">
                    Failed to create link
                  </h2>
                  <p className="text-sm text-gray-400 mb-8">
                    Something went wrong.
                    <br />
                    Please try again.
                  </p>

                  <button
                    onClick={() => {
                      setFlowState('form')
                      setStep(3)
                    }}
                    className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
