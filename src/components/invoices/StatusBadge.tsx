import { type InvoiceStatus, type SettlementStatus } from '@/lib/constants'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' },
  sent: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Sent' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Paid' },
  overdue: { bg: 'bg-red-50', text: 'text-red-600', label: 'Overdue' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Cancelled' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmed' },
  failed: { bg: 'bg-red-50', text: 'text-red-600', label: 'Failed' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Expired' },
}

export default function StatusBadge({ status }: { status: InvoiceStatus | SettlementStatus | string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}
