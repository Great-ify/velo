import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGroups } from '@/hooks/useGroups'
import { useWalletStore } from '@/stores/wallet'
import { useNetBalance } from '@/hooks/useBalances'
import BalanceCard from '@/components/groups/BalanceCard'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

function GroupItem({ group }: { group: { id: string; name: string; emoji: string; default_currency: string } }) {
  const navigate = useNavigate()
  const { profileId } = useWalletStore()
  const balance = useNetBalance(group.id, profileId || '')

  return (
    <BalanceCard
      groupName={group.name}
      emoji={group.emoji}
      balance={balance}
      currency={group.default_currency}
      onClick={() => navigate(`/groups/${group.id}`)}
    />
  )
}

export default function GroupsList() {
  const navigate = useNavigate()
  const { data: groups, isLoading } = useGroups()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  return (
    <div>
      {!groups || groups.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          title="No groups yet"
          description="Create a group to start splitting expenses with friends."
          action={
            <button
              onClick={() => navigate('/groups/new')}
              className="px-6 py-3 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Create Group
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GroupItem group={group} />
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      {groups && groups.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/groups/new')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-nimiq-gold text-nimiq-blue rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      )}
    </div>
  )
}
