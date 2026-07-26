import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VeloAppIcon } from '@/components/VeloLogo'

export default function MobileLanding() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-dvh bg-white flex flex-col items-center px-6 font-sans"
    >
      {/* Center content — logo icon + brand + tagline, all centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
        {/* Logo icon — large, centered */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-4"
        >
          <VeloAppIcon size={56} />
        </motion.div>

        {/* Brand name */}
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-2xl font-bold tracking-tight text-black mb-6"
        >
          Velo
        </motion.p>

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-[1.7rem] font-semibold leading-[1.2] tracking-tight text-black"
        >
          Move money.
          <br />
          Keep it simple.
        </motion.h1>
      </div>

      {/* Bottom — single CTA + terms pinned to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full pb-10"
      >
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 bg-black text-white rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform"
        >
          Get Started
        </button>

        <p className="text-center text-[11px] text-gray-400 mt-5 leading-relaxed">
          By continuing you agree to our
          <br />
          <a href="#" className="text-black font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-black font-medium">Privacy Policy</a>
        </p>
      </motion.div>
    </motion.div>
  )
}
