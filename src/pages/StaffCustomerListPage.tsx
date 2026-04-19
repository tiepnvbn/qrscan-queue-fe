import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { StaffTicketDto } from '../api/types'
import { staffApi } from '../api/staffApi'
import { storage } from '../lib/storage'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'

const STATUS_LABELS: Record<string, string> = {
  Waiting: 'Đang chờ',
  Serving: 'Đã đến lượt',
  Completed: 'Hoàn thành',
  Skipped: 'Bỏ qua',
  Cancelled: 'Đã hủy',
}

const STATUS_COLORS: Record<string, string> = {
  Waiting: 'bg-yellow-600 text-white',
  Serving: 'bg-teal-600 text-white',
  Completed: 'bg-badge text-on-card',
  Skipped: 'bg-gray-500 text-white',
  Cancelled: 'bg-red-700 text-white',
}

const FILTER_TABS = [
  { key: 'Serving', label: 'Đã đến lượt' },
  { key: 'Waiting', label: 'Đang chờ' },
  { key: 'Completed', label: 'Hoàn thành' },
  { key: 'Cancelled', label: 'Đã hủy' },
]

const PAGE_SIZE = 20

export default function StaffCustomerListPage() {
  const navigate = useNavigate()
  const { roomSlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const siteSlug = storage.getStaffSiteSlug()

  const [tickets, setTickets] = useState<StaffTicketDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [activeStatus, setActiveStatus] = useState<string | null>(searchParams.get('status'))
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterStatuses, setFilterStatuses] = useState<string[]>([])
  const [filterTimeRange, setFilterTimeRange] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Swipe state
  const [swipedId, setSwipedId] = useState<string | null>(null)

  useEffect(() => {
    if (!storage.getStaffToken()) navigate('/staff/login', { replace: true })
  }, [navigate])

  const fetchTickets = useCallback(async (p: number, statusFilter?: string | null, searchTerm?: string) => {
    if (!siteSlug) return
    setLoading(true)
    setError(null)
    try {
      const statuses = statusFilter ? [statusFilter] : (filterStatuses.length > 0 ? filterStatuses : undefined)
      const res = await staffApi.listTickets(siteSlug, {
        roomSlug: roomSlug ?? undefined,
        search: searchTerm ?? (search || undefined),
        status: statuses,
        page: p,
        pageSize: PAGE_SIZE,
      })
      setTickets(res.items)
      setTotalCount(res.totalCount)
      setPage(res.page)
    } catch (e: any) {
      if (e?.status === 401) {
        storage.clearStaff()
        navigate('/staff/login', { replace: true })
        return
      }
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [siteSlug, roomSlug, search, filterStatuses, navigate])

  useEffect(() => {
    fetchTickets(1, activeStatus)
  }, [activeStatus, fetchTickets])

  function handleTabClick(statusKey: string) {
    setActiveStatus(prev => prev === statusKey ? null : statusKey)
    setPage(1)
  }

  function handleSearch() {
    setPage(1)
    fetchTickets(1, activeStatus, search)
  }

  function handleApplyFilter() {
    setShowFilterModal(false)
    setActiveStatus(null)
    setPage(1)
    fetchTickets(1, null, search)
  }

  function toggleFilterStatus(s: string) {
    setFilterStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function handleComplete(ticketId: string) {
    setActionLoading(ticketId)
    try {
      await staffApi.completeTicket(ticketId)
      await fetchTickets(page, activeStatus)
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Thao tác thất bại')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel(ticketId: string) {
    setActionLoading(ticketId)
    try {
      await staffApi.cancelTicket(ticketId)
      await fetchTickets(page, activeStatus)
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Thao tác thất bại')
    } finally {
      setActionLoading(null)
      setSwipedId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <PageShell title="Danh sách lượt chụp">
      <div className="space-y-4">
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Link to={roomSlug ? '/staff/rooms' : '/staff'} className="text-sm text-gold">← Quay lại</Link>
          <h1 className="text-lg font-bold text-gold">
            {roomSlug ? `Phòng: ${roomSlug}` : 'Tất cả phòng'}
          </h1>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm"
              className="w-full rounded-full border border-gold/40 bg-white py-2 pl-10 pr-4 text-sm text-on-card placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="rounded-full border border-gold/40 bg-white px-3 py-2 text-sm text-on-card hover:bg-badge"
            title="Bộ lọc nâng cao"
          >
            ⚙️
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={
                'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                (activeStatus === tab.key
                  ? 'border-gold bg-card-dark text-gold'
                  : 'border-gold/30 bg-white/10 text-on-page/70 hover:border-gold/60')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-on-page/70">
          <span>Tổng: <strong className="text-gold">{totalCount}</strong></span>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {loading && tickets.length === 0 ? <Alert>Đang tải…</Alert> : null}

        {/* Mobile: Card List */}
        <div className="md:hidden space-y-3">
          {tickets.map(t => (
            <SwipeableTicketCard
              key={t.ticketId}
              ticket={t}
              swiped={swipedId === t.ticketId}
              onSwipe={() => setSwipedId(swipedId === t.ticketId ? null : t.ticketId)}
              onComplete={() => handleComplete(t.ticketId)}
              onCancel={() => handleCancel(t.ticketId)}
              actionLoading={actionLoading === t.ticketId}
            />
          ))}
          {!loading && tickets.length === 0 ? (
            <p className="text-center text-sm text-muted py-8">Không có dữ liệu</p>
          ) : null}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/30 text-left text-on-page/70">
                <th className="py-3 px-2 font-medium">STT</th>
                <th className="py-3 px-2 font-medium">Tên</th>
                <th className="py-3 px-2 font-medium">Số phòng</th>
                <th className="py-3 px-2 font-medium">Thời gian dự kiến</th>
                <th className="py-3 px-2 font-medium">Thời gian còn lại</th>
                <th className="py-3 px-2 font-medium">Trạng thái</th>
                <th className="py-3 px-2 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.ticketId} className="border-b border-gold/10 hover:bg-card-dark/30">
                  <td className="py-3 px-2">
                    <span className="inline-block rounded-full bg-card-dark px-3 py-1 text-xs font-bold text-on-page">
                      {t.displayNumber}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-on-page">{t.customerName ?? '-'}</td>
                  <td className="py-3 px-2 text-on-page">{t.roomName}</td>
                  <td className="py-3 px-2 text-on-page">{formatTime(t.createdAt)}</td>
                  <td className="py-3 px-2 text-on-page">{remainingTime(t)}</td>
                  <td className="py-3 px-2">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2">
                      {(t.status === 'Waiting' || t.status === 'Serving') ? (
                        <>
                          <button
                            onClick={() => handleComplete(t.ticketId)}
                            disabled={actionLoading === t.ticketId}
                            className="rounded-lg border border-gold/40 px-3 py-1 text-xs text-on-page hover:bg-card-dark disabled:opacity-50"
                          >
                            Hoàn thành
                          </button>
                          <button
                            onClick={() => handleCancel(t.ticketId)}
                            disabled={actionLoading === t.ticketId}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">Không có dữ liệu</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-on-page/70 py-2">
            <button
              onClick={() => fetchTickets(page - 1, activeStatus)}
              disabled={page <= 1}
              className="rounded px-2 py-1 hover:text-gold disabled:opacity-30"
            >
              ← Trở về
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i
              if (p > totalPages || p < 1) return null
              return (
                <button
                  key={p}
                  onClick={() => fetchTickets(p, activeStatus)}
                  className={`rounded px-2 py-1 ${p === page ? 'bg-gold text-on-card font-bold' : 'hover:text-gold'}`}
                >
                  {p}
                </button>
              )
            })}
            {totalPages > 5 && page < totalPages - 2 ? <span>…</span> : null}
            <button
              onClick={() => fetchTickets(page + 1, activeStatus)}
              disabled={page >= totalPages}
              className="rounded px-2 py-1 hover:text-gold disabled:opacity-30"
            >
              Tiếp theo →
            </button>
          </div>
        ) : null}
      </div>

      {/* Advanced Filter Modal */}
      {showFilterModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowFilterModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-on-card">Bộ lọc nâng cao</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-on-card/60 hover:text-on-card text-xl">✕</button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-card">Thời gian:</label>
              <select
                value={filterTimeRange}
                onChange={e => setFilterTimeRange(e.target.value)}
                className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2.5 text-sm text-on-card focus:border-gold focus:outline-none"
              >
                <option value="">Tất cả</option>
                <option value="9-10">Hôm nay, 9:00 - 10:00 AM</option>
                <option value="10-11">Hôm nay, 10:00 - 11:00 AM</option>
                <option value="11-12">Hôm nay, 11:00 - 12:00 PM</option>
                <option value="13-14">Hôm nay, 1:00 - 2:00 PM</option>
                <option value="14-15">Hôm nay, 2:00 - 3:00 PM</option>
                <option value="15-16">Hôm nay, 3:00 - 4:00 PM</option>
                <option value="16-17">Hôm nay, 4:00 - 5:00 PM</option>
                <option value="17-18">Hôm nay, 5:00 - 6:00 PM</option>
                <option value="18-19">Hôm nay, 6:00 - 7:00 PM</option>
                <option value="19-20">Hôm nay, 7:00 - 8:00 PM</option>
                <option value="20-21">Hôm nay, 8:00 - 9:00 PM</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-card">Trạng thái</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilterStatus(key)}
                    className={
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ' +
                      (filterStatuses.includes(key)
                        ? 'border-gold bg-card-dark text-gold'
                        : 'border-gold/30 text-on-card hover:border-gold/60')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyFilter}
              className="w-full rounded-lg bg-card-dark py-3 text-sm font-bold text-on-page transition-colors hover:bg-primary/80"
            >
              Xác nhận
            </button>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}

// ── Sub-components ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-500 text-white'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function SwipeableTicketCard({
  ticket: t,
  swiped,
  onSwipe,
  onComplete,
  onCancel,
  actionLoading,
}: {
  ticket: StaffTicketDto
  swiped: boolean
  onSwipe: () => void
  onComplete: () => void
  onCancel: () => void
  actionLoading: boolean
}) {
  const startX = useRef(0)
  const [offset, setOffset] = useState(0)

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }
  function handleTouchMove(e: React.TouchEvent) {
    const diff = startX.current - e.touches[0].clientX
    setOffset(Math.max(0, Math.min(80, diff)))
  }
  function handleTouchEnd() {
    if (offset > 40) {
      setOffset(80)
      onSwipe()
    } else {
      setOffset(0)
    }
  }

  const canAct = t.status === 'Waiting' || t.status === 'Serving'

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete action behind card */}
      {canAct ? (
        <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-red-600">
          <button onClick={onCancel} disabled={actionLoading} className="text-white text-2xl">🗑️</button>
        </div>
      ) : null}

      {/* Card */}
      <div
        className="relative rounded-xl border-2 border-gold/30 bg-card p-4 transition-transform"
        style={{ transform: canAct ? `translateX(-${swiped ? 80 : offset}px)` : undefined }}
        onTouchStart={canAct ? handleTouchStart : undefined}
        onTouchMove={canAct ? handleTouchMove : undefined}
        onTouchEnd={canAct ? handleTouchEnd : undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-card-dark px-3 py-1 text-xs font-bold text-on-page">
              {t.displayNumber}
            </span>
            <div>
              <div className="text-sm font-medium text-on-card">
                Số phòng: <strong>{t.roomName}</strong>
              </div>
              {t.customerName ? (
                <div className="text-sm text-on-card/70">Tên: <strong>{t.customerName}</strong></div>
              ) : null}
              <div className="text-xs text-muted">Thời gian dự kiến: {formatTime(t.createdAt)}</div>
              <div className="text-xs text-muted italic">Thời gian còn lại: {remainingTime(t)}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={t.status} />
            {canAct ? (
              <button
                onClick={onComplete}
                disabled={actionLoading}
                className="rounded-lg border border-gold/40 px-3 py-1 text-xs text-on-card hover:bg-badge disabled:opacity-50"
              >
                Hoàn thành
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '-'
  }
}

function remainingTime(t: StaffTicketDto): string {
  if (t.status === 'Completed' || t.status === 'Cancelled' || t.status === 'Skipped') return '—'
  if (t.status === 'Serving' && t.calledAt) {
    const elapsed = (Date.now() - new Date(t.calledAt).getTime()) / 60000
    const remaining = Math.max(0, t.serviceMinutes - elapsed)
    return `${Math.ceil(remaining)} phút`
  }
  return `${t.serviceMinutes} phút`
}
