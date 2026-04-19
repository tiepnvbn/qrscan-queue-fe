import { useParams } from 'react-router-dom'
import PageShell from '../ui/PageShell'
import logo from '../theme/logo.png'

export default function ThankYouPage() {
  const { siteSlug = '', roomSlug = '' } = useParams()

  return (
    <PageShell title="Cảm ơn">
      <div className="flex flex-col items-center py-12 text-center space-y-6">
        <img src={logo} alt="Logo" className="h-24 w-auto" />

        <h1 className="text-4xl font-bold italic text-gold tracking-wide">Thank you</h1>

        <div className="space-y-1 text-sm text-on-page/80 max-w-xs">
          <p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
          <p>Chúng tôi rất vui được phục vụ bạn.</p>
          <p>Chúc bạn một ngày tốt lành!</p>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-xs text-muted">
            Đừng quên chia sẻ khoảnh khắc chụp tại Linh Linh nhé!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-dark border border-gold/40 text-on-page hover:bg-primary/80 transition-colors"
              aria-label="Facebook"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-dark border border-gold/40 text-on-page hover:bg-primary/80 transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-dark border border-gold/40 text-on-page hover:bg-primary/80 transition-colors"
              aria-label="TikTok"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 005.58 2.2V11.3a4.85 4.85 0 01-3.77-1.85V6.69h3.77z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
