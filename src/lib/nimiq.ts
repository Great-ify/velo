import HubApi from '@nimiq/hub-api'
import { APP_NAME } from './constants'

const hubApi = new HubApi('https://hub.nimiq.com')

declare global {
  interface Window {
    nimiq?: {
      listAccounts: () => Promise<string[]>
      checkout: (options: {
        appName: string
        recipient: string
        value: number
        fee?: number
      }) => Promise<{ hash: string; raw: string }>
    }
  }
}

/**
 * Connect Nimiq wallet via Hub popup (works in any browser).
 * Falls back to window.nimiq bridge when inside Nimiq Pay.
 */
export async function connectNimiqWallet(): Promise<string> {
  // Inside Nimiq Pay — use the injected bridge
  if (window.nimiq) {
    const accounts = await window.nimiq.listAccounts()
    if (accounts[0]) return accounts[0]
  }

  // Browser — open Nimiq Hub popup for account selection
  const result = await hubApi.chooseAddress({ appName: APP_NAME })
  if (!result?.address) {
    throw new Error('No address selected')
  }
  return result.address
}

/**
 * Initiate a NIM payment via Nimiq Hub checkout
 */
export async function payWithNim(
  recipientAddress: string,
  amountInLuna: number
): Promise<{ hash: string; raw: string } | null> {
  try {
    if (window.nimiq) {
      return await window.nimiq.checkout({
        appName: APP_NAME,
        recipient: recipientAddress,
        value: amountInLuna,
        fee: 0,
      })
    }

    const result = await hubApi.checkout({
      appName: APP_NAME,
      recipient: recipientAddress,
      value: amountInLuna,
      fee: 0,
    })
    const hash = typeof result.hash === 'string'
      ? result.hash
      : Array.from(result.hash as Uint8Array).map(b => b.toString(16).padStart(2, '0')).join('')
    const raw = typeof result.raw === 'string'
      ? result.raw
      : typeof (result as any).raw?.byteLength === 'number'
        ? Array.from(result.raw as unknown as Uint8Array).map(b => b.toString(16).padStart(2, '0')).join('')
        : JSON.stringify(result.raw)
    return { hash, raw }
  } catch (err) {
    console.error('NIM payment failed:', err)
    return null
  }
}

/**
 * Fetch NIM balance for an address from the Nimiq network
 */
export async function getNimBalance(address: string): Promise<number> {
  try {
    const res = await fetch(
      `https://v2.nimiq.watch/api/v1/account/${encodeURIComponent(address)}`
    )
    if (!res.ok) return 0
    const data = await res.json()
    return (data.balance ?? 0) / 100_000
  } catch {
    return 0
  }
}

/**
 * Format a NIM address for display (first 9 + ... + last 4)
 */
export function formatNimAddress(address: string): string {
  if (address.length <= 16) return address
  return `${address.slice(0, 9)}...${address.slice(-4)}`
}
