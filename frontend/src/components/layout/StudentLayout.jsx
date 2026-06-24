import { Outlet } from 'react-router-dom'
import { StudentNavbar } from '@/components/layout/StudentNavbar'

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />
      <Outlet />
    </div>
  )
}
