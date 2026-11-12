import { useCallback, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { tokenStorage } from '../../../shared/lib/tokenStorage'

/** Auth state comes from the refresh token: the access token is short-lived and refreshed on demand. */
export function useAuth() {
  const queryClient = useQueryClient()
  const isAuthenticated = useSyncExternalStore(
    tokenStorage.subscribe,
    () => tokenStorage.getRefresh() !== null,
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    queryClient.clear() // don't leak one user's cached data to the next login
  }, [queryClient])

  return { isAuthenticated, logout }
}
