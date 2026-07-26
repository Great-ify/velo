import { APP_NAME } from './constants'

export async function shareLink(url: string, title?: string, text?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || APP_NAME,
        text: text || 'Check this out on Velo',
        url,
      })
      return true
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false
    }
  }

  // Fallback: copy to clipboard
  return copyToClipboard(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

export function generatePaymentUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${baseUrl}${path}`
}

export function generateInviteUrl(inviteCode: string): string {
  return generatePaymentUrl(`/join/${inviteCode}`)
}
