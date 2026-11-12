import { apiRequest } from '../../../shared/api/httpClient'
import type { LoginFormValues } from '../schemas/loginSchema'

export interface LoginResponse {
  access: string
  refresh: string
}

export function login(credentials: LoginFormValues): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: credentials,
    skipAuth: true,
  })
}
