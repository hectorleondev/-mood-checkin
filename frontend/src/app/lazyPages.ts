import { lazy } from 'react'

// Route-level code splitting: each page is loaded only when visited.
export const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
export const HomePage = lazy(() => import('../features/checkins/pages/HomePage'))
export const NotFoundPage = lazy(() => import('../shared/components/NotFoundPage'))
