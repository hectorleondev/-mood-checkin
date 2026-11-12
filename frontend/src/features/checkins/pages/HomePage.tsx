import { lazy, Suspense, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth'
import { useCheckins } from '../hooks/useCheckins'

const CheckinsTable = lazy(() => import('../components/CheckinsTable'))

export default function HomePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { data: checkins, isPending, isError, refetch } = useCheckins()

  // Stable callbacks so the memoized table/rows don't re-render needlessly.
  const handleCreate = useCallback(() => navigate('/detail'), [navigate])
  const handleEdit = useCallback((id: number) => navigate(`/detail/${id}`), [navigate])
  const handleDelete = useCallback((id: number) => navigate(`/delete/${id}`), [navigate])

  return (
    <main className="page">
      <header className="page-header">
        <h1>Mood check-ins</h1>
        <div className="actions">
          <button type="button" onClick={handleCreate}>
            Create
          </button>
          <button type="button" className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
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
          <CheckinsTable checkins={checkins} onEdit={handleEdit} onDelete={handleDelete} />
        </Suspense>
      )}
    </main>
  )
}
