import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const { login, isPending, errorMessage } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = useCallback((values: LoginFormValues) => login(values), [login])

  return (
    <form className="card form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>Mood Check-in</h1>

      <label htmlFor="username">Username</label>
      <input
        id="username"
        type="text"
        autoComplete="username"
        aria-invalid={!!errors.username}
        {...register('username')}
      />
      {errors.username && <p className="field-error">{errors.username.message}</p>}

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        aria-invalid={!!errors.password}
        {...register('password')}
      />
      {errors.password && <p className="field-error">{errors.password.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in…' : 'Login'}
      </button>

      {errorMessage && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
