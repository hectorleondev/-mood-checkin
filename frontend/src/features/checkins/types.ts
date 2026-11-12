export interface CheckInUser {
  id: number
  username: string
  first_name: string
  last_name: string
  role: 'admin' | 'user'
}

export interface MoodCheckIn {
  id: number
  user: CheckInUser
  score: number
  note: string
  date: string // YYYY-MM-DD (user's local day)
  created_at: string
}
