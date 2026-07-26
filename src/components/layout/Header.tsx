import { useLocation, useNavigate } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/groups': 'Groups',
  '/groups/new': 'New Group',
  '/invoices': 'Invoices',
  '/invoices/new': 'New Invoice',
  '/request': 'Request',
  '/profile': 'Profile',
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const title = TITLES[location.pathname] || 'Velo'
  const showBack = location.pathname.split('/').length > 2 && !Object.keys(TITLES).includes(location.pathname)

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border-light safe-top">
      <div className="flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
    </header>
  )
}
