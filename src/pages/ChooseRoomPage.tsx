import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { SiteRoomStatusDto } from '../api/types'
import { tvApi } from '../api/tvApi'
import { addMinutes, formatHHmm, safeNumber } from '../lib/time'
import { getRoomDisplayName, getRoomVietName } from '../lib/roomNames'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'
import Button from '../ui/Button'

export default function ChooseRoomPage() {
  const { siteSlug = '' } = useParams()
  const navigate = useNavigate()

  const [rooms, setRooms] = useState<SiteRoomStatusDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<SiteRoomStatusDto | null>(null)

  useEffect(() => {
    if (!siteSlug) return
    setLoading(true)
    tvApi.getSiteStatus(siteSlug)
      .then((data) => setRooms(data.rooms))
      .catch((e) => setError(e instanceof Error ? e.message : 'Không tải được dữ liệu'))
      .finally(() => setLoading(false))
  }, [siteSlug])

  function handleConfirm() {
    if (!selectedRoom) return
    navigate(`/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(selectedRoom.roomSlug)}`)
  }

  return (
    <PageShell title="Chọn Phòng">
      <div className="flex flex-col items-center py-4 space-y-5">
        <Link to={`/s/${encodeURIComponent(siteSlug)}`} className="self-start text-sm text-gold">
          ← Quay lại
        </Link>

        <h1 className="title-fancy">Chọn Phòng</h1>
        <p className="text-sm text-on-page/80">Chọn concept yêu thích của bạn</p>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {loading ? <Alert>Đang tải…</Alert> : null}

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {rooms.map((room, i) => {
            const isSelected = selectedRoom?.roomId === room.roomId
            const isLast = i === rooms.length - 1 && rooms.length % 2 === 1
            return (
              <button
                key={room.roomId}
                onClick={() => setSelectedRoom(isSelected ? null : room)}
                className={
                  `rounded-xl border-2 p-4 text-center transition-colors ` +
                  (isLast ? 'col-span-2 ' : '') +
                  (isSelected
                    ? 'border-gold bg-card-dark text-on-page'
                    : 'border-gold/30 bg-card text-on-card hover:border-gold/60')
                }
              >
                <div className="text-base">{getRoomVietName(room.roomSlug, room.roomName)}</div>
                <div className="text-base">{getRoomDisplayName(room.roomSlug, room.roomName)}</div>
              </button>
            )
          })}
        </div>

        {selectedRoom ? (
          <div className="w-full max-w-sm rounded-xl border border-gold/40 bg-card-dark p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-on-page/80">
              <span>🕐</span>
              <span>Thời gian nhận phòng sớm nhất!</span>
            </div>
            <div className="inline-block rounded-lg bg-page px-6 py-2">
              <span className="text-2xl font-bold text-on-page">
                {formatHHmm(addMinutes(selectedRoom.now, safeNumber(selectedRoom.waitingCount, 0) * safeNumber(selectedRoom.serviceMinutes, 10)))}
              </span>
            </div>
            <Button variant="gold" onClick={handleConfirm} className="w-full">
              Xác nhận
            </Button>
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}
