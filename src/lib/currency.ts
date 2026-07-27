const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=nimiq-2&vs_currencies=usd'

export interface ExchangeRates {
  nim_usd: number
}

let cachedRates: ExchangeRates | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60_000 // 1 minute

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now()
  if (cachedRates && now - cacheTimestamp < CACHE_TTL) {
    return cachedRates
  }

  try {
    const res = await fetch(COINGECKO_URL)
    const data = await res.json()
    cachedRates = {
      nim_usd: data['nimiq-2']?.usd ?? 0.001,
    }
    cacheTimestamp = now
    return cachedRates
  } catch {
    return cachedRates ?? { nim_usd: 0.001 }
  }
}

export function fiatToNim(fiatAmount: number, nimPrice: number): number {
  if (nimPrice <= 0) return 0
  return Math.ceil(fiatAmount / nimPrice)
}

export function nimToLuna(nim: number): number {
  return Math.round(nim * 100000)
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCrypto(amount: number, symbol: string): string {
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${symbol}`
}
