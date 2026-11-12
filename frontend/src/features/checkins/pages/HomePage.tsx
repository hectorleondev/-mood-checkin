import { lazy, Suspense } from 'react'
import { useAuth } from '../../auth'
import { useCheckins } from '../hooks/useCheckins'

const CheckinsTable = lazy(() => import('../components/CheckinsTable'))

export default function HomePage() {
  const { logout } = useAuth()
  const { data: checkins, isPending, isError, refetch } = useCheckins()

  return (
    <main className="page">
      <header className="page-header">
        <h1>Mood check-ins</h1>
        <button type="button" className="secondary" onClick={logout}>
          Logout
        </button>
      </header>

      {isPending && <p role="status">Loading check-ins…</p>}

      {isError && (
        <div className="form-error" role="alert">
          Could not load check-ins.{' '}
          <button type="button" className="link" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}

      {checkins && checkins.length === 0 && <p className="muted">No check-ins yet.</p>}

      {checkins && checkins.length > 0 && (
        <Suspense fallback={<p role="status">Loading table…</p>}>
          <CheckinsTable checkins={checkins} />
        </Suspense>
      )}
    </main>
  )
}
