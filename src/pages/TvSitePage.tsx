import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import type { SiteStatusDto, SiteRoomStatusDto } from '../api/types'
import { tvApi } from '../api/tvApi'
import { getQueueHub } from '../realtime/queueHub'
import { getRoomDisplayName } from '../lib/roomNames'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'

function RoomTile({ room }: { room: SiteRoomStatusDto }) {
  return (
    <div className="rounded-xl border border-gold/40 bg-card-dark p-4 space-y-3">
      <div className="text-center text-lg font-bold text-gold">{getRoomDisplayName(room.roomSlug, room.roomName)}</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center">
          <div className="h-8 flex items-center text-center text-xs text-muted uppercase tracking-wide">Số đang thực hiện</div>
          <div className="mt-1 w-full rounded-lg bg-badge px-3 py-2">
            <div className="text-2xl font-bold text-on-card text-center">{room.currentDisplayNumber ?? '—'}</div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-8 flex items-center text-center text-xs text-muted uppercase tracking-wide">Số chờ</div>
          <div className="mt-1 w-full rounded-lg bg-surface px-3 py-2">
            <div className="text-2xl font-bold text-on-card text-center">{room.waitingCount}</div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-on-page/80">
        Số tiếp theo: <span className="font-bold text-gold">{room.nextDisplayNumber ?? '—'}</span>
      </div>
    </div>
  )
}

function QrTile({ siteSlug }: { siteSlug: string }) {
  const roomUrl = `${window.location.origin}/s/${encodeURIComponent(siteSlug)}/rooms`

  return (
    <div className="rounded-xl border border-gold/40 bg-card-dark p-4 space-y-3 flex flex-col items-center">
      <div className="text-lg font-bold text-gold">Quét QR</div>
      <div className="rounded-lg bg-card p-4">
        <QRCodeSVG value={roomUrl} size={120} bgColor="#FFEACF" fgColor="#162114" />
      </div>
      <div className="text-xs text-muted">Để lấy số thứ tự</div>
    </div>
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

        {loading && !data ? <Alert>Đang tải…</Alert> : null}

        {data ? (
          <div className="grid grid-cols-3 gap-4">
            {data.rooms.map((room) => (
              <RoomTile key={room.roomId} room={room} />
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}
