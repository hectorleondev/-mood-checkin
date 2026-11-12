import { useParams } from 'react-router'

/** Reads :id from the URL. Returns null when absent, NaN when it's not a valid positive integer. */
export function useCheckinIdParam(): number | null {
  const { id } = useParams()
  if (id === undefined) return null
  return /^\d+$/.test(id) && Number(id) > 0 ? Number(id) : Number.NaN
}
