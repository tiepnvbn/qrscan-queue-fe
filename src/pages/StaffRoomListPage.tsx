import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { SiteRoomStatusDto } from '../api/types'
import { tvApi } from '../api/tvApi'
import { storage } from '../lib/storage'
import { getRoomDisplayName, getRoomVietName } from '../lib/roomNames'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'

export default function StaffRoomListPage() {
  const navigate = useNavigate()
  const siteSlug = storage.getStaffSiteSlug()

  const [rooms, setRooms] = useState<SiteRoomStatusDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storage.getStaffToken()) {
      navigate('/staff/login', { replace: true })
      return
    }
    if (!siteSlug) return

    setLoading(true)
    tvApi.getSiteStatus(siteSlug)
      .then((data) => setRooms(data.rooms))
      .catch((e) => setError(e instanceof Error ? e.message : 'Không tải được dữ liệu'))
      .finally(() => setLoading(false))
  }, [siteSlug, navigate])

  return (
    <PageShell title="Chọn Phòng">
      <div className="flex flex-col items-center py-4 space-y-5">
        <Link to="/staff" className="self-start text-sm text-gold">
          ← Quay lại
        </Link>

        <h1 className="title-fancy">Chọn Phòng</h1>
        <p className="text-sm text-on-page/80">Để xem danh sách lượt chụp</p>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {loading ? <Alert>Đang tải…</Alert> : null}

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {rooms.map((room, i) => {
            const isLast = i === rooms.length - 1 && rooms.length % 2 === 1
            return (
              <Link
                key={room.roomId}
                to={`/staff/tickets/${encodeURIComponent(room.roomSlug)}`}
                className={
                  `rounded-xl border-2 border-gold/30 bg-card p-4 text-center transition-colors hover:border-gold/60 hover:bg-badge ` +
                  (isLast ? 'col-span-2 ' : '')
                }
              >
                <div className="text-base text-on-card">{getRoomVietName(room.roomSlug, room.roomName)}</div>
                <div className="text-base text-on-card">{getRoomDisplayName(room.roomSlug, room.roomName)}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
