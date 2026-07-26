import { shareLink } from '@/lib/share'

interface ShareButtonProps {
  url: string
  title?: string
  text?: string
  className?: string
}

export default function ShareButton({ url, title, text, className = '' }: ShareButtonProps) {
  const handleShare = async () => {
    await shareLink(url, title, text)
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-nimiq-blue text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition-all ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Share
    </button>
  )
}
