export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  role: 'admin' | 'user'
}

export function displayName(user: User): string {
  const fullName = `${user.first_name} ${user.last_name}`.trim()
  return fullName ? `${user.username} (${fullName})` : user.username
}
