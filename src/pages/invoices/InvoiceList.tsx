import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInvoices } from '@/hooks/useInvoices'
import InvoiceCard from '@/components/invoices/InvoiceCard'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import type { InvoiceStatus } from '@/lib/constants'

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
]

export default function InvoiceList() {
  const navigate = useNavigate()
  const { data: invoices, isLoading } = useInvoices()
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'all'
      ? invoices
      : invoices?.filter((inv) => inv.status === (filter as InvoiceStatus))

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-nimiq-blue text-white'
                : 'bg-surface-secondary text-gray-500 hover:bg-surface-tertiary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!filtered || filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          title="No invoices yet"
          description="Create your first invoice to start billing clients."
          action={
            <button
              onClick={() => navigate('/invoices/new')}
              className="px-6 py-3 bg-nimiq-blue text-white rounded-2xl font-semibold"
            >
              Create Invoice
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((invoice, i) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <InvoiceCard invoice={invoice} onClick={() => navigate(`/invoices/${invoice.id}`)} />
            </motion.div>
          ))}
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/invoices/new')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-nimiq-gold text-nimiq-blue rounded-full shadow-lg flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      )}
    </div>
  )
}
