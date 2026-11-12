import type { User } from '../users'

export interface MoodCheckIn {
  id: number
  user: User
  score: number
  note: string
  date: string // YYYY-MM-DD (user's local day)
  created_at: string
}

export interface CheckinPayload {
  score: number
  note: string
  date: string
  user_id?: number // admin only, create only
}
