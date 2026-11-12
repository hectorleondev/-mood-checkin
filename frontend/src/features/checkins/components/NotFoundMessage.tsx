import { Link } from 'react-router'

export function CheckinNotFound() {
  return (
    <main className="center">
      <h1>Check-in not found</h1>
      <p className="muted">It doesn't exist or you don't have access to it.</p>
      <Link to="/">Back to home</Link>
    </main>
  )
}
