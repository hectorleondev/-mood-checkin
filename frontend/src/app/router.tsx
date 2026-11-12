import { createBrowserRouter } from 'react-router'
import { ProtectedRoute, PublicOnlyRoute } from '../features/auth'
import { HomePage, LoginPage, NotFoundPage } from './lazyPages'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/', element: <HomePage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
