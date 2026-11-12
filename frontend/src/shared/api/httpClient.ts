import { tokenStorage } from '../lib/tokenStorage'

const API_BASE_URL = '/api'

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Public endpoints (login, refresh) must not send a token or trigger a refresh. */
  skipAuth?: boolean
}

interface TokenPair {
  access: string
  refresh?: string
}

// Shared promise so parallel 401s trigger a single refresh request.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!response.ok) {
    tokenStorage.clear() // refresh expired or blacklisted -> back to login
    return null
  }
  const tokens = (await response.json()) as TokenPair
  // ROTATE_REFRESH_TOKENS is on: the backend returns a new refresh token.
  tokenStorage.setTokens(tokens.access, tokens.refresh ?? refresh)
  return tokens.access
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, skipAuth = false }: RequestOptions = {},
  canRetry = true,
): Promise<T> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const access = skipAuth ? null : tokenStorage.getAccess()
  if (access) headers.set('Authorization', `Bearer ${access}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401 && !skipAuth && canRetry) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    })
    if (await refreshPromise) {
      return apiRequest<T>(path, { method, body, skipAuth }, false)
    }
  }

  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data as T
}
