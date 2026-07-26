// USDT contract addresses per chain
export const USDT_CONTRACTS: Record<string, { address: string; decimals: number }> = {
  polygon: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
  base: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
  arbitrum: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
  optimism: { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
  bsc: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  ethereum: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
}

export const CHAIN_IDS: Record<string, string> = {
  polygon: '0x89',
  base: '0x2105',
  arbitrum: '0xa4b1',
  optimism: '0xa',
  bsc: '0x38',
  ethereum: '0x1',
}

export const CHAIN_NAMES: Record<string, string> = {
  polygon: 'Polygon',
  base: 'Base',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  bsc: 'BNB Chain',
  ethereum: 'Ethereum',
}

// Recommended chains (low fees)
export const RECOMMENDED_CHAINS = ['polygon', 'base', 'arbitrum']

export const APP_NAME = 'Velo'

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN'] as const
export type Currency = (typeof CURRENCIES)[number]

export const SPLIT_METHODS = ['equal', 'exact', 'percentage'] as const
export type SplitMethod = (typeof SPLIT_METHODS)[number]

export const PAYMENT_METHODS = ['NIM', 'USDT'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const SETTLEMENT_STATUSES = ['pending', 'confirmed', 'failed'] as const
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number]
