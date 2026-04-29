import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { SiteRoomStatusDto } from '../api/types'
import { tvApi } from '../api/tvApi'
import { publicApi } from '../api/publicApi'
import { storage } from '../lib/storage'
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
  const [selectedRooms, setSelectedRooms] = useState<SiteRoomStatusDto[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!siteSlug) return
    setLoading(true)
    tvApi.getSiteStatus(siteSlug)
      .then((data) => setRooms(data.rooms))
      .catch((e) => setError(e instanceof Error ? e.message : 'Không tải được dữ liệu'))
      .finally(() => setLoading(false))
  }, [siteSlug])

  function toggleRoom(room: SiteRoomStatusDto) {
    setSelectedRooms((prev) => {
      const exists = prev.some((r) => r.roomId === room.roomId)
      if (exists) return prev.filter((r) => r.roomId !== room.roomId)
      return [...prev, room]
    })
  }

  async function handleConfirm() {
    if (selectedRooms.length === 0) return

    // Single room → legacy flow (navigate to room page which handles ticket)
    if (selectedRooms.length === 1) {
      navigate(`/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(selectedRooms[0].roomSlug)}`)
      return
    }

    // Multi-room → create tickets for all rooms at once
    setSubmitting(true)
    setError(null)
    try {
      const customerId = storage.getCustomerId()
      const sessionToken = storage.getSessionToken()
      const result = await publicApi.takeMultiRoomTickets({
        siteSlug,
        body: {
          roomSlugs: selectedRooms.map((r) => r.roomSlug),
          customerId: customerId ?? undefined,
          sessionToken: sessionToken ?? undefined,
        },
      })

      // Store ticket IDs for each room
      for (const ticket of result.tickets) {
        storage.setTicketId(siteSlug, ticket.roomSlug, ticket.ticketId)
      }

      // Navigate to the first room's page
      const first = result.tickets[0]
      navigate(`/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(first.roomSlug)}`)
    } catch (e: any) {
      const body = e?.bodyText
      if (body) {
        try {
          const parsed = JSON.parse(body)
          setError(parsed.error ?? 'Đặt phòng thất bại')
        } catch {
          setError(body)
        }
      } else {
        setError(e?.message ?? 'Đặt phòng thất bại')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell title="Chọn Phòng">
      <div className="flex flex-col items-center py-4 space-y-5">
        <Link to={`/s/${encodeURIComponent(siteSlug)}`} className="self-start text-sm text-gold">
          ← Quay lại
        </Link>

        <h1 className="title-fancy">Chọn Phòng</h1>
        <p className="text-sm text-on-page/80">Chọn concept yêu thích của bạn (có thể chọn nhiều phòng)</p>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {loading ? <Alert>Đang tải…</Alert> : null}

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {rooms.map((room, i) => {
            const isSelected = selectedRooms.some((r) => r.roomId === room.roomId)
            const isLast = i === rooms.length - 1 && rooms.length % 2 === 1
            return (
              <button
                key={room.roomId}
                onClick={() => toggleRoom(room)}
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
                {isSelected ? <div className="mt-1 text-xs text-gold">✓ Đã chọn</div> : null}
              </button>
            )
          })}
        </div>

        {selectedRooms.length > 0 ? (
          <div className="w-full max-w-sm rounded-xl border border-gold/40 bg-card-dark p-4 text-center space-y-3">
            <div className="text-sm font-bold text-on-page">
              {selectedRooms.length} phòng đã chọn
            </div>

            {selectedRooms.map((room) => (
              <div key={room.roomId} className="flex items-center justify-between text-sm text-on-page/80 px-2">
                <span>{getRoomVietName(room.roomSlug, room.roomName)}</span>
                <span className="inline-block rounded-lg bg-page px-3 py-1 text-sm font-bold text-on-page">
                  {formatHHmm(addMinutes(room.now, safeNumber(room.waitingCount, 0) * safeNumber(room.serviceMinutes, 10)))}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-center gap-2 text-xs text-on-page/60">
              <span>🕐</span>
              <span>Thời gian nhận phòng sớm nhất cho mỗi phòng</span>
            </div>

            <Button variant="gold" onClick={handleConfirm} className="w-full" disabled={submitting}>
              {submitting ? 'Đang xử lý…' : 'Xác nhận'}
            </Button>
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}
