import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { tokenStorage } from '../../../shared/lib/tokenStorage'
import { mockFetch } from '../../../test/mockFetch'
import { checkins } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import HomePage from './HomePage'

const renderHome = () => renderWithProviders(<HomePage />, { path: '/', url: '/' })

describe('HomePage', () => {
  beforeEach(() => tokenStorage.setTokens('access-token', 'refresh-token'))

  it('fills the table with the check-ins from GET /api/mood-checkins/', async () => {
    const fetchMock = mockFetch({ 'GET /api/mood-checkins/': { body: checkins } })
    renderHome()

    // Lazy table + async query: wait for the data rows to appear.
    const rows = await screen.findAllByRole('row')
    const [header, firstRow, secondRow] = rows

    expect(rows).toHaveLength(3) // header + 2 check-ins
    expect(within(header).getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Score', 'Notes', 'Date', 'Username', 'Actions',
    ])

    expect(within(firstRow).getByText('8')).toBeInTheDocument()
    expect(within(firstRow).getByText('Went for a walk')).toBeInTheDocument()
    expect(within(firstRow).getByText('11/11/2026')).toBeInTheDocument() // local day, no UTC shift
    expect(within(firstRow).getByText('ana')).toBeInTheDocument()
    expect(within(firstRow).getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(within(firstRow).getByRole('button', { name: /delete/i })).toBeInTheDocument()

    expect(within(secondRow).getByText('carlos')).toBeInTheDocument()
    expect(within(secondRow).getByText('—')).toBeInTheDocument() // empty note placeholder

    // The request was authenticated with the stored token.
    const [, init] = fetchMock.mock.calls[0]
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer access-token')
  })

  it('shows an empty state when there are no check-ins', async () => {
    mockFetch({ 'GET /api/mood-checkins/': { body: [] } })
    renderHome()

    expect(await screen.findByText('No check-ins yet.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows an error with a retry button when the request fails', async () => {
    mockFetch({ 'GET /api/mood-checkins/': { status: 500, body: { detail: 'boom' } } })
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load check-ins.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
