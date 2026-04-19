import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { RoomStatusDto, RoomStatusResponse } from '../api/types'
import { publicApi } from '../api/publicApi'
import { staffApi } from '../api/staffApi'
import { getQueueHub } from '../realtime/queueHub'
import PageShell from '../ui/PageShell'
import RoomStatusCard from '../components/RoomStatusCard'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function StaffRoomPage() {
  const params = useParams()
  const siteSlug = params.siteSlug ?? ''
  const roomSlug = params.roomSlug ?? ''

  const [data, setData] = useState<RoomStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await publicApi.getRoomStatus({ siteSlug, roomSlug })
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!siteSlug || !roomSlug) return

    let isMounted = true
    let lastSignalRUpdate = Date.now()
    let refreshTimer: number | null = null

    const safeRefresh = async () => {
      if (!isMounted) return
      console.log('[StaffRoom] API call triggered')
      await refresh()
    }

    console.log('[StaffRoom] Initial load')
    void safeRefresh()

    // Smart polling: only call API if no SignalR updates for 30s (failsafe)
    refreshTimer = setInterval(() => {
      if (!isMounted) return
      
      const timeSinceLastUpdate = Date.now() - lastSignalRUpdate
      console.log(`[StaffRoom] Polling check: ${Math.round(timeSinceLastUpdate/1000)}s since last SignalR update`)
      
      if (timeSinceLastUpdate > 30000) {
        console.log('[StaffRoom] ⚠️ Failsafe triggered - calling API')
        lastSignalRUpdate = Date.now() // Reset timer after API call
        void safeRefresh()
      } else {
        console.log('[StaffRoom] ✅ Skip API call - SignalR active')
      }
    }, 5000)

    const hub = getQueueHub()
    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        await hub.joinRoom(siteSlug, roomSlug)
          unsub = hub.onQueueUpdated((payload) => {
            if (payload.siteSlug === siteSlug && payload.roomSlug === roomSlug) {
              console.log('[StaffRoom] 🔥 SignalR update received')
              lastSignalRUpdate = Date.now()
              void safeRefresh()
            }
          })
      } catch {
        // ignore
      }
    })()

    return () => {
      isMounted = false
      if (refreshTimer) clearInterval(refreshTimer)
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, roomSlug])

  async function runAction(action: () => Promise<RoomStatusDto>) {
    setLoading(true)
    setError(null)
    try {
      const status = await action()
      setData((prev) => (prev ? { ...prev, status } : prev))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Thao tác thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Nhân viên">
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {data ? <RoomStatusCard title={`${siteSlug} / ${roomSlug}`} status={data.status} /> : null}

        <Card variant="dark">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="gold" onClick={() => runAction(() => staffApi.callNext(siteSlug, roomSlug))} disabled={loading}>
              Gọi số tiếp theo
            </Button>
            <Button variant="primary" onClick={() => runAction(() => staffApi.completeCurrent(siteSlug, roomSlug))} disabled={loading}>
              Hoàn tất lượt
            </Button>
            <Button variant="danger" onClick={() => runAction(() => staffApi.skipCurrent(siteSlug, roomSlug))} disabled={loading}>
              Bỏ qua lượt
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              Làm mới
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-gold/40 bg-card px-4 py-2.5 text-sm font-medium text-on-card hover:bg-badge"
              to={`/s/${siteSlug}/r/${roomSlug}`}
            >
              Giao diện khách
            </Link>
          </div>
        </Card>

        {loading && !data ? <Alert>Đang tải…</Alert> : null}
      </div>
    </PageShell>
  )
}
