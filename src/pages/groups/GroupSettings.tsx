import { useParams, useNavigate } from 'react-router-dom'
import { useGroupDetail, useGroupMembers } from '@/hooks/useGroups'
import { generateInviteUrl } from '@/lib/share'
import MemberAvatar from '@/components/groups/MemberAvatar'
import ShareButton from '@/components/shared/ShareButton'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function GroupSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: group, isLoading } = useGroupDetail(id!)
  const { data: members } = useGroupMembers(id!)

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
  if (!group) return null

  const inviteUrl = generateInviteUrl(group.invite_code)

  return (
    <div className="space-y-6">
      {/* Group info */}
      <div className="text-center py-4">
        <span className="text-5xl">{group.emoji}</span>
        <h2 className="text-xl font-bold mt-3">{group.name}</h2>
        <p className="text-gray-400 text-sm mt-1">{group.default_currency} &middot; {members?.length || 0} members</p>
      </div>

      {/* Invite */}
      <div className="bg-surface-secondary rounded-2xl p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">Invite Members</p>
        <div className="flex items-center gap-3">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 bg-white border border-border rounded-xl py-2.5 px-3 text-sm text-gray-500 outline-none"
          />
          <ShareButton url={inviteUrl} title={`Join ${group.name} on Velo`} text={`Join my group "${group.name}" on Velo to split expenses!`} />
        </div>
      </div>

      {/* Members list */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">Members</p>
        <div className="space-y-2">
          {members?.map((m: { profile_id: string; role: string; profiles: { display_name: string } }) => (
            <div key={m.profile_id} className="flex items-center gap-3 bg-surface-secondary rounded-xl p-3">
              <MemberAvatar name={m.profiles?.display_name || 'Unknown'} />
              <div className="flex-1">
                <p className="text-sm font-medium">{m.profiles?.display_name || 'Unknown'}</p>
                {m.role === 'admin' && (
                  <span className="text-xs text-nimiq-gold font-medium">Admin</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate(`/groups/${id}`)}
        className="w-full py-3 text-gray-400 font-medium text-sm"
      >
        Back to Group
      </button>
    </div>
  )
}
