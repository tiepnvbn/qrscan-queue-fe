import { Link } from 'react-router-dom'
import PageShell from '../ui/PageShell'
import Card from '../ui/Card'
import logo from '../theme/logo.png'

export default function HomePage() {
  return (
    <PageShell title="Trang chủ">
      <div className="space-y-6">
        {/* Hero */}
        <div className="py-8 text-center">
          <img src={logo} alt="Logo" className="mx-auto h-16 w-auto" />
          {/* <div className="mt-2 text-sm text-muted">Hệ thống hàng đợi thông minh</div> */}
        </div>

        <Card>
          <p className="text-sm">
            Quét mã QR tại phòng để lấy số thứ tự, hoặc truy cập trực tiếp:
          </p>
          <p className="mt-1 text-xs text-muted font-mono">/s/site-1/r/room-1</p>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-sm font-bold">Liên kết nhanh</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/qr" className="text-primary underline hover:text-accent">→ Tạo / in mã QR</Link>
              </li>
              <li>
                <Link to="/s/site-1" className="text-primary underline hover:text-accent">→ Quét QR: site-1</Link>
              </li>
              <li>
                <Link to="/s/site-1/rooms" className="text-primary underline hover:text-accent">→ Chọn phòng: site-1</Link>
              </li>
              <li>
                <Link to="/staff/s/site-1/r/room-1" className="text-primary underline hover:text-accent">→ Nhân viên: site-1 / room-1</Link>
              </li>
              <li>
                <Link to="/tv/s/site-1" className="text-primary underline hover:text-accent">→ Màn hình: site-1</Link>
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-bold">Cấu hình</h2>
            <ul className="space-y-1 text-xs">
              <li>
                API: <span className="font-mono text-muted">{import.meta.env.VITE_API_BASE_URL ?? '(chưa đặt)'}</span>
              </li>
              <li>
                Feedback URL:{' '}
                <span className="font-mono text-muted">{import.meta.env.VITE_FEEDBACK_MORE_URL ?? '(chưa đặt)'}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
