import { NavLink, useNavigate } from 'react-router-dom'
import { Home, User } from 'lucide-react'
import { useRequireWallet } from '@/hooks/useRequireWallet'

export default function BottomNav() {
  const navigate = useNavigate()
  const { requireWallet } = useRequireWallet()

  return (
    <>
      {/* Floating send button — must be OUTSIDE the nav to avoid backdrop-blur clipping */}
      <button
        onClick={() => requireWallet(() => navigate('/send'))}
        className="fixed left-1/2 -translate-x-1/2 bottom-[44px] z-[60] w-[56px] h-[56px] bg-black rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-bottom">
        <div className="flex items-center justify-around h-[72px] max-w-md mx-auto">
          {/* Home tab */}
          <NavLink
            to="/home"
            className="flex flex-col items-center justify-center gap-1 w-20 h-full"
          >
            {({ isActive }) => (
              <>
                <Home
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-black' : 'text-gray-400'}
                />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-black' : 'text-gray-400'}`}>
                  Home
                </span>
              </>
            )}
          </NavLink>

          {/* Spacer for center button */}
          <div className="w-20" />

          {/* Profile tab */}
          <NavLink
            to="/profile"
            className="flex flex-col items-center justify-center gap-1 w-20 h-full"
          >
            {({ isActive }) => (
              <>
                <User
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-black' : 'text-gray-400'}
                />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-black' : 'text-gray-400'}`}>
                  Profile
                </span>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </>
  )
}
