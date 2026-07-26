import { CHAIN_NAMES, RECOMMENDED_CHAINS } from '@/lib/constants'

interface ChainSelectorProps {
  selected: string
  onChange: (chain: string) => void
}

const CHAINS = Object.keys(CHAIN_NAMES)

export default function ChainSelector({ selected, onChange }: ChainSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600">Select Network</label>
      <div className="grid grid-cols-2 gap-2">
        {CHAINS.map((chain) => {
          const isRecommended = RECOMMENDED_CHAINS.includes(chain)
          const isSelected = selected === chain

          return (
            <button
              key={chain}
              onClick={() => onChange(chain)}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                isSelected
                  ? 'border-nimiq-gold bg-amber-50/50 text-nimiq-blue'
                  : 'border-border hover:border-gray-300 text-gray-600'
              }`}
            >
              {CHAIN_NAMES[chain]}
              {isRecommended && (
                <span className="text-[10px] font-semibold text-emerald-500">Low fee</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
