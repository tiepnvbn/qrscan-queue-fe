import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import PageShell from '../ui/PageShell'
import logo from '../theme/logo.png'

export default function ScanQrPage() {
  const { siteSlug = '' } = useParams()
  const roomUrl = `${window.location.origin}/s/${encodeURIComponent(siteSlug)}/rooms`

  return (
    <PageShell title="Quét QR">
      <div className="flex flex-col items-center py-6 space-y-6">
        <h1 className="title-fancy">Quét QR</h1>
        <p className="text-sm text-on-page/80">Để chọn phòng chụp bạn muốn</p>

        <div className="rounded-xl border border-gold/40 bg-card-dark p-5 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <div>
              <div className="text-sm font-bold text-on-page">Linh Linh Photobooth</div>
              <div className="text-xs text-muted">Chi nhánh: {siteSlug}</div>
            </div>
          </div>

          <div className="flex justify-center rounded-lg bg-card p-6">
            <QRCodeSVG value={roomUrl} size={200} bgColor="#FFEACF" fgColor="#162114" />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
