interface LineItemRowProps {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  onRemove?: () => void
  editable?: boolean
}

export default function LineItemRow({ description, quantity, unitPrice, amount, onRemove, editable }: LineItemRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{description}</p>
        <p className="text-xs text-gray-400">
          {quantity} x ${unitPrice.toFixed(2)}
        </p>
      </div>
      <span className="text-sm font-semibold">${amount.toFixed(2)}</span>
      {editable && onRemove && (
        <button
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
