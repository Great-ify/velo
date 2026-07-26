import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateInvoice } from '@/hooks/useInvoices'
import { useAppStore } from '@/stores/app'

interface LineItem {
  description: string
  quantity: number
  unit_price: string
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const { defaultCurrency } = useAppStore()
  const createInvoice = useCreateInvoice()

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unit_price: '' }])

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: '' }])

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.unit_price) || 0
    return sum + item.quantity * price
  }, 0)

  const handleCreate = async () => {
    if (!clientName.trim() || items.every((i) => !i.description.trim())) return

    const validItems = items
      .filter((i) => i.description.trim() && parseFloat(i.unit_price) > 0)
      .map((i) => ({
        description: i.description.trim(),
        quantity: i.quantity,
        unit_price: parseFloat(i.unit_price),
      }))

    if (validItems.length === 0) return

    try {
      const invoice = await createInvoice.mutateAsync({
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || undefined,
        due_date: dueDate || undefined,
        notes: notes.trim() || undefined,
        currency: defaultCurrency,
        items: validItems,
      })
      navigate(`/invoices/${invoice.id}`, { replace: true })
    } catch (err) {
      console.error('Failed to create invoice:', err)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Client info */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client or company name"
            className="w-full py-3 px-4 bg-surface-secondary border border-border rounded-xl outline-none focus:border-nimiq-gold transition-colors"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">Client Email (optional)</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@example.com"
            className="w-full py-3 px-4 bg-surface-secondary border border-border rounded-xl outline-none focus:border-nimiq-gold transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">Due Date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full py-3 px-4 bg-surface-secondary border border-border rounded-xl outline-none focus:border-nimiq-gold transition-colors"
          />
        </div>
      </div>

      {/* Line items */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Line Items</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-surface-secondary rounded-xl p-3 space-y-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder="Item description"
                className="w-full py-2 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-nimiq-gold transition-colors"
              />
              <div className="flex gap-2">
                <div className="w-20">
                  <label className="text-xs text-gray-400 mb-0.5 block">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full py-2 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-nimiq-gold transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-0.5 block">Unit Price</label>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(i, 'unit_price', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full py-2 px-3 bg-white border border-border rounded-lg text-sm outline-none focus:border-nimiq-gold transition-colors"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="self-end pb-2 text-gray-300 hover:text-red-400"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="mt-3 text-sm text-nimiq-gold font-medium flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, thank you note..."
          rows={3}
          className="w-full py-3 px-4 bg-surface-secondary border border-border rounded-xl outline-none focus:border-nimiq-gold transition-colors resize-none"
        />
      </div>

      {/* Total */}
      <div className="bg-surface-secondary rounded-2xl p-4 flex justify-between items-center">
        <span className="font-medium text-gray-600">Total</span>
        <span className="text-2xl font-bold">${subtotal.toFixed(2)}</span>
      </div>

      <button
        onClick={handleCreate}
        disabled={!clientName.trim() || subtotal <= 0 || createInvoice.isPending}
        className="w-full py-4 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
      </button>
    </div>
  )
}
