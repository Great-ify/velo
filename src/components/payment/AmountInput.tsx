import { useState } from 'react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  currency: string
  placeholder?: string
  autoFocus?: boolean
}

export default function AmountInput({ value, onChange, currency, placeholder = '0.00', autoFocus }: AmountInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`flex items-center gap-2 border-2 rounded-2xl px-4 py-3 transition-colors ${
        focused ? 'border-nimiq-gold bg-amber-50/30' : 'border-border bg-surface-secondary'
      }`}
    >
      <span className="text-lg font-semibold text-gray-400">{currency === 'USD' ? '$' : currency}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-gray-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        step="0.01"
        min="0"
      />
    </div>
  )
}
