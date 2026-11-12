import { memo, useMemo } from 'react'
import type { MoodCheckIn } from '../types'
import { formatDate } from '../utils/formatDate'

interface CheckinRowProps {
  score: number
  note: string
  date: string
  username: string
}

const CheckinRow = memo(function CheckinRow({ score, note, date, username }: CheckinRowProps) {
  return (
    <tr>
      <td className="score">{score}</td>
      <td>{note || <span className="muted">—</span>}</td>
      <td>{date}</td>
      <td>{username}</td>
    </tr>
  )
})

interface CheckinsTableProps {
  checkins: MoodCheckIn[]
}

function CheckinsTable({ checkins }: CheckinsTableProps) {
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
        </tr>
      </thead>
      <tbody>
        {rows.map(({ id, ...row }) => (
          <CheckinRow key={id} {...row} />
        ))}
      </tbody>
    </table>
  )
}

export default memo(CheckinsTable)
