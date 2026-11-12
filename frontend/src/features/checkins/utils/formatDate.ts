/**
 * Format a "YYYY-MM-DD" date as "DD/MM/YYYY" without `new Date()`:
 * parsing a date-only string as a Date uses UTC and can shift it one day back.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
