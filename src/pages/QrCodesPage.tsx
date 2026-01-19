import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import PageShell from '../ui/PageShell'
import Card from '../ui/Card'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import type { SiteCatalogDto } from '../api/types'
import { publicApi } from '../api/publicApi'

function buildRoomUrl(origin: string, siteSlug: string, roomSlug: string) {
  return `${origin}/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(roomSlug)}`
}

export default function QrCodesPage() {
  const [sites, setSites] = useState<SiteCatalogDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const origin = useMemo(() => window.location.origin, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const data = await publicApi.listSites()
        setSites(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được danh sách điểm/phòng')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <PageShell title="Mã QR">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button onClick={() => window.print()} disabled={sites.length === 0}>
            In
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              setLoading(true)
              setError(null)
              try {
                const data = await publicApi.listSites()
                setSites(data)
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Tải lại thất bại')
              } finally {
                setLoading(false)
              }
            }}
          >
            Tải lại
          </Button>
          <div className="text-sm text-slate-600">
            Các mã QR này sẽ mở trang khách cho từng phòng.
          </div>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {loading && sites.length === 0 ? <Alert>Đang tải…</Alert> : null}

        {sites.length === 0 && !loading && !error ? (
          <Alert>
            Không tìm thấy dữ liệu. Hãy chắc chắn backend đang chạy và đã seed dữ liệu, sau đó tải lại.
          </Alert>
        ) : null}

        <div className="space-y-6">
          {sites.map((site) => (
            <div key={site.siteId} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm text-slate-500">{site.siteSlug}</div>
                  <div className="text-xl font-semibold">{site.siteName}</div>
                </div>
                <div className="text-sm text-slate-600 print:hidden">Phòng: {site.rooms.length}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {site.rooms.map((room) => {
                  const url = buildRoomUrl(origin, site.siteSlug, room.roomSlug)
                  return (
                    <Card key={room.roomId}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm text-slate-500">{site.siteSlug} / {room.roomSlug}</div>
                          <div className="font-semibold">{room.roomName}</div>
                          <div className="text-xs text-slate-500">{room.serviceMinutes} phút/lượt</div>
                        </div>
                        <div className="text-right text-xs text-slate-500 print:hidden">Quét</div>
                      </div>

                      <div className="mt-3 flex items-center justify-center">
                        <QRCodeCanvas value={url} size={180} includeMargin />
                      </div>

                      <div className="mt-3 break-all text-center font-mono text-[10px] text-slate-600">{url}</div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
