export const APP_NAME = 'Velo'

export const CHAIN_IDS: Record<string, string> = {
  polygon: '0x89',
  bsc: '0x38',
  avalanche: '0xa86a',
}

export const CHAIN_NAMES: Record<string, string> = {
  polygon: 'Polygon',
  bsc: 'BSC',
  avalanche: 'Avalanche',
}

export const RECOMMENDED_CHAINS: string[] = [
  'polygon',
  'bsc',
]

export const USDT_CONTRACTS: Record<string, { address: string; decimals: number }> = {
  polygon: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B8263B',
    decimals: 6,
  },
  bsc: {
    address: '0x55d398326f99059fF7754853762b05b3c4dd28B9',
    decimals: 18,
  },
  avalanche: {
    address: '0xc7198437980C041c805A1EDcbA50c1Ce5db95118',
    decimals: 6,
  },
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type SettlementStatus = 'pending' | 'confirmed' | 'failed' | 'expired'
