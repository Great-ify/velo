export const APP_NAME = 'Velo'

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN'] as const
export type Currency = (typeof CURRENCIES)[number]

export const SPLIT_METHODS = ['equal', 'exact', 'percentage'] as const
export type SplitMethod = (typeof SPLIT_METHODS)[number]

export const PAYMENT_METHODS = ['NIM'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const SETTLEMENT_STATUSES = ['pending', 'confirmed', 'failed'] as const
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number]
