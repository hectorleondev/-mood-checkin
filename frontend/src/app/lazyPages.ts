import { lazy } from 'react'

// Route-level code splitting: each page is loaded only when visited.
export const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
export const HomePage = lazy(() => import('../features/checkins/pages/HomePage'))
export const CheckinDetailPage = lazy(() => import('../features/checkins/pages/CheckinDetailPage'))
export const DeleteCheckinPage = lazy(() => import('../features/checkins/pages/DeleteCheckinPage'))
export const NotFoundPage = lazy(() => import('../shared/components/NotFoundPage'))
