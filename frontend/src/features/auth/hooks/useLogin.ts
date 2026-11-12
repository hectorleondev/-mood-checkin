import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { ApiError } from '../../../shared/api/httpClient'
import { tokenStorage } from '../../../shared/lib/tokenStorage'
import { login } from '../api/authApi'

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials'
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ access, refresh }) => {
      tokenStorage.setTokens(access, refresh)
      navigate(redirectTo, { replace: true })
    },
  })

  // 400/401 -> bad credentials; anything else (network, 5xx) -> generic message.
  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError && [400, 401].includes(mutation.error.status)
      ? INVALID_CREDENTIALS_MESSAGE
      : GENERIC_ERROR_MESSAGE
    : null

  return { login: mutation.mutate, isPending: mutation.isPending, errorMessage }
}
