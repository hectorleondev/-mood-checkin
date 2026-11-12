import { apiRequest } from '../../../shared/api/httpClient'
import type { MoodCheckIn } from '../types'

export function getCheckins(): Promise<MoodCheckIn[]> {
  return apiRequest<MoodCheckIn[]>('/mood-checkins/')
}
