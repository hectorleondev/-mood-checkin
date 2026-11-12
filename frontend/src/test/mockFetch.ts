import { vi } from 'vitest'

type Routes = Record<string, { status?: number; body: unknown }>

/**
 * Mock the network layer: `routes` maps "METHOD /api/path" to a JSON response.
 * Any request not listed fails the test with a clear message.
 */
export function mockFetch(routes: Routes) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const key = `${init?.method ?? 'GET'} ${url}`
    const route = routes[key]
    if (!route) throw new Error(`Unexpected request: ${key}`)
    return new Response(JSON.stringify(route.body), {
      status: route.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
