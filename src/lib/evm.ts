import { USDT_CONTRACTS, CHAIN_IDS } from './constants'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

/**
 * Connect EVM wallet and return the first address
 */
export async function connectEvmWallet(): Promise<string | null> {
  try {
    if (!window.ethereum) {
      console.warn('No EVM wallet found')
      return null
    }
    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[]
    return accounts[0] || null
  } catch (err) {
    console.error('Failed to connect EVM wallet:', err)
    return null
  }
}

/**
 * Switch to the desired EVM chain
 */
export async function switchChain(chainKey: string): Promise<boolean> {
  const chainId = CHAIN_IDS[chainKey]
  if (!chainId || !window.ethereum) return false

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    })
    return true
  } catch (err) {
    console.error(`Failed to switch to ${chainKey}:`, err)
    return false
  }
}

/**
 * Encode an ERC-20 transfer call
 */
export function encodeUsdtTransfer(
  recipient: string,
  amount: number,
  decimals: number
): string {
  const functionSelector = 'a9059cbb'
  const paddedAddress = recipient.slice(2).toLowerCase().padStart(64, '0')
  const rawAmount = BigInt(Math.round(amount * 10 ** decimals))
  const paddedAmount = rawAmount.toString(16).padStart(64, '0')
  return '0x' + functionSelector + paddedAddress + paddedAmount
}

/**
 * Send a USDT payment on the given chain
 */
export async function payWithUsdt(
  recipientAddress: string,
  amount: number,
  chainKey: string
): Promise<string | null> {
  const contract = USDT_CONTRACTS[chainKey]
  if (!contract || !window.ethereum) return null

  try {
    // Switch to the correct chain first
    const switched = await switchChain(chainKey)
    if (!switched) return null

    const data = encodeUsdtTransfer(recipientAddress, amount, contract.decimals)

    const accounts = (await window.ethereum.request({
      method: 'eth_accounts',
    })) as string[]

    const txHash = (await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: contract.address,
          data,
        },
      ],
    })) as string

    return txHash
  } catch (err) {
    console.error('USDT payment failed:', err)
    return null
  }
}

/**
 * Poll for transaction receipt confirmation
 */
export async function waitForTxConfirmation(
  txHash: string,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<boolean> {
  if (!window.ethereum) return false

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = (await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      })) as { status: string } | null

      if (receipt && receipt.status === '0x1') {
        return true
      }
      if (receipt && receipt.status === '0x0') {
        return false // tx failed
      }
    } catch {
      // Continue polling
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  return false
}

/**
 * Fetch USDT balance for an EVM address
 */
export async function getUsdtBalance(
  address: string,
  chainKey: string = 'polygon'
): Promise<number> {
  const contract = USDT_CONTRACTS[chainKey]
  if (!contract || !window.ethereum) return 0

  try {
    // Note: We do not call switchChain here to avoid prompting the user
    // with a wallet popup just for reading their balance.
    const selector = '70a08231'
    const paddedAddress = address.slice(2).toLowerCase().padStart(64, '0')
    const data = '0x' + selector + paddedAddress

    const result = (await window.ethereum.request({
      method: 'eth_call',
      params: [{ to: contract.address, data }, 'latest'],
    })) as string

    return parseInt(result, 16) / 10 ** contract.decimals
  } catch {
    return 0
  }
}

/**
 * Format an EVM address for display
 */
export function formatEvmAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
