import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { RoomStatusResponse } from '../api/types'
import { publicApi } from '../api/publicApi'
import { getQueueHub } from '../realtime/queueHub'
import { storage } from '../lib/storage'
import PageShell from '../ui/PageShell'
import RoomStatusCard from '../components/RoomStatusCard'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function MyTicketPage() {
  const params = useParams()
  const siteSlug = params.siteSlug ?? ''
  const roomSlug = params.roomSlug ?? ''
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const ticketIdFromQuery = searchParams.get('ticketId')
  const ticketId = useMemo(
    () => ticketIdFromQuery ?? storage.getTicketId(siteSlug, roomSlug),
    [ticketIdFromQuery, siteSlug, roomSlug],
  )

  const [data, setData] = useState<RoomStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      const res = await publicApi.getRoomStatus({ siteSlug, roomSlug, ticketId })
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!siteSlug || !roomSlug || !ticketId) return

    storage.setTicketId(siteSlug, roomSlug, ticketId)
    
    let isMounted = true
    let lastSignalRUpdate = Date.now()
    let refreshTimer: number | null = null

    const safeRefresh = async () => {
      if (!isMounted) return
      await refresh()
    }

    void safeRefresh()

    // Smart polling: only call API if no SignalR updates for 30s (failsafe)
    refreshTimer = setInterval(() => {
      if (!isMounted) return
      
      const timeSinceLastUpdate = Date.now() - lastSignalRUpdate
      if (timeSinceLastUpdate > 30000) {
        lastSignalRUpdate = Date.now() // Reset timer after API call
        void safeRefresh()
      }
    }, 10000)

    const hub = getQueueHub()
    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        await hub.start()
        console.log('[MyTicket] SignalR connected, joining room:', siteSlug, roomSlug)
        await hub.joinRoom(siteSlug, roomSlug)
        unsub = hub.onQueueUpdated((payload) => {
          if (payload.siteSlug === siteSlug && payload.roomSlug === roomSlug) {
            console.log('[MyTicket] 🔥 SignalR update received')
            lastSignalRUpdate = Date.now()
            void safeRefresh()
          }
        })
      } catch (err) {
        console.error('[MyTicket] SignalR connection failed:', err)
      }
    })()

    return () => {
      isMounted = false
      if (refreshTimer) clearInterval(refreshTimer)
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, roomSlug, ticketId])

  async function handleComplete() {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      await publicApi.completeTicket(ticketId)
      navigate(`/feedback?ticketId=${encodeURIComponent(ticketId)}&siteSlug=${encodeURIComponent(siteSlug)}&roomSlug=${encodeURIComponent(roomSlug)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hoàn tất thất bại')
    } finally {
      setLoading(false)
    }
  }

  function clearSavedTicket() {
    storage.clearTicketId(siteSlug, roomSlug)
    navigate(`/s/${siteSlug}/r/${roomSlug}`)
  }

  const myTicket = data?.myTicket
  const isServing = myTicket?.status === 'Serving'
  const isWaiting = myTicket?.status === 'Waiting'

  if (!ticketId) {
    return (
      <PageShell title="Vé của tôi">
        <Alert variant="error">Thiếu ticketId. Vui lòng quay lại và lấy số.</Alert>
        <div className="mt-3">
          <Link to={`/s/${siteSlug}/r/${roomSlug}`} className="text-sm text-gold">
            ← Quay lại phòng
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Vé của tôi">
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {/* Ticket number badge */}
        {myTicket ? (
          <div className="flex flex-col items-center py-6">
            <div className="text-xs text-muted uppercase tracking-widest">Số thứ tự của bạn</div>
            <div className="mt-2 rounded-2xl border-2 border-gold bg-badge px-8 py-4">
              <div className="text-5xl font-bold text-on-card">{myTicket.displayNumber}</div>
            </div>

            {isServing ? (
              <div className="mt-4 text-center">
                <div className="text-xl font-bold text-gold">Đã đến lượt của bạn!</div>
                <div className="mt-1 text-sm text-on-page/80">Vui lòng di chuyển đến phòng chụp</div>
              </div>
            ) : isWaiting ? (
              <div className="mt-4 text-center">
                <div className="text-sm text-on-page/80">
                  Còn <span className="font-bold text-gold">{myTicket.aheadCount}</span> người trước bạn
                </div>
                <div className="mt-1 text-sm text-muted">
                  Thời gian dự kiến: ~{myTicket.estimatedWaitMinutes} phút
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {data ? <RoomStatusCard title={`${siteSlug} / ${roomSlug}`} status={data.status} myTicket={data.myTicket} /> : null}

        <Card variant="dark">
          <div className="flex flex-wrap items-center gap-2">
            {isServing ? (
              <Button variant="gold" onClick={handleComplete} disabled={loading}>
                Hoàn tất
              </Button>
            ) : null}
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              Làm mới
            </Button>
            <Button variant="secondary" onClick={clearSavedTicket} disabled={loading}>
              Xóa vé đã lưu
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-gold/40 bg-card-dark px-4 py-2.5 text-sm font-medium text-on-page hover:bg-primary/80"
              to={`/s/${siteSlug}/r/${roomSlug}`}
            >
              ← Quay lại phòng
            </Link>
          </div>

          <div className="mt-3 text-xs text-muted">
            Vé: <span className="font-mono">{ticketId}</span>
          </div>
        </Card>

        {loading && !data ? <Alert>Đang tải…</Alert> : null}
      </div>
    </PageShell>
  )
}
