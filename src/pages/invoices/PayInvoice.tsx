import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/currency'
import { usePayment } from '@/hooks/usePayment'
import PaymentButton from '@/components/payment/PaymentButton'
import TxConfirmation from '@/components/payment/TxConfirmation'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import type { Invoice, InvoiceItem } from '@/hooks/useInvoices'

export default function PayInvoice() {
  const { id: paymentCode } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<(Invoice & { invoice_items: InvoiceItem[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatorProfile, setCreatorProfile] = useState<{ nim_address: string | null } | null>(null)
  const { pay, status, txHash, error, reset } = usePayment()

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('payment_code', paymentCode!)
        .single()

      if (data) {
        setInvoice(data as Invoice & { invoice_items: InvoiceItem[] })
        const { data: profile } = await supabase
          .from('profiles')
          .select('nim_address')
          .eq('id', data.created_by)
          .single()
        setCreatorProfile(profile)
      }
      setLoading(false)
    }
    fetch()
  }, [paymentCode])

  if (loading) return <div className="min-h-dvh flex items-center justify-center"><LoadingSpinner size={32} /></div>

  if (!invoice) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-bold mb-2">Invoice Not Found</p>
        <p className="text-gray-400 text-sm">This payment link may be invalid or expired.</p>
      </div>
    )
  }

  if (invoice.status === 'paid') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-xl font-bold mb-1">Already Paid</p>
        <p className="text-gray-400 text-sm">This invoice has been settled.</p>
      </div>
    )
  }

  if (status === 'success' && txHash) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <TxConfirmation
          amount={invoice.subtotal}
          currency={invoice.currency}
          txHash={txHash}
          method="NIM"
          onDone={reset}
        />
      </div>
    )
  }

  const handlePay = () => {
    pay({
      fromProfileId: 'payer',
      toProfileId: invoice.created_by,
      toNimAddress: creatorProfile?.nim_address || undefined,
      amount: invoice.subtotal,
      currency: invoice.currency,
      method: 'NIM',
    })
  }

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <div className="max-w-lg mx-auto px-5 py-8">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-nimiq-gold">Velo</p>
          <p className="text-xs text-gray-400 mt-1">Payment Request</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-sm text-gray-400 mb-1">Amount Due</p>
          <p className="text-3xl font-bold mb-4">{formatCurrency(invoice.subtotal, invoice.currency)}</p>
          <div className="text-sm text-gray-500 space-y-1 mb-4">
            <p>To: <span className="font-medium text-gray-700">{invoice.client_name}</span></p>
            {invoice.due_date && (
              <p>Due: {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            )}
          </div>
          {invoice.invoice_items?.length > 0 && (
            <div className="border-t border-border-light pt-3 mt-3 space-y-2">
              {invoice.invoice_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.description} x{item.quantity}</span>
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <PaymentButton
            method="NIM"
            onClick={handlePay}
            loading={status === 'pending' || status === 'confirming'}
          />
        </div>
      </div>
    </div>
  )
}
