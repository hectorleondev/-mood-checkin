import { useQuery } from '@tanstack/react-query'
import { getMe, getUsers } from '../api/usersApi'

export const userKeys = {
  me: ['users', 'me'] as const,
  all: ['users', 'list'] as const,
}

export function useMe() {
  const query = useQuery({ queryKey: userKeys.me, queryFn: getMe, staleTime: 5 * 60_000 })
  return { ...query, isAdmin: query.data?.role === 'admin' }
}

/** Only fetches when `enabled` (i.e. the current user is an admin). */
export function useUsers(enabled: boolean) {
  return useQuery({ queryKey: userKeys.all, queryFn: getUsers, enabled, staleTime: 5 * 60_000 })
}
