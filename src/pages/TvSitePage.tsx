import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { SiteStatusDto, SiteRoomStatusDto } from '../api/types'
import { tvApi } from '../api/tvApi'
import { getQueueHub } from '../realtime/queueHub'
import { addMinutes, formatHHmm, safeNumber } from '../lib/time'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'
import Card from '../ui/Card'
import Button from '../ui/Button'

function RoomTile({ siteSlug, room }: { siteSlug: string; room: SiteRoomStatusDto }) {
  const serviceMinutes = safeNumber(room.serviceMinutes, 10)
  const estNewTicketMinutes = safeNumber(room.waitingCount, 0) * serviceMinutes
  const eta = formatHHmm(addMinutes(room.now, estNewTicketMinutes))

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm text-slate-500">{room.roomSlug}</div>
          <div className="text-lg font-semibold">{room.roomName}</div>
        </div>
        <div className="text-right text-xs text-slate-600">
          <div>Giờ: {formatHHmm(room.now)}</div>
          <div>{serviceMinutes} phút/lượt</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">Đang phục vụ</div>
          <div className="mt-1 text-3xl font-bold">{room.currentDisplayNumber ?? '—'}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">Sắp gọi</div>
          <div className="mt-1 text-3xl font-bold">{room.nextDisplayNumber ?? '—'}</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-700">
        Đang chờ: <span className="font-semibold">{room.waitingCount}</span>
        <span className="text-slate-500"> (ước tính ~{estNewTicketMinutes} phút, khoảng {eta})</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link className="text-sm" to={`/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(room.roomSlug)}`}>
          Khách
        </Link>
        <span className="text-slate-300">•</span>
        <Link className="text-sm" to={`/staff/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(room.roomSlug)}`}>
          Nhân viên
        </Link>
      </div>
    </Card>
  )
}

export default function TvSitePage() {
  const params = useParams()
  const siteSlug = params.siteSlug ?? ''

  const [data, setData] = useState<SiteStatusDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await tvApi.getSiteStatus(siteSlug)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!siteSlug) return

    let isMounted = true
    let lastSignalRUpdate = Date.now()
    let refreshTimer: number | null = null

    const safeRefresh = async () => {
      if (!isMounted) return
      await refresh()
    }

    void safeRefresh()

    // Smart polling: only call API if no SignalR updates for 30s
    refreshTimer = setInterval(() => {
      if (!isMounted) return
      
      const timeSinceLastUpdate = Date.now() - lastSignalRUpdate
      
      // Only poll if we haven't received SignalR updates for 30+ seconds (failsafe)
      if (timeSinceLastUpdate > 30000) {        lastSignalRUpdate = Date.now() // Reset timer after API call        void safeRefresh()
      }
    }, 5000)

    const hub = getQueueHub()
    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        await hub.start()
        await hub.joinSite(siteSlug)
        unsub = hub.onQueueUpdated((payload) => {
          // TvSitePage shows all rooms in a site, so update on any room change
          if (payload.siteSlug === siteSlug) {
            console.log('[TvSite] 🔥 SignalR update received for', payload.roomSlug || 'site')
            lastSignalRUpdate = Date.now()
            void safeRefresh()
          }
        })
      } catch (err) {
        console.error('[TvSite] SignalR connection failed:', err)
      }
    })()

    return () => {
      isMounted = false
      if (refreshTimer) clearInterval(refreshTimer)
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug])

  return (
    <PageShell title={`Màn hình - ${siteSlug}`}>
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={refresh} disabled={loading}>
            Làm mới
          </Button>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            to="/"
          >
            Trang chủ
          </Link>

          {data ? (
            <div className="ml-auto text-sm text-slate-600">
              Giờ: <span className="font-mono">{formatHHmm(data.now)}</span>
            </div>
          ) : null}
        </div>

        {loading && !data ? <Alert>Đang tải…</Alert> : null}

        {data ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.rooms.map((room) => (
              <RoomTile key={room.roomId} siteSlug={siteSlug} room={room} />
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}
