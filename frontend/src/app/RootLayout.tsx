import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { FullPageSpinner } from '../shared/components/FullPageSpinner'

export function RootLayout() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Outlet />
    </Suspense>
  )
}
