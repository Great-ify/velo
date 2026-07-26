import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useWalletStore } from '@/stores/wallet'
import { supabase } from '@/lib/supabase'

export default function UsernameSetup() {
  const { showUsernameSetup, setShowUsernameSetup, setUsername } = useAppStore()
  const { profileId } = useWalletStore()
  const [input, setInput] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sanitized = input.toLowerCase().replace(/[^a-z0-9._]/g, '')

  const checkAvailability = async (value: string) => {
    if (value.length < 3) {
      setAvailable(null)
      return
    }
    setChecking(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value)
        .maybeSingle()
      setAvailable(!data)
    } catch {
      setAvailable(null)
    } finally {
      setChecking(false)
    }
  }

  const handleChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9._]/g, '')
    setInput(clean)
    setError(null)
    setAvailable(null)
    if (clean.length >= 3) {
      const timeout = setTimeout(() => checkAvailability(clean), 400)
      return () => clearTimeout(timeout)
    }
  }

  const handleSave = async () => {
    if (!sanitized || sanitized.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (available === false) {
      setError('Username is taken')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const deviceId = useWalletStore.getState().deviceId
      if (!deviceId) throw new Error('No device ID')

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ username: sanitized, updated_at: new Date().toISOString() })
        .eq('device_id', deviceId)

      if (dbError) throw dbError

      setUsername(sanitized)
      setShowUsernameSetup(false)
      setInput('')
    } catch (err: any) {
      if (err?.code === '23505') {
        setError('Username is already taken')
        setAvailable(false)
      } else {
        setError('Failed to save username. Try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    setShowUsernameSetup(false)
    setInput('')
  }

  return (
    <AnimatePresence>
      {showUsernameSetup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleSkip}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white rounded-3xl px-6 pt-6 pb-8"
          >
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
            >
              <X size={18} strokeWidth={2} className="text-gray-400" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Profile icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-black mb-1">
                Set up your profile
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Choose a unique username for payments
              </p>

              {/* Username input */}
              <div className="w-full relative mb-2">
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5 focus-within:border-black transition-colors">
                  <span className="text-gray-400 text-sm mr-1">@</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="username"
                    maxLength={20}
                    className="flex-1 outline-none text-sm text-black placeholder:text-gray-300"
                    autoFocus
                  />
                  {checking && (
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Availability feedback */}
              <div className="w-full text-left h-5 mb-4">
                {available === true && sanitized.length >= 3 && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Username is available
                  </p>
                )}
                {available === false && (
                  <p className="text-xs text-red-400">Username is taken</p>
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || !sanitized || sanitized.length < 3 || available === false}
                className="w-full py-4 bg-black text-white rounded-full font-semibold text-[15px] active:scale-[0.98] transition-all disabled:opacity-30"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>

              <button
                onClick={handleSkip}
                className="mt-3 text-sm text-gray-400 font-medium"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
