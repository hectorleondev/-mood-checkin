import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

interface Options {
  path: string // route pattern, e.g. "/detail/:id"
  url: string // initial URL, e.g. "/detail/5"
}

/** Render a page with a fresh QueryClient (no cache, no retries) and an in-memory router. */
export function renderWithProviders(element: ReactElement, { path, url }: Options) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path, element },
      { path: '*', element: <p>Other page</p> },
    ],
    { initialEntries: [url] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
