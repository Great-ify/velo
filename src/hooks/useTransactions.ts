import { useQuery } from '@tanstack/react-query'
import { useWalletStore } from '@/stores/wallet'

interface NimiqTransaction {
  hash: string
  blockNumber: number
  timestamp: number
  from: string
  to: string
  value: number
  fee: number
  data: string | null
}

export interface Transaction {
  id: string
  type: 'sent' | 'received'
  address: string
  amount: number
  amountFormatted: string
  timestamp: number
  timeAgo: string
  hash: string
  fee: number
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

async function fetchNimTransactions(address: string): Promise<Transaction[]> {
  try {
    const res = await fetch(
      `https://v2.nimiq.watch/api/v1/account-transactions/${encodeURIComponent(address)}?max=50`
    )
    if (!res.ok) return []
    const data: NimiqTransaction[] = await res.json()

    return data.map((tx) => {
      const isSent = tx.from.replace(/\s/g, '') === address.replace(/\s/g, '')
      const lunaAmount = tx.value / 100_000
      return {
        id: tx.hash,
        type: isSent ? 'sent' : 'received',
        address: isSent ? tx.to : tx.from,
        amount: lunaAmount,
        amountFormatted: `${lunaAmount.toFixed(2)} NIM`,
        timestamp: tx.timestamp * 1000,
        timeAgo: formatTimeAgo(tx.timestamp * 1000),
        hash: tx.hash,
        fee: tx.fee / 100_000,
      }
    })
  } catch {
    return []
  }
}

export function useTransactions() {
  const nimAddress = useWalletStore((s) => s.nimAddress)

  return useQuery({
    queryKey: ['transactions', nimAddress],
    queryFn: () => (nimAddress ? fetchNimTransactions(nimAddress) : Promise.resolve([])),
    enabled: !!nimAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
