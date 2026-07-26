import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function Layout() {
  const location = useLocation()

  const hideChrome =
    location.pathname.startsWith('/pay/') ||
    location.pathname.startsWith('/request/') ||
    location.pathname === '/onboarding' ||
    location.pathname === '/send' ||
    location.pathname === '/transactions' ||
    location.pathname.startsWith('/transactions/')

  if (hideChrome) {
    return (
      <div className="min-h-dvh">
        <Outlet />
      </div>
    )
  }

  const hideHeader =
    location.pathname === '/home' ||
    location.pathname === '/split' ||
    location.pathname === '/profile'

  return (
    <div className="min-h-dvh flex flex-col pb-20">
      {!hideHeader && <Header />}
      <main className={`flex-1 ${hideHeader ? '' : 'px-4 py-4'}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
