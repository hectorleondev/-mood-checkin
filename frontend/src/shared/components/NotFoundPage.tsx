import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="center">
      <h1>404 · Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go home</Link>
    </main>
  )
}
