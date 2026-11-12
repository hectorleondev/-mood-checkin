import { apiRequest } from '../../../shared/api/httpClient'
import type { User } from '../types'

export const getMe = (): Promise<User> => apiRequest<User>('/users/me/')

/** Admin-only endpoint. */
export const getUsers = (): Promise<User[]> => apiRequest<User[]>('/users/')
