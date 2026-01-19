import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { CustomerLoginResponse, RoomStatusResponse } from '../api/types'
import { publicApi } from '../api/publicApi'
import { getQueueHub } from '../realtime/queueHub'
import { storage } from '../lib/storage'
import PageShell from '../ui/PageShell'
import RoomStatusCard from '../components/RoomStatusCard'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Label from '../ui/Label'

function tierVi(tier: string) {
  return tier === 'Normal' ? 'Thường' : tier
}

export default function CustomerRoomPage() {
  const params = useParams()
  const siteSlug = params.siteSlug ?? ''
  const roomSlug = params.roomSlug ?? ''
  const navigate = useNavigate()

  const [data, setData] = useState<RoomStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loginPhone, setLoginPhone] = useState('')
  const [loginDob, setLoginDob] = useState('')
  const [customer, setCustomer] = useState<CustomerLoginResponse | null>(null)
  const customerId = useMemo(() => customer?.customerId ?? storage.getCustomerId(), [customer])

  const savedTicketId = useMemo(() => storage.getTicketId(siteSlug, roomSlug), [siteSlug, roomSlug])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await publicApi.getRoomStatus({ siteSlug, roomSlug, ticketId: savedTicketId })
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
        // If SignalR fails, page still works via manual refresh.
      }
    })()

    return () => {
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, roomSlug])

  async function handleLogin() {
    setError(null)
    try {
      const res = await publicApi.loginCustomer({ phone: loginPhone, dateOfBirth: loginDob })
      setCustomer(res)
      storage.setCustomerId(res.customerId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại')
    }
  }

  async function handleTakeTicket() {
    if (!siteSlug || !roomSlug) return
    setLoading(true)
    setError(null)
    try {
      const res = await publicApi.takeTicket({
        siteSlug,
        roomSlug,
        body: { customerId: customerId ?? undefined },
      })
      storage.setTicketId(siteSlug, roomSlug, res.ticketId)
      navigate(`/s/${siteSlug}/r/${roomSlug}/mine?ticketId=${encodeURIComponent(res.ticketId)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lấy số thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Khách hàng">
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {data ? <RoomStatusCard title={`${siteSlug} / ${roomSlug}`} status={data.status} myTicket={data.myTicket} /> : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleTakeTicket} disabled={loading}>
            Lấy số
          </Button>
          <Button variant="secondary" onClick={refresh} disabled={loading}>
            Làm mới
          </Button>

          {savedTicketId ? (
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              to={`/s/${siteSlug}/r/${roomSlug}/mine?ticketId=${encodeURIComponent(savedTicketId)}`}
            >
              Xem vé của tôi
            </Link>
          ) : null}
        </div>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Đăng nhập (tích điểm)</div>
              <div className="text-sm text-slate-600">Số điện thoại + ngày sinh</div>
            </div>
            {customerId ? (
              <div className="text-right text-sm">
                <div className="font-mono">{customerId}</div>
                {customer ? (
                  <div className="text-slate-600">
                    Điểm: {customer.points} • Miễn phí: {customer.freeCredits} • Hạng: {tierVi(customer.tier)}
                  </div>
                ) : (
                  <div className="text-slate-600">Đã lưu trên máy</div>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} placeholder="0900000000" />
            </div>
            <div>
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input id="dob" type="date" value={loginDob} onChange={(e) => setLoginDob(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="secondary" onClick={handleLogin} disabled={!loginPhone || !loginDob}>
                Đăng nhập
              </Button>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Bạn có thể bỏ qua đăng nhập; vẫn lấy số bình thường.
          </div>
        </Card>

        {loading && !data ? <Alert>Đang tải…</Alert> : null}
      </div>
    </PageShell>
  )
}
