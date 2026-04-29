import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { staffApi } from '../api/staffApi'
import { storage } from '../lib/storage'
import PageShell from '../ui/PageShell'
import Alert from '../ui/Alert'
import logo from '../theme/logo.png'

export default function StaffLoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!phone.trim() || !password) return

    setLoading(true)
    setError(null)
    try {
      const res = await staffApi.login({ phone: phone.trim(), password })
      storage.setStaffToken(res.token)
      storage.setStaffName(res.name ?? '')
      storage.setStaffSiteSlug(res.siteSlug)
      storage.setStaffSiteName(res.siteName)
      navigate('/staff')
    } catch (e: any) {
      // Parse structured error responses (IP whitelist, site mismatch)
      let errorMsg = 'Đăng nhập thất bại'
      if (e?.bodyText) {
        try {
          const parsed = JSON.parse(e.bodyText)
          errorMsg = parsed.error ?? e.bodyText
        } catch {
          errorMsg = e.bodyText
        }
      } else if (e?.message) {
        errorMsg = e.message
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell title="Đăng nhập nhân viên">
      <div className="flex min-h-[70vh] items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg space-y-5">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>

          <h1 className="text-center text-2xl font-bold text-on-card">Đăng nhập</h1>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-on-card">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2.5 text-sm text-on-card placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-on-card">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2.5 pr-10 text-sm text-on-card placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-on-card"
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-card-dark py-3 text-sm font-bold text-on-page transition-colors hover:bg-primary/80 disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}
