import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, FileText, ShieldCheck, Lock, Globe, Wallet } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useWalletStore } from '@/stores/wallet'
import { useNimiqContext } from '@/providers/NimiqProvider'
import { supabase } from '@/lib/supabase'

/* ─── Dot Indicator ─── */
function DotIndicator({ step, total, dark }: { step: number; total: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === step
              ? dark ? 'w-6 bg-white' : 'w-6 bg-black'
              : dark ? 'w-2 bg-white/30' : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

/* ─── Slide 1: Features (WHITE background) ─── */
function FeatureSlide({ onNext }: { onNext: () => void }) {
  const features = [
    {
      icon: Users,
      title: 'Split expenses',
      sub: 'with friends',
      gradient: 'from-violet-50 to-purple-50',
      iconColor: 'text-violet-600',
    },
    {
      icon: Send,
      title: 'Send or request',
      sub: 'money instantly',
      gradient: 'from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: ShieldCheck,
      title: 'Secure and',
      sub: 'borderless',
      gradient: 'from-emerald-50 to-green-50',
      iconColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="flex flex-col h-full px-5">
      {/* Feature cards */}
      <div className="flex-shrink-0 pt-16 pb-6 space-y-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4"
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shrink-0`}
            >
              <f.icon size={20} strokeWidth={1.8} className={f.iconColor} />
            </div>
            <div>
              <p className="text-black text-[15px] font-semibold leading-tight">
                {f.title}
              </p>
              <p className="text-gray-400 text-[13px] leading-tight mt-0.5">
                {f.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heading */}
      <div className="flex-1 flex flex-col justify-end pb-4">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-[1.65rem] font-bold text-black leading-tight tracking-tight"
        >
          Everything you need
          <br />
          in one app
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-400 text-[15px] mt-2 leading-relaxed"
        >
          All the tools you need to manage money in one simple place.
        </motion.p>
      </div>

      {/* Bottom — pinned */}
      <div className="w-full pt-5 pb-10">
        <DotIndicator step={0} total={3} />
        <button
          onClick={onNext}
          className="w-full py-[15px] bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform mt-5"
        >
          Next
        </button>
      </div>
    </div>
  )
}

/* ─── Slide 2: Security (WHITE background) ─── */
function SecuritySlide({ onNext }: { onNext: () => void }) {
  const points = [
    { icon: Lock, title: 'End-to-end encrypted', sub: 'Your keys never leave your device' },
    { icon: ShieldCheck, title: 'Non-custodial', sub: 'You control your funds always' },
    { icon: Globe, title: 'Borderless payments', sub: 'Send anywhere, no intermediaries' },
  ]

  return (
    <div className="flex flex-col h-full px-5">
      {/* Illustration area */}
      <div className="flex-shrink-0 pt-14 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <div className="relative w-48 h-48">
            {/* Shield illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                <ShieldCheck size={48} strokeWidth={1.2} className="text-gray-800" />
              </div>
            </div>
            {/* Floating elements */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 right-6 w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center"
            >
              <Lock size={16} className="text-green-600" />
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-4 left-4 w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center"
            >
              <Globe size={16} className="text-blue-600" />
            </motion.div>
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-6 left-2 w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <polyline points="9 12 12 15 16 10" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-[1.6rem] font-bold text-black leading-tight tracking-tight mb-1"
      >
        Built for security
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-gray-400 text-[15px] mb-5"
      >
        Your money, your rules
      </motion.p>

      {/* Points */}
      <div className="space-y-2.5 flex-1">
        {points.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 + i * 0.07, duration: 0.35 }}
            className="flex items-center gap-3.5 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
              <p.icon size={17} strokeWidth={1.8} className="text-gray-800" />
            </div>
            <div>
              <p className="text-black text-[14px] font-semibold leading-tight">{p.title}</p>
              <p className="text-gray-400 text-[13px] leading-tight mt-0.5">{p.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom — pinned */}
      <div className="w-full pt-5 pb-10">
        <DotIndicator step={1} total={3} />
        <button
          onClick={onNext}
          className="w-full py-[15px] bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform mt-5"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

/* ─── Slide 3: Connect Wallet (DARK background) ─── */
function ConnectSlide({
  onConnect,
  onSkip,
  isConnecting,
  error,
}: {
  onConnect: () => void
  onSkip: () => void
  isConnecting: boolean
  error: string | null
}) {
  return (
    <div className="flex flex-col h-full px-5">
      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative w-48 h-48 mb-8"
        >
          {/* Central wallet icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Wallet size={36} strokeWidth={1.4} className="text-white" />
            </div>
          </div>
          {/* Orbiting elements */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 right-4 w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center"
          >
            <Send size={14} className="text-white/70" />
          </motion.div>
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 left-6 w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center"
          >
            <Users size={14} className="text-white/70" />
          </motion.div>
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 left-0 w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center"
          >
            <FileText size={12} className="text-white/50" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-[1.6rem] font-bold text-white leading-tight tracking-tight mb-3"
        >
          Connect your wallet
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-white/60 text-[15px] leading-relaxed max-w-[280px]"
        >
          Link your Nimiq wallet to start sending, splitting, and receiving payments instantly.
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl"
          >
            <p className="text-red-300 text-[13px]">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Bottom — pinned */}
      <div className="w-full pt-5 pb-10">
        <DotIndicator step={2} total={3} dark />
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full py-[15px] bg-white text-black rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform mt-5 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        <p className="text-center text-[11px] text-white/40 mt-4 leading-relaxed">
          Powered by Nimiq — fast, fee-less, and secure
        </p>
        <button
          onClick={onSkip}
          className="w-full text-center text-sm text-white/50 font-medium mt-4 active:text-white/70 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

/* ─── Main Onboarding Component ─── */
export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { setOnboardingComplete } = useAppStore()
  const { connectNimiq, isConnecting } = useNimiqContext()

  const handleConnect = async () => {
    setConnectionError(null)

    try {
      await connectNimiq()
    } catch {
      setConnectionError(
        'Wallet connection failed. Please try again.'
      )
      return
    }

    await handleFinish()
  }

  const handleSkip = () => {
    setOnboardingComplete(true)
    navigate('/home', { replace: true })
  }

  const handleFinish = async () => {
    const address = useWalletStore.getState().nimAddress
    const deviceId = useWalletStore.getState().deviceId
    if (address && deviceId) {
      try {
        const { data: profile } = await supabase.from('profiles').upsert(
          {
            device_id: deviceId,
            nim_address: address,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'device_id' }
        )
        .select('id')
        .single()

        if (profile) {
          useWalletStore.getState().setProfileId(profile.id)
        }
      } catch (err) {
        console.error('Profile upsert failed:', err)
      }
    }
    setOnboardingComplete(true)
    navigate('/home', { replace: true })
  }

  const isDark = step === 2

  return (
    <div
      className={`min-h-dvh transition-colors duration-500 ${
        isDark ? 'bg-black' : 'bg-white'
      }`}
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="feature"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="h-dvh"
          >
            <FeatureSlide onNext={() => setStep(1)} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="h-dvh"
          >
            <SecuritySlide onNext={() => setStep(2)} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="h-dvh"
          >
            <ConnectSlide onConnect={handleConnect} onSkip={handleSkip} isConnecting={isConnecting} error={connectionError} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
