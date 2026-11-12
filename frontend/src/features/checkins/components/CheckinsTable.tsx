import { memo, useMemo } from 'react'
import type { MoodCheckIn } from '../types'
import { formatDate } from '../utils/formatDate'

interface CheckinRowProps {
  id: number
  score: number
  note: string
  date: string
  username: string
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

const CheckinRow = memo(function CheckinRow({ id, score, note, date, username, onEdit, onDelete }: CheckinRowProps) {
  return (
    <tr>
      <td className="score">{score}</td>
      <td>{note || <span className="muted">—</span>}</td>
      <td>{date}</td>
      <td>{username}</td>
      <td className="row-actions">
        <button type="button" className="small" onClick={() => onEdit(id)} aria-label={`Edit check-in of ${date}`}>
          Edit
        </button>
        <button type="button" className="small danger" onClick={() => onDelete(id)} aria-label={`Delete check-in of ${date}`}>
          Delete
        </button>
      </td>
    </tr>
  )
})

interface CheckinsTableProps {
  checkins: MoodCheckIn[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

function CheckinsTable({ checkins, onEdit, onDelete }: CheckinsTableProps) {
  // Derive display rows once per data change, not on every render.
  const rows = useMemo(
    () =>
      checkins.map((checkin) => ({
        id: checkin.id,
        score: checkin.score,
        note: checkin.note,
        date: formatDate(checkin.date),
        username: checkin.user.username,
      })),
    [checkins],
  )

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Score</th>
          <th scope="col">Notes</th>
          <th scope="col">Date</th>
          <th scope="col">Username</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <CheckinRow key={row.id} {...row} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  )
}

export default memo(CheckinsTable)
