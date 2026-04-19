import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { CustomerLoginResponse, RoomStatusResponse } from '../api/types'
import { publicApi } from '../api/publicApi'
import { getQueueHub } from '../realtime/queueHub'
import { storage } from '../lib/storage'
import { formatHHmm, safeNumber } from '../lib/time'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Label from '../ui/Label'
import TextArea from '../ui/TextArea'
import StarsInput from '../components/StarsInput'

type Phase = 'waiting' | 'your-turn' | 'photo-inprogress' | 'photo-ended' | 'feedback'

export default function CustomerRoomPage() {
  const params = useParams()
  const siteSlug = params.siteSlug ?? ''
  const roomSlug = params.roomSlug ?? ''
  const navigate = useNavigate()

  const [data, setData] = useState<RoomStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(() => storage.getTicketId(siteSlug, roomSlug))
  const [phase, setPhase] = useState<Phase>('waiting')

  // Register form
  const [showRegister, setShowRegister] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [customerName, setCustomerName] = useState<string | null>(() => storage.getCustomerName())
  const [customer, setCustomer] = useState<CustomerLoginResponse | null>(null)
  const customerId = useMemo(() => customer?.customerId ?? storage.getCustomerId(), [customer])

  // Cancel modal
  const [showCancel, setShowCancel] = useState(false)

  // Countdown timer
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef<number | null>(null)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<number | null>(null)

  // Feedback
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  // ticketId is initialized from localStorage in useState above

  useEffect(() => {
    if (!siteSlug || !roomSlug) return

    let isMounted = true
    let lastSignalRUpdate = Date.now()
    let refreshTimer: number | null = null

    const safeRefresh = async () => {
      if (!isMounted) return
      setLoading(true)
      setError(null)
      try {
        const saved = storage.getTicketId(siteSlug, roomSlug)
        const res = await publicApi.getRoomStatus({ siteSlug, roomSlug, ticketId: saved })
        if (isMounted) setData(res)
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void safeRefresh()

    refreshTimer = setInterval(() => {
      if (!isMounted) return
      const timeSinceLastUpdate = Date.now() - lastSignalRUpdate
      if (timeSinceLastUpdate > 30000) {
        lastSignalRUpdate = Date.now()
        void safeRefresh()
      }
    }, 10000)

    const hub = getQueueHub()
    let unsub: (() => void) | null = null

    ;(async () => {
      try {
        await hub.start()
        await hub.joinRoom(siteSlug, roomSlug)
        unsub = hub.onQueueUpdated((payload) => {
          if (payload.siteSlug === siteSlug && payload.roomSlug === roomSlug) {
            lastSignalRUpdate = Date.now()
            void safeRefresh()
          }
        })
      } catch (err) {
        console.error('[CustomerRoom] SignalR connection failed:', err)
      }
    })()

    return () => {
      isMounted = false
      if (refreshTimer) clearInterval(refreshTimer)
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, roomSlug])

  // Auto-transition to your-turn when ticket becomes Serving
  useEffect(() => {
    if (data?.myTicket?.status === 'Serving' && phase === 'waiting') {
      setPhase('your-turn')
    }
  }, [data?.myTicket?.status, phase])

  // If no ticket yet, auto take ticket on page load
  useEffect(() => {
    const saved = storage.getTicketId(siteSlug, roomSlug)
    if (ticketId || saved || loading) return
    if (!siteSlug || !roomSlug) return
    handleTakeTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, roomSlug])

  async function handleTakeTicket() {
    setLoading(true)
    setError(null)
    try {
      const res = await publicApi.takeTicket({
        siteSlug,
        roomSlug,
        body: { customerId: customerId ?? undefined },
      })
      storage.setTicketId(siteSlug, roomSlug, res.ticketId)
      setTicketId(res.ticketId)
      setData({ siteSlug, roomSlug, status: res.status, myTicket: res.myTicket })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lấy số thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!regPhone.trim()) return
    setError(null)
    try {
      const res = await publicApi.loginCustomer({ phone: regPhone.trim(), name: regName.trim() || undefined })
      setCustomer(res)
      storage.setCustomerId(res.customerId)
      const name = res.name || regName.trim()
      if (name) {
        setCustomerName(name)
        storage.setCustomerName(name)
      }
      setShowRegister(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng ký thất bại')
    }
  }

  async function handleCancel() {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      await publicApi.cancelTicket(ticketId)
      storage.clearTicketId(siteSlug, roomSlug)
      setShowCancel(false)
      navigate(`/s/${encodeURIComponent(siteSlug)}/rooms`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hủy lượt thất bại')
    } finally {
      setLoading(false)
    }
  }

  function handleStartPhoto() {
    const minutes = safeNumber(data?.status.serviceMinutes, 10)
    setCountdown(minutes * 60)
    setPhase('photo-inprogress')

    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          setPhase('photo-ended')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Demo shortcut: tap countdown 3 times quickly to skip to 3 seconds
  function handleCountdownTap() {
    tapCountRef.current += 1
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
      setCountdown(3)
      return
    }
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    tapTimerRef.current = window.setTimeout(() => { tapCountRef.current = 0 }, 800)
  }

  async function handleComplete() {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      await publicApi.completeTicket(ticketId)
      setPhase('feedback')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hoàn thành thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function handleFeedbackSubmit() {
    if (!ticketId) return
    setFeedbackLoading(true)
    try {
      await publicApi.submitFeedback(ticketId, { stars, comment: comment.trim() || null })
    } catch {
      // Silently continue to thank you even if feedback fails
    } finally {
      setFeedbackLoading(false)
      storage.clearTicketId(siteSlug, roomSlug)
      navigate(`/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(roomSlug)}/thankyou`)
    }
  }

  function handleFeedbackSkip() {
    storage.clearTicketId(siteSlug, roomSlug)
    navigate(`/s/${encodeURIComponent(siteSlug)}/r/${encodeURIComponent(roomSlug)}/thankyou`)
  }

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const myTicket = data?.myTicket
  const serviceMinutes = safeNumber(data?.status.serviceMinutes, 10)
  const countdownMin = Math.floor(countdown / 60).toString().padStart(2, '0')
  const countdownSec = (countdown % 60).toString().padStart(2, '0')

  const estimatedTime = myTicket
    ? formatHHmm(myTicket.estimatedServeTime)
    : '--:--'

  const remainingMin = myTicket
    ? `${String(Math.floor(safeNumber(myTicket.estimatedWaitMinutes, 0))).padStart(2, '0')}:${String(0).padStart(2, '0')}`
    : '00:00'

  return (
    <PageShell title="Khách hàng">
      <div className="flex flex-col items-center py-4 space-y-4 max-w-sm mx-auto">
        <Link to={`/s/${encodeURIComponent(siteSlug)}/rooms`} className="self-start text-sm text-gold">
          ← Quay lại
        </Link>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {loading && !data ? <Alert>Đang tải…</Alert> : null}

        {/* ============ PHASE: WAITING (Screen 4) ============ */}
        {phase === 'waiting' && myTicket ? (
          <>
            <h1 className="title-fancy">Thời gian dự kiến</h1>

            <div className="rounded-xl border border-gold px-6 py-2">
              <span className="text-2xl font-bold text-on-page">{estimatedTime}h</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-on-page/80">
              <span>Thời gian còn lại:</span>
              <span className="rounded-lg bg-badge px-3 py-1 text-sm font-bold text-on-card">{remainingMin} phút</span>
            </div>

            <div className="w-full rounded-xl border border-gold/40 bg-card-dark p-5 space-y-4 text-center">
              {customerName ? (
                <div className="text-sm font-bold text-gold">{customerName}</div>
              ) : null}

              <div className="text-sm text-on-page/80">Số của bạn</div>
              <div className="inline-block rounded-2xl bg-surface px-8 py-4">
                <div className="text-5xl font-bold text-on-card">{myTicket.displayNumber}</div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-on-page/80">
                <span>Số hiện tại:</span>
                <span className="rounded-lg bg-card-dark border border-gold/30 px-3 py-1 text-sm font-bold text-on-page">
                  {data?.status.currentDisplayNumber ?? '—'}
                </span>
              </div>

              <div className="text-sm text-on-page/80">
                Còn <span className="font-bold text-gold">{myTicket.aheadCount}</span> ở phía trước bạn
              </div>

              <div className="text-xs text-muted">
                Vui lòng quay lại trong vòng <span className="underline">{serviceMinutes} phút</span> khi đến lượt.
              </div>
            </div>

            {!customerId ? (
              <Button variant="gold" onClick={() => setShowRegister(true)} className="w-full">
                Đăng ký tích điểm
              </Button>
            ) : null}

            <button
              onClick={() => setShowCancel(true)}
              className="text-sm italic text-gold underline hover:text-badge"
            >
              Hủy lượt
            </button>
          </>
        ) : null}

        {/* ============ PHASE: YOUR TURN (Screen 5) ============ */}
        {phase === 'your-turn' ? (
          <>
            <h1 className="title-fancy">Thời gian dự kiến</h1>

            <div className="rounded-xl border border-gold px-6 py-2">
              <span className="text-2xl font-bold text-on-page">{estimatedTime}h</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-on-page/80">
              <span>Thời gian còn lại:</span>
              <span className="rounded-lg bg-badge px-3 py-1 text-sm font-bold text-on-card">00:00 phút</span>
            </div>

            <div className="w-full rounded-xl border border-gold/40 bg-card p-6 space-y-3 text-center">
              <div className="text-2xl font-bold text-on-card">Đã đến lượt của bạn!</div>
              <div className="text-sm text-on-card/80">Vui lòng vào phòng để sử dụng dịch vụ</div>
            </div>

            <Button variant="gold" onClick={handleStartPhoto} className="w-full">
              Bắt đầu
            </Button>
          </>
        ) : null}

        {/* ============ PHASE: PHOTO IN PROGRESS (Screen 6) ============ */}
        {phase === 'photo-inprogress' ? (
          <>
            <h1 className="title-fancy">Thời gian chụp</h1>

            <div className="flex items-center gap-2 text-sm text-on-page/80" onClick={handleCountdownTap}>
              <span>Thời gian còn lại:</span>
              <span className="rounded-lg bg-badge px-3 py-1 text-sm font-bold text-on-card cursor-pointer">
                {countdownMin}:{countdownSec} phút
              </span>
            </div>

            <div className="w-full rounded-xl border border-gold/40 bg-card p-6 space-y-3 text-center">
              <div className="text-2xl font-bold text-on-card">Bắt đầu tạo dáng thôi!</div>
              <div className="text-sm text-on-card/80">Vui lòng chú ý thời gian chụp.</div>
            </div>
          </>
        ) : null}

        {/* ============ PHASE: PHOTO ENDED (Screen 7) ============ */}
        {phase === 'photo-ended' ? (
          <>
            <h1 className="title-fancy">Thời gian chụp</h1>

            <div className="flex items-center gap-2 text-sm text-on-page/80">
              <span>Thời gian còn lại:</span>
              <span className="rounded-lg bg-badge px-3 py-1 text-sm font-bold text-on-card">00:00 phút</span>
            </div>

            <div className="w-full rounded-xl border border-gold/40 bg-card p-6 space-y-3 text-center">
              <div className="text-2xl font-bold text-on-card">Thời gian chụp đã kết thúc.</div>
              <div className="text-sm text-on-card/80">Vui lòng nhấn "Hoàn thành".</div>
            </div>

            <Button variant="gold" onClick={handleComplete} disabled={loading} className="w-full">
              Hoàn thành
            </Button>
          </>
        ) : null}

        {/* ============ PHASE: FEEDBACK MODAL (Screen 8) ============ */}
        {phase === 'feedback' ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-gold/40 bg-card-dark p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold italic text-gold">Đánh giá dịch vụ</h2>
                <button onClick={handleFeedbackSkip} className="text-muted hover:text-on-page text-xl">✕</button>
              </div>

              <StarsInput value={stars} onChange={setStars} />

              <div>
                <div className="mb-1 text-xs text-on-page/70">Nhập nhận xét của bạn (không bắt buộc)</div>
                <TextArea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleFeedbackSkip} className="flex-1">
                  Bỏ qua
                </Button>
                <Button variant="gold" onClick={handleFeedbackSubmit} disabled={feedbackLoading} className="flex-1">
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ============ REGISTER MODAL (Screen 4.1) ============ */}
      {showRegister ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-gold/40 bg-card-dark p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold italic text-gold">Nhập thông tin</h2>
              <button onClick={() => setShowRegister(false)} className="text-muted hover:text-on-page text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="reg-name" className="text-gold italic">Tên:</Label>
                <Input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <Label htmlFor="reg-phone" className="text-gold italic">Số điện thoại:</Label>
                <Input id="reg-phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="0123456789" />
              </div>
            </div>

            <Button variant="gold" onClick={handleRegister} disabled={!regPhone.trim()} className="w-full">
              Xác nhận
            </Button>
          </div>
        </div>
      ) : null}

      {/* ============ CANCEL MODAL (Screen 4.3) ============ */}
      {showCancel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-gold/40 bg-card-dark p-6 space-y-4 text-center">
            <h2 className="text-xl font-bold italic text-gold">Xác nhận hủy lượt</h2>

            <div className="flex gap-3">
              <Button variant="gold" onClick={handleCancel} disabled={loading} className="flex-1">
                Xác nhận
              </Button>
              <Button variant="secondary" onClick={() => setShowCancel(false)} className="flex-1">
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
