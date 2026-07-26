import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateGroup } from '@/hooks/useGroups'
import { useAppStore } from '@/stores/app'

const EMOJIS = ['💰', '🏠', '✈️', '🍕', '🎉', '🏋️', '🎮', '📚', '🛒', '💼', '🚗', '☕']

export default function CreateGroup() {
  const navigate = useNavigate()
  const { defaultCurrency } = useAppStore()
  const createGroup = useCreateGroup()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💰')
  const [currency, setCurrency] = useState(defaultCurrency)

  const handleCreate = async () => {
    if (!name.trim()) return

    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        emoji,
        default_currency: currency,
      })
      navigate(`/groups/${group.id}`, { replace: true })
    } catch (err) {
      console.error('Failed to create group:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Emoji picker */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Group Icon</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                emoji === e
                  ? 'bg-nimiq-gold/20 border-2 border-nimiq-gold scale-110'
                  : 'bg-surface-secondary border-2 border-transparent hover:bg-surface-tertiary'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Group name */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Group Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Weekend Trip, Roommates"
          className="w-full py-3 px-4 bg-surface-secondary border border-border rounded-xl outline-none focus:border-nimiq-gold transition-colors"
          maxLength={50}
          autoFocus
        />
      </div>

      {/* Currency */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Default Currency</label>
        <div className="grid grid-cols-4 gap-2">
          {['USD', 'EUR', 'GBP', 'NGN'].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                currency === c
                  ? 'bg-nimiq-blue text-white'
                  : 'bg-surface-secondary text-gray-600 hover:bg-surface-tertiary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!name.trim() || createGroup.isPending}
        className="w-full py-4 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {createGroup.isPending ? 'Creating...' : 'Create Group'}
      </button>
    </div>
  )
}
