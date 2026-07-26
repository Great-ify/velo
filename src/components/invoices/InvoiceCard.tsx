import { formatCurrency } from '@/lib/currency'
import StatusBadge from './StatusBadge'
import type { Invoice } from '@/hooks/useInvoices'

interface InvoiceCardProps {
  invoice: Invoice
  onClick?: () => void
}

export default function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-border rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate">{invoice.client_name}</h3>
          {invoice.due_date && (
            <p className="text-xs text-gray-400 mt-0.5">
              Due {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
        <span className="text-xs text-gray-400">#{invoice.payment_code}</span>
        <span className="text-lg font-bold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
    </div>
  )
}
