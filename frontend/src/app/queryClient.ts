import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../shared/api/httpClient'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // serve cached data for 30s before refetching
      // Don't retry client errors (401/403/404): retrying won't fix them.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})
