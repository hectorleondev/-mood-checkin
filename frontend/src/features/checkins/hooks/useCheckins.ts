import { useQuery } from '@tanstack/react-query'
import { getCheckins } from '../api/checkinsApi'

export const checkinKeys = {
  all: ['mood-checkins'] as const,
}

export function useCheckins() {
  return useQuery({
    queryKey: checkinKeys.all,
    queryFn: getCheckins,
  })
}
