import { useCallback, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { parseApiErrors } from '../../../shared/api/fieldErrors'
import { localToday } from '../../../shared/lib/today'
import {
  adminCreateCheckinSchema,
  CHECKIN_FORM_FIELDS,
  checkinSchema,
  type CheckinFormValues,
} from '../schemas/checkinSchema'
import type { MoodCheckIn } from '../types'
import { useCreateCheckin, useUpdateCheckin } from './useCheckins'

interface Options {
  checkin?: MoodCheckIn // present = edit mode
  isAdmin: boolean
}

/** All form logic for create/edit: validation, submit, API error mapping, redirect. */
export function useCheckinForm({ checkin, isAdmin }: Options) {
  const navigate = useNavigate()
  const isEdit = checkin !== undefined
  const requireUser = isAdmin && !isEdit

  const createMutation = useCreateCheckin()
  const updateMutation = useUpdateCheckin(checkin?.id ?? 0)
  const mutation = isEdit ? updateMutation : createMutation

  const defaultValues = useMemo<CheckinFormValues>(
    () => ({
      score: checkin?.score ?? (undefined as unknown as number),
      note: checkin?.note ?? '',
      date: checkin?.date ?? localToday(), // user's local day, not the server's
      user_id: undefined,
    }),
    [checkin],
  )

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(requireUser ? adminCreateCheckinSchema : checkinSchema) as Resolver<CheckinFormValues>,
    defaultValues,
  })
  const { setError } = form

  const onSubmit = useCallback(
    (values: CheckinFormValues) => {
      const payload = {
        score: values.score,
        note: values.note,
        date: values.date,
        // Only admins pick an owner; regular users are identified by their token.
        ...(requireUser ? { user_id: values.user_id } : {}),
      }
      mutation.mutate(payload, {
        onSuccess: () => navigate('/', { replace: true }),
        onError: (error) => {
          const { fieldErrors, formError } = parseApiErrors(error, CHECKIN_FORM_FIELDS)
          Object.entries(fieldErrors).forEach(([field, message]) =>
            setError(field as keyof CheckinFormValues, { type: 'server', message: message as string }),
          )
          if (formError) setError('root.server', { type: 'server', message: formError })
        },
      })
    },
    [mutation, navigate, requireUser, setError],
  )

  return { form, onSubmit, isEdit, requireUser, isSubmitting: mutation.isPending }
}
