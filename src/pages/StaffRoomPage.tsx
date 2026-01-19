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

        <Card>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button onClick={() => runAction(() => staffApi.callNext(siteSlug, roomSlug))} disabled={loading}>
              Gọi số tiếp theo
            </Button>
            <Button variant="primary" onClick={() => runAction(() => staffApi.completeCurrent(siteSlug, roomSlug))} disabled={loading}>
              Hoàn tất lượt hiện tại
            </Button>
            <Button variant="danger" onClick={() => runAction(() => staffApi.skipCurrent(siteSlug, roomSlug))} disabled={loading}>
              Bỏ qua lượt hiện tại
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              Làm mới
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
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
