/**
 * JWT storage in cookies.
 *
 * Note: cookies written from JavaScript cannot be HttpOnly, so they are still readable
 * by any script on the page (same XSS exposure as localStorage). The proper fix is for
 * the backend to set HttpOnly cookies on login/refresh. See NOTES.md.
 */
const ACCESS_COOKIE = 'mc_access'
const REFRESH_COOKIE = 'mc_refresh'
const ACCESS_MAX_AGE = 5 * 60 // matches SIMPLE_JWT ACCESS_TOKEN_LIFETIME
const REFRESH_MAX_AGE = 24 * 60 * 60 // matches SIMPLE_JWT REFRESH_TOKEN_LIFETIME

type Listener = () => void
const listeners = new Set<Listener>()

function cookieAttributes(maxAgeSeconds: number): string {
  // `Secure` only on HTTPS: some browsers drop Secure cookies on http://localhost.
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  return `; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Strict${secure}`
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}${cookieAttributes(maxAgeSeconds)}`
}

function getCookie(name: string): string | null {
  const entry = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export const tokenStorage = {
  getAccess: (): string | null => getCookie(ACCESS_COOKIE),
  getRefresh: (): string | null => getCookie(REFRESH_COOKIE),

  setTokens(access: string, refresh: string): void {
    setCookie(ACCESS_COOKIE, access, ACCESS_MAX_AGE)
    setCookie(REFRESH_COOKIE, refresh, REFRESH_MAX_AGE)
    emit()
  },

  clear(): void {
    setCookie(ACCESS_COOKIE, '', 0)
    setCookie(REFRESH_COOKIE, '', 0)
    emit()
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
