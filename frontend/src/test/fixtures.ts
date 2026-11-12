import type { MoodCheckIn } from '../features/checkins/types'
import type { User } from '../features/users'

export const adminUser: User = { id: 1, username: 'boss', first_name: 'Laura', last_name: 'Admin', role: 'admin' }
export const ana: User = { id: 2, username: 'ana', first_name: 'Ana', last_name: 'Lopez', role: 'user' }
export const carlos: User = { id: 3, username: 'carlos', first_name: 'Carlos', last_name: 'Ruiz', role: 'user' }

export const checkins: MoodCheckIn[] = [
  { id: 10, user: ana, score: 8, note: 'Went for a walk', date: '2026-11-11', created_at: '2026-11-11T18:00:00Z' },
  { id: 11, user: carlos, score: 3, note: '', date: '2026-11-10', created_at: '2026-11-10T09:00:00Z' },
]
