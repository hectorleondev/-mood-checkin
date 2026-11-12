import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCheckin,
  deleteCheckin,
  getCheckin,
  getCheckins,
  updateCheckin,
} from '../api/checkinsApi'
import type { CheckinPayload } from '../types'

export const checkinKeys = {
  all: ['mood-checkins'] as const,
  detail: (id: number) => ['mood-checkins', id] as const,
}

export function useCheckins() {
  return useQuery({ queryKey: checkinKeys.all, queryFn: getCheckins })
}

export function useCheckin(id: number | null) {
  return useQuery({
    queryKey: checkinKeys.detail(id ?? 0),
    queryFn: () => getCheckin(id as number),
    enabled: id !== null,
  })
}

/** Any write invalidates the list and detail caches so Home shows fresh data. */
function useInvalidateCheckins() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: checkinKeys.all })
}

export function useCreateCheckin() {
  const invalidate = useInvalidateCheckins()
  return useMutation({
    mutationFn: (payload: CheckinPayload) => createCheckin(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateCheckin(id: number) {
  const invalidate = useInvalidateCheckins()
  return useMutation({
    mutationFn: (payload: Partial<CheckinPayload>) => updateCheckin(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteCheckin(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteCheckin(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: checkinKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: checkinKeys.all })
    },
  })
}
