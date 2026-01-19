import { Link } from 'react-router-dom'
import PageShell from '../ui/PageShell'

export default function HomePage() {
  return (
    <PageShell title="Hàng đợi QR">
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-slate-700">
            Frontend này dùng URL từ mã QR, ví dụ:
            <span className="ml-2 font-mono text-xs">/s/site-1/r/room-1</span>
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 font-semibold">Liên kết nhanh</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                <Link to="/qr">Tạo / in mã QR</Link>
              </li>
              <li>
                <Link to="/s/site-1/r/room-1">Khách: site-1 / room-1</Link>
              </li>
              <li>
                <Link to="/staff/s/site-1/r/room-1">Nhân viên: site-1 / room-1</Link>
              </li>
              <li>
                <Link to="/tv/s/site-1">Màn hình: site-1</Link>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 font-semibold">Cấu hình</h2>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>
                API: <span className="font-mono">{import.meta.env.VITE_API_BASE_URL ?? '(chưa đặt)'}</span>
              </li>
              <li>
                URL phản hồi thêm:{' '}
                <span className="font-mono">{import.meta.env.VITE_FEEDBACK_MORE_URL ?? '(chưa đặt)'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
