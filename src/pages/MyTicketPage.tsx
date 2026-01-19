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
    void refresh()

    const hub = getQueueHub()
    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        await hub.joinRoom(siteSlug, roomSlug)
        unsub = hub.onQueueUpdated((payload) => {
          if (payload.siteSlug === siteSlug && payload.roomSlug === roomSlug) {
            void refresh()
          }
        })
      } catch {
        // ignore
      }
    })()

    return () => {
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

  if (!ticketId) {
    return (
      <PageShell title="Vé của tôi">
        <Alert variant="error">Thiếu ticketId. Vui lòng quay lại và lấy số.</Alert>
        <div className="mt-3">
          <Link to={`/s/${siteSlug}/r/${roomSlug}`} className="text-sm">
            Quay lại phòng
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Vé của tôi">
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {data ? <RoomStatusCard title={`${siteSlug} / ${roomSlug}`} status={data.status} myTicket={data.myTicket} /> : null}

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleComplete} disabled={loading}>
              Hoàn tất (khách)
            </Button>
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              Làm mới
            </Button>
            <Button variant="secondary" onClick={clearSavedTicket} disabled={loading}>
              Xóa vé đã lưu
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              to={`/s/${siteSlug}/r/${roomSlug}`}
            >
              Quay lại phòng
            </Link>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Vé: <span className="font-mono">{ticketId}</span>
          </div>
        </Card>

        {loading && !data ? <Alert>Đang tải…</Alert> : null}
      </div>
    </PageShell>
  )
}
