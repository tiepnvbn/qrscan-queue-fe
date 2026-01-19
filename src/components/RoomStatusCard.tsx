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

        <div className="text-right text-sm text-slate-600">
          <div>Thời gian: {serviceMinutes} phút/lượt</div>
          <div>Đang chờ: {status.waitingCount}</div>
          <div>Số tiếp theo để lấy: {status.nextToTakeNumber}</div>
          <div>
            Ước tính đến lượt mới: ~{estForNewTicketMinutes} phút (khoảng {estForNewTicketTime})
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">Đang phục vụ</div>
          <div className="mt-1 text-3xl font-bold">{status.currentNumber ?? '—'}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">Sắp gọi</div>
          <div className="mt-1 text-3xl font-bold">{status.nextNumber ?? '—'}</div>
        </div>
      </div>

      {myTicket ? (
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
          <div className="text-sm font-semibold text-blue-900">Vé của tôi #{myTicket.number}</div>
          <div className="mt-1 text-sm text-blue-900">
            Còn trước: {myTicket.aheadCount} • Ước tính: {myTicket.estimatedWaitMinutes} phút • Dự kiến phục vụ:{' '}
            <span className="font-mono">{formatHHmm(myTicket.estimatedServeTime)}</span>
          </div>
          <div className="mt-1 text-xs text-blue-900/80">Trạng thái: {ticketStatusVi(myTicket.status)}</div>
        </div>
      ) : null}
    </Card>
  )
}
