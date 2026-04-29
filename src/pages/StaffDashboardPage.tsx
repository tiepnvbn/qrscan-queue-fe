import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { RoomStatusDto, SiteRoomStatusDto } from '../api/types'
import { publicApi } from '../api/publicApi'
import { staffApi } from '../api/staffApi'
import { tvApi } from '../api/tvApi'
import { getQueueHub } from '../realtime/queueHub'
import { storage } from '../lib/storage'
import { getRoomDisplayName } from '../lib/roomNames'
import PageShell from '../ui/PageShell'
import RoomStatusCard from '../components/RoomStatusCard'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Card from '../ui/Card'

/** Per-room data combining TV status (for the overview) and full RoomStatusDto (for the detail card). */
interface RoomPanel {
  overview: SiteRoomStatusDto
  detail: RoomStatusDto | null
  loading: boolean
  error: string | null
}

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const staffName = storage.getStaffName()
  const siteName = storage.getStaffSiteName()
  const siteSlug = storage.getStaffSiteSlug() ?? ''

  const [panels, setPanels] = useState<RoomPanel[]>([])
  const [initLoading, setInitLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (!storage.getStaffToken()) navigate('/staff/login', { replace: true })
  }, [navigate])

  // Load all rooms overview first
  useEffect(() => {
    if (!siteSlug) return
    setInitLoading(true)
    tvApi.getSiteStatus(siteSlug)
      .then((data) => {
        setPanels(data.rooms.map((r) => ({ overview: r, detail: null, loading: true, error: null })))
      })
      .catch((e) => setInitError(e instanceof Error ? e.message : 'Không tải được dữ liệu'))
      .finally(() => setInitLoading(false))
  }, [siteSlug])

  // Fetch detail for each room once overview is ready
  useEffect(() => {
    if (!siteSlug || panels.length === 0) return
    // Only fetch details for panels that have no detail yet and are loading
    panels.forEach((panel, idx) => {
      if (panel.detail !== null || !panel.loading) return
      publicApi.getRoomStatus({ siteSlug, roomSlug: panel.overview.roomSlug })
        .then((res) => {
          setPanels((prev) => prev.map((p, i) => i === idx ? { ...p, detail: res.status, loading: false } : p))
        })
        .catch((e) => {
          setPanels((prev) => prev.map((p, i) => i === idx ? { ...p, error: e instanceof Error ? e.message : 'Lỗi', loading: false } : p))
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, panels.length])

  // SignalR for real-time updates
  useEffect(() => {
    if (!siteSlug || panels.length === 0) return

    const hub = getQueueHub()
    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        await hub.start()
        await hub.joinSite(siteSlug)
        unsub = hub.onQueueUpdated((payload) => {
          if (payload.siteSlug !== siteSlug) return
          const roomSlug = payload.roomSlug
          if (!roomSlug) return
          // Refresh the specific room
          publicApi.getRoomStatus({ siteSlug, roomSlug })
            .then((res) => {
              setPanels((prev) => prev.map((p) =>
                p.overview.roomSlug === roomSlug ? { ...p, detail: res.status, error: null } : p
              ))
            })
            .catch(() => { /* ignore refresh errors */ })
        })
      } catch {
        // ignore
      }
    })()

    return () => { if (unsub) unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, panels.length])

  const refreshRoom = useCallback(async (roomSlug: string) => {
    setPanels((prev) => prev.map((p) => p.overview.roomSlug === roomSlug ? { ...p, loading: true } : p))
    try {
      const res = await publicApi.getRoomStatus({ siteSlug, roomSlug })
      setPanels((prev) => prev.map((p) => p.overview.roomSlug === roomSlug ? { ...p, detail: res.status, loading: false, error: null } : p))
    } catch (e) {
      setPanels((prev) => prev.map((p) => p.overview.roomSlug === roomSlug ? { ...p, loading: false, error: 'Lỗi tải dữ liệu' } : p))
    }
  }, [siteSlug])

  async function runAction(roomSlug: string, action: () => Promise<RoomStatusDto>) {
    setPanels((prev) => prev.map((p) => p.overview.roomSlug === roomSlug ? { ...p, loading: true } : p))
    try {
      const status = await action()
      setPanels((prev) => prev.map((p) => p.overview.roomSlug === roomSlug ? { ...p, detail: status, loading: false, error: null } : p))
    } catch (e) {
      setPanels((prev) => prev.map((p) => p.overview.roomSlug === roomSlug ? { ...p, loading: false, error: 'Thao tác thất bại' } : p))
    }
  }

  function handleLogout() {
    storage.clearStaff()
    navigate('/staff/login', { replace: true })
  }

  return (
    <PageShell title="Dashboard nhân viên">
      <div className="flex flex-col items-center py-8 space-y-6">
        <div className="text-center space-y-1">
          {staffName ? <p className="text-sm text-on-page/70">Xin chào, <span className="font-bold text-gold">{staffName}</span></p> : null}
          {siteName ? <p className="text-xs text-muted">{siteName}</p> : null}
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Link
            to="/staff/tickets"
            className="block w-full rounded-2xl bg-card p-5 text-center text-lg font-bold text-on-card no-underline shadow transition-colors hover:bg-card-dark hover:text-on-page"
          >
            Danh sách lượt chụp
          </Link>

          <Link
            to="/staff/rooms"
            className="block w-full rounded-2xl bg-card p-5 text-center text-lg font-bold text-on-card no-underline shadow transition-colors hover:bg-card-dark hover:text-on-page"
          >
            Danh sách phòng
          </Link>
        </div>

        {/* ── All rooms inline ───────────────────────────────────── */}
        <div className="w-full max-w-2xl space-y-4">
          <h2 className="text-center text-lg font-bold text-gold">Quản lý phòng</h2>

          {initError ? <Alert variant="error">{initError}</Alert> : null}
          {initLoading ? <Alert>Đang tải…</Alert> : null}

          {panels.map((panel) => {
            const roomSlug = panel.overview.roomSlug
            return (
              <div key={panel.overview.roomId} className="space-y-2">
                {panel.error ? <Alert variant="error">{panel.error}</Alert> : null}

                {panel.detail ? (
                  <RoomStatusCard title={`${siteSlug} / ${roomSlug}`} status={panel.detail} />
                ) : panel.loading ? (
                  <Card>
                    <div className="text-center text-muted text-sm py-4">
                      Đang tải {getRoomDisplayName(roomSlug, panel.overview.roomName)}…
                    </div>
                  </Card>
                ) : null}

                <Card variant="dark">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button
                      variant="gold"
                      onClick={() => runAction(roomSlug, () => staffApi.callNext(siteSlug, roomSlug))}
                      disabled={panel.loading}
                    >
                      Gọi số tiếp theo
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => runAction(roomSlug, () => staffApi.completeCurrent(siteSlug, roomSlug))}
                      disabled={panel.loading}
                    >
                      Hoàn tất lượt
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => runAction(roomSlug, () => staffApi.skipCurrent(siteSlug, roomSlug))}
                      disabled={panel.loading}
                    >
                      Bỏ qua lượt
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="secondary" onClick={() => refreshRoom(roomSlug)} disabled={panel.loading}>
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
              </div>
            )
          })}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-gold underline"
        >
          Đăng xuất
        </button>
      </div>
    </PageShell>
  )
}
