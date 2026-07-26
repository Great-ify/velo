import { useParams } from 'react-router-dom'
import { useInvoiceDetail, useSendInvoice } from '@/hooks/useInvoices'
import { formatCurrency } from '@/lib/currency'
import { generatePaymentUrl } from '@/lib/share'
import StatusBadge from '@/components/invoices/StatusBadge'
import LineItemRow from '@/components/invoices/LineItemRow'
import ShareButton from '@/components/shared/ShareButton'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoiceDetail(id!)
  const sendInvoice = useSendInvoice()

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
  if (!invoice) return <div className="text-center py-20 text-gray-400">Invoice not found</div>

  const payUrl = generatePaymentUrl(`/pay/${invoice.payment_code}`)

  const handleSend = async () => {
    await sendInvoice.mutateAsync(invoice.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{invoice.client_name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">#{invoice.payment_code}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Amount */}
      <div className="text-center py-4 bg-surface-secondary rounded-2xl">
        <p className="text-sm text-gray-400 mb-1">Amount Due</p>
        <p className="text-3xl font-bold">{formatCurrency(invoice.subtotal, invoice.currency)}</p>
        {invoice.due_date && (
          <p className="text-xs text-gray-400 mt-2">
            Due {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Line items */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Items</h3>
        <div className="bg-surface-secondary rounded-xl p-4 divide-y divide-border-light">
          {invoice.invoice_items?.map((item) => (
            <LineItemRow
              key={item.id}
              description={item.description}
              quantity={item.quantity}
              unitPrice={item.unit_price}
              amount={item.amount}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-surface-secondary rounded-xl p-4">
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* TX hash if paid */}
      {invoice.tx_hash && (
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-sm text-emerald-600 font-medium mb-1">Payment Received</p>
          <p className="text-xs text-emerald-500 font-mono break-all">{invoice.tx_hash}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {invoice.status === 'draft' && (
          <button
            onClick={handleSend}
            disabled={sendInvoice.isPending}
            className="w-full py-4 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {sendInvoice.isPending ? 'Sending...' : 'Mark as Sent'}
          </button>
        )}

        {(invoice.status === 'sent' || invoice.status === 'draft') && (
          <ShareButton
            url={payUrl}
            title={`Invoice from Velo`}
            text={`You have an invoice for ${formatCurrency(invoice.subtotal, invoice.currency)} from ${invoice.client_name}. Pay here:`}
            className="w-full justify-center"
          />
        )}
      </div>
    </div>
  )
}
