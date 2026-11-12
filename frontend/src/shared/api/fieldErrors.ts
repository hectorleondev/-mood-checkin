import { ApiError } from './httpClient'

/**
 * Turn a DRF 400 body ({"field": ["msg"], "non_field_errors": [...]}) into
 * { fieldErrors, formError } so forms can show each message next to its field.
 */
export function parseApiErrors<F extends string>(
  error: unknown,
  formFields: readonly F[],
): { fieldErrors: Partial<Record<F, string>>; formError: string | null } {
  const fieldErrors: Partial<Record<F, string>> = {}

  if (!(error instanceof ApiError)) {
    return { fieldErrors, formError: 'Network error. Please try again.' }
  }
  if (error.status !== 400 || typeof error.data !== 'object' || error.data === null) {
    const detail = (error.data as { detail?: string } | null)?.detail
    return { fieldErrors, formError: detail ?? 'Something went wrong. Please try again.' }
  }

  const otherMessages: string[] = []
  for (const [key, value] of Object.entries(error.data as Record<string, unknown>)) {
    const message = Array.isArray(value) ? String(value[0]) : String(value)
    if ((formFields as readonly string[]).includes(key)) fieldErrors[key as F] = message
    else otherMessages.push(message)
  }
  return { fieldErrors, formError: otherMessages.length ? otherMessages.join(' ') : null }
}
