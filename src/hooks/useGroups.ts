import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys } from '@/lib/supabase'
import { useWalletStore } from '@/stores/wallet'

export interface Group {
  id: string
  name: string
  emoji: string
  default_currency: string
  invite_code: string
  created_by: string
  created_at: string
}

export function useGroups() {
  const { profileId } = useWalletStore()

  return useQuery({
    queryKey: queryKeys.groups(profileId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('profile_id', profileId!)

      if (error) throw error
      return (data?.map((gm) => (gm as unknown as { groups: Group }).groups) ?? []) as Group[]
    },
    enabled: !!profileId,
  })
}

export function useGroupDetail(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groupDetail(groupId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (error) throw error
      return data as Group
    },
    enabled: !!groupId,
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, profiles(*)')
        .eq('group_id', groupId)

      if (error) throw error
      return data ?? []
    },
    enabled: !!groupId,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { profileId } = useWalletStore()

  return useMutation({
    mutationFn: async (input: { name: string; emoji: string; default_currency: string }) => {
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: input.name,
          emoji: input.emoji,
          default_currency: input.default_currency,
          created_by: profileId,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Add creator as admin member
      const { error: memberError } = await supabase.from('group_members').insert({
        group_id: group.id,
        profile_id: profileId,
        role: 'admin',
      })

      if (memberError) throw memberError
      return group as Group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(profileId || '') })
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  const { profileId } = useWalletStore()

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      // Find group by invite code
      const { data: group, error: findError } = await supabase
        .from('groups')
        .select('id, name, emoji')
        .eq('invite_code', inviteCode)
        .single()

      if (findError) throw findError

      // Join as member
      const { error: joinError } = await supabase.from('group_members').insert({
        group_id: group.id,
        profile_id: profileId,
        role: 'member',
      })

      if (joinError) throw joinError
      return group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups(profileId || '') })
    },
  })
}
