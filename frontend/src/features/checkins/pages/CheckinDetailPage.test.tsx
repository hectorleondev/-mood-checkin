import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { tokenStorage } from '../../../shared/lib/tokenStorage'
import { mockFetch } from '../../../test/mockFetch'
import { adminUser, ana, carlos, checkins } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import CheckinDetailPage from './CheckinDetailPage'

const renderCreate = () =>
  renderWithProviders(<CheckinDetailPage />, { path: '/detail', url: '/detail' })
const renderEdit = (id: number) =>
  renderWithProviders(<CheckinDetailPage />, { path: '/detail/:id', url: `/detail/${id}` })

describe('CheckinDetailPage — user selector', () => {
  beforeEach(() => tokenStorage.setTokens('access-token', 'refresh-token'))

  it('admin creating a check-in sees a required user select with all users', async () => {
    mockFetch({
      'GET /api/users/me/': { body: adminUser },
      'GET /api/users/': { body: [adminUser, ana, carlos] },
    })
    renderCreate()

    const select = await screen.findByRole('combobox', { name: 'User' })
    const options = within(select).getAllByRole('option').map((o) => o.textContent)
    expect(options).toEqual([
      'Select a user…',
      'boss (Laura Admin)',
      'ana (Ana Lopez)',
      'carlos (Carlos Ruiz)',
    ])
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('normal user creating a check-in does not see the user select (and never calls /api/users/)', async () => {
    const fetchMock = mockFetch({ 'GET /api/users/me/': { body: ana } })
    renderCreate()

    expect(await screen.findByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'User' })).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.map(([url]) => url)).not.toContain('/api/users/')
  })

  it('admin editing a check-in sees the owner as read-only text, not a select', async () => {
    mockFetch({
      'GET /api/users/me/': { body: adminUser },
      'GET /api/mood-checkins/10/': { body: checkins[0] },
    })
    renderEdit(10)

    expect(await screen.findByRole('button', { name: 'Update' })).toBeInTheDocument()
    expect(screen.getByText('ana (Ana Lopez)')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'User' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Score (1–10)')).toHaveValue(8)
  })
})
