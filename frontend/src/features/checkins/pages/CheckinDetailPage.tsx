import { useMe, useUsers } from '../../users'
import { CheckinForm } from '../components/CheckinForm'
import { CheckinNotFound } from '../components/NotFoundMessage'
import { useCheckin } from '../hooks/useCheckins'
import { useCheckinIdParam } from '../hooks/useCheckinIdParam'

/** /detail -> create, /detail/:id -> edit. */
export default function CheckinDetailPage() {
  const id = useCheckinIdParam()
  const isEdit = id !== null
  const validId = isEdit && !Number.isNaN(id)

  const me = useMe()
  const users = useUsers(me.isAdmin && !isEdit)
  const checkin = useCheckin(validId ? id : null)

  if (isEdit && (!validId || checkin.isError)) return <CheckinNotFound />

  const isLoading = me.isPending || (isEdit && checkin.isPending) || (me.isAdmin && !isEdit && users.isPending)
  if (isLoading) return <p className="center" role="status">Loading…</p>
  if (me.isError || users.isError) {
    return <p className="center form-error" role="alert">Could not load the form. Please refresh.</p>
  }

  return (
    <main className="center">
      <CheckinForm
        key={checkin.data?.id ?? 'new'} // reset the form when switching records
        checkin={checkin.data}
        isAdmin={me.isAdmin}
        users={users.data ?? []}
      />
    </main>
  )
}
