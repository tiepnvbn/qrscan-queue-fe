import type { RoomStatusDto, MyTicketDto } from '../api/types'
import { addMinutes, formatHHmm, safeNumber } from '../lib/time'
import Card from '../ui/Card'

function ticketStatusVi(status: string) {
  switch (status) {
    case 'Waiting':
      return 'Đang chờ'
    case 'Serving':
      return 'Đang phục vụ'
    case 'Completed':
      return 'Hoàn tất'
    case 'Skipped':
      return 'Bỏ qua'
    default:
      return status
  }
}

export default function RoomStatusCard({
  title,
  status,
  myTicket,
}: {
  title: string
  status: RoomStatusDto
  myTicket?: MyTicketDto | null
}) {
  const serviceMinutes = safeNumber(status.serviceMinutes, 10)
  const estForNewTicketMinutes = (safeNumber(status.waitingCount, 0) + (status.currentNumber ? 1 : 0)) * serviceMinutes
  const estForNewTicketTime = formatHHmm(addMinutes(status.now, estForNewTicketMinutes))

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="text-lg font-semibold">{status.roomName}</div>
          <div className="mt-1 text-sm text-slate-600">
            Hôm nay: <span className="font-mono">{status.serviceDate}</span> • Giờ:{' '}
            <span className="font-mono">{formatHHmm(status.now)}</span>
          </div>
        </div>

        <div className="text-right text-xs text-on-card/70">
          <div>Thời gian: {serviceMinutes} phút/lượt</div>
          <div>Đang chờ: {status.waitingCount}</div>
          <div>Số tiếp theo: {status.nextToTakeDisplayNumber}</div>
          <div>
            Ước tính: ~{estForNewTicketMinutes}p ({estForNewTicketTime})
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gold/30 bg-card-dark p-3">
          <div className="text-xs uppercase tracking-wide text-muted">Đang phục vụ</div>
          <div className="mt-1 text-3xl font-bold text-on-page">{status.currentDisplayNumber ?? '—'}</div>
        </div>
        <div className="rounded-lg border border-gold/30 bg-badge p-3">
          <div className="text-xs uppercase tracking-wide text-on-card/70">Sắp gọi</div>
          <div className="mt-1 text-3xl font-bold text-on-card">{status.nextDisplayNumber ?? '—'}</div>
        </div>
      </div>

      {myTicket ? (
        <div className="mt-4 rounded-lg border-2 border-gold bg-badge/30 p-3">
          <div className="text-sm font-bold text-on-card">Vé của tôi: {myTicket.displayNumber}</div>
          <div className="mt-1 text-sm text-on-card/80">
            Còn trước: {myTicket.aheadCount} • Ước tính: {myTicket.estimatedWaitMinutes} phút • Phục vụ lúc:{' '}
            <span className="font-mono">{formatHHmm(myTicket.estimatedServeTime)}</span>
          </div>
          <div className="mt-1 text-xs text-on-card/60">Trạng thái: {ticketStatusVi(myTicket.status)}</div>
        </div>
      ) : null}
    </Card>
  )
}
