import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { parseApiErrors } from '../../../shared/api/fieldErrors'
import { displayName } from '../../users'
import { CheckinNotFound } from '../components/NotFoundMessage'
import { useCheckin, useDeleteCheckin } from '../hooks/useCheckins'
import { useCheckinIdParam } from '../hooks/useCheckinIdParam'
import { formatDate } from '../utils/formatDate'

export default function DeleteCheckinPage() {
  const navigate = useNavigate()
  const id = useCheckinIdParam()
  const validId = id !== null && !Number.isNaN(id)
  const { data: checkin, isPending, isError } = useCheckin(validId ? id : null)
  const deleteMutation = useDeleteCheckin(validId ? id : 0)

  const goHome = useCallback(() => navigate('/', { replace: true }), [navigate])
  const handleDelete = useCallback(() => deleteMutation.mutate(undefined, { onSuccess: goHome }), [deleteMutation, goHome])

  if (!validId || isError) return <CheckinNotFound />
  if (isPending) return <p className="center" role="status">Loading…</p>

  const fields: [string, string][] = [
    ['User', displayName(checkin.user)],
    ['Score', String(checkin.score)],
    ['Date', formatDate(checkin.date)],
    ['Note', checkin.note || '—'],
    ['Created at', new Date(checkin.created_at).toLocaleString()],
  ]
  const errorMessage = deleteMutation.error ? parseApiErrors(deleteMutation.error, []).formError : null

  return (
    <main className="center">
      <section className="card wide">
        <h1>Delete check-in</h1>
        <table className="key-value">
          <thead>
            <tr>
              <th scope="col">Key</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(([key, value]) => (
              <tr key={key}>
                <th scope="row">{key}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="warning">Are you sure you want to delete this record?</p>

        <div className="actions">
          <button type="button" className="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
          <button type="button" className="secondary" onClick={goHome} disabled={deleteMutation.isPending}>
            Cancel
          </button>
        </div>

        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  )
}
