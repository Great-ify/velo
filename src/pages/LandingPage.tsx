import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MobileLanding from './MobileLanding'
import VeloLogoComponent from '@/components/VeloLogo'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

/* ─── Logo Component ─── */
function VeloLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`${className}`}>
      <VeloLogoComponent size={20} showText textClassName="text-xl" />
    </span>
  )
}

/* ─── Navbar ─── */
function Navbar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'About', href: '#about' },
    { label: 'Login', href: '#', onClick: () => navigate('/onboarding') },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <VeloLogo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={link.onClick}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="hidden md:block px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Get the App
        </button>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5">
          <span className={`w-5 h-0.5 bg-black transition-all ${mobileOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`w-5 h-0.5 bg-black transition-all ${mobileOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-5 py-4 space-y-3">
              {links.map((link) => (
                <a key={link.label} href={link.href} onClick={link.onClick} className="block text-sm text-gray-600 hover:text-black py-1">
                  {link.label}
                </a>
              ))}
              <button onClick={() => navigate('/onboarding')} className="w-full py-3 bg-black text-white rounded-full text-sm font-medium mt-2">
                Get the App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

/* ─── Phone Mockup ─── */
function PhoneMockup() {
  return (
    <div className="relative w-[280px] sm:w-[300px]">
      {/* Phone frame */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden">
        {/* Notch */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-24 h-5 bg-black rounded-full" />
        </div>

        {/* Screen content */}
        <div className="px-4 pb-4">
          {/* Greeting */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Hello, Great <span>👋</span></p>
            <div className="w-6 h-6 bg-gray-100 rounded-full" />
          </div>

          {/* Net balance card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 mb-3">
            <p className="text-[10px] text-gray-500 mb-0.5">Net balance</p>
            <p className="text-2xl font-bold text-green-700">+ $90.00</p>
            <p className="text-[9px] text-gray-400 mt-1">You're owed more than you owe</p>
            <div className="flex justify-between mt-3">
              <div>
                <p className="text-[9px] text-gray-400">You're owed</p>
                <p className="text-xs font-bold text-green-600">$125.00</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400">You owe</p>
                <p className="text-xs font-bold text-red-500">$35.00</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <p className="text-[10px] font-medium text-gray-500 mb-2">Quick actions</p>
          <div className="grid grid-cols-5 gap-1 mb-3">
            {['Split', 'Request', 'Invoice', 'Pay', 'Scan'].map((a) => (
              <div key={a} className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-3.5 h-3.5 border border-gray-300 rounded-sm" />
                </div>
                <span className="text-[8px] text-gray-400">{a}</span>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-gray-500">Recent activity</p>
            <p className="text-[8px] text-gray-400">View all</p>
          </div>
          <div className="space-y-2">
            {[
              { icon: '🍽️', name: 'Dinner at Lagos Kitchen', sub: 'Alex and 3 others', amount: '+$30.00', date: 'Today', color: 'text-green-600' },
              { icon: '📄', name: 'Design invoice #0024', sub: 'Simple Inc.', amount: '+$500.00', date: 'Yesterday', color: 'text-green-600' },
              { icon: '✈️', name: 'Trip to Abuja', sub: 'You paid', amount: '-$45.50', date: 'Jul 20', color: 'text-red-500' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="text-sm">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate">{item.name}</p>
                  <p className="text-[8px] text-gray-400">{item.sub}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-semibold ${item.color}`}>{item.amount}</p>
                  <p className="text-[8px] text-gray-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around mt-4 pt-3 border-t border-gray-100">
            {['Home', 'Groups', '', 'Invoices', 'Me'].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                {i === 2 ? (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center -mt-4">
                    <span className="text-white text-lg">+</span>
                  </div>
                ) : (
                  <>
                    <div className="w-4 h-4 border border-gray-300 rounded-sm" />
                    <span className="text-[7px] text-gray-400">{label}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating action button (outside phone) */}
      <div className="absolute -right-4 top-[45%] w-10 h-10 bg-black rounded-full shadow-lg flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </div>

      {/* Floating members badge */}
      <div className="absolute -right-3 bottom-[25%] w-9 h-9 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
    </div>
  )
}

/* ─── Balance Card Mockup ─── */
function BalanceCardMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-xs">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          <span className="text-xs text-gray-500">Total balance</span>
        </div>
        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
        </div>
      </div>
      <p className="text-3xl font-bold mb-4">$1,245.50</p>

      <div className="flex gap-8 mb-5">
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">NIM balance</p>
          <p className="text-sm font-bold mt-0.5">420.00 NIM</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">Quick actions</p>
      <div className="flex gap-4">
        {[
          <svg key="g" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
          <svg key="d" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
          <svg key="f" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
          <svg key="s" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
          <svg key="q" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
        ].map((icon, i) => (
          <div key={i} className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
            {icon}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Invoice Dashboard Mockup ─── */
function InvoiceMockup() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Bar chart card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          <span className="text-[10px] text-gray-400">Invoices</span>
        </div>
        <p className="text-xl font-bold mb-4">$3,650.00</p>
        <div className="flex items-end gap-2 h-20">
          {[40, 65, 30, 80, 55, 45, 70, 90, 50, 60, 75, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-t-sm" style={{ height: `${h}%` }}>
              {i >= 8 && <div className="w-full bg-gray-400 rounded-t-sm h-full" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[8px] text-gray-400">1 Jun</span>
          <span className="text-[8px] text-gray-400">15 Jun</span>
          <span className="text-[8px] text-gray-400">30 Jun</span>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-3 sm:w-40">
        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 mb-2">Paid</p>
          <p className="text-lg font-bold mb-2">$2,450.00</p>
          <div className="relative w-16 h-16 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#111" strokeWidth="4" strokeDasharray="87.96" strokeDashoffset="29" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold">67%</span>
              <span className="text-[7px] text-gray-400">of total</span>
            </div>
          </div>
        </div>

        {/* Pending card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400">Pending</p>
          <p className="text-lg font-bold">$1,200.00</p>
          <p className="text-[8px] text-gray-400 mt-0.5">Invoice #0023</p>
        </div>
      </div>
    </div>
  )
}

/* ─── FAQ Accordion ─── */
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    { q: 'What is Velo?', a: 'Velo is a Nimiq Pay Mini App that combines group expense splitting with freelancer invoicing, settling payments in NIM.' },
    { q: 'Is Velo free to use?', a: 'Yes, Velo is completely free. You only pay the standard Nimiq transaction fees when settling payments.' },
    { q: 'What currencies are supported?', a: 'Velo supports NIM (Nimiq) for fast, feeless payments on the Nimiq blockchain.' },
    { q: 'Is my money safe?', a: 'Velo never holds your funds or has access to your private keys. All payments are made directly from your wallet.' },
    { q: 'How do I get started?', a: 'Simply open Velo inside Nimiq Pay, connect your wallet, and you\'re ready to split expenses or send invoices.' },
  ]

  return (
    <div className="space-y-0">
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-gray-100">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="text-sm font-medium text-gray-800">{faq.q}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              className={`shrink-0 ml-4 transition-transform ${openIndex === i ? 'rotate-45' : ''}`}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-gray-500 pb-4 pr-8">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileLanding />
  }

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8">
          <div className="flex-1 max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[2.75rem] md:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-black"
            >
              Move money.
              <br />
              Keep it simple.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-6 text-gray-500 text-base leading-relaxed"
            >
              Split expenses, request payments, and send invoices.
              <br />
              Settle instantly in NIM — fast, secure,
              <br />
              and built for real life.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => navigate('/onboarding')}
                className="px-7 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
              <a
                href="#features"
                className="px-7 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                See How It Works
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-shrink-0"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* ─── Logo Strip ─── */}
      <section className="border-y border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between gap-8 overflow-x-auto no-scrollbar">
          {[
            { name: 'Dropbox', style: 'font-semibold text-lg tracking-tight' },
            { name: 'airbnb', style: 'font-semibold text-lg' },
            { name: 'GitHub', style: 'font-bold text-lg' },
            { name: 'NETFLIX', style: 'font-bold text-lg tracking-widest' },
            { name: 'HBO', style: 'font-bold text-xl tracking-wider' },
          ].map((brand) => (
            <span key={brand.name} className={`text-gray-400 ${brand.style} whitespace-nowrap select-none`}>
              {brand.name}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <BalanceCardMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Everything you need
              <br />
              in one app
            </h2>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-md">
              Velo combines expense splitting, payment requests,
              and invoicing — all in one place.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Split expenses with friends',
                'Request or send money instantly',
                'Create and manage invoices',
                'Settle instantly in NIM',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-gray-400">{'>'}</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/onboarding')}
              className="mt-8 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Explore Features
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Invoice Section ─── */}
      <section id="how-it-works" className="bg-white">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                Get paid faster.
                <br />
                Stay in control.
              </h2>
              <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-md">
                Create professional invoices, track payments,
                and get paid in crypto — without the complexity.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Professional invoices in seconds',
                  'Track payments in real-time',
                  'Automatic reminders',
                  'Secure and borderless',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-gray-400">{'>'}</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/onboarding')}
                className="mt-8 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Learn More
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <InvoiceMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Velo ─── */}
      <section id="security" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why choose Velo?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Fast & Easy', desc: 'Create, share, and settle in just a few taps.' },
            { title: 'Secure & Private', desc: 'Bank-level security for your money and data.' },
            { title: 'Borderless Payments', desc: 'Send and receive in NIM instantly.' },
          ].map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4 }}
              className="bg-green-50 rounded-2xl p-6 cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-12">
                <h3 className="text-base font-bold">{card.title}</h3>
                <div className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="about" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Frequently Asked Questions</h2>
        <p className="text-sm text-gray-400 text-center mb-12">Find answers to common questions about Velo.</p>

        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <FAQ />
          </div>

          <div className="md:w-72">
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <h3 className="font-bold text-base mb-1">Still have questions?</h3>
              <p className="text-sm text-gray-500 mb-5">Our support team is here to help you.</p>
              <button className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-white transition-colors">
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="px-5 pb-20">
        <div className="max-w-6xl mx-auto bg-black rounded-3xl overflow-hidden relative">
          <div className="px-8 py-16 md:py-20 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to move money
              <br />
              the smarter way?
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Join thousands of users already using Velo
              inside Nimiq Pay.
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="px-7 py-3 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Get the App
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <div className="absolute right-8 top-8 w-32 h-32 border border-white/30 rounded-full" />
            <div className="absolute right-16 bottom-8 w-48 h-48 border border-white/20 rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Brand column */}
            <div className="md:w-48">
              <VeloLogo className="text-black" />
              <p className="text-xs text-gray-400 mt-3">Built with ❤️ on Nimiq</p>
              <div className="flex items-center gap-4 mt-4">
                {/* Twitter/X */}
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                {/* Discord */}
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" /></svg>
                </a>
                {/* Telegram */}
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                </a>
              </div>
            </div>

            {/* Link columns */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold mb-4">Product</h4>
                <ul className="space-y-2.5">
                  {['Home', 'Features', 'Security', 'About'].map((l) => (
                    <li key={l}><a href="#" className="text-sm text-gray-400 hover:text-black transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Company</h4>
                <ul className="space-y-2.5">
                  {['How it works', 'About us', 'Careers', 'Blog'].map((l) => (
                    <li key={l}><a href="#" className="text-sm text-gray-400 hover:text-black transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Support</h4>
                <ul className="space-y-2.5">
                  {['Help Center', 'Contact', 'Privacy Policy', 'Terms of Service'].map((l) => (
                    <li key={l}><a href="#" className="text-sm text-gray-400 hover:text-black transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-4">Download</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-xs font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                    App Store
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-xs font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.76 1.6a1 1 0 0 1 0 1.73l-2.76 1.599-2.586-2.586 2.586-2.344zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                    Google Play
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">© 2025 Velo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
