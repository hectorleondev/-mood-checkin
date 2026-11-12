import { z } from 'zod'

const baseFields = {
  score: z
    .number({ error: 'Score is required' })
    .int('Score must be a whole number')
    .min(1, 'Score must be between 1 and 10')
    .max(10, 'Score must be between 1 and 10'),
  note: z.string().trim().max(1000, 'Note is too long (max 1000 characters)'),
  date: z.iso.date({ error: 'Enter a valid date (YYYY-MM-DD)' }),
}

export const checkinSchema = z.object({ ...baseFields, user_id: z.number().optional() })

/** Admin creating a check-in must pick the owner. */
export const adminCreateCheckinSchema = z.object({
  ...baseFields,
  user_id: z.number({ error: 'User is required' }).int().positive(),
})

export type CheckinFormValues = z.infer<typeof checkinSchema>
export const CHECKIN_FORM_FIELDS = ['score', 'note', 'date', 'user_id'] as const
