import { apiRequest } from '../../../shared/api/httpClient'
import type { CheckinPayload, MoodCheckIn } from '../types'

const BASE = '/mood-checkins/'

export const getCheckins = (): Promise<MoodCheckIn[]> => apiRequest<MoodCheckIn[]>(BASE)

export const getCheckin = (id: number): Promise<MoodCheckIn> =>
  apiRequest<MoodCheckIn>(`${BASE}${id}/`)

export const createCheckin = (payload: CheckinPayload): Promise<MoodCheckIn> =>
  apiRequest<MoodCheckIn>(BASE, { method: 'POST', body: payload })

export const updateCheckin = (id: number, payload: Partial<CheckinPayload>): Promise<MoodCheckIn> =>
  apiRequest<MoodCheckIn>(`${BASE}${id}/`, { method: 'PATCH', body: payload })

export const deleteCheckin = (id: number): Promise<null> =>
  apiRequest<null>(`${BASE}${id}/`, { method: 'DELETE' })
