import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NimiqProvider } from '@/providers/NimiqProvider'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { useAppStore } from '@/stores/app'

import Layout from '@/components/layout/Layout'
import WalletConnectModal from '@/components/WalletConnectModal'
import UsernameSetup from '@/components/UsernameSetup'
import LandingPage from '@/pages/LandingPage'
import Onboarding from '@/pages/Onboarding'
import Home from '@/pages/Home'
import SplitBill from '@/pages/split/SplitBill'
import GroupsList from '@/pages/groups/GroupsList'
import CreateGroup from '@/pages/groups/CreateGroup'
import GroupDetail from '@/pages/groups/GroupDetail'
import AddExpense from '@/pages/groups/AddExpense'
import ExpenseDetail from '@/pages/groups/ExpenseDetail'
import SettleUp from '@/pages/groups/SettleUp'
import GroupSettings from '@/pages/groups/GroupSettings'
import JoinGroup from '@/pages/groups/JoinGroup'
import QuickRequest from '@/pages/request/QuickRequest'
import PayRequest from '@/pages/request/PayRequest'
import SendPayment from '@/pages/send/SendPayment'
import TransactionList from '@/pages/TransactionList'
import TransactionDetail from '@/pages/TransactionDetail'
import ComingSoon from '@/pages/ComingSoon'
import Profile from '@/pages/Profile'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { onboardingComplete } = useAppStore()

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <NimiqProvider>
        <SupabaseProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/join/:code" element={<JoinGroup />} />
            <Route path="/request/:id" element={<PayRequest />} />

            {/* Protected routes */}
            <Route
              element={
                <OnboardingGuard>
                  <Layout />
                </OnboardingGuard>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/split" element={<SplitBill />} />

              <Route path="/groups" element={<GroupsList />} />
              <Route path="/groups/new" element={<CreateGroup />} />
              <Route path="/groups/:id" element={<GroupDetail />} />
              <Route path="/groups/:id/expense/new" element={<AddExpense />} />
              <Route path="/groups/:id/expense/:eid" element={<ExpenseDetail />} />
              <Route path="/groups/:id/settle" element={<SettleUp />} />
              <Route path="/groups/:id/settings" element={<GroupSettings />} />

              <Route path="/request" element={<QuickRequest />} />
              <Route path="/send" element={<SendPayment />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/transactions/:hash" element={<TransactionDetail />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Routes>

          {/* Global modals */}
          <WalletConnectModal />
          <UsernameSetup />
        </SupabaseProvider>
      </NimiqProvider>
    </BrowserRouter>
  )
}
