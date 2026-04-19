import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import PageShell from '../ui/PageShell'

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const staffName = storage.getStaffName()
  const siteName = storage.getStaffSiteName()

  useEffect(() => {
    if (!storage.getStaffToken()) navigate('/staff/login', { replace: true })
  }, [navigate])

  function handleLogout() {
    storage.clearStaff()
    navigate('/staff/login', { replace: true })
  }

  return (
    <PageShell title="Dashboard nhân viên">
      <div className="flex flex-col items-center py-8 space-y-6">
        <div className="text-center space-y-1">
          {staffName ? <p className="text-sm text-on-page/70">Xin chào, <span className="font-bold text-gold">{staffName}</span></p> : null}
          {siteName ? <p className="text-xs text-muted">{siteName}</p> : null}
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Link
            to="/staff/tickets"
            className="block w-full rounded-2xl bg-card p-5 text-center text-lg font-bold text-on-card no-underline shadow transition-colors hover:bg-card-dark hover:text-on-page"
          >
            Danh sách lượt chụp
          </Link>

          <Link
            to="/staff/rooms"
            className="block w-full rounded-2xl bg-card p-5 text-center text-lg font-bold text-on-card no-underline shadow transition-colors hover:bg-card-dark hover:text-on-page"
          >
            Danh sách phòng
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-gold underline"
        >
          Đăng xuất
        </button>
      </div>
    </PageShell>
  )
}
