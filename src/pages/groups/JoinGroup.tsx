import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useJoinGroup } from '@/hooks/useGroups'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function JoinGroup() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const joinGroup = useJoinGroup()
  const [group, setGroup] = useState<{ name: string; emoji: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGroup() {
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('name, emoji')
        .eq('invite_code', code!)
        .single()

      if (fetchError || !data) {
        setError('Group not found or invite link is invalid.')
      } else {
        setGroup(data)
      }
      setLoading(false)
    }
    fetchGroup()
  }, [code])

  const handleJoin = async () => {
    try {
      await joinGroup.mutateAsync(code!)
      navigate('/groups', { replace: true })
    } catch {
      setError('Failed to join group. You may already be a member.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/groups')} className="text-nimiq-gold font-medium">
          Go to Groups
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl mb-4">{group?.emoji}</span>
      <h1 className="text-2xl font-bold mb-2">Join "{group?.name}"</h1>
      <p className="text-gray-500 text-sm mb-8">You've been invited to join this group on Velo.</p>

      <button
        onClick={handleJoin}
        disabled={joinGroup.isPending}
        className="w-full max-w-xs py-4 bg-nimiq-blue text-white rounded-2xl font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {joinGroup.isPending ? 'Joining...' : 'Join Group'}
      </button>
    </div>
  )
}
