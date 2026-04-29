import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { publicApi } from '../api/publicApi'
import { storage } from '../lib/storage'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'
import logo from '../theme/logo.png'

export default function ScanQrPage() {
  const { siteSlug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dynamic QR state
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const timerRef = useRef<number | null>(null)

  // If token is present, verify it automatically
  useEffect(() => {
    if (!token || !siteSlug) return

    setVerifying(true)
    setError(null)
    publicApi.verifySiteToken(siteSlug, { token })
      .then((res) => {
        if (res.success && res.sessionToken) {
          storage.setSessionToken(res.sessionToken)
          storage.setSessionSiteSlug(siteSlug)
          navigate(`/s/${encodeURIComponent(siteSlug)}/rooms`, { replace: true })
        } else {
          setError(res.errorMessage ?? 'Mã QR không hợp lệ. Vui lòng scan lại.')
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Xác thực thất bại')
      })
      .finally(() => setVerifying(false))
  }, [token, siteSlug, navigate])

  // If no token (display mode) → fetch dynamic QR and auto-refresh
  const fetchQrToken = useCallback(async () => {
    if (!siteSlug || token) return
    setQrLoading(true)
    try {
      const data = await publicApi.getQrToken(siteSlug)
      setQrUrl(data.qrUrl)
    } catch {
      // Fallback to static URL if dynamic QR is not enabled
      setQrUrl(`${window.location.origin}/s/${encodeURIComponent(siteSlug)}/rooms`)
    } finally {
      setQrLoading(false)
    }
  }, [siteSlug, token])

  useEffect(() => {
    if (token) return // Don't poll when verifying

    void fetchQrToken()
    // Refresh QR every 4 minutes (before 5-minute expiry)
    timerRef.current = window.setInterval(fetchQrToken, 240_000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchQrToken, token])

  return (
    <PageShell title="Quét QR">
      <div className="flex flex-col items-center py-6 space-y-6">
        <h1 className="title-fancy">Quét QR</h1>
        <p className="text-sm text-on-page/80">Để chọn phòng chụp bạn muốn</p>

        {verifying ? <Alert>Đang xác thực mã QR…</Alert> : null}
        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="rounded-xl border border-gold/40 bg-card-dark p-5 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <div>
              <div className="text-sm font-bold text-on-page">Linh Linh Photobooth</div>
              <div className="text-xs text-muted">Chi nhánh: {siteSlug}</div>
            </div>
          </div>

          <div className="flex justify-center rounded-lg bg-card p-6">
            {qrUrl ? (
              <QRCodeSVG value={qrUrl} size={200} bgColor="#FFEACF" fgColor="#162114" />
            ) : qrLoading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-muted text-sm">
                Đang tải QR…
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-card-dark px-6 py-2 text-sm font-bold text-on-page"
          >
            Thử lại
          </button>
        ) : null}
      </div>
    </PageShell>
  )
}
