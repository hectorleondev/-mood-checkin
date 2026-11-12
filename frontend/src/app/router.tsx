import { createBrowserRouter } from 'react-router'
import { ProtectedRoute, PublicOnlyRoute } from '../features/auth'
import { CheckinDetailPage, DeleteCheckinPage, HomePage, LoginPage, NotFoundPage } from './lazyPages'
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
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/detail', element: <CheckinDetailPage /> }, // create
          { path: '/detail/:id', element: <CheckinDetailPage /> }, // edit
          { path: '/delete/:id', element: <DeleteCheckinPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
