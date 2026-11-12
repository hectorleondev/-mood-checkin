import { Link } from 'react-router'
import { displayName, type User } from '../../users'
import { useCheckinForm } from '../hooks/useCheckinForm'
import type { MoodCheckIn } from '../types'

interface CheckinFormProps {
  checkin?: MoodCheckIn
  isAdmin: boolean
  users: User[]
}

export function CheckinForm({ checkin, isAdmin, users }: CheckinFormProps) {
  const { form, onSubmit, isEdit, requireUser, isSubmitting } = useCheckinForm({ checkin, isAdmin })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form className="card form wide" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>{isEdit ? 'Edit check-in' : 'New check-in'}</h1>

      {isEdit && checkin && (
        <p className="readonly-field">
          <span>User</span> {displayName(checkin.user)}
        </p>
      )}

      {requireUser && (
        <>
          <label htmlFor="user_id">User</label>
          <select
            id="user_id"
            aria-invalid={!!errors.user_id}
            {...register('user_id', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          >
            <option value="">Select a user…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {displayName(user)}
              </option>
            ))}
          </select>
          {errors.user_id && <p className="field-error">{errors.user_id.message}</p>}
        </>
      )}

      <label htmlFor="score">Score (1–10)</label>
      <input
        id="score"
        type="number"
        min={1}
        max={10}
        step={1}
        aria-invalid={!!errors.score}
        {...register('score', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
      />
      {errors.score && <p className="field-error">{errors.score.message}</p>}

      <label htmlFor="date">Date (YYYY-MM-DD)</label>
      <input id="date" type="text" placeholder="2026-11-12" aria-invalid={!!errors.date} {...register('date')} />
      {errors.date && <p className="field-error">{errors.date.message}</p>}

      <label htmlFor="note">Note (optional)</label>
      <textarea id="note" rows={3} aria-invalid={!!errors.note} {...register('note')} />
      {errors.note && <p className="field-error">{errors.note.message}</p>}

      <div className="actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </button>
        <Link to="/" className="button secondary">
          Cancel
        </Link>
      </div>

      {errors.root?.server && (
        <p className="form-error" role="alert">
          {errors.root.server.message}
        </p>
      )}
    </form>
  )
}
