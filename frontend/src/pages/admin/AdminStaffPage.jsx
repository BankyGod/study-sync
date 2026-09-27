import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'
import { PageHeader, PageShell } from '@/components/layout/PageShell'
import {
  fetchAdminStaff,
  getAdminErrorMessage,
  updateAdminStaffRole,
} from '@/services/adminService'
import { useAuth } from '@/hooks/useAuth'
import {
  hasPermission,
  normalizeStaffRoleType,
  PERMISSIONS,
  STAFF_ROLE_LABELS,
  STAFF_ROLE_OPTIONS,
} from '@/utils/staffPermissions'

export function AdminStaffPage() {
  const { user } = useAuth()
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [busyUserId, setBusyUserId] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const list = await fetchAdminStaff()
        if (!cancelled) setStaff(list)
      } catch (loadError) {
        if (!cancelled) setError(getAdminErrorMessage(loadError, 'Unable to load staff.'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!hasPermission(user, PERMISSIONS.MANAGE_STAFF)) {
    return (
      <PageShell>
        <p className="text-[13px] text-muted">You do not have permission to manage staff.</p>
      </PageShell>
    )
  }

  const handleRoleChange = async (member, nextRole) => {
    const currentRole = normalizeStaffRoleType(member.staffRole ?? member.role)
    if (nextRole === currentRole) return
    const label = STAFF_ROLE_LABELS[nextRole] ?? nextRole
    if (!window.confirm(`Change ${member.name} to ${label}?`)) return

    setBusyUserId(member.id)
    setActionMessage('')
    try {
      const updated = await updateAdminStaffRole(member.id, nextRole)
      setStaff((current) =>
        current.map((item) =>
          item.id === member.id
            ? { ...item, staffRole: updated.staffRole ?? nextRole, role: updated.role }
            : item,
        ),
      )
      setActionMessage(`${member.name} is now ${label}.`)
    } catch (updateError) {
      setActionMessage(getAdminErrorMessage(updateError, 'Unable to update staff role.'))
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <PageShell className="space-y-5">
      <PageHeader
        eyebrow="Super admin"
        title="Staff"
        description="Assign staff roles to control what each instructor account can access."
      />

      {actionMessage ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-ink shadow-sm">
          {actionMessage}
        </p>
      ) : null}

      <Card title="Staff accounts" description={`${staff.length} account(s)`}>
        {isLoading ? (
          <div className="flex min-h-[100px] items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-[12px] text-red-600">{error}</p>
        ) : staff.length === 0 ? (
          <p className="text-[12px] text-muted">No staff accounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Staff role</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const isSelf = String(member.id) === String(user?.id)
                  const currentRole = normalizeStaffRoleType(member.staffRole ?? member.role)
                  return (
                    <tr key={member.id} className="border-b border-border/60">
                      <td className="py-2.5 font-medium text-ink">
                        {member.name}
                        {isSelf ? <span className="ml-1.5 text-[11px] text-muted">(you)</span> : null}
                      </td>
                      <td className="py-2.5 text-muted">{member.email || '—'}</td>
                      <td className="py-2.5">
                        <select
                          className="h-9 rounded-md border border-border bg-surface px-2 text-[13px] disabled:opacity-60"
                          value={currentRole}
                          disabled={isSelf || busyUserId === member.id}
                          onChange={(event) => handleRoleChange(member, event.target.value)}
                          aria-label={`Staff role for ${member.name}`}
                        >
                          {STAFF_ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  )
}
